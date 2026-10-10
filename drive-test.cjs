const assert=require('node:assert/strict');const {DriveStore}=require('./drive-client.js');
(async()=>{
let calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.includes('/upload/')?{id:'new'}:{files:[{id:'old'}]}};};
const d=new DriveStore(fetcher,'test-only');
await assert.rejects(()=>d.save({version:1},'different'),/versión nueva/);assert.equal(calls.length,1);
calls=[];assert.equal((await d.save({version:1},'old')).id,'new');assert.equal(calls.length,2);assert.equal(calls[1].options.method,'POST');assert.ok(calls[1].options.body.includes('"parent":"old"'));assert.ok(!calls[1].options.body.includes('permissions'));assert.ok(!calls[1].options.body.includes('test-only'));assert.equal(calls[1].options.headers.Authorization,'Bearer test-only');
await assert.rejects(()=>d.read('../bad'),/inválido/);
const expired=new DriveStore(async()=>({ok:false,status:401}),'test');await assert.rejects(()=>expired.list(),/Sesión vencida/);
console.log('OK: conflictos previos impiden subir; guardado crea versión nueva sin compartir; token solo en cabecera; sesión expirada y IDs inválidos.');
})().catch(e=>{console.error(e);process.exitCode=1});
