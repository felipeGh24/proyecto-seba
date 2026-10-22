/**
 * Voltage Obras · Listas, búsqueda y filtros de documentos
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- LISTAS ---------- */
const FILT={cotizacion:[['all','Todas'],['ingresada','Recibidas'],['en_preparacion','En preparación'],['borrador','Borradores'],['enviada','Enviadas'],['aprobada','Aprobadas'],['rechazada','Rechazadas'],['vencida','Vencidas'],['facturada','Facturadas']],
  factura:[['all','Todas'],['emitida','Por cobrar'],['parcial','Abonos'],['vencida','Vencidas'],['pagada','Pagadas'],['anulada','Anuladas']]};
function mountList(tipo){
  const v=tipo==='cotizacion'?'cotizaciones':'facturas',el=$('#v-'+v);
  el.innerHTML='<div class="top"><div><div class="eyebrow">'+(tipo==='cotizacion'?'Ofertas a clientes':'Documentos de cobro')+'</div><h1>'+TITLES[v]+'</h1></div><div class="actions">'+
    (tipo==='cotizacion'?'<button class="btn ghost" data-act="new-prop">Propuesta detallada</button>':'')+
    '<button class="btn ghost" data-act="csv" data-t="'+tipo+'" id="csv-'+tipo+'"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Exportar CSV</button>'+
    '<button class="btn" data-act="'+(tipo==='cotizacion'?'new-cot':'new-fac')+'"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'+(tipo==='cotizacion'?'Nueva cotización':'Nueva factura')+'</button></div></div>'+
    '<div class="toolbar"><div class="chips" id="chips-'+tipo+'"></div><div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input class="inp" id="q-'+tipo+'" type="search" placeholder="Buscar por código, cliente o referencia" aria-label="Buscar" value="'+esc(S.q[v])+'"></div></div>'+
    '<div class="card"><div class="scroll" id="rows-'+tipo+'"></div></div>';
  $('#q-'+tipo).addEventListener('input',e=>{S.q[v]=e.target.value;paintList(tipo)});
  if(!S.dl)$('#csv-'+tipo).hidden=true;
  paintList(tipo);
}
function paintList(tipo){
  const v=tipo==='cotizacion'?'cotizaciones':'facturas';
  if(!$('#rows-'+tipo))return;
  const q=S.q[v].trim().toLowerCase();
  let all=S.docs.filter(d=>d.tipo===tipo);
  const total=all.length;
  if(q)all=all.filter(d=>[d.codigo,d.clienteSnap.razon,d.clienteSnap.rut,d.referencia,d.ordenCompra,d.folioSII].join(' ').toLowerCase().includes(q));
  const cnt={all:all.length};all.forEach(d=>{const k=estadoInfo(d).key;cnt[k]=(cnt[k]||0)+1});
  $('#chips-'+tipo).innerHTML=FILT[tipo].map(([k,l])=>'<button class="chip" data-fil="'+k+'" data-t="'+tipo+'" aria-pressed="'+(S.fil[v]===k)+'">'+l+'<b>'+(cnt[k]||0)+'</b></button>').join('');
  let list=S.fil[v]==='all'?all:all.filter(d=>estadoInfo(d).key===S.fil[v]);
  list=list.slice().sort((a,b)=>(b.numero||0)-(a.numero||0));
  const fac=tipo==='factura';
  if(!total){
    $('#rows-'+tipo).innerHTML='<div class="empty"><b>'+(fac?'Aún no hay facturas':'Aún no hay cotizaciones')+'</b>'+(fac?'Crea una desde una cotización aprobada o desde cero.':'Crea la primera para tu cliente y descárgala en PDF.')+'<br>'+(S.canWrite?'<button class="btn" data-act="'+(fac?'new-fac':'new-cot')+'">'+(fac?'Nueva factura':'Nueva cotización')+'</button>':'')+'</div>';return}
  if(!list.length){$('#rows-'+tipo).innerHTML='<div class="empty"><b>Sin resultados</b>Prueba con otro filtro o búsqueda.</div>';return}
  $('#rows-'+tipo).innerHTML='<table class="tbl"><thead><tr><th>Código</th><th>Cliente</th><th>'+(fac?'Emisión':'Fecha')+'</th><th>'+(fac?'Vence':'Válida hasta')+'</th><th class="r">Total con IVA</th><th>Estado</th><th></th></tr></thead><tbody>'+
   list.map(d=>{const st=estadoInfo(d);return '<tr class="row" data-open="'+d.id+'"><td class="mono">'+esc(d.codigo)+(d.folioSII?'<small>SII N° '+esc(d.folioSII)+'</small>':'')+'</td><td><span class="nm">'+esc(d.clienteSnap.razon)+'</span><small>'+esc(d.referencia||'Sin referencia')+'</small></td><td class="mono">'+fmtD(d.fecha)+'</td><td class="mono">'+fmtD(fac?venceFac(d):addD(d.fecha,num(d.validezDias)))+'</td><td class="r mono">'+clp(d.total)+'</td><td><span class="pill '+st.cls+'">'+st.label+'</span></td><td><button class="btn ghost sm" data-pdf="'+d.id+'" '+(S.dl?'':'hidden')+'>PDF</button>'+(fac?'':' <button class="btn ghost sm" data-followup="'+d.id+'">Seguimiento</button>')+'</td></tr>'}).join('')+'</tbody></table>';
}

