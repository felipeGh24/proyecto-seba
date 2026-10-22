/**
 * Voltage Obras · Arranque, suscripción al repositorio y carga inicial
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- arranque ---------- */
function checkReady(){
  if(S.ready)return;
  if(S.loaded.cli&&S.loaded.doc&&S.loaded.emp&&S.loaded.pro&&S.loaded.bit&&S.loaded.costos){S.ready=true;const h=(location.hash||'').replace('#','');go(['panel','flujo','cotizaciones','facturas','proyectos','clientes','costos','reportes','integraciones','config','tributario'].includes(h)?h:'panel')}
}
async function boot(){
  refresh();
  const [db,user,dl]=await Promise.all([use('db'),use('user'),use('downloads')]);
  S.db=db;S.user=user;S.dl=dl;
  S.canWrite=!!db&&!(user&&user.can&&user.can('data.write')===false);
  if(!db){S.ready=true;S.loaded={cli:true,doc:true,emp:true,pro:true,bit:true,costos:true};refresh();$('#v-panel').innerHTML='<div class="empty"><b>No se pudo conectar con la base de datos</b>Abre esta página desde tu cuenta de Claude con la sesión iniciada para ver y guardar cotizaciones y facturas.</div>';return}
  const fail=e=>{toast('No se pudo leer la información guardada.',true)};
  setTimeout(()=>{if(!S.ready){S.loaded={cli:true,doc:true,emp:true,pro:true,bit:true,costos:true};checkReady()}},7000);
  db.collection('costos').onSnapshot(sn=>{S.costos=sn.docs.map(d=>Object.assign({id:d.id},d.data()));S.loaded.costos=true;checkReady();refresh()},fail);
  db.collection('bitacora').onSnapshot(sn=>{S.bitacora=sn.docs.map(d=>Object.assign({id:d.id},d.data()));S.loaded.bit=true;checkReady();refresh()},fail);
   db.collection('proyectos').onSnapshot(sn=>{S.proyectos=sn.docs.map(d=>Object.assign({id:d.id},d.data()));S.loaded.pro=true;checkReady();refresh()},fail);
  db.collection('clientes').onSnapshot(sn=>{S.clientes=sn.docs.map(d=>Object.assign({id:d.id},d.data()));S.loaded.cli=true;checkReady();refresh()},fail);
  db.collection('documentos').onSnapshot(sn=>{S.docs=sn.docs.map(d=>Object.assign({id:d.id},d.data()));S.loaded.doc=true;checkReady();refresh()},fail);
  db.doc('meta/empresa').onSnapshot(sn=>{S.empresa=sn.exists?sn.data():{};S.loaded.emp=true;checkReady();refresh()},fail);
}
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(S.ready&&S.view==='panel')paintPanel()},180)});
boot();
