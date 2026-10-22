/**
 * Voltage Obras · Delegación de eventos y acciones transversales
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- eventos globales ---------- */
function startNew(tipo,detailed=false){
  if(!S.canWrite){toast('Necesitas acceso de colaborador para crear documentos.',true);return}
  if(tipo==='cotizacion'&&!S.clientes.length){toast('Primero agrega un cliente.');clientModal(null,()=>openEditor('cotizacion',null));return}
  if(tipo==='factura'&&!S.clientes.length){toast('Primero agrega un cliente.');clientModal(null,()=>openEditor('factura',null));return}
  if(tipo==='cotizacion'&&detailed){const d=newDraft(tipo);d.modo='propuesta';openEditor(tipo,null,d)}else openEditor(tipo,null);
}
document.addEventListener('click',async ev=>{
  const t=ev.target;
  const g=t.closest('[data-go]');if(g){if(S.editor&&S.editor.dirty&&!isRO()){const ok=await confirmBox('Hay cambios sin guardar','Si sales ahora, se perderán los cambios de este documento.','Descartar y salir',true);if(!ok)return}go(g.dataset.go);return}
  const fu=t.closest('[data-followup]');if(fu){ev.preventDefault();ev.stopPropagation();showFollowup(fu.dataset.followup);return}
  const gt=t.closest('[data-gtoggle]');if(gt){const id=gt.dataset.gtoggle;S.pjCollapsed.has(id)?S.pjCollapsed.delete(id):S.pjCollapsed.add(id);if(S.editor&&S.view==='editor'&&S.editor.tipo==='proyecto'){fillTasks();paintProject()}else paintProyectos();return}
  const pt=t.closest('[data-ptoggle]');if(pt){const id=pt.dataset.ptoggle;S.pjOpen.has(id)?S.pjOpen.delete(id):S.pjOpen.add(id);paintProyectos();return}
  const pf=t.closest('[data-pdf]');if(pf){ev.stopPropagation();const d=S.docs.find(x=>x.id===pf.dataset.pdf);if(d)downloadPdf(d);return}
  const op=t.closest('[data-open]');if(op){const d=S.docs.find(x=>x.id===op.dataset.open);if(d)openEditor(d.tipo,d);return}
  const cc=t.closest('[data-cli]');if(cc){clientModal(cc.dataset.cli);return}
  const fl=t.closest('[data-fil]');if(fl){S.fil[fl.dataset.t==='cotizacion'?'cotizaciones':'facturas']=fl.dataset.fil;paintList(fl.dataset.t);return}
  const pj=t.closest('[data-proj]');if(pj){if(!await leaveOk())return;const p=S.proyectos.find(x=>x.id===pj.dataset.proj);if(p)openProject(p);return}
  const pf2=t.closest('[data-pfil]');if(pf2){S.fil.proyectos=pf2.dataset.pfil;paintProyectos();return}
  const pv=t.closest('[data-pjv]');if(pv){S.pjView=pv.dataset.pjv;paintProyectos();return}
  const a=t.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='new-cot')startNew('cotizacion');
  else if(act==='new-prop')startNew('cotizacion',true);
  else if(act==='new-fac')startNew('factura');
  else if(act==='new-proj')startProject();
  else if(act==='proj-from-cot'){if(S.editor.dirty){if(!await saveDoc(true))return}projFromCot(S.editor.draft)}
  else if(act==='pj-save')saveProject();
  else if(act==='pj-del')delProject();
  else if(act==='pj-add'){const ts=S.editor.draft.tareas,last=ts[ts.length-1],ini=last&&last.fin?addD(last.fin,1):S.editor.draft.fechaInicio;ts.push({id:uid(),nombre:'',inicio:ini,fin:addD(ini,6),avance:0,nivel:0,monto:0});S.editor.dirty=true;fillTasks();paintProject();const ins=$$('#pj-tasks [data-tk=nombre]');ins[ins.length-1].focus()}
  else if(act==='pj-sub'||act==='pj-in'||act==='pj-out'||act==='pj-rm'){
    const ts=S.editor.draft.tareas,i=+a.dataset.i,lv=num(ts[i].nivel);let end=i;while(end+1<ts.length&&num(ts[end+1].nivel)>lv)end++;
    if(act==='pj-sub'){if(lv>=3){toast('Se permiten hasta 4 niveles.',true);return}
      const kids=ts.slice(i+1,end+1).filter(x=>num(x.nivel)===lv+1),lastK=kids[kids.length-1],ini=lastK&&lastK.fin?addD(lastK.fin,1):(ts[i].inicio||S.editor.draft.fechaInicio);
      ts.splice(end+1,0,{id:uid(),nombre:'',inicio:ini,fin:addD(ini,6),avance:0,nivel:lv+1,monto:0});S.pjCollapsed.delete(ts[i].id);
      S.editor.dirty=true;fillTasks();paintProject();const nm=$$('#pj-tasks [data-tk=nombre]').find(e=>+e.dataset.ti===end+1);if(nm)nm.focus();return}
    if(act==='pj-in'){const mx=Math.max(...ts.slice(i,end+1).map(x=>num(x.nivel)));if(i===0||lv>=num(ts[i-1].nivel)+1||mx>=3){toast(i===0?'La primera tarea no puede ser subtarea.':'No se puede bajar más este nivel.',true);return}ts.slice(i,end+1).forEach(x=>x.nivel=num(x.nivel)+1)}
    else if(act==='pj-out'){if(lv===0)return;ts.slice(i,end+1).forEach(x=>x.nivel=num(x.nivel)-1)}
    else{if(end>i){const ok=await confirmBox('Quitar con sus subtareas','Esta tarea tiene '+(end-i)+' subtarea'+(end-i===1?'':'s')+'. Se quitan todas.','Quitar',true);if(!ok)return}ts.splice(i,end-i+1)}
    S.editor.dirty=true;fillTasks();paintProject()}
  else if(act==='pj-expand'){S.pjCollapsed.clear();fillTasks();paintProject()}
  else if(act==='pj-collapse'){pjTree(S.editor.draft.tareas).n.forEach(x=>{if(x.kids.length)S.pjCollapsed.add(x.t.id)});fillTasks();paintProject()}
  else if(act==='pl-expand'){S.proyectos.forEach(p=>S.pjOpen.add(p.id));S.pjCollapsed.clear();paintProyectos()}
  else if(act==='pl-collapse'){S.pjOpen.clear();paintProyectos()}
  else if(act==='new-cli'){if(!S.canWrite){toast('Necesitas acceso de colaborador para crear clientes.',true);return}clientModal(null)}
  else if(act==='csv')exportCsv(a.dataset.t);
  else if(act==='back')backToList();
  else if(act==='save')saveDoc();
  else if(act==='add-item'){S.editor.draft.items.push({d:'',u:'un',q:1,p:0});fillItems();paintEditor();const ins=$$('#ed-items .d');ins[ins.length-1].focus()}
  else if(act==='rm-item'){const it=S.editor.draft.items;if(it.length>1){it.splice(+a.dataset.i,1);S.editor.dirty=true;fillItems();paintEditor()}}
  else if(act==='cli-new-ed')clientModal(null,(id)=>{S.editor.draft.clienteId=id;S.editor.dirty=true;mountEditor();paintEditor()});
  else if(act==='pdf-ed'){const d=S.editor.draft,tt=totalsOf(d);downloadPdf(Object.assign({},d,tt,{clienteSnap:snapOf(d.clienteId,d),codigo:d.codigo||(d.tipo==='cotizacion'?'BORRADOR':'FACTURA-BORRADOR')}))}
  else if(act==='dup')dupDoc();
  else if(act==='del')delDoc();
  else if(act==='void')voidDoc();
  else if(act==='pay'){if(S.editor.dirty){if(!await saveDoc(true))return}payModal()}
  else if(act==='facturar'){if(S.editor.dirty){if(!await saveDoc(true))return}facturarModal()}
  else if(act==='dte-json'){const d=S.editor.draft;if(!S.dl){toast('La descarga no está disponible en esta vista.',true);return}
    try{await S.dl.save({filename:(d.codigo||'factura-borrador')+'-datos-sii.json',data:JSON.stringify(dteJson(Object.assign({},d,{clienteSnap:snapOf(d.clienteId,d)})),null,2)});toast('Archivo guardado.')}catch(e){if(!e||e.code!=='declined')toast('No se pudo guardar el archivo.',true)}}
  else if(secAct(act,a)){}
});


