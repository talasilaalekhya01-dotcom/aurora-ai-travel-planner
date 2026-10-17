import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const output = fileURLToPath(new URL('../public/hero.mp4',import.meta.url));
const source = 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/aurora/hero.mp4';
if(existsSync(output)){console.log('Hero video is already present.');process.exit(0);}
try{
  const response=await fetch(source,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const contentType=response.headers.get('content-type')||'';
  if(contentType.includes('text/')||contentType.includes('html'))throw new Error('The URL did not return video.');
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<1024||bytes.length>150_000_000)throw new Error('Unexpected video size.');
  mkdirSync(new URL('../public/',import.meta.url),{recursive:true});writeFileSync(output,bytes);
  console.log('Downloaded the video from your Aurora reference.');
}catch(error){console.log('Video unavailable: '+error.message+'\nThe built-in aurora illustration will be used instead.');}
