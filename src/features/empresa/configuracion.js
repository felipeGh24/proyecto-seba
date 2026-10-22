/**
 * Voltage Obras · Identidad, datos y opciones de empresa
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- EMPRESA ---------- */
function mountConfig(){
  const e=emp();
  const f=(i,l,v,ph,type)=>'<div class="field"><label for="'+i+'">'+l+'</label><input class="inp" id="'+i+'" type="'+(type||'text')+'" value="'+esc(v)+'" placeholder="'+(ph||'')+'"></div>';
  $('#v-config').innerHTML='<div class="top"><div><div class="eyebrow">Aparece en cada documento</div><h1>Datos de la empresa</h1></div><div class="actions"><button class="btn" id="cfg-save">Guardar cambios</button></div></div>'+
  (S.canWrite?'':'<div class="note warn">Solo lectura: necesitas acceso de colaborador para cambiar estos datos.</div>')+
  '<div class="note">Esta plataforma prepara, numera y controla tus facturas. La factura electrónica con validez tributaria se emite en el SII o en tu proveedor de facturación; registra su folio en el campo «Folio SII» de cada factura.</div>'+
  '<div class="grid"><div class="card c6"><fieldset '+(S.canWrite?'':'disabled')+'><div class="sec">Identificación</div>'+f('e-razon','Razón social',e.razon,'Razón social de la empresa')+'<div class="two">'+f('e-rut','RUT',e.rut,'76.123.456-7')+f('e-giro','Giro',e.giro,'')+'</div><div id="e-err" class="err" hidden></div>'+f('e-dir','Dirección',e.direccion,'')+'<div class="two">'+f('e-com','Comuna',e.comuna,'')+f('e-ciu','Ciudad',e.ciudad,'Santiago')+'</div><div class="two">'+f('e-mail','Correo',e.email,'')+f('e-tel','Teléfono',e.telefono,'+56 2 2345 6789')+'</div>'+f('e-web','Sitio web',e.web,'www.ejemplo.cl')+
   '<div class="sec">Giros y actividades</div><p class="hint" style="margin-bottom:10px">Cada giro define cómo se emite la factura: afecta o exenta, código de actividad económica del SII y una glosa por defecto. Al elegirlo en la factura, se aplican solos.</p><div id="e-giros"></div><button class="btn ghost sm" type="button" id="giro-add">+ Agregar giro</button>'+
   '<div class="sec">Logo</div><div class="logo-prev"><div class="box" id="logo-box">'+(e.logo?'<img alt="Logo" src="'+esc(e.logo)+'">':'Sin logo')+'</div><label class="btn ghost sm" for="e-logo" style="cursor:pointer">Subir logo</label><input id="e-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden><button class="btn ghost sm" id="logo-del" type="button" '+(e.logo?'':'hidden')+'>Quitar</button></div><p class="hint" style="margin-top:8px">PNG o JPG con fondo blanco o transparente. Se reduce automáticamente.</p></fieldset></div>'+
  '<div class="card c6"><fieldset '+(S.canWrite?'':'disabled')+'><div class="sec">Datos para transferencia</div><p class="hint" style="margin-bottom:10px">Se imprimen en cotizaciones y facturas.</p>'+f('e-banco','Banco',e.banco,'')+'<div class="two"><div class="field"><label for="e-tcta">Tipo de cuenta</label><select class="inp" id="e-tcta">'+['Cuenta corriente','Cuenta vista','Cuenta de ahorro'].map(o=>'<option'+(o===e.tipoCuenta?' selected':'')+'>'+o+'</option>').join('')+'</select></div>'+f('e-ncta','N° de cuenta',e.numCuenta,'')+'</div><div class="two">'+f('e-tit','Titular',e.titular,'')+f('e-rtit','RUT del titular',e.rutTitular,'')+'</div>'+f('e-mpag','Correo para comprobantes',e.emailPagos,'')+
   '<div class="sec">Valores por defecto</div><div class="two">'+f('e-val','Validez de cotizaciones (días)',e.cotValidez,'','number')+'<div class="field"><label for="e-plz">Plazo de pago de facturas</label><select class="inp" id="e-plz">'+[0,15,30,45,60].map(n=>'<option value="'+n+'"'+(n===num(e.facPlazo)?' selected':'')+'>'+(n?n+' días':'Contado')+'</option>').join('')+'</select></div></div>'+
   '<div class="field"><label for="e-not">Notas y condiciones de cotizaciones</label><textarea class="inp" id="e-not" rows="5">'+esc(e.cotNotas)+'</textarea></div></fieldset></div></div>';
  let logo={logo:e.logo,logoW:e.logoW,logoH:e.logoH};
  let giros=girosList().map(g=>Object.assign({},g));
  const paintG=()=>{$('#e-giros').innerHTML=giros.map((g,i)=>'<div class="girow"><input class="inp" data-gi="'+i+'" data-gk="nombre" type="text" placeholder="Ej: Instalaciones eléctricas" aria-label="Nombre del giro" value="'+esc(g.nombre)+'"><input class="inp" data-gi="'+i+'" data-gk="codigo" type="text" inputmode="numeric" placeholder="Cód. actividad SII" aria-label="Código de actividad económica" value="'+esc(g.codigo||'')+'"><select class="inp" data-gi="'+i+'" data-gk="tipo" aria-label="Tipo de documento por defecto"><option value="33"'+(g.tipo===34?'':' selected')+'>Factura afecta (33)</option><option value="34"'+(g.tipo===34?' selected':'')+'>Factura exenta (34)</option></select><button class="x" type="button" data-grm="'+i+'" aria-label="Quitar giro">×</button><textarea class="inp" rows="2" data-gi="'+i+'" data-gk="notas" placeholder="Glosa o nota por defecto en la factura (opcional)" aria-label="Glosa por defecto">'+esc(g.notas||'')+'</textarea></div>').join('')||'<p class="hint">Aún no hay giros. Agrega el primero.</p>'};
  paintG();
  const gb=$('#e-giros');
  gb.addEventListener('input',ev=>{const t=ev.target;if(t.dataset.gk===undefined)return;giros[+t.dataset.gi][t.dataset.gk]=t.dataset.gk==='tipo'?+t.value:t.value});
  gb.addEventListener('change',ev=>{const t=ev.target;if(t.dataset.gk==='tipo')giros[+t.dataset.gi].tipo=+t.value});
  gb.addEventListener('click',ev=>{const b=ev.target.closest('[data-grm]');if(b){giros.splice(+b.dataset.grm,1);paintG()}});
  $('#giro-add').addEventListener('click',()=>{giros.push({nombre:'',codigo:'',tipo:33,notas:''});paintG();const ins=$$('#e-giros [data-gk=nombre]');ins[ins.length-1].focus()});
  const lf=$('#e-logo');
  if(lf)lf.addEventListener('change',async ev=>{const file=ev.target.files[0];if(!file)return;try{const r=await loadLogo(file);logo={logo:r.data,logoW:r.w,logoH:r.h};$('#logo-box').innerHTML='<img alt="Logo" src="'+r.data+'">';$('#logo-del').hidden=false}catch(err){toast(err.message,true)}});
  $('#logo-del').addEventListener('click',()=>{logo={logo:'',logoW:0,logoH:0};$('#logo-box').textContent='Sin logo';$('#logo-del').hidden=true});
  $('#cfg-save').disabled=!S.canWrite;
  $('#cfg-save').addEventListener('click',async()=>{
    const g=i=>$('#'+i).value.trim(),err=$('#e-err');err.hidden=true;
    if(g('e-rut')&&!rutValid(g('e-rut'))){err.textContent='El RUT no es válido. Revisa el dígito verificador.';err.hidden=false;$('#e-rut').focus();return}
    const data=Object.assign({},EMP_DEF,{razon:g('e-razon'),rut:g('e-rut')?rutFmt(g('e-rut')):'',giro:g('e-giro'),direccion:g('e-dir'),comuna:g('e-com'),ciudad:g('e-ciu'),email:g('e-mail'),telefono:g('e-tel'),web:g('e-web'),
      banco:g('e-banco'),tipoCuenta:$('#e-tcta').value,numCuenta:g('e-ncta'),titular:g('e-tit'),rutTitular:g('e-rtit'),emailPagos:g('e-mpag'),cotValidez:Math.max(1,num(g('e-val'))||15),facPlazo:num($('#e-plz').value),cotNotas:$('#e-not').value.trim(),giros:giros.map(g=>({nombre:(g.nombre||'').trim(),codigo:(g.codigo||'').trim(),tipo:g.tipo===34?34:33,notas:(g.notas||'').trim()})).filter(g=>g.nombre)},logo);
    try{await wr(()=>S.db.doc('meta/empresa').set(data));S.empresa=data;toast('Datos de la empresa guardados.');refresh()}catch(e){}
  });
}
function loadLogo(file){return new Promise((res,rej)=>{
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const iw=img.naturalWidth||img.width||300,ih=img.naturalHeight||img.height||100,max=420,sc=Math.min(1,max/iw,max/ih),w=Math.max(1,Math.round(iw*sc)),h=Math.max(1,Math.round(ih*sc));
    const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);
    let data=c.toDataURL('image/png');
    if(data.length>170000){x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);data=c.toDataURL('image/jpeg',.85)}
    URL.revokeObjectURL(url);if(data.length>200000)rej(new Error('La imagen es muy pesada. Usa una más pequeña.'));else res({data,w,h})};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('No se pudo leer la imagen.'))};img.src=url})}

