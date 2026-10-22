/**
 * Voltage Obras · CRUD de clientes
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- CLIENTES ---------- */
function mountClientes(){
  $('#v-clientes').innerHTML='<div class="top"><div><div class="eyebrow">Quién te compra</div><h1>Clientes</h1></div><div class="actions"><button class="btn" data-act="new-cli"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Nuevo cliente</button></div></div>'+
   '<div class="toolbar"><div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input class="inp" id="q-cli" type="search" placeholder="Buscar por nombre o RUT" aria-label="Buscar cliente" value="'+esc(S.q.clientes)+'"></div></div><div class="card"><div class="scroll" id="rows-cli"></div></div>';
  $('#q-cli').addEventListener('input',e=>{S.q.clientes=e.target.value;paintClientes()});
  paintClientes();
}
function paintClientes(){
  const el=$('#rows-cli');if(!el)return;
  const q=S.q.clientes.trim().toLowerCase();
  let list=S.clientes.slice().sort((a,b)=>a.razon.localeCompare(b.razon,'es'));
  if(!S.clientes.length){el.innerHTML='<div class="empty"><b>Aún no hay clientes</b>Agrega el primero para poder cotizarle.<br>'+(S.canWrite?'<button class="btn" data-act="new-cli">Nuevo cliente</button>':'')+'</div>';return}
  if(q)list=list.filter(c=>(c.razon+' '+c.rut+' '+(c.contacto||'')).toLowerCase().includes(q));
  if(!list.length){el.innerHTML='<div class="empty"><b>Sin resultados</b></div>';return}
  el.innerHTML='<table class="tbl" style="min-width:700px"><thead><tr><th>Cliente</th><th>Contacto</th><th class="r">Cotizado abierto</th><th class="r">Facturado, neto</th><th class="r">Por cobrar</th></tr></thead><tbody>'+list.map(c=>{
    const ds=S.docs.filter(d=>d.clienteId===c.id);
    const ab=ds.filter(d=>d.tipo==='cotizacion'&&['enviada'].includes(estadoInfo(d).key)).reduce((a,d)=>a+d.total,0);
    const fa=ds.filter(d=>d.tipo==='factura'&&d.estado!=='anulada').reduce((a,d)=>a+d.neto,0);
    const pc=ds.filter(d=>d.tipo==='factura'&&d.estado!=='anulada').reduce((a,d)=>a+saldoFac(d),0);
    return '<tr class="row" data-cli="'+c.id+'"><td><span class="nm">'+esc(c.razon)+'</span><small class="mono">'+esc(rutFmt(c.rut))+'</small></td><td>'+esc(c.contacto||'')+'<small>'+esc(c.email||c.telefono||'')+'</small></td><td class="r mono">'+clp(ab)+'</td><td class="r mono">'+clp(fa)+'</td><td class="r mono">'+clp(pc)+'</td></tr>'}).join('')+'</tbody></table>';
}
function clientModal(id,onSaved){
  const c=id?clientById(id):{};
  const f=(i,l,v,ph,x)=>'<div class="field"><label for="'+i+'">'+l+'</label><input class="inp" id="'+i+'" type="text" value="'+esc(v||'')+'" placeholder="'+(ph||'')+'" '+(x||'')+'></div>';
  modal({title:id?'Editar cliente':'Nuevo cliente',body:
    f('c-razon','Razón social',c.razon,'Ej: Inmobiliaria Costanera S.A.')+
    '<div class="two">'+f('c-rut','RUT',c.rut?rutFmt(c.rut):'','12.345.678-5')+f('c-giro','Giro',c.giro,'Ej: Inmobiliaria')+'</div><div id="c-err" class="err" hidden></div>'+
    '<div class="two">'+f('c-dir','Dirección',c.direccion,'')+f('c-com','Comuna',c.comuna,'')+'</div>'+
    '<div class="two">'+f('c-con','Persona de contacto',c.contacto,'')+f('c-tel','Teléfono',c.telefono,'')+'</div>'+f('c-mail','Correo',c.email,'compras@empresa.cl'),
    actions:[{label:'Cancelar',cls:'ghost',close:true},{label:'Guardar cliente',run:async b=>{
      const g=i=>$('#'+i,b).value.trim(),err=$('#c-err',b);
      const razon=g('c-razon'),rut=g('c-rut');
      if(!razon){err.textContent='Escribe la razón social.';err.hidden=false;return false}
      if(!rutValid(rut)){err.textContent='El RUT no es válido. Revisa el dígito verificador.';err.hidden=false;return false}
      if(S.clientes.some(x=>x.id!==id&&rutClean(x.rut)===rutClean(rut))){err.textContent='Ya existe un cliente con ese RUT.';err.hidden=false;return false}
      const data={razon,rut:rutFmt(rut),giro:g('c-giro'),direccion:g('c-dir'),comuna:g('c-com'),contacto:g('c-con'),telefono:g('c-tel'),email:g('c-mail'),actualizado:Date.now()};
      const ref=id?S.db.collection('clientes').doc(id):S.db.collection('clientes').doc();
      if(!id)data.creado=Date.now();else data.creado=c.creado||Date.now();
      await wr(()=>ref.set(data));
      const row=Object.assign({id:ref.id},data),ix=S.clientes.findIndex(x=>x.id===ref.id);
      if(ix>=0)S.clientes[ix]=row;else S.clientes.push(row);
      toast('Cliente guardado.');
      if(onSaved)onSaved(ref.id,data);
    }}]});
}

