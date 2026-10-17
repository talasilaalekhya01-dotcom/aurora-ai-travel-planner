import { spawn } from 'node:child_process';
const env = {...process.env, DEV_MODE:'1', PORT:'3000'};
const api = spawn(process.execPath,['server.mjs'],{stdio:'inherit',env});
const vite = spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit',env});
let closing=false;
function close(code=0){if(closing)return;closing=true;api.kill();vite.kill();setTimeout(()=>process.exit(code),150);}
for(const child of [api,vite]){child.on('error',()=>close(1));child.on('exit',code=>close(code||0));}
process.on('SIGINT',()=>close());process.on('SIGTERM',()=>close());
