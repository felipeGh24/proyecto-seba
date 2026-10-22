/**
 * Voltage Obras · Información contextual de módulos
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
// Anexa contexto de uso sin modificar formularios existentes ni sus eventos.
const reportPainterV2=paintReportes;
paintReportes=function(){reportPainterV2();const area=$('#report-body');if(!area)return;const bill=liveInvoices().reduce((a,f)=>a+num(f.neto),0),cost=totalCost();area.insertAdjacentHTML('beforeend','<section class="v3-sheet v3-report-extra"><header><div><span class="v3-kicker">RESULTADO OPERATIVO</span><h2>Margen bruto parcial</h2></div><button class="text-btn" data-go="costos">Ver costos →</button></header><div class="v3-cost-totals"><div><span>Facturado neto</span><strong>'+clp(bill)+'</strong></div><div><span>Costos directos</span><strong>'+clp(cost)+'</strong></div><div><span>Margen bruto parcial</span><strong class="'+(bill-cost<0?'v3-red':'')+'">'+clp(bill-cost)+'</strong></div></div><p class="v3-note">No equivale a utilidad neta: faltan gastos indirectos, impuestos y costos no contabilizados.</p></section>');};
const originalMountCompany=mountConfig;
mountConfig=function(){originalMountCompany();const v=$('#v-config');const box=document.createElement('div');box.className='v2-company-intro';box.innerHTML='<div><b>¿Para qué sirve «Empresa»?</b><p>Aquí defines la identidad legal y comercial que aparecerá en documentos y reportes: razón social, RUT, giro, contacto, logo, datos de transferencia y condiciones predeterminadas de cotización y facturación.</p></div><span>Se aplica a los próximos documentos</span>';const top=v.querySelector('.top');if(top)top.insertAdjacentElement('afterend',box)};
// En la lista de obras suma un resumen de gestión que se recalcula con cada cambio.
const originalMountProjects=mountProyectos;
mountProyectos=function(){originalMountProjects();const top=$('#v-proyectos .top');if(top){top.insertAdjacentHTML('afterend','<div id="v2-project-pulse" class="v2-project-pulse"></div>');drawProjectPulse()}};
const originalPaintProjects=paintProyectos;
paintProyectos=function(){originalPaintProjects();drawProjectPulse()};
function drawProjectPulse(){const box=$('#v2-project-pulse');if(!box)return;const a=S.proyectos.filter(p=>p.estado==='en_curso');const b=a.filter(p=>pjCalc(p).key==='atraso');const p=S.proyectos.filter(x=>x.estado==='planificado');const end=S.proyectos.filter(x=>x.estado==='terminado');box.innerHTML='<div><span>Planificados</span><b>'+p.length+'</b></div><div><span>En ejecución</span><b>'+a.length+'</b></div><div><span>Con desvíos</span><b class="'+(b.length?'red':'')+'">'+b.length+'</b></div><div><span>Finalizados</span><b>'+end.length+'</b></div>'}


/* Contexto operativo por área: resumen compacto, sin duplicar el dashboard. */
const legacyMountList=mountList,legacyPaintList=paintList;
mountList=function(tipo){legacyMountList(tipo);const root=$('#v-'+(tipo==='cotizacion'?'cotizaciones':'facturas'));const top=root.querySelector('.top');if(top){top.insertAdjacentHTML('afterend','<div class="v2-area-pulse" id="pulse-'+tipo+'"></div>');drawAreaPulse(tipo)}};
paintList=function(tipo){legacyPaintList(tipo);drawAreaPulse(tipo)};
function drawAreaPulse(tipo){const x=$('#pulse-'+tipo);if(!x)return;
 let stats=[];if(tipo==='cotizacion'){const q=allQuotes();stats=[
 ['Presupuestos',q.length,'Todos los estados'],
 ['Enviados',q.filter(d=>d.estado==='enviada').length,'Esperando respuesta'],
 ['En elaboración',q.filter(d=>['borrador','ingresada','en_preparacion'].includes(d.estado)).length,'Pendientes de enviar'],
 ['Seguimientos atrasados',q.filter(d=>!['aprobada','facturada','rechazada'].includes(d.estado)&&d.proximoContacto&&d.proximoContacto<todayS()).length,'Próxima acción vencida']
 ]}else{const d=liveInvoices(),p=d.filter(v=>saldoFac(v)>0);stats=[
 ['Total por cobrar',clp(p.reduce((a,d)=>a+saldoFac(d),0)),'Saldo después de abonos'],
 ['Vencidas',p.filter(d=>venceFac(d)<todayS()).length,'Requieren seguimiento'],
 ['Con abonos',p.filter(d=>pagadoFac(d)>0).length,'Saldo parcial'],
 ['Pagadas',d.filter(v=>saldoFac(v)<=0).length,'Cobro registrado']
 ]}
 x.innerHTML=stats.map(([label,value,detail])=>'<div><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(detail)+'</small></div>').join('');
}
const legacyMountClients=mountClientes,legacyPaintClients=paintClientes;
mountClientes=function(){legacyMountClients();const top=$('#v-clientes .top');if(top){top.insertAdjacentHTML('afterend','<div id="v2-clients-pulse" class="v2-client-pulse"></div>');drawClientsPulse()}};
paintClientes=function(){legacyPaintClients();drawClientsPulse()};
function drawClientsPulse(){const target=$('#v2-clients-pulse');if(!target)return;
 const clients=S.clientes.length,income=liveInvoices(),due=income.reduce((a,v)=>a+saldoFac(v),0),active=S.proyectos.filter(p=>p.estado==='en_curso').length;
 target.innerHTML='<div><b>'+clients+'</b><span>Clientes registrados</span></div><div><b>'+active+'</b><span>Proyectos en ejecución</span></div><div><b>'+clp(due)+'</b><span>Cartera por cobrar</span></div>';
}


