import http from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { buildPlan, InputError, todayISO, getWeather, validateInput } from './lib/planner.mjs';
import { cityNames, interests } from './lib/catalogue.mjs';

const root=dirname(fileURLToPath(import.meta.url));
if(existsSync(join(root,'.env'))){
  for(const line of readFileSync(join(root,'.env'),'utf8').split(/\r?\n/)){
    const match=/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if(!match||Object.hasOwn(process.env,match[1]))continue;
    let value=match[2];
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    process.env[match[1]]=value;
  }
}
const config={apiKey:process.env.GEMINI_API_KEY?.trim()||'',model:process.env.GEMINI_MODEL?.trim()||'gemini-3.5-flash-lite',weatherEnabled:process.env.WEATHER_ENABLED!=='0'};
const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be a number between 1 and 65535.');
const publicRoot=resolve(root,'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.ico':'image/x-icon'};
const headers={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Cache-Control':'no-store'
};
function json(res,status,body,extra={}){res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(body));}
async function body(req){let text='',size=0;for await(const chunk of req){size+=chunk.length;if(size>32000)throw new InputError('Request too large.');text+=chunk;}try{return JSON.parse(text);}catch{throw new InputError('Use valid JSON.');}}
let times=[],aiTimes=[],active=0;
const server=http.createServer(async(req,res)=>{
  try{
    const requestHost=req.headers.host||'';
    if(!new Set([`localhost:${port}`,`127.0.0.1:${port}`,`[::1]:${port}`]).has(requestHost))return json(res,403,{error:'This application is configured for localhost only.'});
    const path=new URL(req.url,`http://${requestHost}`).pathname;
    if(req.method==='GET'&&path==='/api/config')return json(res,200,{
      aiConfigured:!!config.apiKey,model:config.model,cities:cityNames,interests,today:todayISO(),weatherEnabled:config.weatherEnabled,
      heroAvailable:existsSync(join(process.env.DEV_MODE==='1'?join(root,'public'):publicRoot,'hero.mp4'))
    });
    if(req.method==='POST'&&['/api/plan','/api/weather'].includes(path)){
      const allowed=new Set([`http://${requestHost}`]);
      if(process.env.DEV_MODE==='1'){allowed.add('http://127.0.0.1:5173');allowed.add('http://localhost:5173');}
      if(req.headers.origin&&!allowed.has(req.headers.origin))return json(res,403,{error:'Requests must come from this application.'});
      if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(res,415,{error:'Use application/json.'});
      const input=await body(req);times=times.filter(t=>Date.now()-t<60000);aiTimes=aiTimes.filter(t=>Date.now()-t<60000);
      const aiRequest=path==='/api/plan'&&input?.useAI===true&&!!config.apiKey;
      if(times.length>=40||active>=2||(aiRequest&&aiTimes.length>=6))return json(res,429,{error:'Please wait a minute. The local rate limit protects your API quota.'},{'Retry-After':'60'});
      times.push(Date.now());if(aiRequest)aiTimes.push(Date.now());active++;
      try{
        if(path==='/api/weather')return json(res,200,await getWeather(validateInput(input),{enabled:config.weatherEnabled}));
        return json(res,200,await buildPlan(input,config));
      }finally{active--;}
    }
    if(['GET','HEAD'].includes(req.method)&&!path.startsWith('/api/')){
      let decoded;try{decoded=decodeURIComponent(path);}catch{return json(res,400,{error:'Invalid path.'});}
      if(decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').some(x=>x.startsWith('.')&&x!==''))return json(res,404,{error:'Not found.'});
      const local=resolve(publicRoot,decoded==='/'?'index.html':'.'+decoded);
      if(local!==publicRoot&&!local.startsWith(publicRoot+sep))return json(res,403,{error:'Not permitted.'});
      if(!existsSync(local)||!statSync(local).isFile()){
        if(decoded==='/'&&!existsSync(join(publicRoot,'index.html')))return json(res,503,{error:'Build the frontend first: npm install, then npm run build. Or use START-WINDOWS.bat.'});
        return json(res,404,{error:'File not found.'});
      }
      const type=types[extname(local)];if(!type)return json(res,404,{error:'Not found.'});
      const size=statSync(local).size;let start=0,end=size-1,status=200;
      if(req.headers.range&&extname(local)==='.mp4'){
        const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if(!match)return json(res,416,{error:'Invalid range.'},{'Content-Range':`bytes */${size}`});
        start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;
        if(start>end||start>=size)return json(res,416,{error:'Range out of bounds.'},{'Content-Range':`bytes */${size}`});status=206;
      }
      res.writeHead(status,{...headers,'Content-Type':type,'Content-Length':end-start+1,'Accept-Ranges':'bytes',...(status===206?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
      if(req.method==='HEAD'){res.end();return;}
      createReadStream(local,{start,end}).on('error',()=>res.destroy()).pipe(res);return;
    }
    return json(res,404,{error:'Not found.'});
  }catch(error){
    if(res.headersSent){res.destroy();return;}
    if(error instanceof InputError)return json(res,400,{error:error.message});
    console.error('Request failed:',error.name);return json(res,500,{error:'The request could not be completed. Try again.'});
  }
});
server.requestTimeout=45000;server.headersTimeout=15000;
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is busy. Stop the other server or set PORT=3001 in .env.`:error.message);process.exitCode=1;});
server.listen(port,host,()=>{
  const url=`http://localhost:${port}`;
  console.log(`\nAurora Travel - ${url}\n${config.apiKey?'Optional Gemini configured; verify your project is Free Tier.':'No key needed. Rule-based planner is ready.'}\nKeep this terminal open. Ctrl+C stops the server.\n`);
  if(process.argv.includes('--open')){
    const args=process.platform==='win32'?['cmd',['/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
    const child=spawn(args[0],args[1],{stdio:'ignore'});child.on('error',()=>console.log('Open '+url+' in your browser.'));child.unref();
  }
});
