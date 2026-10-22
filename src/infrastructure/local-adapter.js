(function(){
  if(window.claude&&window.claude.use)return;
  var KEY='seba-voltage-local-v4',store=new Map(),subs=[];
  try{var raw=localStorage.getItem(KEY);if(raw)JSON.parse(raw).forEach(function(e){store.set(e[0],e[1])})}catch(e){}
  // Primera ejecución: cargar DEMO ficticia en clave independiente de v1, v2 y v3.
  // Los registros creados posteriormente se mantienen hasta restaurar/vaciar.
  if(!store.size&&window.SebaFixtures)window.SebaFixtures.make().forEach(function(e){store.set(e[0],e[1])});
  if(!store.has('meta/empresa')) store.set('meta/empresa',{razon:'',rut:'',giro:'',direccion:'',comuna:'',ciudad:'',email:'',telefono:'',cotValidez:15,facPlazo:30,logo:'',giros:[],cotNotas:''});
  var persist=function(){try{localStorage.setItem(KEY,JSON.stringify(Array.from(store.entries())))}catch(e){}};
  var notify=function(){persist();subs.forEach(function(s){s()})};
  var clone=function(o){return JSON.parse(JSON.stringify(o))};
  var snapDoc=function(p){return {id:p.split('/').pop(),exists:store.has(p),data:function(){return store.has(p)?clone(store.get(p)):undefined},metadata:{}}};
  var colDocs=function(c){return Array.from(store.keys()).filter(function(k){return k.indexOf(c+'/')===0&&k.slice(c.length+1).indexOf('/')<0}).sort().map(snapDoc)};
  var docRef=function(p){return {id:p.split('/').pop(),path:p,
    get:function(){return Promise.resolve(snapDoc(p))},
    set:function(d){store.set(p,clone(d));notify();return Promise.resolve()},
    update:function(d){if(!store.has(p))return Promise.reject({code:'invalid_argument'});store.set(p,Object.assign({},store.get(p),clone(d)));notify();return Promise.resolve()},
    delete:function(){store.delete(p);notify();return Promise.resolve()},
    acquire:function(){return Promise.resolve({acquired:true})},
    onSnapshot:function(next){var f=function(){next(snapDoc(p))};subs.push(f);setTimeout(f,0);return function(){subs=subs.filter(function(x){return x!==f})}}}};
  var colRef=function(c){return {path:c,
    doc:function(id){return docRef(c+'/'+(id||'id'+Math.random().toString(36).slice(2,11)))},
    onSnapshot:function(next){var f=function(){var d=colDocs(c);next({docs:d,size:d.length,empty:!d.length,metadata:{}})};subs.push(f);setTimeout(f,0);return function(){subs=subs.filter(function(x){return x!==f})}}}};
  var db={doc:docRef,collection:colRef};
  var user={can:function(){return true},isOwner:function(){return false},canEdit:function(){return true},id:function(){return Promise.resolve('demo-local-sin-autenticacion')}};
  var downloads={save:function(o){return new Promise(function(res){
    var blob=o.data instanceof Blob?o.data:new Blob([o.data]);var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=o.filename;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500);res({status:'saved'})})}};
  window.SebaLocal={key:KEY,isDemo:function(){return !!(store.get('meta/dataset')&&store.get('meta/dataset').kind==='demo')},resetDemo:function(){if(!window.SebaFixtures)throw new Error('No existe el catálogo de demo.');store.clear();window.SebaFixtures.make().forEach(function(e){store.set(e[0],clone(e[1]))});notify()},backup:function(){return JSON.stringify(Array.from(store.entries()),null,2)},restore:function(rows){if(!Array.isArray(rows)||!rows.every(function(x){return Array.isArray(x)&&x.length===2&&typeof x[0]==='string'&&x[1]&&typeof x[1]==='object'}))throw new Error('Formato de respaldo inválido.');if(rows.length>20000)throw new Error('Respaldo demasiado grande.');store.clear();rows.forEach(function(x){store.set(x[0],clone(x[1]))});notify()},clear:function(){store.clear();store.set('meta/empresa',{razon:'',rut:'',giro:'',direccion:'',comuna:'',ciudad:'',email:'',telefono:'',cotValidez:15,facPlazo:30,logo:'',giros:[],cotNotas:''});notify()}};
  window.claude={use:function(n){return Promise.resolve(n==='db'?db:n==='user'?user:n==='downloads'?downloads:null)}};
})();