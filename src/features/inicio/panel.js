/**
 * Voltage Obras · Dashboard original y reglas de semáforo
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- PANEL ---------- */
function semClass(x){return x==='red'?'sem-red':x==='yellow'?'sem-yellow':x==='blue'?'sem-blue':'sem-green'}
function semDot(c){return '<span class="sema '+semClass(c)+'"></span>'}
function ciState(c){if(c==='atraso')return 'red';if(c==='riesgo'||c==='plan')return 'yellow';return 'green'}
const safeName=d=>esc((d.clienteSnap&&d.clienteSnap.razon)||((clientById(d.clienteId)||{}).razon)||'Cliente sin asignar');
function mountPanel(){
 $('#v-panel').innerHTML='<div class="top"><div><div class="eyebrow">CENTRO DE CONTROL · '+fmtDL(todayS())+'</div><h1>Resumen ejecutivo</h1><p class="subtitle">Lo importante de tu empresa, sin perderte entre pantallas.</p></div><div class="actions"><button class="btn ghost" data-go="flujo">Ver trazabilidad ↗</button><button class="btn" data-act="new-cot">+ Nueva cotización</button></div></div><div id="panel-body"></div>';
 paintPanel();
}
function paintPanel(){
 const el=$('#panel-body');if(!el)return;
 const quotes=S.docs.filter(d=>d.tipo==='cotizacion');const bills=S.docs.filter(d=>d.tipo==='factura'&&d.estado!=='anulada');
 const live=bills.filter(d=>saldoFac(d)>0),overdue=live.filter(d=>venceFac(d)<todayS());
 const due=live.reduce((sum,d)=>sum+saldoFac(d),0);const risk=overdue.reduce((sum,d)=>sum+saldoFac(d),0);
 const active=S.proyectos.filter(p=>p.estado==='en_curso');const late=active.filter(p=>pjCalc(p).key==='atraso');
 const pending=quotes.filter(d=>['ingresada','en_preparacion','borrador','enviada'].includes(d.estado));
 const steps=[{t:'Recibidas',k:'ingresada',v:quotes.filter(d=>d.estado==='ingresada').length,c:'blue'},{t:'En preparación',k:'en_preparacion',v:quotes.filter(d=>['en_preparacion','borrador'].includes(d.estado)).length,c:'yellow'},{t:'Enviadas',k:'enviada',v:quotes.filter(d=>d.estado==='enviada').length,c:'blue'},{t:'Resueltas',k:'aprobada',v:quotes.filter(d=>['aprobada','facturada','rechazada'].includes(d.estado)).length,c:'green'}];
 const attention=[];
 overdue.forEach(d=>attention.push({c:'red',t:'Cobranza vencida · '+esc(d.codigo),s:safeName(d)+' · '+clp(saldoFac(d)),id:d.id}));
 late.forEach(p=>attention.push({c:'red',t:'Obra con retraso · '+esc(p.nombre),s:'Avance '+pjCalc(p).avance+'% · Plan '+pjCalc(p).plan+'%',p:p.id}));
 live.filter(d=>!overdue.includes(d)&&diffD(venceFac(d),todayS())<=7).forEach(d=>attention.push({c:'yellow',t:'Cobranza próxima · '+esc(d.codigo),s:clp(saldoFac(d))+' pendiente',id:d.id}));
 quotes.filter(q=>q.estado==='enviada'&&diffD(todayS(),q.fecha)>=7).forEach(q=>attention.push({c:'yellow',t:'Cotización sin respuesta · '+esc(q.codigo),s:safeName(q),id:q.id}));
 const events=S.bitacora.slice().sort((a,b)=>b.fecha-a.fecha).slice(0,4);
 const projects=active.slice().sort((a,b)=>(pjCalc(a).key==='atraso'?-1:1)-(pjCalc(b).key==='atraso'?-1:1)).slice(0,4);
 el.innerHTML='<div class="exec-kpis">'+
  [{t:'POR COBRAR',v:clp(due),s:live.length+' documentos pendientes',c:'teal',go:'facturas'},{t:'COBROS VENCIDOS',v:clp(risk),s:overdue.length+' requieren atención',c:'red',go:'facturas'},{t:'OBRAS ACTIVAS',v:String(active.length),s:late.length+' con retraso',c:'normal',go:'proyectos'},{t:'COTIZACIONES ABIERTAS',v:String(pending.length),s:'En proceso comercial',c:'normal',go:'cotizaciones'}].map(x=>'<button class="exec-kpi '+x.c+'" data-go="'+x.go+'"><span>'+x.t+'</span><strong>'+x.v+'</strong><small>'+x.s+'</small><i>↗</i></button>').join('')+'</div>'+ 
 '<div class="workspace-grid"><section class="workspace-block wide"><div class="workspace-heading"><div><span class="overline">CONTROL COMERCIAL</span><h2>Semáforo de cotizaciones</h2></div><button class="text-btn" data-go="flujo">Abrir tablero →</button></div><div class="flow-strip">'+steps.map(s=>'<button class="flow-step" data-go="flujo">'+semDot(s.c)+'<small>'+s.t+'</small><strong>'+s.v+'</strong></button>').join('')+'</div><div class="work-hint">Seguimiento del ciclo: recepción → preparación → envío → resolución.</div></section>'+ 
 '<section class="workspace-block"><div class="workspace-heading"><div><span class="overline">PRIORIDADES</span><h2>Requieren atención</h2></div><span class="count-mini">'+attention.length+'</span></div><div class="signal-list">'+(attention.length?attention.slice(0,4).map(a=>'<button class="signal" '+(a.id?'data-open="'+a.id+'"':'data-proj="'+a.p+'"')+'>'+semDot(a.c)+'<span><b>'+a.t+'</b><small>'+a.s+'</small></span><span class="arrow">↗</span></button>').join(''):'<div class="quiet"><b>Todo al día</b><span>Sin alertas críticas registradas.</span></div>')+'</div></section>'+ 
 '<section class="workspace-block wide"><div class="workspace-heading"><div><span class="overline">OPERACIONES</span><h2>Proyectos en seguimiento</h2></div><button class="text-btn" data-go="proyectos">Todos los proyectos →</button></div><div class="project-list">'+(projects.length?projects.map(p=>{const c=pjCalc(p);return '<button class="proj-line" data-proj="'+p.id+'"><span class="proj-meta">'+semDot(ciState(c.key))+'<span><b>'+esc(p.nombre)+'</b><small>'+esc(pjClient(p))+'</small></span></span><div class="progress-container"><span class="progress-nums">'+c.avance+'% <small>de '+c.plan+'% esperado</small></span><div class="progress-track"><i style="width:'+c.avance+'%" class="progress-fill '+(c.key==='atraso'?'danger':'')+'"></i></div></div><span class="arrow">↗</span></button>'}).join(''):'<div class="quiet"><b>Sin obras en ejecución</b><span>Puedes crear proyectos desde cotizaciones aprobadas.</span></div>')+'</div></section>'+ 
 '<section class="workspace-block"><div class="workspace-heading"><div><span class="overline">MOVIMIENTOS</span><h2>Actividad reciente</h2></div><button class="text-btn" data-go="flujo">Ver historial →</button></div><div class="activity-list">'+(events.length?events.map(ev=>'<div class="activity"><span class="activity-icon">↗</span><span><b>'+esc(ev.descripcion)+'</b><small>'+new Date(ev.fecha).toLocaleString('es-CL')+'</small></span></div>').join(''):'<div class="quiet"><b>Actividad inicial</b><span>Los movimientos que registres aparecerán aquí.</span></div>')+'</div></section></div>';
}
function drawChart(el,months){
  if(!el)return;
  const mx=Math.max(...months.map(m=>Math.max(m.f,m.c)));
  if(!mx){el.innerHTML='<div class="empty" style="padding:40px 10px"><b>Sin facturas todavía</b>El gráfico se llena cuando emitas tu primera factura.</div>';return}
  const W=Math.max(el.clientWidth,300),H=250,L=62,R=8,T=22,B=26;
  const stepRaw=mx/4,pw=Math.pow(10,Math.floor(Math.log10(stepRaw))),st=[1,2,2.5,5,10].map(x=>x*pw).find(x=>x>=stepRaw);
  const top=st*4,iw=W-L-R,ih=H-T-B,gw=iw/months.length,bw=Math.min(22,(gw-14)/2),y=v=>T+ih-v/top*ih;
  let s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Facturado y cobrado por mes">';
  for(let i=0;i<=4;i++){const v=st*i;s+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="ax" x="'+(L-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+short(v)+'</text>'}
  months.forEach((m,i)=>{const cx=L+gw*i+gw/2;
    if(m.f)s+='<rect class="bA" x="'+(cx-bw-1)+'" y="'+y(m.f)+'" width="'+bw+'" height="'+(T+ih-y(m.f))+'" rx="3"><title>'+m.l+': facturado '+clp(m.f)+'</title></rect>';
    if(m.c)s+='<rect class="bB" x="'+(cx+1)+'" y="'+y(m.c)+'" width="'+bw+'" height="'+(T+ih-y(m.c))+'" rx="3"><title>'+m.l+': cobrado '+clp(m.c)+'</title></rect>';
    if(i===months.length-1){if(m.f)s+='<text class="vl" x="'+(cx-1)+'" y="'+(y(m.f)-6)+'" text-anchor="end">'+short(m.f)+'</text>';if(m.c)s+='<text class="vl" x="'+(cx+1)+'" y="'+(y(m.c)-6)+'" text-anchor="start">'+short(m.c)+'</text>'}
    s+='<text class="ax" x="'+cx+'" y="'+(H-7)+'" text-anchor="middle">'+m.l+'</text>'});
  el.innerHTML=s+'</svg>';
}

