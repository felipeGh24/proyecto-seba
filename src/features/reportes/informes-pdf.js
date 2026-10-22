/**
 * Voltage Obras · Informes PDF por cliente y obra
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ========== V4: informes PDF contextuales y acciones independientes ========== */
function v4ReportData(scope,id){
 const project=scope==='project'?S.proyectos.find(x=>x.id===id):null;
 const client=scope==='client'?S.clientes.find(x=>x.id===id):project?clientById(project.clienteId):null;
 if(scope==='project'&&!project)throw Error('Selecciona un proyecto existente.');
 if(scope==='client'&&!client)throw Error('Selecciona un cliente existente.');
 const projects=project?[project]:S.proyectos.filter(x=>x.clienteId===client.id);
 const pIds=new Set(projects.map(x=>x.id)),qIds=new Set(projects.map(x=>x.cotizacionId).filter(Boolean));
 const quotes=scope==='client'?allQuotes().filter(x=>x.clienteId===id):allQuotes().filter(x=>qIds.has(x.id));
 const invoices=scope==='client'?liveInvoices().filter(x=>x.clienteId===id):liveInvoices().filter(x=>pIds.has(x.proyectoId)||(!!x.cotizacionId&&qIds.has(x.cotizacionId)));
 const costs=S.costos.filter(x=>pIds.has(x.proyectoId));
 const linked=new Set([...projects.map(x=>x.id),...quotes.map(x=>x.id),...invoices.map(x=>x.id),...costs.map(x=>x.id)]);
 const billed=invoices.reduce((a,d)=>a+num(d.neto),0),cost=costs.reduce((a,x)=>a+num(x.monto),0);
 const dates=projects.flatMap(x=>[x.fechaInicio,x.fechaFin]).filter(Boolean).sort();
 const projectReport=projects.map(p=>{const calc=pjCalc(p);const trees=pjTree(p.tareas||[]);
  return {nombre:p.nombre,estado:calc.label,fechaInicio:p.fechaInicio,fechaFin:p.fechaFin,responsable:p.responsable,avance:calc.avance,plan:calc.plan,
   tareas:trees.n.filter(x=>x.ok).map(x=>({nombre:x.t.nombre,inicio:x.ini||x.t.inicio,fin:x.fin||x.t.fin,nivel:x.nivel,avance:Math.round(x.av),plan:Math.round(x.pl)}))};
 });
 const paymentData=invoices.flatMap(f=>(f.pagos&&f.pagos.length?f.pagos:f.pago?[f.pago]:[]).map(p=>({fecha:p.fecha,factura:f.codigo,medio:p.medio,monto:num(p.monto),ref:p.ref||p.referencia||''})));
 return {scope,title:project?project.nombre:client.razon,clientName:client?client.razon:'Sin cliente',generated:fmtD(todayS()),demo:window.SebaLocal&&window.SebaLocal.isDemo(),
 owners:[...new Set(projects.map(x=>x.responsable).filter(Boolean))].join(' / '),period:dates.length?dates[0]+' a '+dates[dates.length-1]:'Sin fechas',
 description:project?(project.notas||''):projects.map(x=>x.nombre).join(' · '),
 metrics:{budget:projects.reduce((a,x)=>a+num(x.presupuesto),0),billed,paid:invoices.reduce((a,x)=>a+pagadoFac(x),0),due:invoices.reduce((a,x)=>a+saldoFac(x),0),cost},
 projects:projectReport, quotes:quotes.map(x=>({codigo:x.codigo,referencia:x.referencia,estado:estadoInfo(x).label,fecha:x.fecha,neto:x.neto})),
 invoices:invoices.map(x=>({codigo:x.codigo,estado:estadoInfo(x).label,fecha:x.fecha,vence:venceFac(x),total:x.total,saldo:saldoFac(x)})),
 payments:paymentData,costs:costs.map(x=>({fecha:x.fecha,categoria:x.categoria,descripcion:x.descripcion,comprobante:x.comprobante,monto:x.monto})),
 events:S.bitacora.filter(x=>linked.has(x.refId)).sort((a,b)=>b.fecha-a.fecha).map(x=>({date:new Date(x.fecha).toLocaleDateString('es-CL'),tipo:x.tipo,descripcion:x.descripcion}))};
}
async function v4ExportPDF(scope,id){
 if(!window.SebaReportPDF){toast('El módulo de PDF no se cargó. Abre la carpeta completa o usa el HTML portátil.',true);return}
 try{const data=v4ReportData(scope,id),pdf=window.SebaReportPDF.build(data);
  await S.dl.save({filename:'SEBA-INFORME-'+(scope==='project'?'OBRA-':'CLIENTE-')+slug(data.title)+'-'+todayS()+'.pdf',data:pdf});
  toast('Informe PDF descargado: '+data.title);
 }catch(err){console.error(err);toast('No se pudo exportar PDF: '+(err.message||'error no identificado'),true)}
}
const v4MountReportesOriginal=mountReportes;
mountReportes=function(){
 v4MountReportesOriginal();
 const header=$('#v-reportes .top');if(!header)return;
 const portfolio=document.createElement('section');portfolio.className='v4-export-area';portfolio.id='v4-pdf-export';
 portfolio.innerHTML='<div class="v4-report-title"><div><span class="v3-kicker">EXPORTACIONES PERSONALIZADAS</span><h2>Informe técnico y financiero en PDF</h2><p>Selecciona el cliente o la obra. El PDF incluye su trazabilidad, planificación Gantt, documentos, pagos, costos y movimientos registrados.</p></div><span class="v4-tag">INFORME COMPLETO</span></div>'+
 '<div class="v4-export-controls"><label>Informe por cliente<select id="v4-select-client" aria-label="Cliente para informe">'+(S.clientes.length?S.clientes.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.razon)+'</option>').join(''):'<option value="">Sin clientes</option>')+'</select></label><button class="btn" data-v4-pdf="client" '+(!S.clientes.length?'disabled':'')+'>Descargar PDF cliente ↓</button></div>'+
 '<div class="v4-export-controls"><label>Informe por proyecto<select id="v4-select-project" aria-label="Proyecto para informe">'+(S.proyectos.length?S.proyectos.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nombre)+' · '+esc(pjClient(p))+'</option>').join(''):'<option value="">Sin proyectos</option>')+'</select></label><button class="btn ghost" data-v4-pdf="project" '+(!S.proyectos.length?'disabled':'')+'>Descargar PDF obra ↓</button></div>'+
 '<p class="v4-export-note">Se incluyen los registros vinculados al alcance seleccionado. Los importes de facturación neta no incluyen IVA; pagos y saldos sí lo incluyen. El informe no es un DTE ni un estado de resultados auditado.</p>';
 header.insertAdjacentElement('afterend',portfolio);
 const reportBody=$('#report-body');if(reportBody)reportBody.insertAdjacentHTML('beforebegin','<div class="v4-report-divider"><span>INDICADORES CONSOLIDADOS · CARTERA GLOBAL</span><span>Detalle interactivo</span></div>');
};
const v4MountProjectOriginal=mountProject;
mountProject=function(){v4MountProjectOriginal();const p=S.editor&&S.editor.tipo==='proyecto'?S.editor.draft:null;if(!p||!p.id)return;
 const target=$('#pj-actions');if(!target)return;
 const b=document.createElement('button');b.type='button';b.className='btn ghost v4-pj-pdf';b.dataset.v4Pdf='project';b.dataset.reportId=p.id;b.textContent='Informe PDF de obra ↓';target.appendChild(b);
};
document.addEventListener('click',function(ev){
 const b=ev.target.closest('[data-v4-pdf]');if(!b)return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
 const scope=b.dataset.v4Pdf;const sel=scope==='client'?'#v4-select-client':'#v4-select-project';
 const id=b.dataset.reportId||($(sel)&&$(sel).value);
 if(!id){toast('Debes seleccionar un '+(scope==='client'?'cliente':'proyecto')+'.',true);return}
 v4ExportPDF(scope,id);
},true);

