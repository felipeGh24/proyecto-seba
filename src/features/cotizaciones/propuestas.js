/**
 * Voltage Obras · Cotizaciones detalladas por secciones y partidas
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* secciones de la cotización (formato propuesta) */
function setPath(o,path,v){const k=path.split('.');for(let i=0;i<k.length-1;i++)o=o[k[i]];o[k[k.length-1]]=v}
const numIn=(p,v,ph,al)=>'<input class="inp" type="number" min="0" step="any" data-p="'+p+'" data-t="n" aria-label="'+esc(al)+'" placeholder="'+esc(ph||'0')+'" value="'+(num(v)===0?'':esc(v))+'">';
const txtIn=(p,v,ph,al,x)=>'<input class="inp" type="text" data-p="'+p+'" data-t="s" aria-label="'+esc(al)+'" placeholder="'+esc(ph||'')+'" value="'+esc(v)+'" '+(x||'')+'>';
const xBtn=(act,at,al)=>'<button class="x" type="button" data-act="'+act+'" '+at+' aria-label="'+al+'">×</button>';
function secEdHTML(s,si){
  const P='secciones.'+si+'.',A='data-si="'+si+'"';
  let h='<div class="sed"><div class="sed-h"><span class="tag">'+(s.tipo==='lotes'?'Por lotes':'Con cantidades')+'</span>'+txtIn(P+'titulo',s.titulo,'Título de la sección','Título de la sección '+(si+1))+'<span class="mv"><button class="x" type="button" data-act="sec-up" '+A+' aria-label="Subir sección">↑</button><button class="x" type="button" data-act="sec-dn" '+A+' aria-label="Bajar sección">↓</button>'+xBtn('sec-rm',A,'Quitar sección')+'</span></div>';
  if(s.tipo==='lotes'){
    h+='<div class="sed-sc"><table class="sed-t"><thead><tr><th>Partida / especialidad</th>'+s.lotes.map((l,c)=>'<th><div class="lh">'+txtIn(P+'lotes.'+c,l,'Lote','Nombre del lote '+(c+1))+(s.lotes.length>1?xBtn('lote-rm',A+' data-c="'+c+'"','Quitar lote '+(c+1)):'')+'</div></th>').join('')+'<th>Total</th><th></th></tr></thead><tbody>'+
      s.filas.map((f,ri)=>'<tr><td>'+txtIn(P+'filas.'+ri+'.d',f.d,'Partida o especialidad','Partida '+(ri+1))+'</td>'+s.lotes.map((_,c)=>'<td>'+numIn(P+'filas.'+ri+'.v.'+c,f.v[c],'0','Monto neto lote '+(c+1)+', partida '+(ri+1))+'</td>').join('')+'<td class="tt" id="sr-'+si+'-'+ri+'"></td><td>'+(s.filas.length>1?xBtn('row-rm',A+' data-ri="'+ri+'"','Quitar partida '+(ri+1)):'')+'</td></tr>').join('')+
      '</tbody></table></div><div class="addrow"><button class="btn ghost sm" type="button" data-act="row-add" '+A+'>+ Agregar partida</button><button class="btn ghost sm" type="button" data-act="lote-add" '+A+'>+ Agregar lote</button></div>';
  }else{
    h+=s.grupos.map((g,gi)=>'<div class="sed-g">'+txtIn(P+'grupos.'+gi+'.t',g.t,'Subtítulo del grupo (opcional). Ej: Red Media Tensión','Subtítulo del grupo '+(gi+1))+(s.grupos.length>1?xBtn('grp-rm',A+' data-gi="'+gi+'"','Quitar grupo '+(gi+1)):'<span></span>')+'</div>'+
      g.items.map((it,ii)=>{const q=P+'grupos.'+gi+'.items.'+ii+'.';return '<div class="sed-it">'+txtIn(q+'d',it.d,'Descripción','Descripción ítem '+(ii+1))+numIn(q+'q',it.q,'Cant.','Cantidad')+txtIn(q+'u',it.u,'Unid.','Unidad','list="units"')+numIn(q+'t',it.t,'Total neto','Total neto del ítem')+(g.items.length>1?xBtn('it-rm',A+' data-gi="'+gi+'" data-ii="'+ii+'"','Quitar ítem '+(ii+1)):'<span></span>')+'</div>'}).join('')+
      '<button class="btn ghost sm" type="button" data-act="it-add" '+A+' data-gi="'+gi+'">+ Agregar ítem</button>').join('')+
      '<div class="addrow"><button class="btn ghost sm" type="button" data-act="grp-add" '+A+'>+ Agregar grupo con subtotal</button></div>';
  }
  return h+'<div class="sed-f">'+txtIn(P+'descLabel',s.descLabel,'Concepto del descuento','Concepto del descuento')+numIn(P+'descPct',s.descPct,'Desc. %','Porcentaje de descuento')+'</div><div class="sed-sum" id="ss-'+si+'"></div></div>';
}
function fillSecs(){const d=S.editor.draft;$('#ed-secs').innerHTML=d.secciones.map(secEdHTML).join('');paintSecTotals()}
function paintSecTotals(){
  const E=S.editor,d=E&&E.draft;if(!d||d.modo!=='propuesta'||!$('#ed-secs'))return;
  d.secciones.forEach((s,si)=>{const c=secCalc(s);
    if(s.tipo==='lotes')c.filas.forEach((v,ri)=>{const e=$('#sr-'+si+'-'+ri);if(e)e.textContent=clp(v)});
    const e=$('#ss-'+si);if(e)e.innerHTML='<span>Subtotal '+clp(c.sub)+'</span>'+(c.desc?'<span>Descuento -'+clp(c.desc)+'</span>':'')+'<span>Neto '+clp(c.neto)+'</span><b>Con IVA '+clp(c.total)+'</b>'});
}
function secAct(act,a){
  const E=S.editor,d=E&&E.draft;if(!d||d.modo!=='propuesta')return false;
  const ds=a.dataset,si=+ds.si,s=d.secciones[si];let focus=null;
  if(act==='sec-add')d.secciones.push(newSec(ds.k));
  else if(act==='sec-rm'){if(d.secciones.length<2){toast('La cotización necesita al menos una sección.',true);return true}d.secciones.splice(si,1)}
  else if(act==='sec-up'){if(si>0)d.secciones.splice(si-1,0,d.secciones.splice(si,1)[0])}
  else if(act==='sec-dn'){if(si<d.secciones.length-1)d.secciones.splice(si+1,0,d.secciones.splice(si,1)[0])}
  else if(act==='lote-add'){if(s.lotes.length>=8){toast('Máximo 8 lotes por sección.',true);return true}s.lotes.push('Lote N°'+(s.lotes.length+1));s.filas.forEach(f=>f.v.push(0))}
  else if(act==='lote-rm'){if(s.lotes.length<2)return true;s.lotes.splice(+ds.c,1);s.filas.forEach(f=>f.v.splice(+ds.c,1))}
  else if(act==='row-add'){s.filas.push({d:'',v:s.lotes.map(()=>0)});focus='tbody tr:last-child input'}
  else if(act==='row-rm'){if(s.filas.length>1)s.filas.splice(+ds.ri,1)}
  else if(act==='grp-add'){s.grupos.push({t:'',items:[{d:'',q:1,u:'C/U',t:0}]});focus='.sed-g:last-of-type input'}
  else if(act==='grp-rm'){if(s.grupos.length>1)s.grupos.splice(+ds.gi,1)}
  else if(act==='it-add'){const it=s.grupos[+ds.gi].items;it.push({d:'',q:1,u:'C/U',t:0})}
  else if(act==='it-rm'){const it=s.grupos[+ds.gi].items;if(it.length>1)it.splice(+ds.ii,1)}
  else return false;
  E.dirty=true;fillSecs();paintEditor();
  if(focus){const sc=$$('.sed')[si];const i=sc&&sc.querySelector(focus);if(i)i.focus()}
  else if(act==='it-add'){const g=$$('.sed')[si].querySelectorAll('.sed-it');const gi=+ds.gi;const sec=d.secciones[si];let idx=0;for(let k=0;k<=gi;k++)idx+=sec.grupos[k].items.length;const i=g[idx-1]&&g[idx-1].querySelector('input');if(i)i.focus()}
  return true;
}
function fillItems(){
  const d=S.editor.draft;
  $('#ed-items').innerHTML=d.items.map((l,i)=>'<div class="item"><input class="inp d" data-i="'+i+'" data-k="d" type="text" placeholder="Descripción del trabajo o producto" aria-label="Descripción línea '+(i+1)+'" value="'+esc(l.d)+'"><input class="inp u" data-i="'+i+'" data-k="u" type="text" list="units" aria-label="Unidad" value="'+esc(l.u)+'"><input class="inp q" data-i="'+i+'" data-k="q" type="number" min="0" step="any" aria-label="Cantidad" value="'+esc(l.q)+'"><input class="inp p" data-i="'+i+'" data-k="p" type="number" min="0" step="any" aria-label="Precio unitario neto" placeholder="Precio neto" value="'+(l.p===0?'':esc(l.p))+'"><div class="t" id="it-t-'+i+'">'+clp(num(l.q)*num(l.p))+'</div><button class="x" type="button" data-act="rm-item" data-i="'+i+'" aria-label="Quitar línea '+(i+1)+'">×</button></div>').join('');
}
$('#v-editor').addEventListener('input',ev=>{
  const t=ev.target;if(S.editor&&t.dataset&&t.dataset.p){setPath(S.editor.draft,t.dataset.p,t.dataset.t==='n'?(t.value===''?0:num(t.value)):t.value);S.editor.dirty=true;paintEditor();return}
  if(!S.editor||t.dataset.k===undefined)return;
  const i=+t.dataset.i,k=t.dataset.k,l=S.editor.draft.items[i];
  l[k]=k==='d'||k==='u'?t.value:t.value===''?0:num(t.value);
  const tt=$('#it-t-'+i);if(tt)tt.textContent=clp(Math.round(num(l.q)*num(l.p)));
  S.editor.dirty=true;paintEditor();
});
function paintEditor(){
  const {tipo,draft:d}=S.editor,cot=tipo==='cotizacion',t=totalsOf(d);
  $('#ed-sum').innerHTML='<div><span>Subtotal</span><span class="mono">'+clp(t.sub)+'</span></div>'+(t.desc?'<div><span>'+(d.modo==='propuesta'?'Descuentos':'Descuento '+NF2.format(d.descPct)+'%')+'</span><span class="mono">-'+clp(t.desc)+'</span></div>':'')+'<div><span>Monto neto</span><span class="mono">'+clp(t.neto)+'</span></div><div><span>'+(d.tipoDte===34?'IVA (exenta)':'IVA 19%')+'</span><span class="mono">'+clp(t.iva)+'</span></div><div class="t"><span>Total</span><span class="mono">'+clp(t.total)+'</span></div>';
  const full=Object.assign({},d,t,{clienteSnap:snapOf(d.clienteId,d)});
  $('#ed-prev').innerHTML=(cot?'':siiCard(full))+paperHTML(full);
  const st=S.editor.example?{label:'Ejemplo',cls:'info'}:d.id?estadoInfo(Object.assign({},d,{neto:t.neto})):{label:'Sin guardar',cls:''};
  $('#ed-pill').innerHTML='<span class="pill '+st.cls+'">'+st.label+(S.editor.dirty&&d.id?' · cambios sin guardar':'')+'</span>';
  paintEdActions();
  const n=$('#ed-note');
  const msgs=[];
  if(!cot)msgs.push('Prepara y controla la factura aquí. La emisión con validez tributaria se hace en el SII o en tu proveedor; anota su folio en «Folio SII».');
  if(d.cotizacionCodigo)msgs.push('Origen: cotización '+esc(d.cotizacionCodigo)+'.');
  if(!S.canWrite)msgs.unshift('Solo lectura: no tienes permiso para editar.');
  if(S.editor.example)msgs.unshift('Vista de ejemplo temporal. No se guarda ningún documento hasta que confirmes.');
  paintSecTotals();
  n.innerHTML=msgs.length?'<div class="note'+(S.canWrite?'':' warn')+'">'+msgs.join(' ')+'</div>':'';
}
function paintEdActions(){
  const {tipo,draft:d}=S.editor,cot=tipo==='cotizacion',ro=isRO(),w=S.canWrite;
  const st=d.id?estadoInfo(Object.assign({},d,{neto:totalsOf(d).neto})):{key:''};
  let h='';
  if(S.editor.example){setHTML($('#ed-actions'),(S.dl?'<button class="btn ghost" data-act="pdf-ed">Descargar PDF de ejemplo</button>':'')+'<button class="btn" data-act="new-cot">Crear mi cotización</button>');return}
  if(S.dl)h+='<button class="btn ghost" data-act="pdf-ed"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>PDF</button>';
  if(w&&d.id&&cot)h+='<button class="btn ghost" data-act="dup">Duplicar</button>';
  if(w&&d.id&&cot&&['enviada','aprobada','vencida'].includes(st.key)&&d.estado!=='facturada')h+='<button class="btn ghost" data-act="facturar">Facturar</button>';
  if(w&&d.id&&cot&&['aprobada','facturada'].includes(d.estado)){const pj=S.proyectos.find(p=>p.cotizacionId===d.id);h+=pj?'<button class="btn ghost" data-proj="'+pj.id+'">Ver proyecto</button>':'<button class="btn ghost" data-act="proj-from-cot">Crear proyecto</button>'}
  if(w&&d.id&&cot&&d.estado!=='facturada')h+='<button class="btn danger" data-act="del">Eliminar</button>';
  if(w&&d.id&&!cot&&['emitida','vencida','parcial'].includes(st.key))h+='<button class="btn ghost" data-act="pay">Registrar pago</button><button class="btn danger" data-act="void">Anular</button>';
  if(w&&!ro)h+='<button class="btn" data-act="save" id="btn-save">Guardar</button>';
  setHTML($('#ed-actions'),h);
}
function snapOf(id,d){
  const c=clientById(id);
  if(c)return {razon:c.razon,rut:c.rut,giro:c.giro||'',direccion:[c.direccion,c.comuna].filter(Boolean).join(', '),contacto:c.contacto||'',email:c.email||''};
  if(d&&d.clienteSnap&&d.clienteId===id)return d.clienteSnap;
  return {razon:'Selecciona un cliente',rut:'',giro:'',direccion:'',contacto:'',email:''};
}
function siiChecks(d){
  const e=emp(),c=clientById(d.clienteId)||{},cs=d.clienteSnap||{},tot=totalsOf(d).total;
  return [['RUT del emisor',!!e.rut],['Giro y código de actividad del emisor',!!(d.giroFac&&d.giroCod)],['Dirección y comuna del emisor',!!(e.direccion&&e.comuna)],
    ['RUT del cliente',!!cs.rut],['Giro del cliente',!!cs.giro],['Dirección y comuna del cliente',!!((c.direccion||cs.direccion)&&c.comuna)],['Al menos una línea con monto',tot>0]];
}
function siiCard(d){
  const ch=siiChecks(d),ok=ch.filter(x=>x[1]).length;
  return '<div class="sii"><h4>Preparación para el SII · '+ok+' de '+ch.length+'</h4><ul>'+ch.map(x=>'<li><span class="'+(x[1]?'ok':'no')+'" aria-hidden="true">'+(x[1]?'✓':'✕')+'</span><span>'+esc(x[0])+(x[1]?'':' <em style="color:var(--muted)">· falta</em>')+'</span></li>').join('')+'</ul><p class="hint" style="margin-top:8px">Esta plataforma no emite directamente al SII. Con estos datos completos puedes ingresar la factura en el SII o enviarla a un proveedor de facturación electrónica.</p><div class="acts"><button class="btn ghost sm" type="button" data-act="dte-json">Descargar datos para el SII (JSON)</button></div></div>';
}
function dteJson(d){
  const e=emp(),c=clientById(d.clienteId)||{},cs=d.clienteSnap||{},t=totalsOf(d),ex=d.tipoDte===34;
  const out={_nota:'Datos preparados por la plataforma de gestión con los nombres de campo del DTE del SII. No es un documento firmado ni tiene validez tributaria hasta emitirse en el SII o en un proveedor autorizado.',
    Encabezado:{IdDoc:{TipoDTE:ex?34:33,Folio:d.folioSII||0,FchEmis:d.fecha,FmaPago:num(d.plazoDias)?2:1,FchVenc:venceFac(d)},
      Emisor:{RUTEmisor:e.rut,RznSoc:e.razon,GiroEmis:d.giroFac||e.giro,Acteco:d.giroCod||'',DirOrigen:e.direccion,CmnaOrigen:e.comuna,CiudadOrigen:e.ciudad,Telefono:e.telefono,CorreoEmisor:e.email},
      Receptor:{RUTRecep:cs.rut,RznSocRecep:cs.razon,GiroRecep:cs.giro,DirRecep:c.direccion||cs.direccion,CmnaRecep:c.comuna||'',CiudadRecep:c.ciudad||'',CorreoRecep:c.email||cs.email||''},
      Totales:{MntNeto:ex?0:t.neto,MntExe:ex?t.neto:0,TasaIVA:ex?0:19,IVA:t.iva,MntTotal:t.total}},
    Detalle:(d.items||[]).filter(l=>(l.d||'').trim()).map((l,i)=>Object.assign({NroLinDet:i+1},ex?{IndExe:1}:{},{NmbItem:l.d,QtyItem:num(l.q),UnmdItem:l.u||'',PrcItem:num(l.p),MontoItem:Math.round(num(l.q)*num(l.p))}))};
  if(num(d.descPct)>0)out.DscRcgGlobal=[{NroLinDR:1,TpoMov:'D',TpoValor:'%',ValorDR:num(d.descPct)}];
  if(d.ordenCompra)out.Referencia=[{NroLinRef:1,TpoDocRef:'801',FolioRef:d.ordenCompra,FchRef:d.fecha}];
  return out;
}
function propBody(d){
  const cs=d.secciones.map(secCalc),m=n=>clp(n),mz=n=>n?clp(n):'-';
  const tr=(lab,vals,cls,span)=>'<tr class="'+cls+'"><td'+(span>1?' colspan="'+span+'"':'')+'>'+lab+'</td>'+vals.map(v=>'<td class="r">'+v+'</td>').join('')+'</tr>';
  const secs=d.secciones.map((s,si)=>{
    const c=cs[si],k=si+1,dl='DESCUENTO ('+esc((s.descLabel||'Descuento').toUpperCase())+' '+NF2.format(num(s.descPct))+'%)';
    let t='<div class="pp-sec"><div class="pp-sh">'+k+' · '+esc(s.titulo||'Sección '+k)+'</div><div class="pp-scroll"><table class="pp-t">';
    if(s.tipo==='lotes'){
      t+='<thead><tr><th class="l">Partida / Especialidad</th>'+s.lotes.map(l=>'<th>'+esc(l)+'</th>').join('')+'<th>Total neto</th></tr></thead><tbody>';
      s.filas.forEach((f,ri)=>{if(!(f.d||f.v.some(x=>num(x))))return;t+='<tr><td>'+esc(f.d||'Sin descripción')+'</td>'+s.lotes.map((_,i)=>'<td class="r">'+mz(Math.round(num(f.v[i])))+'</td>').join('')+'<td class="r"><b>'+mz(c.filas[ri])+'</b></td></tr>'});
      t+=tr('SUBTOTAL NETO',c.cols.map(x=>m(x.sub)).concat(m(c.sub)),'sub',1);
      if(c.desc)t+=tr(dl,c.cols.map(x=>'-'+m(x.desc)).concat('-'+m(c.desc)),'dsc',1)+tr('SUBTOTAL NETO',c.cols.map(x=>m(x.neto)).concat(m(c.neto)),'sub',1);
      t+=tr('IVA 19%',c.cols.map(x=>m(x.iva)).concat(m(c.iva)),'',1)+tr('TOTAL CON IVA',c.cols.map(x=>m(x.total)).concat(m(c.total)),'tot',1);
    }else{
      t+='<thead><tr><th class="l">Partida / Especialidad</th><th>Cant.</th><th>Unidad</th><th>Total neto</th></tr></thead><tbody>';
      s.grupos.forEach((g,gi)=>{
        if(g.t)t+='<tr class="g"><td colspan="4">'+esc(g.t)+'</td></tr>';
        g.items.forEach(i=>{if(!(i.d||num(i.t)))return;t+='<tr><td>'+esc(i.d||'Sin descripción')+'</td><td class="r">'+(num(i.q)?NF2.format(num(i.q)):'')+'</td><td class="r">'+esc(i.u||'')+'</td><td class="r">'+mz(Math.round(num(i.t)))+'</td></tr>'});
        if(s.grupos.length>1)t+=tr('SUBTOTAL '+esc((g.t||'GRUPO '+(gi+1)).toUpperCase()),[m(c.gs[gi])],'sub',3);
      });
      t+=tr('SUBTOTAL NETO',[m(c.sub)],'sub',3);
      if(c.desc)t+=tr(dl,['-'+m(c.desc)],'dsc',3)+tr('SUBTOTAL NETO',[m(c.neto)],'sub',3);
      t+=tr('IVA 19%',[m(c.iva)],'',3)+tr('TOTAL CON IVA',[m(c.total)],'tot',3);
    }
    return t+'</tbody></table></div></div>';
  }).join('');
  const T=totalsOf(d);
  const res='<div class="pp-sec"><div class="pp-sh">Resumen Económico Unificado</div><div class="pp-scroll"><table class="pp-t"><thead><tr><th class="l">Concepto</th><th>Subtotal neto</th><th>IVA 19%</th><th>Total con IVA</th></tr></thead><tbody>'+d.secciones.map((s,i)=>tr((i+1)+' · '+esc(s.titulo||'Sección '+(i+1)),[m(cs[i].neto),m(cs[i].iva),m(cs[i].total)],'',1)).join('')+tr('TOTAL OFERTA',[m(T.neto),m(T.iva),m(T.total)],'tot',1)+'</tbody></table></div></div>';
  return '<div class="pp-title"><b>Propuesta Técnico-Comercial</b>'+(d.referencia?'<span>'+esc(d.referencia)+'</span>':'')+'</div>'+(d.intro?'<p class="pp-intro">'+esc(d.intro)+'</p>':'')+secs+res+'<div class="p-bot"><div class="p-words">Son: '+pesosEnLetras(T.total)+'</div></div>';
}
function paperHTML(d){
  const e=emp(),cot=d.tipo==='cotizacion',cl=d.clienteSnap,t=d,prop=cot&&d.modo==='propuesta';
  const giroE=(!cot&&d.giroFac)?d.giroFac+(d.giroCod?' · cód. actividad '+d.giroCod:''):e.giro;
  const rows=(d.items||[]).filter(l=>l.d||num(l.p)).map((l,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(l.d||'Sin descripción')+'</td><td class="r">'+esc(l.u||'')+'</td><td class="r mono">'+NF2.format(num(l.q))+'</td><td class="r mono">'+clp(num(l.p))+'</td><td class="r mono">'+clp(Math.round(num(l.q)*num(l.p)))+'</td></tr>').join('');
  const fechaV=cot?addD(d.fecha,num(d.validezDias)):addD(d.fecha,num(d.plazoDias));
  const iss=[e.rut?'R.U.T. '+e.rut:'',giroE,[e.direccion,e.comuna,e.ciudad].filter(Boolean).join(', '),[e.email,e.telefono].filter(Boolean).join(' · ')].filter(Boolean);
  const logo=e.logo?'<div class="p-logo img"><img alt="" src="'+esc(e.logo)+'"></div>':'<div class="p-logo">'+esc(((e.razon||'EMPRESA').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('')||'EMPRESA').toUpperCase())+'</div>';
  const bank=(e.banco&&e.numCuenta)?'<div><h4>Datos para transferencia</h4><p>'+esc([e.titular,e.rutTitular?'RUT '+e.rutTitular:'',e.banco+' · '+e.tipoCuenta+' N° '+e.numCuenta,e.emailPagos?'Comprobante a '+e.emailPagos:''].filter(Boolean).join('\n'))+'</p></div>':'';
  return '<div class="paper"><div class="p-head"><div class="p-issuer">'+logo+'<div><b>'+esc(e.razon||'Razón social de la empresa')+'</b>'+iss.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>'+
   '<div class="p-box"><b>'+(cot?'COTIZACIÓN':'DOCUMENTO ADMINISTRATIVO DE COBRO')+'</b><span>N° '+esc(d.codigo||'(se asigna al guardar)')+'</span>'+(d.folioSII?'<em>Folio SII N° '+esc(d.folioSII)+'</em>':'')+'<em>'+fmtD(d.fecha)+'</em></div></div>'+
   '<dl class="p-meta"><dt>Señor(es)</dt><dd>'+esc(cl.razon)+'</dd><dt>'+(prop?'Proyecto':'Referencia')+'</dt><dd>'+esc(d.referencia||'-')+'</dd><dt>R.U.T.</dt><dd class="mono">'+esc(cl.rut?rutFmt(cl.rut):'-')+'</dd><dt>'+(cot?'Válida hasta':'Vence')+'</dt><dd>'+fmtD(fechaV)+'</dd><dt>Giro</dt><dd>'+esc(cl.giro||'-')+'</dd><dt>'+(cot?'Atención':'Orden de compra')+'</dt><dd>'+esc((cot?d.atencion:d.ordenCompra)||'-')+'</dd><dt>Dirección</dt><dd>'+esc(cl.direccion||'-')+'</dd><dt>'+(cot?'Plazo de ejecución':'Condición')+'</dt><dd>'+esc(cot?(d.plazoEjecucion||'-'):(num(d.plazoDias)?num(d.plazoDias)+' días':'Contado'))+'</dd></dl>'+
   (prop?propBody(d):'' )+(prop?'':   '<table class="p-lines"><thead><tr><th>#</th><th>Descripción</th><th class="r">Unid.</th><th class="r">Cant.</th><th class="r">P. unit.</th><th class="r">Total</th></tr></thead><tbody>'+(rows||'<tr><td colspan="6" style="color:var(--paper-muted)">Agrega líneas de detalle</td></tr>')+'</tbody></table>'+
   '<div class="p-bot"><div class="p-words">Son: '+pesosEnLetras(t.total)+'</div><div class="p-totals"><div><span>Subtotal</span><span class="mono">'+clp(t.sub)+'</span></div>'+(t.desc?'<div><span>Descuento '+NF2.format(d.descPct)+'%</span><span class="mono">-'+clp(t.desc)+'</span></div>':'')+'<div><span>Monto neto</span><span class="mono">'+clp(t.neto)+'</span></div><div><span>'+(d.tipoDte===34?'IVA (exenta)':'IVA 19%')+'</span><span class="mono">'+clp(t.iva)+'</span></div><div class="t"><span>TOTAL</span><span class="mono">'+clp(t.total)+'</span></div></div></div>')+
   '<div class="p-cond">'+(prop&&d.incluye?'<div><h4>Incluye</h4><p>'+esc(d.incluye)+'</p></div>':'')+(prop&&d.noIncluye?'<div><h4>No incluye</h4><p>'+esc(d.noIncluye)+'</p></div>':'')+(cot&&d.condPago?'<div><h4>Forma de pago</h4><p>'+esc(d.condPago)+'</p></div>':'')+(prop?'<div><h4>Validez de la oferta</h4><p>'+num(d.validezDias)+' días corridos desde la fecha de emisión.</p></div>':'')+(d.notas?'<div><h4>'+(prop?'Otras consideraciones':cot?'Condiciones':'Notas')+'</h4><p>'+esc(d.notas)+'</p></div>':'')+bank+'</div>'+
   (cot?'':'<div class="p-foot">Documento de gestión interna. La factura electrónica con validez tributaria se emite en el SII.</div>')+'</div>';
}

