/**
 * Voltage Obras · Editor de facturas y cotizaciones
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- EDITOR ---------- */
function newSec(k){return k==='lotes'?{id:uid(),tipo:'lotes',titulo:'Partidas por lote',descPct:0,descLabel:'Atención comercial',lotes:['Lote N°1','Lote N°2'],filas:[{d:'',v:[0,0]}]}:{id:uid(),tipo:'lista',titulo:'Obras y servicios',descPct:0,descLabel:'Atención comercial',grupos:[{t:'',items:[{d:'',q:1,u:'C/U',t:0}]}]}}
function newDraft(tipo){
  const e=emp(),base={tipo,fecha:todayS(),clienteId:'',items:[{d:'',u:'un',q:1,p:0}],descPct:0,referencia:'',estado:tipo==='cotizacion'?'ingresada':'emitida'};
  if(tipo==='cotizacion')return Object.assign(base,{modo:'simple',intro:'',secciones:[newSec('lista')],incluye:'',noIncluye:'',validezDias:num(e.cotValidez)||15,atencion:'',plazoEjecucion:'',condPago:'',notas:e.cotNotas||''});
  const g0=girosList()[0];
  return Object.assign(base,{plazoDias:num(e.facPlazo),ordenCompra:'',folioSII:'',notas:g0&&g0.notas?g0.notas:'',tipoDte:g0&&g0.tipo===34?34:33,giroFac:g0?g0.nombre:'',giroCod:g0?(g0.codigo||''):'',cotizacionId:'',cotizacionCodigo:'',proyectoId:''});
}
function openEditor(tipo,doc,draftOverride,example){
  let draft=draftOverride||(doc?JSON.parse(JSON.stringify(doc)):newDraft(tipo));
  if(doc&&!draft.items.length)draft.items=[{d:'',u:'un',q:1,p:0}];
  S.editor={tipo,draft,dirty:!!draftOverride&&!doc&&!example,saving:false,example:!!example};
  S.view='editor';
  $$('main > section').forEach(s=>s.hidden=s.id!=='v-editor');
  $$('#nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.go===(tipo==='cotizacion'?'cotizaciones':'facturas'))));
  mountEditor();const tb=$('#v5-current');if(tb)tb.textContent=tipo==='cotizacion'?'Cotización · '+(draft.codigo||'Nueva'): 'Documento de cobro · '+(draft.codigo||'Nuevo');window.scrollTo({top:0});
}
const isRO=()=>{const d=S.editor.draft;if(S.editor.example)return true;if(S.editor.tipo==='proyecto')return !S.canWrite;if(!S.canWrite)return true;if(d.tipo==='cotizacion')return d.estado==='facturada';return d.estado==='pagada'||d.estado==='anulada'};
function mountEditor(){
  const {tipo,draft:d}=S.editor,cot=tipo==='cotizacion',ro=isRO(),e=emp(),prop=cot&&d.modo==='propuesta',gl=girosList();
  const giroRow=cot?'':'<div class="two"><div class="field"><label for="ed-giro">Giro de la operación</label><select class="inp" id="ed-giro"><option value="">'+(gl.length?'Selecciona un giro':'Sin giros: agrégalos en Empresa')+'</option>'+gl.map((g,i)=>'<option value="'+i+'"'+(g.nombre===d.giroFac?' selected':'')+'>'+esc(g.nombre)+(g.codigo?' · '+esc(g.codigo):'')+'</option>').join('')+'</select></div><div class="field"><label for="ed-dte">Tipo de documento</label><select class="inp" id="ed-dte"><option value="33"'+(d.tipoDte===34?'':' selected')+'>Factura afecta, con IVA (33)</option><option value="34"'+(d.tipoDte===34?' selected':'')+'>Factura exenta (34)</option></select></div></div>';
  const cli=S.clientes.slice().sort((a,b)=>a.razon.localeCompare(b.razon,'es'));
  const f=(id,l,v,type,extra)=>'<div class="field"><label for="'+id+'">'+l+'</label><input class="inp" id="'+id+'" type="'+(type||'text')+'" value="'+esc(v==null?'':v)+'" '+(extra||'')+'></div>';
  $('#v-editor').innerHTML=
   '<div class="edbar"><button class="btn ghost" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Volver</button><div class="ttl"><div class="eyebrow">'+(cot?'Cotización':'Factura')+'</div><h1 id="ed-code">'+esc(d.codigo||(cot?'Nueva cotización':'Nueva factura'))+'</h1></div><span id="ed-pill"></span><div class="actions" id="ed-actions"></div></div>'+
   '<div id="ed-note"></div>'+
   '<div class="builder'+(prop?' wide':'')+'"><div class="card"><fieldset id="ed-fs" '+(ro?'disabled':'')+'>'+
   '<div class="sec">Cliente</div><div class="field"><label for="ed-cli">Cliente</label><div class="cli-row"><select class="inp" id="ed-cli"><option value="">Selecciona un cliente</option>'+(S.editor.example?'<option value="'+esc(d.clienteId)+'" selected>'+esc(d.clienteSnap.razon)+'</option>':'')+cli.map(c=>'<option value="'+c.id+'"'+(c.id===d.clienteId?' selected':'')+'>'+esc(c.razon)+'</option>').join('')+'</select><button class="btn ghost" type="button" data-act="cli-new-ed">+ Nuevo</button></div></div>'+
   (cot?'<div class="two">'+f('ed-ref','Proyecto o referencia',d.referencia,'text','placeholder="Ej: Subestación planta Maipo"')+f('ed-aten','A la atención de',d.atencion,'text')+'</div>':'<div class="two">'+f('ed-ref','Referencia',d.referencia,'text','placeholder="Ej: Estado de pago N°3"')+f('ed-oc','N° de orden de compra',d.ordenCompra,'text')+'</div>')+
     (!cot?'<div class="field"><label for="ed-proj">Proyecto asociado</label><select class="inp" id="ed-proj"><option value="">Sin proyecto asociado</option>'+S.proyectos.filter(p=>!d.clienteId||p.clienteId===d.clienteId).map(p=>'<option value="'+esc(p.id)+'"'+(d.proyectoId===p.id?' selected':'')+'>'+esc(p.nombre)+'</option>').join('')+'</select></div>':'')+
    '<div class="sec">Condiciones</div>'+
   (cot?'<div class="three">'+f('ed-fecha','Fecha',d.fecha,'date')+f('ed-val','Validez (días)',d.validezDias,'number','min="1"')+'<div class="field"><label for="ed-est">Estado</label><select class="inp" id="ed-est">'+[['ingresada','Recibida'],['en_preparacion','En preparación'],['borrador','Borrador'],['enviada','Enviada'],['aprobada','Aprobada'],['rechazada','Rechazada']].map(([k,l])=>'<option value="'+k+'"'+(d.estado===k?' selected':'')+'>'+l+'</option>').join('')+(d.estado==='facturada'?'<option value="facturada" selected>Facturada</option>':'')+'</select></div></div>'
        :'<div class="three">'+f('ed-fecha','Fecha de emisión',d.fecha,'date')+'<div class="field"><label for="ed-plz">Plazo de pago</label><select class="inp" id="ed-plz">'+[0,15,30,45,60,90].map(n=>'<option value="'+n+'"'+(n===num(d.plazoDias)?' selected':'')+'>'+(n?n+' días':'Contado')+'</option>').join('')+'</select></div>'+f('ed-sii','Folio SII',d.folioSII,'text','placeholder="Cuando la emitas en el SII"')+'</div>'+giroRow)+
   (prop?'<div class="sec">Presentación</div><div class="field"><label for="ed-intro">Descripción de la propuesta</label><textarea class="inp" id="ed-intro" rows="3" placeholder="Ej: Propuesta para el suministro, montaje e instalación de...">'+esc(d.intro)+'</textarea></div><div class="sec">Secciones de la cotización</div><div id="ed-secs"></div><div class="addrow"><button class="btn ghost sm" type="button" data-act="sec-add" data-k="lista">+ Sección con cantidades</button><button class="btn ghost sm" type="button" data-act="sec-add" data-k="lotes">+ Sección por lotes</button></div><div class="sum" id="ed-sum" style="margin-top:14px"></div>':
   '<div class="sec">Detalle</div><div id="ed-items"></div><button class="btn ghost sm" type="button" data-act="add-item">+ Agregar línea</button>'+
   '<div class="two" style="margin-top:14px">'+f('ed-desc','Descuento (%)',d.descPct||0,'number','min="0" max="100" step="any"')+'<div></div></div><div class="sum" id="ed-sum"></div>')+
   (cot?'<div class="sec">Condiciones comerciales</div><div class="two">'+f('ed-ejec','Plazo de ejecución',d.plazoEjecucion,'text','placeholder="Ej: 15 días hábiles desde la orden"')+f('ed-pago','Forma de pago',d.condPago,'text','placeholder="Ej: 50% anticipo, 50% contra entrega"')+'</div>'+(prop?'<div class="field"><label for="ed-incl">Incluye</label><textarea class="inp" id="ed-incl" rows="3" placeholder="Qué está incluido en el precio">'+esc(d.incluye)+'</textarea></div><div class="field"><label for="ed-nincl">No incluye</label><textarea class="inp" id="ed-nincl" rows="3" placeholder="Exclusiones y supuestos">'+esc(d.noIncluye)+'</textarea></div>':'')+'<div class="field"><label for="ed-notas">'+(prop?'Otras consideraciones':'Notas y condiciones')+'</label><textarea class="inp" id="ed-notas" rows="4">'+esc(d.notas)+'</textarea></div>'
       :'<div class="field"><label for="ed-notas">Notas</label><textarea class="inp" id="ed-notas" rows="3" placeholder="Visible en el documento">'+esc(d.notas)+'</textarea></div>')+
   '</fieldset></div><div class="prev-col" id="ed-prev"></div></div>';
  if(prop)fillSecs();else fillItems();paintEditor();
  const on=(id,ev,fn)=>{const x=$('#'+id);if(x)x.addEventListener(ev,fn)};
  const touch=()=>{S.editor.dirty=true;paintEditor()};
  on('ed-cli','change',ev=>{d.clienteId=ev.target.value;touch()});
  on('ed-ref','input',ev=>{d.referencia=ev.target.value;touch()});
  on('ed-aten','input',ev=>{d.atencion=ev.target.value;touch()});
  on('ed-oc','input',ev=>{d.ordenCompra=ev.target.value;touch()});
  on('ed-proj','change',ev=>{d.proyectoId=ev.target.value;touch()});
  on('ed-fecha','input',ev=>{if(ev.target.value){d.fecha=ev.target.value;touch()}});
  on('ed-val','input',ev=>{d.validezDias=num(ev.target.value);touch()});
  on('ed-est','change',ev=>{d.estado=ev.target.value;touch()});
  on('ed-plz','change',ev=>{d.plazoDias=num(ev.target.value);touch()});
  on('ed-sii','input',ev=>{d.folioSII=ev.target.value;touch()});
  on('ed-giro','change',ev=>{const g=gl[+ev.target.value];if(!g)return;d.giroFac=g.nombre;d.giroCod=g.codigo||'';d.tipoDte=g.tipo===34?34:33;$('#ed-dte').value=String(d.tipoDte);if(g.notas&&!(d.notas||'').trim()){d.notas=g.notas;const n=$('#ed-notas');if(n)n.value=g.notas}touch()});
  on('ed-dte','change',ev=>{d.tipoDte=+ev.target.value;touch()});
  on('ed-desc','input',ev=>{d.descPct=Math.min(100,Math.max(0,num(ev.target.value)));touch()});
  on('ed-ejec','input',ev=>{d.plazoEjecucion=ev.target.value;touch()});
  on('ed-pago','input',ev=>{d.condPago=ev.target.value;touch()});
  on('ed-notas','input',ev=>{d.notas=ev.target.value;touch()});
  on('ed-intro','input',ev=>{d.intro=ev.target.value;touch()});
  on('ed-incl','input',ev=>{d.incluye=ev.target.value;touch()});
  on('ed-nincl','input',ev=>{d.noIncluye=ev.target.value;touch()});
}

