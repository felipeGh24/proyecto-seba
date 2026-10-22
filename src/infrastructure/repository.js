/**
 * Voltage Obras · Interfaz de persistencia y numeración local
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* base de datos */
const use=async n=>{try{return (await (window.claude&&window.claude.use&&window.claude.use(n)))||null}catch(e){return null}};
const wr=async fn=>{try{return await fn()}catch(e){const m=e&&e.code==='invalid_argument'?'No tienes permiso para modificar datos en esta página.':e&&e.code==='quota_exceeded'?'Se alcanzó el límite de almacenamiento.':e&&!e.code&&e.message?e.message:'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.';toast(m,true);throw e}};
async function nextNumber(tipo){
  const ref=S.db.doc('meta/counter-'+tipo);
  const maxEx=Math.max(0,...S.docs.filter(d=>d.tipo===tipo).map(d=>d.numero||0));
  for(let i=0;i<12;i++){
    const r=await ref.acquire({holder:HOLDER,ttlMs:1000});
    if(r.acquired){const s=await ref.get();const cur=s.exists?num(s.data().n):0;const n=Math.max(cur,maxEx)+1;await ref.set({n});return n}
    await new Promise(r=>setTimeout(r,450+Math.random()*350));
  }
  throw new Error('No se pudo reservar el número del documento. Inténtalo de nuevo.');
}

