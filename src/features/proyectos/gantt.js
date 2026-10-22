/**
 * Voltage Obras · Proyectos, tareas, carta Gantt y cálculo de avances
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- PROYECTOS ---------- */
const uid=()=>Math.random().toString(36).slice(2,9);
const pjDur=t=>Math.max(1,diffD(t.fin,t.inicio)+1);
function pjTree(ts){
  const n=ts.map((t,i)=>({i,t,nivel:Math.max(0,Math.min(3,num(t.nivel))),kids:[],parent:null})),st=[];
  n.forEach(x=>{while(st.length&&st[st.length-1].nivel>=x.nivel)st.pop();if(st.length){x.parent=st[st.length-1];x.parent.kids.push(x)}st.push(x)});
  const valid=t=>t.inicio&&t.fin&&t.fin>=t.inicio,t0=todayS();
  const leaves=n.filter(x=>!x.kids.length&&valid(x.t)),useM=leaves.length>0&&leaves.every(x=>num(x.t.monto)>0);
  for(let k=n.length-1;k>=0;k--){const x=n[k];
    if(!x.kids.length){if(valid(x.t)){const d=pjDur(x.t);x.ok=true;x.ini=x.t.inicio;x.fin=x.t.fin;x.w=useM?num(x.t.monto):d;x.av=num(x.t.avance);x.pl=Math.min(1,Math.max(0,(diffD(t0,x.t.inicio)+1)/d))*100;x.late=diffD(t0,x.t.fin)>0&&x.av<100?1:0}}
    else{const ks=x.kids.filter(c=>c.ok);if(ks.length){x.ok=true;x.ini=ks.map(c=>c.ini).sort()[0];x.fin=ks.map(c=>c.fin).sort().pop();x.w=ks.reduce((a,c)=>a+c.w,0);x.av=x.w?ks.reduce((a,c)=>a+c.av*c.w,0)/x.w:0;x.pl=x.w?ks.reduce((a,c)=>a+c.pl*c.w,0)/x.w:0;x.late=ks.reduce((a,c)=>a+c.late,0)}}
  }
  return {n,leaves,useM};
}
function pjRows(p,base,col){
  const tr=pjTree(p.tareas||[]),rows=[],hid=x=>{for(let q=x.parent;q;q=q.parent)if(col.has(q.t.id))return true;return false};
  tr.n.forEach(x=>{if(!x.ok||hid(x))return;const sum=x.kids.length>0,pc=Math.round(x.av);
    rows.push({label:x.t.nombre||'Sin nombre',start:x.ini,end:x.fin,pct:pc,c:pc>=100?'var(--good)':(diffD(todayS(),x.fin)>0?'var(--bad)':'var(--primary)'),nivel:x.nivel+base,sum,tid:sum?x.t.id:'',open:sum&&!col.has(x.t.id)})});
  return rows;
}
function pjCalc(p){
  const t0=todayS(),tr=pjTree(p.tareas||[]),ts=tr.leaves;
  let w=0,av=0,pl=0,late=0;
  ts.forEach(x=>{w+=x.w;av+=x.av*x.w;pl+=x.pl*x.w;late+=x.late});
  const avance=w?Math.round(av/w):0;
  let plan=w?Math.round(pl/w):0;
  if(!w&&p.fechaInicio&&p.fechaFin&&p.fechaFin>=p.fechaInicio)plan=Math.round(Math.min(1,Math.max(0,(diffD(t0,p.fechaInicio)+1)/(diffD(p.fechaFin,p.fechaInicio)+1)))*100);
  let key,label,cls;
  if(p.estado==='terminado'){key='ok';label='Terminado';cls='good'}
  else if(p.estado==='pausado'){key='pausa';label='Pausado';cls=''}
  else if(p.estado==='planificado'&&p.fechaInicio&&diffD(t0,p.fechaInicio)<0){key='plan';label='Inicia el '+fmtD(p.fechaInicio);cls='info'}
  else if(late||(p.fechaFin&&diffD(t0,p.fechaFin)>0&&avance<100)){key='atraso';label='Atrasado';cls='bad'}
  else if(plan-avance>10){key='riesgo';label='En riesgo';cls='warn'}
  else{key='ok';label='A tiempo';cls='info'}
  return {avance,plan,late,key,label,cls,tareas:ts.length};
}
const pjColor=(p,c)=>p.estado==='terminado'?'var(--good)':c.key==='atraso'?'var(--bad)':c.key==='riesgo'?'#E9A820':c.key==='pausa'?'var(--muted)':'var(--primary)';
const pjClient=p=>(clientById(p.clienteId)||p.clienteSnap||{}).razon||'';
const pjFact=p=>p.cotizacionId?S.docs.filter(d=>d.tipo==='factura'&&d.estado!=='anulada'&&d.cotizacionId===p.cotizacionId).reduce((a,d)=>a+d.neto,0):0;
const pjRange=p=>{const ds=[p.fechaInicio,p.fechaFin].concat((p.tareas||[]).flatMap(t=>[t.inicio,t.fin])).filter(Boolean).sort();return [ds[0],ds[ds.length-1]]};
const pjDays=(ini,fin)=>ini&&fin&&fin>=ini?diffD(fin,ini)+1:0;
function pjTaskStats(p){
  const tr=pjTree(p.tareas||[]),ts=tr.leaves;
  const dueSoon=ts.filter(x=>x.fin&&diffD(x.fin,todayS())>=0&&diffD(x.fin,todayS())<=7&&x.av<100).length;
  const done=ts.filter(x=>x.av>=100).length;
  const pending=ts.filter(x=>x.av<100).length;
  return {done,pending,dueSoon,total:ts.length};
}
function ganttHTML(rows){
  if(!rows.length)return '';
  let min=rows.map(r=>r.start).sort()[0],max=rows.map(r=>r.end).sort().pop();
  min=addD(min,-2);max=addD(max,2);
  const tot=Math.max(1,diffD(max,min)),pos=s=>Math.min(100,Math.max(0,diffD(s,min)/tot*100));
  const ticks=[];let d=parse(min);d=new Date(d.getFullYear(),d.getMonth()+1,1);
  while(iso(d)<=max){ticks.push({p:pos(iso(d)),l:MONTHS[d.getMonth()]+(d.getMonth()===0?' '+d.getFullYear():'')});d=new Date(d.getFullYear(),d.getMonth()+1,1)}
  const td=todayS(),tp=td>=min&&td<=max?pos(td):null;
  const grid=ticks.map(k=>'<i class="g-tick" style="left:'+k.p+'%"></i>').join('')+(tp!==null?'<i class="g-today" style="left:'+tp+'%" title="Hoy"></i>':'');
  const head='<div class="g-row g-row-head"><div></div><div class="g-track g-axis">'+ticks.map(k=>'<span style="left:'+k.p+'%">'+k.l+'</span>').join('')+(tp!==null?'<span class="g-hoy" style="left:'+tp+'%">hoy</span>':'')+'</div></div>';
  return '<div class="scroll"><div class="g">'+head+rows.map(r=>{const l=pos(r.start),w=Math.max(1.2,pos(addD(r.end,1))-l);
    return '<div class="g-row"><div class="g-lab'+(r.sum?' grp':'')+'" style="padding-left:'+((r.nivel||0)*14)+'px" title="'+esc(r.label)+'">'+(r.tid?'<button type="button" class="chev" data-gtoggle="'+esc(r.tid)+'" aria-expanded="'+!!r.open+'" aria-label="'+(r.open?'Contraer ':'Expandir ')+esc(r.label)+'">'+(r.open?'▾':'▸')+'</button>':r.ptoggle?'<button type="button" class="chev" data-ptoggle="'+esc(r.ptoggle)+'" aria-expanded="'+!!r.open+'" aria-label="'+(r.open?'Contraer ':'Expandir ')+esc(r.label)+'">'+(r.open?'▾':'▸')+'</button>':(r.nivel||r.ptoggle==='')?'<span class="chev sp"></span>':'')+'<span class="gl-t"'+(r.id?' data-proj="'+r.id+'" style="cursor:pointer"':'')+'>'+esc(r.label)+(r.sub?'<small>'+esc(r.sub)+'</small>':'')+'</span></div><div class="g-track">'+grid+'<div class="g-bar'+(r.sum?' grp':'')+'" style="left:'+l+'%;width:'+w+'%;--c:'+(r.c||'var(--primary)')+'" title="'+esc(r.label)+': '+r.pct+'% · '+fmtD(r.start)+' a '+fmtD(r.end)+'"><div class="g-fill" style="width:'+r.pct+'%"></div><span class="g-pct">'+r.pct+'%</span></div></div></div>'}).join('')+'</div></div>';
}
function pjHeroCard(p,c){
  const pr=num(p.presupuesto),fa=pjFact(p),left=p.fechaFin?diffD(p.fechaFin,todayS()):null,stats=pjTaskStats(p),r=pjRange(p),rows=pjRows(p,0,S.pjCollapsed),hasSum=pjTree(p.tareas).n.some(x=>x.kids.length);
  const dueTxt=p.estado==='terminado'?'Proyecto terminado':left===null?'Sin plazo definido':left>=0?'Quedan '+left+' días':'Plazo vencido hace '+(-left)+' días';
  return '<div class="card pj-hero-card"><div class="card-head"><div><h2>Carta Gantt y seguimiento</h2><span>Vista principal del cronograma. Aquí se compara el avance real con el avance esperado del proyecto.</span></div>'+(hasSum?'<div class="seg"><button type="button" data-act="pj-expand">Abrir todo</button><button type="button" data-act="pj-collapse">Cerrar todo</button></div>':'')+'</div>'+
   '<div class="pj-hero-stats">'+
    '<div><small>Avance real</small><b>'+c.avance+'%</b><span>'+c.label+'</span></div>'+
    '<div><small>Avance planificado</small><b>'+c.plan+'%</b><span>Línea roja = hoy</span></div>'+
    '<div><small>Presupuesto</small><b class="mono">'+clp(pr)+'</b><span>'+(fa?('Facturado '+clp(fa)):dueTxt)+'</span></div>'+
    '<div><small>Tareas</small><b>'+stats.total+'</b><span>'+stats.done+' listas · '+stats.pending+' pendientes'+(stats.dueSoon?' · '+stats.dueSoon+' por vencer':'')+'</span></div>'+
   '</div>'+
   '<div class="pj-hero-meta"><span><b>Cliente:</b> '+esc(pjClient(p)||'Sin cliente')+'</span><span><b>Responsable:</b> '+esc(p.responsable||'Sin asignar')+'</span><span><b>Plazo:</b> '+fmtD(r[0])+' a '+fmtD(r[1])+' · '+pjDays(r[0],r[1])+' días</span></div>'+
   (rows.length?ganttHTML(rows):'<div class="empty" style="padding:22px"><b>Sin cronograma</b>Agrega tareas con fechas para ver la carta Gantt del proyecto.</div>')+
   '<div class="pj-gantt-legend"><span><i class="lg real"></i> Avance real dentro de cada barra</span><span><i class="lg today"></i> Línea roja: fecha actual</span><span><i class="lg ok"></i> Verde: completado</span><span><i class="lg risk"></i> Amarillo o rojo: atención / atraso</span></div></div>';
}
function pjPanel(){
  const list=S.proyectos.filter(p=>p.estado==='en_curso').map(p=>({p,c:pjCalc(p)})).sort((a,b)=>(b.c.key==='atraso')-(a.c.key==='atraso')||b.c.plan-a.c.plan).slice(0,6);
  if(!list.length)return '<div class="empty" style="padding:22px"><b>Sin proyectos en curso</b>Crea un proyecto desde una cotización aprobada y sigue su avance aquí.</div>';
  return '<div class="pj-mini">'+list.map(({p,c})=>'<div class="it" data-proj="'+p.id+'"><div class="row"><span class="nm">'+esc(p.nombre)+'</span><span class="pill '+c.cls+'">'+c.label+'</span></div><div class="meter-l"><span>'+esc(pjClient(p))+'</span><b class="mono">'+c.avance+'%</b></div><div class="track"><div class="fill" style="width:'+c.avance+'%;background:'+pjColor(p,c)+'"></div><i class="plan" style="left:'+c.plan+'%" title="Planificado a hoy"></i></div></div>').join('')+'</div>';
}
function mountProyectos(){
  $('#v-proyectos').innerHTML='<div class="top"><div><div class="eyebrow">Planificación y avance de obras</div><h1>Proyectos</h1></div><div class="actions"><button class="btn" data-act="new-proj"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Nuevo proyecto</button></div></div>'+
   '<div class="toolbar"><div class="chips" id="chips-pj"></div><div class="actions" style="align-items:center"><div class="seg" role="group" aria-label="Vista" id="pj-seg"></div><div class="search" style="min-width:200px"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input class="inp" id="q-pj" type="search" placeholder="Buscar proyecto o cliente" aria-label="Buscar proyecto" value="'+esc(S.q.proyectos)+'"></div></div></div><div id="pj-body"></div>';
  $('#q-pj').addEventListener('input',e=>{S.q.proyectos=e.target.value;paintProyectos()});
  paintProyectos();
}
function paintProyectos(){
  const body=$('#pj-body');if(!body)return;
  const q=S.q.proyectos.trim().toLowerCase();
  let all=S.proyectos.map(p=>({p,c:pjCalc(p)}));
  const total=all.length;
  if(q)all=all.filter(x=>(x.p.nombre+' '+pjClient(x.p)+' '+(x.p.responsable||'')).toLowerCase().includes(q));
  const cnt={all:all.length};all.forEach(x=>{cnt[x.p.estado]=(cnt[x.p.estado]||0)+1});
  $('#chips-pj').innerHTML=[['all','Todos'],['planificado','Planificados'],['en_curso','En curso'],['pausado','Pausados'],['terminado','Terminados']].map(([k,l])=>'<button class="chip" data-pfil="'+k+'" aria-pressed="'+(S.fil.proyectos===k)+'">'+l+'<b>'+(cnt[k]||0)+'</b></button>').join('');
  $('#pj-seg').innerHTML='<button data-pjv="cards" aria-pressed="'+(S.pjView==='cards')+'">Tarjetas</button><button data-pjv="gantt" aria-pressed="'+(S.pjView==='gantt')+'">Cronograma</button>';
  if(!total){body.innerHTML='<div class="card"><div class="empty"><b>Aún no hay proyectos</b>Crea uno desde una cotización aprobada, o parte de cero con sus tareas y fechas.<br>'+(S.canWrite?'<button class="btn" data-act="new-proj">Nuevo proyecto</button> ':'')+'</div></div>';return}
  let list=S.fil.proyectos==='all'?all:all.filter(x=>x.p.estado===S.fil.proyectos);
  const ord={atraso:0,riesgo:1,ok:2,plan:3,pausa:4};
  list=list.slice().sort((a,b)=>(a.p.estado==='terminado')-(b.p.estado==='terminado')||(ord[a.c.key]-ord[b.c.key])||(a.p.fechaFin||'').localeCompare(b.p.fechaFin||''));
  if(!list.length){body.innerHTML='<div class="card"><div class="empty"><b>Sin resultados</b>Prueba con otro filtro.</div></div>';return}
  if(S.pjView==='gantt'){
    const grows=[];list.forEach(({p,c})=>{const r=pjRange(p),has=(p.tareas||[]).length>0,op=S.pjOpen.has(p.id);
      grows.push({id:p.id,label:p.nombre,sub:pjClient(p),start:r[0],end:r[1],pct:c.avance,c:pjColor(p,c),sum:true,ptoggle:has?p.id:'',open:op});
      if(op&&has)pjRows(p,1,S.pjCollapsed).forEach(x=>grows.push(x))});
    const act=list.filter(x=>x.p.estado==='en_curso').length,late=list.filter(x=>x.c.key==='atraso').length,risk=list.filter(x=>x.c.key==='riesgo').length;
    body.innerHTML='<div class="card pj-board"><div class="card-head"><div><h2>Cronograma general</h2><span>Abre cada proyecto para revisar sus partidas. La barra muestra el avance real y la línea roja indica el día de hoy.</span></div><div class="seg"><button type="button" data-act="pl-expand">Abrir todo</button><button type="button" data-act="pl-collapse">Cerrar todo</button></div></div><div class="pj-board-kpis"><div><small>Proyectos filtrados</small><b>'+list.length+'</b></div><div><small>En ejecución</small><b>'+act+'</b></div><div><small>Con atraso</small><b>'+late+'</b></div><div><small>En observación</small><b>'+risk+'</b></div></div>'+ganttHTML(grows)+'</div>';return}
  body.innerHTML='<div class="pj-grid">'+list.map(({p,c})=>{
    const fa=pjFact(p),pr=num(p.presupuesto),r=pjRange(p);
    return '<article class="card pj" data-proj="'+p.id+'"><div class="pj-top"><div><h3>'+esc(p.nombre)+'</h3><small>'+esc(pjClient(p))+(p.responsable?' · '+esc(p.responsable):'')+'</small></div><span class="pill '+c.cls+'">'+c.label+'</span></div>'+
     '<div class="meter"><div class="meter-l"><span>Avance real</span><b class="mono">'+c.avance+'% <span class="muted">· plan '+c.plan+'%</span></b></div><div class="track"><div class="fill" style="width:'+c.avance+'%;background:'+pjColor(p,c)+'"></div><i class="plan" style="left:'+c.plan+'%"></i></div></div>'+
     (pr?'<div class="meter"><div class="meter-l"><span>Facturado</span><b class="mono">'+clp(fa)+' <span class="muted">de '+clp(pr)+'</span></b></div><div class="track"><div class="fill" style="width:'+Math.min(100,Math.round(fa/pr*100))+'%;background:#E9A820"></div></div></div>':'')+
     '<div class="pj-meta"><span class="mono">'+fmtD(r[0])+' a '+fmtD(r[1])+'</span><span>'+c.tareas+' tarea'+(c.tareas===1?'':'s')+(c.late?' · '+c.late+' atrasada'+(c.late===1?'':'s'):'')+'</span></div></article>'}).join('')+'</div>';
}
async function leaveOk(){if(S.editor&&S.editor.dirty&&!isRO())return await confirmBox('Hay cambios sin guardar','Si sales ahora, se perderán los cambios de este documento.','Descartar y salir',true);return true}
function startProject(){
  if(!S.canWrite){toast('Necesitas acceso de colaborador para crear proyectos.',true);return}
  if(!S.clientes.length){toast('Primero agrega un cliente.');clientModal(null,()=>openProject(null));return}
  openProject(null);
}
function projFromCot(c){
  const s0=todayS();
  if(c.modo==='propuesta'){
    const tareas=[];let k=0;
    c.secciones.forEach(sc=>{
      const a=addD(s0,k*21),b=addD(a,20),from=tareas.length;k++;
      tareas.push({id:uid(),nombre:sc.titulo||'Sección '+k,inicio:a,fin:b,avance:0,nivel:0,monto:0});
      const mk=(nombre,monto,nivel)=>tareas.push({id:uid(),nombre,inicio:a,fin:b,avance:0,nivel,monto:Math.max(1,Math.round(monto))});
      if(sc.tipo==='lotes'){sc.lotes.forEach((l,ci)=>{const fs=sc.filas.filter(f=>num(f.v[ci])>0);if(!fs.length)return;tareas.push({id:uid(),nombre:l,inicio:a,fin:b,avance:0,nivel:1,monto:0});fs.forEach(f=>mk(f.d,num(f.v[ci]),2))})}
      else{sc.grupos.forEach(g=>{if(g.t)tareas.push({id:uid(),nombre:g.t,inicio:a,fin:b,avance:0,nivel:1,monto:0});g.items.forEach(it=>mk(it.d,num(it.t),g.t?2:1))})}
      if(tareas.length===from+1)tareas.pop();
    });
    pjTree(tareas).n.forEach(x=>{if(x.kids.length&&x.nivel>=1)S.pjCollapsed.add(x.t.id)});
    openProject(null,{nombre:c.referencia||('Proyecto '+c.codigo),clienteId:c.clienteId,cotizacionId:c.id,cotizacionCodigo:c.codigo,presupuesto:c.neto,estado:'planificado',responsable:'',fechaInicio:s0,fechaFin:tareas.map(t=>t.fin).sort().pop(),notas:'',tareas});
    toast('Partidas creadas desde la cotización, por sección y lote. Ajusta las fechas de cada una.');return;
  }
  const n=Math.max(1,c.items.length),per=Math.max(1,Math.floor(30/n));
  const tareas=c.items.map((l,i)=>({id:uid(),nombre:l.d,inicio:addD(s0,i*per),fin:addD(s0,Math.max(i*per,(i+1)*per-1)),avance:0}));
  openProject(null,{nombre:c.referencia||('Proyecto '+c.codigo),clienteId:c.clienteId,cotizacionId:c.id,cotizacionCodigo:c.codigo,presupuesto:c.neto,estado:'planificado',responsable:'',fechaInicio:s0,fechaFin:tareas.map(t=>t.fin).sort().pop(),notas:'',tareas});
  toast('Tareas creadas desde las líneas de la cotización. Ajusta las fechas.');
}
function openProject(p,override,example){
  const d=override?JSON.parse(JSON.stringify(override)):p?JSON.parse(JSON.stringify(p)):{nombre:'',clienteId:'',cotizacionId:'',cotizacionCodigo:'',proyectoId:'',presupuesto:0,estado:'planificado',responsable:'',fechaInicio:todayS(),fechaFin:addD(todayS(),30),notas:'',tareas:[]};
  (d.tareas||[]).forEach(t=>{if(!t.id)t.id=uid()});
  S.editor={tipo:'proyecto',draft:d,dirty:!!override&&!example&&!p,saving:false,example:!!example};
  S.view='editor';
  $$('main > section').forEach(s=>s.hidden=s.id!=='v-editor');
  $$('#nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.go==='proyectos')));
  mountProject();const tb=$('#v5-current');if(tb)tb.textContent='Proyecto · '+(d.nombre||'Nuevo');window.scrollTo({top:0});
}
function mountProject(){
  const E=S.editor,d=E.draft,ro=isRO();
  const cli=S.clientes.slice().sort((a,b)=>a.razon.localeCompare(b.razon,'es'));
  const cots=S.docs.filter(x=>x.tipo==='cotizacion'&&['aprobada','facturada'].includes(x.estado));
  const f=(id,l,k,v,type,extra)=>'<div class="field"><label for="'+id+'">'+l+'</label><input class="inp" id="'+id+'" data-pf="'+k+'" type="'+(type||'text')+'" value="'+esc(v==null?'':v)+'" '+(extra||'')+'></div>';
  $('#v-editor').innerHTML=
   '<div class="edbar"><button class="btn ghost" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Volver</button><div class="ttl"><div class="eyebrow">Proyecto</div><h1 id="pj-title">'+esc(d.nombre||'Nuevo proyecto')+'</h1></div><span id="pj-pill"></span><div class="actions" id="pj-actions"></div></div><div id="pj-note"></div>'+
   '<div id="pj-hero"></div>'+
   '<div class="builder"><div class="card"><fieldset id="ed-fs" '+(ro?'disabled':'')+'><div class="sec">Datos del proyecto</div>'+
   f('pj-nom','Nombre del proyecto','nombre',d.nombre,'text','placeholder="Ej: Instalación eléctrica Edificio Costanera"')+
   '<div class="two"><div class="field"><label for="pj-cli">Cliente</label><select class="inp" id="pj-cli" data-pf="clienteId"><option value="">Selecciona un cliente</option>'+(E.example?'<option value="'+esc(d.clienteId)+'" selected>'+esc(d.clienteSnap.razon)+'</option>':'')+cli.map(c=>'<option value="'+c.id+'"'+(c.id===d.clienteId?' selected':'')+'>'+esc(c.razon)+'</option>').join('')+'</select></div>'+
   '<div class="field"><label for="pj-cot">Cotización de origen</label><select class="inp" id="pj-cot" data-pf="cotizacionId"><option value="">Sin cotización</option>'+cots.map(c=>'<option value="'+c.id+'"'+(c.id===d.cotizacionId?' selected':'')+'>'+esc(c.codigo+' · '+(c.referencia||c.clienteSnap.razon))+'</option>').join('')+'</select></div></div>'+
   '<div class="two">'+f('pj-resp','Responsable','responsable',d.responsable,'text','placeholder="Jefe de obra o ITO"')+'<div class="field"><label for="pj-est">Estado</label><select class="inp" id="pj-est" data-pf="estado">'+[['planificado','Planificado'],['en_curso','En curso'],['pausado','Pausado'],['terminado','Terminado']].map(([k,l])=>'<option value="'+k+'"'+(d.estado===k?' selected':'')+'>'+l+'</option>').join('')+'</select></div></div>'+
   '<div class="three">'+f('pj-ini','Inicio','fechaInicio',d.fechaInicio,'date')+f('pj-fin','Término','fechaFin',d.fechaFin,'date')+f('pj-pre','Presupuesto neto','presupuesto',d.presupuesto||'','number','min="0" step="any"')+'</div>'+
   '<div class="sec">Plan de trabajo</div><p class="hint project-hint">Organiza el proyecto por etapas o partidas. La carta Gantt superior se actualiza automáticamente y muestra el avance real versus el esperado.</p><div class="actions" style="margin-bottom:10px"><button class="btn ghost sm" type="button" data-act="pj-expand">Abrir todo</button><button class="btn ghost sm" type="button" data-act="pj-collapse">Cerrar todo</button></div><div id="pj-tasks"></div><div class="addrow"><button class="btn ghost sm" type="button" data-act="pj-add">+ Agregar tarea</button></div>'+
   '<div class="sec">Notas</div><div class="field"><label for="pj-not" style="display:none">Notas</label><textarea class="inp" id="pj-not" data-pf="notas" rows="3" placeholder="Acuerdos, restricciones, contactos en obra">'+esc(d.notas||'')+'</textarea></div></fieldset></div>'+
   '<div class="prev-col" id="pj-side"></div></div>';
  fillTasks();paintProject();
}
function fillTasks(){
  const d=S.editor.draft,tr=pjTree(d.tareas),col=S.pjCollapsed;
  const hid=x=>{for(let q=x.parent;q;q=q.parent)if(col.has(q.t.id))return true;return false};
  const head='<div class="task-head"><span>Actividad</span><span>Edición</span><span>Fechas, avance y monto</span></div>';
  $('#pj-tasks').innerHTML=d.tareas.length?head+tr.n.map(x=>{
    if(hid(x))return '';
    const t=x.t,i=x.i,sum=x.kids.length>0,c=col.has(t.id),days=pjDays(t.inicio,t.fin);
    return '<div class="task'+(sum?' tsum':'')+'" style="margin-left:'+(x.nivel*16)+'px"><div class="tn">'+
      (sum?'<span role="button" tabindex="0" class="chev" data-gtoggle="'+esc(t.id)+'" aria-expanded="'+!c+'" aria-label="'+(c?'Expandir':'Contraer')+' '+esc(t.nombre||'tarea')+'">'+(c?'▸':'▾')+'</span>':'<span class="chev sp"></span>')+
      '<input class="inp" data-tk="nombre" data-ti="'+i+'" type="text" placeholder="'+(sum?'Nombre del grupo o partida':'Nombre de la tarea')+'" aria-label="Tarea '+(i+1)+'" value="'+esc(t.nombre)+'"></div>'+
      '<div class="tb"><button class="x" type="button" data-act="pj-out" data-i="'+i+'" title="Subir de nivel" aria-label="Subir de nivel">←</button><button class="x" type="button" data-act="pj-in" data-i="'+i+'" title="Bajar de nivel (hacerla subtarea)" aria-label="Bajar de nivel">→</button><button class="x" type="button" data-act="pj-sub" data-i="'+i+'" title="Agregar subtarea" aria-label="Agregar subtarea">+</button><button class="x" type="button" data-act="pj-rm" data-i="'+i+'" title="Quitar'+(sum?' con sus subtareas':'')+'" aria-label="Quitar tarea '+(i+1)+'">×</button></div>'+
      (sum?'<div class="row2 sumrow" id="tsum-'+i+'"></div>':
      '<div class="row2"><div class="field compact"><label>Inicio</label><input class="inp" data-tk="inicio" data-ti="'+i+'" type="date" aria-label="Inicio de la tarea '+(i+1)+'" value="'+esc(t.inicio)+'"></div><div class="field compact"><label>Término</label><input class="inp" data-tk="fin" data-ti="'+i+'" type="date" aria-label="Término de la tarea '+(i+1)+'" value="'+esc(t.fin)+'"></div><div class="field compact"><label>Avance</label><label class="rg"><input type="range" min="0" max="100" step="5" data-tk="avance" data-ti="'+i+'" aria-label="Avance de la tarea '+(i+1)+'" value="'+num(t.avance)+'"><span class="mono" id="tv-'+i+'">'+num(t.avance)+'%</span></label></div><div class="field compact"><label>Monto neto</label><input class="inp" data-tk="monto" data-ti="'+i+'" type="number" min="0" step="any" placeholder="Monto neto" aria-label="Monto neto de la tarea '+(i+1)+'" value="'+(num(t.monto)?esc(t.monto):'')+'"></div><div class="task-foot"><span>Duración: <b>'+(days?days+' día'+(days===1?'':'s'):'—')+'</b></span><span>Estado: <b>'+(num(t.avance)>=100?'Terminado':num(t.avance)>0?'En curso':'Pendiente')+'</b></span></div></div>')+'</div>'}).join(''):'<div class="empty" style="padding:18px">Aún no hay tareas. Agrega la primera para construir la carta Gantt.</div>';
  paintTaskSums();
}
function paintTaskSums(){
  const d=S.editor&&S.editor.draft;if(!d||!$('#pj-tasks'))return;
  pjTree(d.tareas).n.forEach(x=>{if(!x.kids.length)return;const e=$('#tsum-'+x.i);if(!e)return;
    e.innerHTML=x.ok?'<span class="mono">'+fmtD(x.ini)+' → '+fmtD(x.fin)+'</span><span>Avance <b>'+Math.round(x.av)+'%</b></span>'+(x.kids.some(k=>num(k.t.monto)>0)?'<span>Monto <b class="mono">'+clp(x.kids.reduce((a,k)=>a+subMonto(k),0))+'</b></span>':'')+'<span>'+x.kids.length+' subtarea'+(x.kids.length===1?'':'s')+'</span>':'<span>Agrega subtareas con fechas</span>'});
}
function subMonto(x){return x.kids.length?x.kids.reduce((a,k)=>a+subMonto(k),0):num(x.t.monto)}
function paintProject(){
  const E=S.editor,d=E.draft,c=pjCalc(d),pr=num(d.presupuesto),fa=pjFact(d),ro=isRO();
  $('#pj-title').textContent=d.nombre||'Nuevo proyecto';
  $('#pj-pill').innerHTML='<span class="pill '+c.cls+'">'+(E.example?'Ejemplo · ':'')+c.label+(E.dirty&&d.id?' · cambios sin guardar':'')+'</span>';
  let h='';
  if(E.example)h='<button class="btn" data-act="new-proj">Crear mi proyecto</button>';
  else if(!ro){if(d.id)h+='<button class="btn danger" data-act="pj-del">Eliminar</button>';h+='<button class="btn" data-act="pj-save" id="btn-save">Guardar</button>'}
  setHTML($('#pj-actions'),h);
  const msgs=[];
  if(E.example)msgs.push('Ejemplo con datos ficticios para que veas cómo se planifica un proyecto. Nada de esto se guarda.');
  if(!S.canWrite)msgs.push('Solo lectura: no tienes permiso para editar.');
  $('#pj-note').innerHTML=msgs.length?'<div class="note'+(S.canWrite?'':' warn')+'">'+msgs.join(' ')+'</div>':'';
  const left=d.fechaFin?diffD(d.fechaFin,todayS()):null;
  const rows=pjRows(d,0,S.pjCollapsed),hasSum=pjTree(d.tareas).n.some(x=>x.kids.length),stats=pjTaskStats(d);
  paintTaskSums();
  const hero=$('#pj-hero');if(hero)hero.innerHTML=pjHeroCard(d,c);
  $('#pj-side').innerHTML='<div class="card"><div class="card-head"><div><h2>Seguimiento</h2><span>'+(d.estado==='terminado'?'Proyecto terminado':left===null?'Sin plazo definido':left>=0?'Quedan '+left+' días':'Plazo vencido hace '+(-left)+' días')+'</span></div>'+(hasSum?'<button type="button" class="btn ghost sm" data-act="pj-expand">Ver todas las tareas</button>':'')+'</div>'+
   '<div class="sumgrid"><div><small>Tareas totales</small><b>'+stats.total+'</b></div><div><small>Completadas</small><b>'+stats.done+'</b></div><div><small>Presupuesto neto</small><b class="mono">'+clp(pr)+'</b></div>'+
   (d.cotizacionId?'<div><small>Por facturar</small><b class="mono">'+clp(Math.max(0,pr-fa))+'</b></div>':'<div><small>Tareas por vencer</small><b>'+stats.dueSoon+'</b></div>')+'</div>'+
   '<div class="meter"><div class="meter-l"><span>Avance real</span><b class="mono">'+c.avance+'%</b></div><div class="track"><div class="fill" style="width:'+c.avance+'%;background:'+pjColor(d,c)+'"></div><i class="plan" style="left:'+c.plan+'%"></i></div></div>'+
   '<div class="pj-side-note">Usa esta columna para revisar rápidamente si el proyecto va en plazo, cuánto se ha completado y cuánto queda por ejecutar.</div>'+
   (rows.length?'<div class="pj-side-mini">'+ganttHTML(rows.slice(0,Math.min(rows.length,6)))+'</div>':'<div class="empty" style="padding:18px"><b>Sin cronograma</b>Agrega tareas para visualizar el seguimiento.</div>')+'</div>';
}
function pjInput(ev){
  const E=S.editor;if(!E||E.tipo!=='proyecto'||E.example)return;
  const t=ev.target,d=E.draft;
  if(t.dataset.pf){
    const k=t.dataset.pf;d[k]=t.type==='number'?num(t.value):t.value;
    if(k==='cotizacionId'){const c=S.docs.find(x=>x.id===d.cotizacionId);d.cotizacionCodigo=c?c.codigo:'';if(c){if(!d.clienteId){d.clienteId=c.clienteId;$('#pj-cli').value=c.clienteId}if(!num(d.presupuesto)){d.presupuesto=c.neto;$('#pj-pre').value=c.neto}if(!d.nombre.trim()&&c.referencia){d.nombre=c.referencia;$('#pj-nom').value=c.referencia}}}
    E.dirty=true;paintProject();return;
  }
  if(t.dataset.tk!==undefined){
    const i=+t.dataset.ti,k=t.dataset.tk,tk=d.tareas[i];if(!tk)return;
    tk[k]=k==='avance'||k==='monto'?num(t.value):t.value;
    if(k==='avance'){const o=$('#tv-'+i);if(o)o.textContent=tk.avance+'%'}
    E.dirty=true;paintProject();
  }
}
document.addEventListener('keydown',ev=>{const t=ev.target;if((ev.key==='Enter'||ev.key===' ')&&t.matches&&t.matches('span[data-gtoggle]')){ev.preventDefault();t.click()}});
$('#v-editor').addEventListener('input',pjInput);
$('#v-editor').addEventListener('change',pjInput);
async function saveProject(){
  const E=S.editor,d=E.draft;if(E.saving)return false;
  if(!d.nombre.trim()){toast('Escribe el nombre del proyecto.',true);return false}
  if(!d.clienteId||!clientById(d.clienteId)){toast('Selecciona un cliente.',true);return false}
  if(!d.fechaInicio||!d.fechaFin||d.fechaFin<d.fechaInicio){toast('Revisa las fechas: el término debe ser igual o posterior al inicio.',true);return false}
  const ts=d.tareas.filter(t=>(t.nombre||'').trim()||t.inicio);
  const isSum=ts.map((t,i)=>i+1<ts.length&&num(ts[i+1].nivel)>num(t.nivel));
  for(let i=0;i<ts.length;i++){const t=ts[i];if(!(t.nombre||'').trim()||(!isSum[i]&&(!t.inicio||!t.fin||t.fin<t.inicio))){toast('Revisa la tarea «'+(t.nombre||'sin nombre')+'»: necesita nombre y fechas válidas.',true);return false}}
  E.saving=true;const b=$('#btn-save');if(b)b.disabled=true;
  try{
    d.tareas=ts.map(t=>({id:t.id||uid(),nombre:t.nombre.trim(),inicio:t.inicio||'',fin:t.fin||'',avance:Math.min(100,Math.max(0,num(t.avance))),nivel:Math.max(0,Math.min(3,num(t.nivel))),monto:Math.max(0,num(t.monto))}));
    pjTree(d.tareas).n.forEach(x=>{if(x.kids.length&&x.ok){x.t.inicio=x.ini;x.t.fin=x.fin;x.t.avance=Math.round(x.av);x.t.monto=0}});
    const c=pjCalc(d);let auto='';
    if(d.tareas.length&&c.avance===100&&d.estado!=='terminado'){d.estado='terminado';auto=' Todas las tareas están al 100%: quedó como terminado.'}
    else if(c.avance>0&&d.estado==='planificado'){d.estado='en_curso';auto=' Hay avance registrado: quedó en curso.'}
    const cs=clientById(d.clienteId);
    const payload=Object.assign({},d,{presupuesto:num(d.presupuesto),clienteSnap:{razon:cs.razon},actualizado:Date.now()});delete payload.id;
    const ref=d.id?S.db.collection('proyectos').doc(d.id):S.db.collection('proyectos').doc();
    payload.creado=d.creado||Date.now();
    await wr(()=>ref.set(payload));
    Object.assign(d,payload,{id:ref.id});E.dirty=false;
    await audit('proyecto',ref.id,'Proyecto «'+d.nombre+'» guardado · '+d.estado);
    toast('Proyecto guardado.'+auto);mountProject();return true;
  }catch(e){return false}
  finally{E.saving=false;const b2=$('#btn-save');if(b2)b2.disabled=false}
}
async function delProject(){
  const d=S.editor.draft;
  const ok=await confirmBox('Eliminar proyecto','Se borra «'+d.nombre+'» con todas sus tareas. Las cotizaciones y facturas no se tocan.','Eliminar',true);if(!ok)return;
  try{await wr(()=>S.db.collection('proyectos').doc(d.id).delete());S.editor.dirty=false;toast('Proyecto eliminado.');go('proyectos')}catch(e){}
}
