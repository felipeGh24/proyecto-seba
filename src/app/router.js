/**
 * Voltage Obras · Navegación, cambio de vista y actualización de estado
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* navegación */
const TITLES={tributario:'Preparación SII',panel:'Inicio',costos:'Costos y margen',flujo:'Trazabilidad',cotizaciones:'Cotizaciones',facturas:'Facturas',proyectos:'Proyectos',clientes:'Clientes',reportes:'Reportes',integraciones:'Integraciones',config:'Datos de la empresa'};
const v5Trail=[];
let v5Returning=false;
function v5SyncNavigation(){
 const back=$('#v5-back'), label=$('#v5-current');
 if(label)label.textContent=TITLES[S.view]||'Detalle';
 if(back){const dest=v5Trail[v5Trail.length-1];back.disabled=!(dest&&dest!==S.view);back.title=dest?'Volver a '+(TITLES[dest]||dest):'No hay una vista anterior';}
}
function go(v){
  const prev=S.view==='editor'?(S.editor&&S.editor.tipo==='proyecto'?'proyectos':S.editor&&S.editor.tipo==='factura'?'facturas':'cotizaciones'):S.view;
  if(!v5Returning&&prev&&prev!==v&&TITLES[prev]&&TITLES[v]){
    if(v5Trail[v5Trail.length-1]!==prev)v5Trail.push(prev);
    if(v5Trail.length>25)v5Trail.shift();
  }
  S.editor=null;S.view=v;
  $$('main > section').forEach(s=>s.hidden=s.id!=='v-'+v);
  $$('#nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.go===v)));
  const m={tributario:mountTributario,panel:mountPanel,flujo:mountFlujo,cotizaciones:()=>mountList('cotizacion'),facturas:()=>mountList('factura'),proyectos:mountProyectos,clientes:mountClientes,costos:mountCostos,reportes:mountReportes,integraciones:mountIntegraciones,config:mountConfig}[v];
  m();v5SyncNavigation();if(history.replaceState&&v!=='editor')history.replaceState(null,'','#'+v);window.scrollTo({top:0});
}
function refresh(){
  const nl=S.docs.filter(d=>d.tipo==='factura'&&estadoInfo(d).key==='vencida').length;
  const nc=S.docs.filter(d=>d.tipo==='cotizacion'&&['enviada'].includes(estadoInfo(d).key)).length;
  const a=$('#cnt-fac');if(a){a.hidden=!nl;a.textContent=nl}const b=$('#cnt-cot');if(b){b.hidden=!nc;b.textContent=nc}
  const np=S.proyectos.filter(p=>pjCalc(p).key==='atraso').length;const c3=$('#cnt-pro');if(c3){c3.hidden=!np;c3.textContent=np}
  const e=emp();const br=$('#brand-name');if(br)br.textContent=e.razon||'Empresa';
  const mk=$('#mark');if(mk){if(e.logo){mk.innerHTML='<img alt="" src="'+esc(e.logo)+'">'}else{const w=(e.razon||'EMPRESA').split(/\s+/).filter(Boolean);mk.textContent=(w.length>1&&e.razon?(w[0][0]+w[1][0]):'SE').toUpperCase().slice(0,3)}}
  $('#conn').innerHTML=S.db?'<span class="dot"></span>Guardado en este equipo':'<span class="dot off"></span>Almacenamiento local no disponible';
  if(S.ready)refreshNotifications();
  if(!S.ready||S.editor)return;
  if(S.view==='panel')paintPanel();
  else if(S.view==='cotizaciones')paintList('cotizacion');
  else if(S.view==='facturas')paintList('factura');
  else if(S.view==='clientes')paintClientes();
  else if(S.view==='proyectos')paintProyectos();
  else if(S.view==='flujo')paintFlujo();
  else if(S.view==='reportes')paintReportes();
  else if(S.view==='costos')paintCostos();
  else if(S.view==='tributario')paintTributario();
}

