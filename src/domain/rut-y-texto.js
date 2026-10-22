/**
 * Voltage Obras · Reglas de RUT chileno y montos en letras
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* RUT chileno */
const rutClean=s=>String(s||'').replace(/[^0-9kK]/g,'').toUpperCase();
function rutDV(b){let s=0,m=2;for(let i=b.length-1;i>=0;i--){s+=Number(b[i])*m;m=m===7?2:m+1}const r=11-(s%11);return r===11?'0':r===10?'K':String(r)}
function rutValid(s){const c=rutClean(s);if(c.length<2)return false;const b=c.slice(0,-1);return /^\d+$/.test(b)&&rutDV(b)===c.slice(-1)}
function rutFmt(s){const c=rutClean(s);if(c.length<2)return String(s||'');return c.slice(0,-1).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'-'+c.slice(-1)}

/* monto en letras */
const UN=['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE','VEINTE','VEINTIÚN','VEINTIDÓS','VEINTITRÉS','VEINTICUATRO','VEINTICINCO','VEINTISÉIS','VEINTISIETE','VEINTIOCHO','VEINTINUEVE'];
const DE=['','','','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
const CE=['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
function w999(n){if(!n)return '';if(n===100)return 'CIEN';let s='';const c=Math.floor(n/100),r=n%100;if(c)s+=CE[c]+' ';if(r<30)s+=UN[r];else{const u=r%10;s+=DE[Math.floor(r/10)]+(u?' Y '+UN[u]:'')}return s.trim()}
function words(n){if(n===0)return 'CERO';const mm=Math.floor(n/1e6),mi=Math.floor((n%1e6)/1000),re=n%1000,p=[];
  if(mm)p.push(mm===1?'UN MILLÓN':words(mm)+' MILLONES');
  if(mi)p.push(mi===1?'MIL':w999(mi)+' MIL');
  if(re)p.push(w999(re));
  let s=p.join(' ');if(mm&&!mi&&!re)s+=' DE';return s}
const pesosEnLetras=n=>words(Math.round(n))+' PESOS';

