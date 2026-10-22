/**
 * Voltage Obras · SII preliminar, validación, avisos y campana
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* =========== VOLTAGE OBRAS V6: Trazabilidad accionable, notificaciones y pre-emisión SII =========== */
const v6SeenKey='voltage-obras-notifications-seen-v6';
let v6Seen=new Set();try{v6Seen=new Set(JSON.parse(localStorage.getItem(v6SeenKey)||'[]'))}catch(e){}
const v6PersistSeen=()=>{try{localStorage.setItem(v6SeenKey,JSON.stringify([...v6Seen].slice(-600)))}catch(e){}};
function v6Alerts(){
 const n=[];const dt=todayS();
 S.docs.filter(x=>x.tipo==='factura'&&x.estado!=='anulada'&&saldoFac(x)>0).forEach(f=>{
   const delta=diffD(venceFac(f),dt);
   if(delta<0)n.push({id:'fac-'+f.id,kind:'invoice',ref:f.id,level:'red',title:'Factura vencida · '+f.codigo,description:'Saldo '+clp(saldoFac(f))+' · Vencida hace '+(-delta)+' días',rank:0});
   else if(delta<=7)n.push({id:'fac-'+f.id,kind:'invoice',ref:f.id,level:'yellow',title:'Cobro próximo · '+f.codigo,description:'Saldo '+clp(saldoFac(f))+' · Vence '+(delta===0?'hoy':'en '+delta+' días'),rank:2});
 });
 S.docs.filter(x=>x.tipo==='cotizacion').forEach(q=>{
   if(['aprobada','facturada','rechazada'].includes(q.estado))return;
   if(q.proximoContacto&&q.proximoContacto<=dt)n.push({id:'cot-'+q.id,kind:'follow',ref:q.id,level:q.proximoContacto<dt?'red':'yellow',title:'Seguimiento · '+q.codigo,description:(q.referencia||'Cotización')+' · '+(q.proximoContacto<dt?'Gestión atrasada':'Gestión para hoy'),rank:q.proximoContacto<dt?0:1});
   else if(q.estado==='ingresada')n.push({id:'rec-'+q.id,kind:'quote',ref:q.id,level:'blue',title:'Solicitud recibida · '+q.codigo,description:(q.referencia||'Sin referencia')+' · Pendiente de elaborar',rank:3});
 });
 S.proyectos.filter(p=>p.estado==='en_curso').forEach(p=>{const a=pjCalc(p);if(a.key==='atraso'||a.key==='riesgo')n.push({id:'obra-'+p.id,kind:'project',ref:p.id,level:a.key==='atraso'?'red':'yellow',title:'Obra '+(a.key==='atraso'?'atrasada':'en observación'),description:p.nombre+' · '+a.avance+'% ejecutado / '+a.plan+'% esperado',rank:a.key==='atraso'?0:2});});
 return n.sort((a,b)=>a.rank-b.rank||a.title.localeCompare(b.title,'es'));
}
function refreshNotifications(){
 const all=v6Alerts(),newItems=all.filter(x=>!v6Seen.has(x.id)),counter=$('#v6-notif-count'),menu=$('#v6-notif-menu'),trigger=$('#v6-notif-trigger');
 if(!counter||!menu||!trigger)return;
 counter.hidden=newItems.length===0;counter.textContent=newItems.length>99?'99+':String(newItems.length);
 trigger.setAttribute('aria-label','Notificaciones: '+newItems.length+' sin revisar');
 if(!menu.hidden)v6DrawNotif();
}
function v6DrawNotif(){
 const menu=$('#v6-notif-menu');if(!menu)return;
 const all=v6Alerts();
 menu.innerHTML='<div class="v6-notif-header"><div><strong>Notificaciones</strong><small>'+all.filter(x=>!v6Seen.has(x.id)).length+' sin revisar · '+all.length+' alertas activas</small></div><button type="button" data-v6-all-read>Marcar leídas</button></div>'+
 (all.length?all.slice(0,25).map(x=>'<button type="button" class="v6-notif-row'+(v6Seen.has(x.id)?' read':'')+'" data-v6-open-notif="'+esc(x.id)+'"><i class="v6-signal '+x.level+'"></i><span><b>'+esc(x.title)+'</b><small>'+esc(x.description)+'</small></span><em>↗</em></button>').join(''):'<div class="v6-no-notif">No hay alertas activas. Las notificaciones se calculan desde cobros, seguimientos y avances.</div>')+
 '<footer>Las alertas se recalculan con los registros locales. No son avisos externos ni enviados por correo.</footer>';
}
function v6OpenNotif(id){
 const item=v6Alerts().find(x=>x.id===id);if(!item)return;
 v6Seen.add(item.id);v6PersistSeen();const menu=$('#v6-notif-menu');if(menu)menu.hidden=true;$('#v6-notif-trigger')?.setAttribute('aria-expanded','false');
 if(item.kind==='invoice'||item.kind==='quote'){const d=S.docs.find(x=>x.id===item.ref);if(d)openEditor(d.tipo,d)}
 else if(item.kind==='follow'){go('flujo');showFollowup(item.ref)}
 else if(item.kind==='project'){const p=S.proyectos.find(x=>x.id===item.ref);if(p)openProject(p)}
 refreshNotifications();
}
const v6FlowStage=[['Recibidas','ingresada','blue'],['En elaboración','borrador,en_preparacion','yellow'],['Enviadas','enviada','blue'],['Aprobadas','aprobada,facturada','green'],['Rechazadas','rechazada','red']];
function paintFlujo(){
 const el=$('#flow-body');if(!el)return;const qs=allQuotes();
 const stage=(stat)=>qs.filter(q=>stat.split(',').includes(q.estado));
 const urgent=qs.filter(q=>!['aprobada','facturada','rechazada'].includes(q.estado)&&((q.proximoContacto&&q.proximoContacto<=todayS())||q.estado==='ingresada'))
 .sort((a,b)=>String(a.proximoContacto||'9999').localeCompare(String(b.proximoContacto||'9999'))).slice(0,8);
 el.innerHTML='<div class="v6-flow-intro"><div><strong>Estado de solicitudes</strong><span>Selecciona un presupuesto para abrirlo o registra una próxima acción.</span></div><button type="button" class="btn ghost" data-go="cotizaciones">Ver cotizaciones →</button></div>'+
 '<div class="v6-stage-grid">'+v6FlowStage.map(([name,status,color])=>{const docs=stage(status);return '<section class="v6-stage"><div class="v6-stage-heading"><i class="v6-signal '+color+'"></i><b>'+name+'</b><strong>'+docs.length+'</strong></div>'+((docs.length)?docs.slice().sort((a,b)=>num(b.actualizado)-num(a.actualizado)).slice(0,7).map(q=>'<button type="button" data-open="'+esc(q.id)+'" class="v6-stage-item"><strong>'+esc(q.codigo||'Solicitud')+'</strong><span>'+esc(q.referencia||safeName(q))+'</span><small>'+clp(q.total)+'</small></button>').join(''):'<p class="v6-empty">Sin registros</p>')+'</section>'}).join('')+'</div>'+
 '<section class="v6-section"><header><div><small>ACCIONES PENDIENTES</small><h2>Qué gestionar ahora</h2></div><span>'+urgent.length+' prioritarias</span></header>'+(urgent.length?urgent.map(q=>'<div class="v6-action"><i class="v6-signal '+followColor(q)+'"></i><div><strong>'+esc(q.codigo)+' · '+esc(q.referencia||'Sin descripción')+'</strong><small>'+esc(q.responsable||'Sin responsable')+' · '+(q.proximoContacto?'Contactar: '+fmtD(q.proximoContacto):'Solicitud pendiente de revisión')+'</small></div><button type="button" data-followup="'+esc(q.id)+'">Seguimiento ↗</button></div>').join(''):'<p class="v6-empty">No tienes gestiones comerciales urgentes.</p>')+'</section>'+
 '<section class="v6-section"><header><div><small>CONTINUIDAD DOCUMENTAL</small><h2>Presupuesto → obra → cobro</h2></div><span>Relaciones registradas</span></header><div class="scroll"><table class="tbl"><thead><tr><th>Presupuesto</th><th>Obra asociada</th><th>Documento de cobro</th><th>Saldo</th></tr></thead><tbody>'+(qs.length?qs.slice(0,12).map(q=>{const p=S.proyectos.filter(x=>x.cotizacionId===q.id);const f=liveInvoices().filter(x=>x.cotizacionId===q.id||p.some(y=>y.id===x.proyectoId));return '<tr><td><button class="cell-link" data-open="'+esc(q.id)+'">'+esc(q.codigo)+'</button></td><td>'+(p.map(x=>'<button class="cell-link" data-proj="'+esc(x.id)+'">'+esc(x.nombre)+'</button>').join(', ')||'—')+'</td><td>'+(f.map(x=>'<button class="cell-link" data-open="'+esc(x.id)+'">'+esc(x.codigo)+'</button>').join(', ')||'—')+'</td><td class="mono">'+clp(f.reduce((a,x)=>a+saldoFac(x),0))+'</td></tr>'}).join(''):'<tr><td colspan="4">Sin cotizaciones</td></tr>')+'</tbody></table></div></section>';
}
function v6SiiChecks(d){
 const e=emp(),cl=clientById(d.clienteId)||d.clienteSnap||{},t=totalsOf(d);
 return [
 ['RUT del emisor válido',rutValid(e.rut)],['Razón social y giro del emisor',!!(e.razon&&e.giro)],
 ['Domicilio del emisor',!!(e.direccion&&e.comuna)],['RUT del receptor válido',rutValid(cl.rut)],
 ['Razón social y giro del receptor',!!(cl.razon&&cl.giro)],['Domicilio del receptor',!!(cl.direccion&&cl.comuna)],
 ['Detalle con cantidad y precio',!!((d.items||[]).length&&(d.items||[]).every(x=>String(x.d||'').trim()&&num(x.q)>0&&num(x.p)>=0))],
 ['Tipo de documento definido',d.tipoDte===33||d.tipoDte===34],['Monto total positivo',t.total>0],
 ['Referencia de orden de compra (si corresponde)',true]
 ];
}
function v6SiiReady(d){const checks=v6SiiChecks(d);return checks.every(x=>x[1])}
function mountTributario(){
 $('#v-tributario').innerHTML='<div class="top v2-top"><div><div class="eyebrow">FACTURACIÓN · CHILE</div><h1>Preparación de documentos SII</h1><p class="subtitle">Revisa los antecedentes de facturas antes de ingresarlas al SII o enviarlas a un proveedor autorizado.</p></div><div class="actions"><button type="button" class="btn ghost" data-go="facturas">Facturas y cobros →</button></div></div><div id="v6-tax-body"></div>';
 paintTributario();
}
function paintTributario(){
 const host=$('#v6-tax-body');if(!host)return;
 const inv=liveInvoices(),draft=inv.map(d=>({d,checks:v6SiiChecks(d)}));
 host.innerHTML='<div class="v6-tax-notice"><strong>Preparación administrativa, NO emisión electrónica</strong><p>El sistema local no genera DTE XML firmado, no asigna folios oficiales ni envía información al SII. La ficha PDF es un borrador de revisión, no una factura tributaria.</p></div>'+
 '<section class="v6-section"><header><div><small>PREVALIDACIÓN</small><h2>Documentos pendientes de revisión tributaria</h2></div><button type="button" data-go="config">Datos del emisor →</button></header><div class="scroll"><table class="tbl"><thead><tr><th>Documento</th><th>Cliente</th><th>Tipo</th><th>Total</th><th>Datos completos</th><th>Acciones</th></tr></thead><tbody>'+(draft.length?draft.map(({d,checks})=>{const ok=checks.filter(x=>x[1]).length;return '<tr><td><strong>'+esc(d.codigo)+'</strong><small>'+fmtD(d.fecha)+'</small></td><td>'+esc(safeName(d))+'</td><td>'+(d.tipoDte===34?'Exenta (34)':'Afecta (33)')+'</td><td class="mono">'+clp(d.total)+'</td><td><span class="v6-tax-status '+(ok===checks.length?'ok':'warn')+'">'+ok+'/'+checks.length+' comprobaciones</span></td><td><div class="v6-tax-actions"><button class="cell-link" data-v6-tax-check="'+esc(d.id)+'">Revisar</button><button class="cell-link" data-v6-tax-pdf="'+esc(d.id)+'">PDF preliminar ↓</button><button class="cell-link" data-open="'+esc(d.id)+'">Editar ↗</button></div></td></tr>'}).join(''):'<tr><td colspan="6">No hay facturas administrativas registradas.</td></tr>')+'</tbody></table></div></section>'+
 '<section class="v6-tax-help"><div><b>1. Preparar</b><p>Completar emisor, receptor, partidas, tipo e importes.</p></div><div><b>2. Emitir externamente</b><p>Ingresar datos en el SII o usar un proveedor autorizado. Validar firma, folio y aceptación.</p></div><div><b>3. Registrar y cobrar</b><p>Guardar la referencia real del DTE y gestionar vencimientos y abonos.</p></div></section>';
}
function v6ShowCheck(id){
 const d=S.docs.find(x=>x.id===id&&x.tipo==='factura');if(!d){toast('No se encontró la factura.',true);return}
 const checks=v6SiiChecks(d);modal({title:'Revisión de antecedentes · '+d.codigo,body:'<div class="v6-checklist">'+checks.map(([label,ok])=>'<div><b class="'+(ok?'pass':'fail')+'">'+(ok?'✓':'!')+'</b><span>'+esc(label)+'</span></div>').join('')+'</div><p class="v6-warning">Estas comprobaciones son preliminares: no sustituyen la validación tributaria, la certificación ni la aceptación del SII.</p>',actions:[{label:'Cerrar',cls:'ghost',close:true}]});
}
async function v6ExportTaxPrep(id){
 const d=S.docs.find(x=>x.id===id&&x.tipo==='factura');if(!d){toast('No se encontró el documento.',true);return}
 if(!window.SebaReportPDF||!window.SebaReportPDF.buildSiiPreparation){toast('No está cargado el generador de ficha tributaria.',true);return}
 const e=emp(),c=clientById(d.clienteId)||d.clienteSnap||{},t=totalsOf(d);
 const details=(d.items||[]).map(x=>({name:x.d||'',qty:num(x.q),unit:x.u||'',price:num(x.p),amount:num(x.q)*num(x.p)}));
 const pdf=window.SebaReportPDF.buildSiiPreparation({number:d.codigo,date:d.fecha,kind:d.tipoDte===34?'FACTURA EXENTA (34)':'FACTURA AFECTA (33)',issuer:e,client:c,reference:d.ordenCompra||d.referencia||'',details,net:t.neto,discount:t.desc,tax:t.iva,total:t.total,checks:v6SiiChecks(d),folio:d.folioSII||'',isDemo:window.SebaLocal&&window.SebaLocal.isDemo()});
 try{await S.dl.save({filename:'PREPARACION-SII-'+slug(d.codigo)+'.pdf',data:pdf});toast('Ficha de preparación descargada. No es un DTE.')}
 catch(err){toast('No se pudo descargar la ficha PDF.',true)}
}
document.addEventListener('click',async function(ev){
 const el=ev.target.closest('[data-v6-tax-check],[data-v6-tax-pdf],[data-v6-open-notif],[data-v6-all-read],#v6-notif-trigger');
 if(!el){if(!ev.target.closest('#v6-notif-menu')){const p=$('#v6-notif-menu');if(p)p.hidden=true;const b=$('#v6-notif-trigger');if(b)b.setAttribute('aria-expanded','false')}return}
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
 if(el.id==='v6-notif-trigger'){const menu=$('#v6-notif-menu');menu.hidden=!menu.hidden;el.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)v6DrawNotif()}
 else if(el.hasAttribute('data-v6-all-read')){v6Alerts().forEach(x=>v6Seen.add(x.id));v6PersistSeen();refreshNotifications();v6DrawNotif()}
 else if(el.dataset.v6OpenNotif)v6OpenNotif(el.dataset.v6OpenNotif);
 else if(el.dataset.v6TaxCheck)v6ShowCheck(el.dataset.v6TaxCheck);
 else if(el.dataset.v6TaxPdf)await v6ExportTaxPrep(el.dataset.v6TaxPdf);
},true);

