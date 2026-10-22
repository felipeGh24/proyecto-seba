/**
 * Voltage Obras · Control de costos por obra y acciones
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* Seguimiento de costos directos: registro local para análisis de margen. */
function mountCostos(){
 $('#v-costos').innerHTML='<div class="top v3-top"><div><div class="eyebrow">CONTROL ECONÓMICO DE OBRAS</div><h1>Costos y margen</h1><p class="subtitle">Costos directos por proyecto, facturación neta asociada y margen bruto parcial.</p></div><div class="actions"><button class="btn ghost" data-act="cost-csv">Exportar costos</button><button class="btn" data-act="new-cost">+ Registrar costo</button></div></div><div id="costs-body"></div>';
 paintCostos();
}
function paintCostos(){
 const el=$('#costs-body');if(!el)return;
 const bill=liveInvoices().reduce((a,x)=>a+num(x.neto),0),cost=totalCost(),margin=bill-cost;
 const rows=S.proyectos.map(p=>{const f=liveInvoices().filter(d=>d.proyectoId===p.id||p.cotizacionId&&d.cotizacionId===p.cotizacionId).reduce((s,x)=>s+num(x.neto),0);const c=projectCosts(p.id);return {p,f,c,margin:f-c}}).sort((a,b)=>a.margin-b.margin);
 const movements=S.costos.slice().sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
 el.innerHTML='<div class="v3-cost-totals"><div><span>Facturado neto</span><strong>'+clp(bill)+'</strong></div><div><span>Costos directos</span><strong>'+clp(cost)+'</strong></div><div><span>Margen bruto parcial</span><strong class="'+(margin<0?'v3-red':'')+'">'+clp(margin)+'</strong></div></div><p class="v3-cost-warning">Este es un margen bruto operativo parcial, no utilidad neta ni flujo de caja: no incluye costos indirectos, impuestos, provisiones ni pagos futuros. Registra los costos reales para mejorar su precisión.</p>'+
 '<section class="v3-sheet"><header><div><span class="v3-kicker">RENTABILIDAD POR OBRA</span><h2>Costos frente a facturación</h2></div><span class="v3-count">'+rows.length+' obras</span></header><div class="scroll"><table class="tbl v3-table"><thead><tr><th>Proyecto</th><th>Facturado neto</th><th>Costos registrados</th><th>Margen parcial</th><th></th></tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr><td><b>'+esc(r.p.nombre)+'</b><small>'+esc(pjClient(r.p))+'</small></td><td class="mono">'+clp(r.f)+'</td><td class="mono">'+clp(r.c)+'</td><td class="mono '+(r.margin<0?'v3-red':'')+'">'+clp(r.margin)+'</td><td><button class="cell-link" data-add-cost="'+r.p.id+'">+ Costo</button></td></tr>').join(''):'<tr><td colspan="5" class="v2-table-empty">Aún no existen proyectos.</td></tr>')+'</tbody></table></div></section>'+
 '<section class="v3-sheet"><header><div><span class="v3-kicker">MOVIMIENTOS</span><h2>Registro de costos</h2></div></header><div class="scroll"><table class="tbl v3-table"><thead><tr><th>Fecha</th><th>Proyecto</th><th>Categoría y concepto</th><th>Proveedor</th><th>Monto sin IVA</th><th></th></tr></thead><tbody>'+(movements.length?movements.map(c=>{let p=S.proyectos.find(p=>p.id===c.proyectoId);return '<tr><td class="mono">'+esc(fmtD(c.fecha))+'</td><td>'+esc(p?p.nombre:'Proyecto eliminado')+'</td><td><b>'+esc(c.categoria||'Otros')+'</b><small>'+esc(c.descripcion||'')+'</small></td><td>'+esc(c.proveedor||'—')+'</td><td class="mono">'+clp(c.monto)+'</td><td><button class="cell-link" data-edit-cost="'+esc(c.id)+'">Editar</button></td></tr>'}).join(''):'<tr><td colspan="6" class="v2-table-empty">Sin costos registrados. Puedes ingresar uno desde Nueva entrada.</td></tr>')+'</tbody></table></div></section>';
}
function costModal(costId,projectId){
 const d=costId?S.costos.find(c=>c.id===costId):null;
 if(!S.proyectos.length){toast('Primero crea un proyecto.',true);return}
 const val=(x)=>esc(x||'');const opts=S.proyectos.map(p=>'<option value="'+p.id+'"'+((d&&d.proyectoId||projectId||S.proyectos[0].id)===p.id?' selected':'')+'>'+esc(p.nombre)+'</option>').join('');
 modal({title:d?'Editar costo directo':'Registrar costo directo',body:'<div class="field"><label for="cs-project">Proyecto</label><select class="inp" id="cs-project">'+opts+'</select></div><div class="two"><div class="field"><label for="cs-date">Fecha de registro</label><input type="date" class="inp" id="cs-date" value="'+(d?d.fecha:todayS())+'"></div><div class="field"><label for="cs-category">Categoría</label><select class="inp" id="cs-category">'+['Materiales','Mano de obra','Subcontrato','Transporte y logística','Arriendo de maquinaria','Otros'].map(c=>'<option'+(d&&d.categoria===c?' selected':'')+'>'+c+'</option>').join('')+'</select></div></div><div class="field"><label for="cs-desc">Descripción</label><input class="inp" id="cs-desc" value="'+val(d&&d.descripcion)+'" placeholder="Ej.: compra de fierro y perfiles"></div><div class="two"><div class="field"><label for="cs-amount">Monto sin IVA (CLP)</label><input class="inp" type="number" id="cs-amount" min="1" step="1" value="'+(d?num(d.monto):'')+'"></div><div class="field"><label for="cs-supplier">Proveedor</label><input class="inp" id="cs-supplier" value="'+val(d&&d.proveedor)+'" placeholder="Nombre del proveedor"></div></div><div class="field"><label for="cs-receipt">Referencia o comprobante</label><input class="inp" id="cs-receipt" value="'+val(d&&d.comprobante)+'" placeholder="Folio de respaldo"></div>',actions:[{label:'Cancelar',cls:'ghost',close:true},...(d?[{label:'Eliminar costo',cls:'ghost',run:async()=>{let ok=await confirmBox('Eliminar costo','Se eliminará este movimiento del registro.','Eliminar',true);if(!ok)return false;await wr(()=>S.db.collection('costos').doc(d.id).delete());await audit('costo',d.proyectoId,'Costo eliminado');toast('Costo eliminado.')}}]:[]),{label:d?'Guardar cambios':'Guardar costo',run:async()=>{
 const amount=Math.round(num($('#cs-amount').value));if(!$('#cs-project').value||!$('#cs-date').value||!$('#cs-desc').value.trim()||amount<=0){toast('Indica proyecto, fecha, descripción y monto positivo.',true);return false}
 const proj=$('#cs-project').value,p=S.proyectos.find(x=>x.id===proj);
 const payload={proyectoId:proj,clienteId:p?p.clienteId:'',fecha:$('#cs-date').value,categoria:$('#cs-category').value,descripcion:$('#cs-desc').value.trim(),monto:amount,proveedor:$('#cs-supplier').value.trim(),comprobante:$('#cs-receipt').value.trim(),creado:d?d.creado:Date.now(),actualizado:Date.now()};
 const ref=S.db.collection('costos').doc(d?d.id:undefined);await wr(()=>ref.set(payload));await audit('costo',proj,(d?'Costo actualizado':'Costo registrado')+' · '+clp(amount));toast('Movimiento guardado.');
 }}]});
}
async function exportCostsCsv(){
 const fields=['Fecha','Proyecto','Cliente','Categoría','Descripción','Proveedor','Comprobante','Monto sin IVA'];const safe=v=>'"'+String(v==null?'':v).replace(/^\s*[=+@-]/,x=>"'"+x).replace(/"/g,'""')+'"';const lines=[fields.map(safe).join(';')];
 S.costos.forEach(x=>{const p=S.proyectos.find(z=>z.id===x.proyectoId);const c=S.clientes.find(z=>z.id===x.clienteId);lines.push([x.fecha,p&&p.nombre,c&&c.razon,x.categoria,x.descripcion,x.proveedor,x.comprobante,x.monto].map(safe).join(';'))});
 await S.dl.save({filename:'costos-por-proyecto-'+todayS()+'.csv',data:'\ufeff'+lines.join('\r\n')});toast('Costos exportados.');
}
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-add-cost],[data-edit-cost],[data-act="new-cost"],[data-act="cost-csv"],[data-act="reset-demo"],[data-act="clear-demo"]');if(!el)return;
 if(el.hasAttribute('data-add-cost'))return costModal(null,el.dataset.addCost);
 if(el.hasAttribute('data-edit-cost'))return costModal(el.dataset.editCost);
 const a=el.dataset.act;
 if(a==='new-cost')costModal();
 if(a==='cost-csv')await exportCostsCsv();
 if(a==='reset-demo'||a==='clear-demo'){
 const ok=await confirmBox(a==='reset-demo'?'Restablecer datos DEMO':'Vaciar registros locales',a==='reset-demo'?'Esta acción reemplazará TODOS los datos de esta versión por ocho empresas ficticias. Descarga un respaldo antes de continuar.':'Esta acción borrará todos los registros locales de esta versión. Descarga un respaldo antes de continuar.',a==='reset-demo'?'Restablecer DEMO':'Vaciar registros',true);
 if(!ok)return;
 if(a==='reset-demo')window.SebaLocal.resetDemo();else window.SebaLocal.clear();toast(a==='reset-demo'?'Demo restablecida.':'Registros locales vaciados.');go('panel');
 }
});

