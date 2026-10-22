/**
 * Voltage Obras · Escapes HTML, notificaciones y modales
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* utilidades UI */
function setHTML(el,h){if(el._h!==h){el.innerHTML=h;el._h=h}}
function toast(msg,bad){const t=$('#toast');t.textContent=msg;t.className='toast'+(bad?' bad':'');t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{t.hidden=true},bad?6500:4200)}
function modal(o){
  const root=$('#modal-root');
  root.innerHTML='<div class="scrim" id="m-scrim"><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="m-t"><h2 id="m-t">'+esc(o.title)+'</h2><div id="m-body">'+o.body+'</div><div class="foot">'+(o.actions||[]).map((a,i)=>'<button class="btn '+(a.cls||'')+'" data-mi="'+i+'" id="m-a'+i+'">'+esc(a.label)+'</button>').join('')+'</div></div></div>';
  const close=()=>{root.innerHTML='';document.removeEventListener('keydown',kd)};
  const kd=e=>{if(e.key==='Escape')close()};
  document.addEventListener('keydown',kd);
  $('#m-scrim').addEventListener('mousedown',e=>{if(e.target.id==='m-scrim')close()});
  (o.actions||[]).forEach((a,i)=>{$('#m-a'+i).addEventListener('click',async ev=>{
    const b=ev.currentTarget;if(a.close){close();return}
    b.disabled=true;try{const r=await a.run($('#m-body'));if(r!==false)close()}catch(err){toast(err&&err.message||'No se pudo completar la acción.',true)}finally{b.disabled=false}})});
  if(o.mount)o.mount($('#m-body'),close);
  const f=$('#m-body input,#m-body select,#m-body textarea');if(f&&!o.noFocus)f.focus();
  return close;
}
function confirmBox(title,msg,label,danger){
  return new Promise(res=>{let done=false;
    const fin=v=>{if(!done){done=true;res(v)}};
    modal({title,body:'<p>'+esc(msg)+'</p><div style="height:14px"></div>',actions:[{label:'Cancelar',cls:'ghost',close:true},{label,cls:danger?'danger':'',run:()=>{fin(true)}}],mount:(b,close)=>{const sc=$('#m-scrim');new MutationObserver(()=>{if(!$('#m-scrim'))fin(false)}).observe($('#modal-root'),{childList:true})}});
  });
}


// V5: navegación contextual, sin interferir con los botones y acciones de módulos.
document.addEventListener('click',async function(ev){
 const b=ev.target.closest&&ev.target.closest('#v5-back');if(!b)return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
 if(b.disabled)return;
 if(S.editor&&S.editor.dirty&&!isRO()){
  const ok=await confirmBox('Hay cambios sin guardar','Si vuelves ahora, se perderán los cambios no guardados.','Descartar y volver',true);if(!ok)return;
 }
 const target=v5Trail.pop()||'panel';v5Returning=true;
 try{go(target)}finally{v5Returning=false;v5SyncNavigation()}
},true);

