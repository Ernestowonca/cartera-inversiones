/* Cada guardado crea una versión nueva: nunca pisa el archivo de otro equipo. */
(function(root){
'use strict';
class DriveStore {
 constructor(fetcher,token){this.fetcher=fetcher;this.token=token;}
 async request(path,options={}){const r=await this.fetcher('https://www.googleapis.com/'+path,{signal:AbortSignal.timeout(20000),...options,headers:{Authorization:'Bearer '+this.token,...options.headers}});if(!r.ok)throw Error(r.status===401?'Sesión vencida: conectá Google otra vez.':'Drive respondió '+r.status+'. Tus datos locales se conservan.');return r.json();}
 async list(){const q="trashed = false and 'me' in owners and appProperties has { key='carteraApp' and value='v1' }";return (await this.request('drive/v3/files?'+new URLSearchParams({q,spaces:'drive',pageSize:'100',orderBy:'createdTime desc',fields:'files(id,name,createdTime,appProperties),nextPageToken'}))).files;}
 async read(id){if(!/^[A-Za-z0-9_-]+$/.test(id))throw Error('Archivo inválido');return this.request('drive/v3/files/'+id+'?alt=media');}
 async save(payload,parent){const files=await this.list();if((files[0]?.id||null)!==parent)throw Error('Hay una versión nueva en Drive. Descargá un respaldo local y abrí la versión remota antes de guardar.');const boundary='cartera_'+crypto.randomUUID().replaceAll('-','');const name='cartera-'+new Date().toISOString().replaceAll(':','-')+'.json';const metadata={name,mimeType:'application/json',appProperties:{carteraApp:'v1',parent:parent||'initial'}};const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(payload)+'\r\n--'+boundary+'--';return this.request('upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});}
}
if(typeof module!=='undefined')module.exports={DriveStore};else root.DriveStore=DriveStore;
})(globalThis);
