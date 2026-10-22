/**
 * Voltage Obras · Formato de fechas, moneda, DOM y utilidades sin estado
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NF=new Intl.NumberFormat('es-CL',{maximumFractionDigits:0});
const NF2=new Intl.NumberFormat('es-CL',{maximumFractionDigits:2});
const clp=n=>'$'+NF.format(Math.round(n||0));
const short=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace('.',',')+' M':n>=1e3?NF.format(Math.round(n/1e3))+' mil':String(Math.round(n));
const MONTHS=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MFULL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WD=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const p=String(s).split('-').map(Number);return new Date(p[0],p[1]-1,p[2])};
const todayD=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const todayS=()=>iso(todayD());
const addD=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const diffD=(a,b)=>Math.round((parse(a)-parse(b))/864e5);
const fmtD=s=>{if(!s)return '';const d=parse(s);return d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear()};
const fmtDL=s=>{const d=parse(s);return d.getDate()+' de '+MFULL[d.getMonth()]+' de '+d.getFullYear()};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const num=v=>{const n=Number(v);return isFinite(n)?n:0};

