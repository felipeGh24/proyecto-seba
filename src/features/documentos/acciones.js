/**
 * Voltage Obras · Guardado, conversión de documentos, acciones comerciales
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* guardar y acciones de documento */
function cleanSecs(d){
  const out=[];
  for(const s0 of d.secciones){
    const s=JSON.parse(JSON.stringify(s0));
    s.titulo=(s.titulo||'').trim();s.descLabel=(s.descLabel||'').trim();s.descPct=Math.min(100,Math.max(0,num(s.descPct)));
    if(s.tipo==='lotes'){
      s.lotes=s.lotes.map((l,i)=>(l||'').trim()||'Lote N°'+(i+1));
      s.filas=s.filas.filter(f=>(f.d||'').trim()||f.v.some(x=>num(x)));
      if(s.filas.some(f=>!(f.d||'').trim())){toast('Cada partida necesita una descripción.',true);return null}
      s.filas.forEach(f=>{f.d=f.d.trim();f.v=f.v.map(x=>Math.max(0,Math.round(num(x))))});
      if(s.filas.length)out.push(s);
    }else{
      s.grupos.forEach(g=>{g.t=(g.t||'').trim();g.items=g.items.filter(i=>(i.d||'').trim()||num(i.t))});
      s.grupos=s.grupos.filter(g=>g.items.length);
      if(s.grupos.some(g=>g.items.some(i=>!(i.d||'').trim()))){toast('Cada ítem necesita una descripción.',true);return null}
      s.grupos.forEach(g=>g.items.forEach(i=>{i.d=i.d.trim();i.u=(i.u||'').trim();i.q=Math.max(0,num(i.q));i.t=Math.max(0,Math.round(num(i.t)))}));
      if(s.grupos.length)out.push(s);
    }
  }
  if(!out.length||!out.some(s=>secCalc(s).sub>0)){toast('Agrega al menos una partida con precio.',true);return null}
  return out;
}
async function saveDoc(silent){
  const E=S.editor;if(!E||E.saving)return false;
  const d=E.draft,cot=d.tipo==='cotizacion';
  if(!d.clienteId||!clientById(d.clienteId)&&!d.clienteSnap){toast('Selecciona un cliente.',true);return false}
  const prop=d.modo==='propuesta';let items=[],secs=null;
  if(prop){secs=cleanSecs(d);if(!secs)return false}
  else{
  items=d.items.filter(l=>(l.d||'').trim()||num(l.p));
  if(!items.length||items.some(l=>!(l.d||'').trim())){toast('Cada línea necesita una descripción.',true);return false}
  if(items.some(l=>num(l.q)<=0)){toast('Las cantidades deben ser mayores a cero.',true);return false}
  if(!items.some(l=>num(l.p)>0)){toast('Agrega al menos un precio.',true);return false}
  }
  E.saving=true;const b=$('#btn-save');if(b)b.disabled=true;
  try{
    if(prop){d.secciones=secs;d.items=secs.map(x=>({d:x.titulo||'Sección',u:'gl',q:1,p:secCalc(x).neto}))}
    else d.items=items.map(l=>({d:l.d.trim(),u:(l.u||'un').trim(),q:num(l.q),p:num(l.p)}));
    const t=totalsOf(d);
    const cs=snapOf(d.clienteId,d);
    const payload=Object.assign({},d,t,{clienteSnap:cs,descPct:num(d.descPct),actualizado:Date.now()});
    delete payload.id;
    let ref;
    if(!d.id){
      const n=await wr(()=>nextNumber(d.tipo));
      ref=S.db.collection('documentos').doc();
      payload.numero=n;payload.codigo=(cot?'COT-':'FAC-')+String(n).padStart(4,'0');payload.creado=Date.now();
      if(!cot&&payload.estado!=='anulada')payload.estado='emitida';
    }else{ref=S.db.collection('documentos').doc(d.id);payload.creado=d.creado||Date.now()}
    await wr(()=>ref.set(payload));
    // factura nueva desde cotización: actualizar la cotización
    if(!cot&&!d.id&&d.cotizacionId){
      const c=S.docs.find(x=>x.id===d.cotizacionId);
      if(c){const fn=num(c.facturadoNeto)+t.neto;await wr(()=>S.db.collection('documentos').doc(c.id).update({facturadoNeto:fn,estado:fn>=c.neto-1?'facturada':'aprobada',actualizado:Date.now()}))}
    }
    Object.assign(d,payload,{id:ref.id});
    await audit(cot?'cotizacion':'factura',ref.id,(cot?'Cotización ':'Factura ')+d.codigo+' '+(d.id?'actualizada':'guardada')+' · '+estadoInfo(d).label);
    E.dirty=false;
    if(!silent)toast((cot?'Cotización ':'Factura ')+d.codigo+' guardada.');
    $('#ed-code').textContent=d.codigo;paintEditor();
    return true;
  }catch(e){return false}
  finally{E.saving=false;const b2=$('#btn-save');if(b2)b2.disabled=false}
}
async function backToList(){
  const E=S.editor;if(!E)return;
  if(E.dirty&&!isRO()){const ok=await confirmBox('Hay cambios sin guardar','Si vuelves ahora, se perderán los cambios de este documento.','Descartar y volver',true);if(!ok)return}
  go(E.tipo==='cotizacion'?'cotizaciones':E.tipo==='proyecto'?'proyectos':'facturas');
}
function facturarModal(){
  const E=S.editor,c=E.draft,t=totalsOf(c),fn=num(c.facturadoNeto),pend=Math.max(0,t.neto-fn);
  modal({title:'Facturar '+c.codigo,body:
   '<p class="muted" style="margin-bottom:12px">Neto cotizado '+clp(t.neto)+(fn?' · ya facturado '+clp(fn)+' · pendiente '+clp(pend):'')+'</p>'+
   '<label class="radio"><input type="radio" name="fm" value="all" checked><span><b>'+(fn?'Saldo pendiente':'Cotización completa')+'</b><br><span class="hint">'+(fn?'Una línea por el saldo, '+clp(pend)+' neto':'Copia todas las líneas y el descuento')+'</span></span></label>'+
   '<label class="radio"><input type="radio" name="fm" value="pct"><span><b>Porcentaje</b><br><span class="hint">Para anticipos o estados de pago</span></span><input class="inp" id="fm-pct" type="number" min="1" max="100" step="any" value="30" style="width:84px;margin-left:auto" aria-label="Porcentaje a facturar"><span>%</span></label>'+
   '<div id="fm-err" class="err" hidden></div>',
   actions:[{label:'Cancelar',cls:'ghost',close:true},{label:'Crear factura',run:async b=>{
     const mode=$('input[name=fm]:checked',b).value,err=$('#fm-err',b);
     let draft=newDraft('factura');
     draft.clienteId=c.clienteId;draft.referencia='Cotización '+c.codigo+(c.referencia?' · '+c.referencia:'');draft.cotizacionId=c.id;draft.cotizacionCodigo=c.codigo;
     if(mode==='all'&&!fn){draft.items=JSON.parse(JSON.stringify(c.items));draft.descPct=c.descPct||0}
     else{
       let amt,label;
       if(mode==='all'){amt=pend;label='Saldo según cotización '+c.codigo}
       else{const p=num($('#fm-pct',b).value);if(!(p>0&&p<=100)){err.textContent='Ingresa un porcentaje entre 1 y 100.';err.hidden=false;return false}amt=Math.round(t.neto*p/100);label=NF2.format(p)+'% según cotización '+c.codigo}
       if(amt>pend+1){err.textContent='El monto supera lo pendiente por facturar ('+clp(pend)+' neto).';err.hidden=false;return false}
       if(amt<=0){err.textContent='No hay saldo pendiente por facturar.';err.hidden=false;return false}
       draft.items=[{d:label+(c.referencia?' - '+c.referencia:''),u:'gl',q:1,p:amt}];draft.descPct=0;
     }
     draft.clienteSnap=snapOf(c.clienteId,c);
     setTimeout(()=>openEditor('factura',null,draft),0);
   }}]});
}
function payModal(){
  const d=S.editor.draft,rest=saldoFac(d);
  if(rest<=0){toast('No queda saldo pendiente.');return}
  modal({title:'Registrar abono · '+d.codigo,body:'<p class="muted" style="margin-bottom:12px">Saldo pendiente '+clp(rest)+' · Abonos anteriores '+clp(pagadoFac(d))+'</p>'+ 
    '<div class="two"><div class="field"><label for="pg-f">Fecha del abono</label><input class="inp" id="pg-f" type="date" value="'+todayS()+'"></div><div class="field"><label for="pg-m">Medio de pago</label><select class="inp" id="pg-m"><option>Transferencia</option><option>Cheque</option><option>Efectivo</option><option>Otro</option></select></div></div>'+ 
    '<div class="field"><label for="pg-v">Monto del abono (CLP)</label><input class="inp" id="pg-v" type="number" min="1" max="'+rest+'" value="'+rest+'"></div><div class="field"><label for="pg-r">Referencia</label><input class="inp" id="pg-r" type="text" placeholder="N° de comprobante"></div>',
    actions:[{label:'Cancelar',cls:'ghost',close:true},{label:'Guardar abono',run:async b=>{
      const f=$('#pg-f',b).value,v=Math.round(num($('#pg-v',b).value));
      if(!f||!Number.isFinite(v)||v<=0||v>rest){toast('Verifica fecha y monto. El abono debe ser positivo y no exceder el saldo.',true);return false}
      const pago={id:uid(),fecha:f,medio:$('#pg-m',b).value,ref:$('#pg-r',b).value.trim(),monto:v};
      const anteriores=d.pagos&&d.pagos.length?d.pagos.slice():d.pago?[d.pago]:[],pagos=[...anteriores,pago];
      const estado=pagos.reduce((s,p)=>s+num(p.monto),0)>=num(d.total)?'pagada':'emitida';
      await wr(()=>S.db.collection('documentos').doc(d.id).update({estado,pagos,actualizado:Date.now()}));
      d.estado=estado;d.pagos=pagos;delete d.pago;
      await audit('pago',d.id,'Abono '+clp(v)+' registrado en '+d.codigo);
      toast('Abono de '+clp(v)+' registrado. Saldo '+clp(saldoFac(d)));mountEditor();
    }}]});
}
async function voidDoc(){
  const d=S.editor.draft;
  const ok=await confirmBox('Anular '+d.codigo,'La factura queda registrada como anulada y deja de contar como por cobrar. Esta acción no se puede deshacer.','Anular factura',true);if(!ok)return;
  try{
    await wr(()=>S.db.collection('documentos').doc(d.id).update({estado:'anulada',actualizado:Date.now()}));
    if(d.cotizacionId){const c=S.docs.find(x=>x.id===d.cotizacionId);if(c){const fn=Math.max(0,num(c.facturadoNeto)-d.neto);await wr(()=>S.db.collection('documentos').doc(c.id).update({facturadoNeto:fn,estado:'aprobada',actualizado:Date.now()}))}}
    d.estado='anulada';toast(d.codigo+' anulada.');mountEditor();
  }catch(e){}
}
async function delDoc(){
  const d=S.editor.draft;
  const ok=await confirmBox('Eliminar '+d.codigo,'Se borra la cotización de forma permanente.','Eliminar',true);if(!ok)return;
  try{await wr(()=>S.db.collection('documentos').doc(d.id).delete());S.editor.dirty=false;toast('Cotización eliminada.');go('cotizaciones')}catch(e){}
}
function dupDoc(){
  const d=JSON.parse(JSON.stringify(S.editor.draft));
  ['id','numero','codigo','creado','actualizado','facturadoNeto','pago'].forEach(k=>delete d[k]);
  d.estado='borrador';d.fecha=todayS();
  openEditor('cotizacion',null,d);toast('Copia lista. Revísala y guárdala.');
}

