/**
 * Voltage Obras · Cálculos de documentos, IVA, descuentos y vencimientos
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* cálculo */
const IVA_R=0.19;
function secCalc(s){
  const pct=num(s.descPct);
  if(s.tipo==='lotes'){
    const L=s.lotes||[],F=s.filas||[];
    const cols=L.map((_,c)=>{const sub=F.reduce((a,f)=>a+Math.round(num((f.v||[])[c])),0),desc=Math.round(sub*pct/100),neto=sub-desc,iva=Math.round(neto*IVA_R);return {sub,desc,neto,iva,total:neto+iva}});
    const sub=cols.reduce((a,c)=>a+c.sub,0),desc=cols.reduce((a,c)=>a+c.desc,0),neto=sub-desc,iva=Math.round(neto*IVA_R);
    return {sub,desc,neto,iva,total:neto+iva,cols,filas:F.map(f=>(f.v||[]).reduce((a,x)=>a+Math.round(num(x)),0))};
  }
  const gs=(s.grupos||[]).map(g=>(g.items||[]).reduce((a,i)=>a+Math.round(num(i.t)),0));
  const sub=gs.reduce((a,x)=>a+x,0),desc=Math.floor(sub*pct/100+1e-9),neto=sub-desc,iva=Math.round(neto*IVA_R);
  return {sub,desc,neto,iva,total:neto+iva,gs};
}
function totalsOf(d){
  if(d.modo==='propuesta'){const cs=(d.secciones||[]).map(secCalc),z=k=>cs.reduce((a,c)=>a+c[k],0),neto=z('neto'),iva=z('iva');return {sub:z('sub'),desc:z('desc'),neto,iva,total:neto+iva}}
  const items=(d.items||[]);
  const sub=items.reduce((a,l)=>a+Math.round(num(l.q)*num(l.p)),0);
  const desc=Math.round(sub*num(d.descPct)/100);
  const neto=sub-desc;
  const iva=d.tipoDte===34?0:Math.round(neto*0.19);
  return {sub,desc,neto,iva,total:neto+iva};
}
function estadoInfo(d){
  const t=todayS();
  if(d.tipo==='cotizacion'){
    const venc=addD(d.fecha,num(d.validezDias));
    const e=d.estado;
    if(e==='ingresada')return {key:'ingresada',label:'Recibida',cls:'info'};
    if(e==='en_preparacion')return {key:'en_preparacion',label:'En preparación',cls:'warn'};
    if(e==='facturada')return {key:'facturada',label:'Facturada',cls:'good'};
    if(e==='aprobada'){const pc=d.neto?Math.round(num(d.facturadoNeto)/d.neto*100):0;return {key:'aprobada',label:pc>0?'Aprobada, '+pc+'% facturado':'Aprobada',cls:'good'}}
    if(e==='rechazada')return {key:'rechazada',label:'Rechazada',cls:'bad'};
    if(e==='enviada'){if(t>venc)return {key:'vencida',label:'Vencida',cls:'warn'};return {key:'enviada',label:'Enviada',cls:'info'}}
    return {key:'borrador',label:'Borrador',cls:''};
  }
  if(d.estado==='anulada')return {key:'anulada',label:'Anulada',cls:''};
  const saldo=saldoFac(d),pagado=pagadoFac(d);
  if(d.estado==='pagada'||(num(d.total)>0&&saldo<=0))return {key:'pagada',label:'Pagada',cls:'good'};
  if(pagado>0&&venceFac(d)<t)return {key:'vencida',label:'Abono parcial · vencida '+clp(saldo),cls:'bad'};
  if(pagado>0)return {key:'parcial',label:'Pago parcial · '+clp(saldo),cls:'warn'};
  const v=addD(d.fecha,num(d.plazoDias)),df=diffD(v,t);
  if(df<0)return {key:'vencida',label:'Vencida hace '+(-df)+' d',cls:'bad'};
  if(df<=7)return {key:'emitida',label:df===0?'Vence hoy':'Vence en '+df+' d',cls:'warn'};
  return {key:'emitida',label:'Por cobrar, '+df+' d',cls:'info'};
}
const venceFac=d=>addD(d.fecha,num(d.plazoDias));
const pagadoFac=d=>(d.pagos&&d.pagos.length?d.pagos.reduce((s,p)=>s+Math.max(0,num(p.monto)),0):d.pago?Math.max(0,num(d.pago.monto)):0);
const saldoFac=d=>Math.max(0,num(d.total)-pagadoFac(d));
async function audit(tipo,refId,descripcion){try{if(S.db){const r=S.db.collection('bitacora').doc();await r.set({tipo,refId,descripcion,fecha:Date.now(),actor:'Operador local'})}}catch(e){console.warn('No fue posible guardar la bitácora',e)}}

