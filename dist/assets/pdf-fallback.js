/* Self-contained fallback for valid, simplified one-/multi-page PDFs.
   The full-format renderer is used when jsPDF is available. */
(function(){
 'use strict';
 const MONEY=new Intl.NumberFormat('es-CL',{maximumFractionDigits:0});
 const fmt=n=>'$'+MONEY.format(Math.round(Number(n)||0));
 const plain=s=>String(s==null?'':s).replace(/[\r\n\t]+/g,' ').replace(/[^\x20-\x7e\xa0-\xff]/g,' ').trim();
 const esc=s=>plain(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
 const pdfBytes=s=>{const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i)&255;return a};
 const asDate=s=>{const p=String(s||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:'—'};
 function fallback(d,empresa){
   const client=d.clienteSnap||{};
   const header=[plain(empresa.razon||'Empresa'),plain((empresa.rut?'RUT '+empresa.rut+'  ·  ':'')+(empresa.giro||'')),plain([empresa.direccion,empresa.comuna,empresa.ciudad].filter(Boolean).join(', '))];
   const title=d.tipo==='cotizacion'?'COTIZACION':'DOCUMENTO INTERNO DE COBRO';
   const lines=[];
   lines.push('CLIENTE: '+plain(client.razon||'Sin cliente'));
   lines.push('REFERENCIA: '+plain(d.referencia||'-'));
   lines.push('FECHA: '+asDate(d.fecha));
   if(d.folioSII)lines.push('FOLIO SII (REFERENCIA): '+plain(d.folioSII));
   lines.push('');lines.push('PARTIDAS / SERVICIOS:');
   for(const item of (d.items||[])){
     const txt=plain(item.d||'Servicio');
     const amount=(Number(item.q)||1)*(Number(item.p)||0);
     const chunk=txt.match(/.{1,76}(?:\s|$)/g)||[txt];
     chunk.slice(0,12).forEach((p,i)=>lines.push((i?'    ':'- ')+p.trim()));
     lines.push('    Cantidad '+plain(item.q||1)+' x '+fmt(item.p||0)+'   =   '+fmt(amount));
   }
   lines.push('');
   lines.push('SUBTOTAL: '+fmt(d.sub==null?d.neto:d.sub));
   if(d.desc)lines.push('DESCUENTO: -'+fmt(d.desc));
   lines.push('NETO: '+fmt(d.neto));lines.push('IVA: '+fmt(d.iva));lines.push('TOTAL: '+fmt(d.total));
   if(d.tipo==='factura')lines.push('Este documento NO es una factura electronica valida ante SII.');
   const pages=[];while(lines.length){pages.push(lines.splice(0,37))};if(!pages.length)pages.push([]);
   const contents=pages.map((l,i)=>{
     const out=[];const write=(text,x,y,size,color)=>{out.push((color||'0.13 0.22 0.24')+' rg');out.push('BT /F1 '+size+' Tf 1 0 0 1 '+x+' '+y+' Tm ('+esc(text)+') Tj ET')};
     out.push('0.03 0.50 0.51 rg 0 780 595 62 re f');
     write(title,45,807,16,'1 1 1');write(plain(d.codigo||'BORRADOR'),420,807,12,'1 1 1');
     header.filter(Boolean).forEach((h,j)=>write(h,45,766-j*15,9));
     out.push('0.76 0.84 0.83 RG 45 719 m 550 719 l S');
     l.forEach((line,j)=>write(line,45,700-j*16,10));
     write('Generado desde Seba Gestion  -  Documento demostrativo',45,44,8,'0.4 0.5 0.5');
     write('Pagina '+(i+1)+' de '+pages.length,475,44,8,'0.4 0.5 0.5');
     return out.join('\n')+'\n';
   });
   const all=[]; const obj=x=>{all.push(x);return all.length};
   const catalog=obj('<< /Type /Catalog /Pages 2 0 R >>');
   const pageRoot=obj('');
   const font=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
   let pageRefs=[];
   for(const stream of contents){
     const pageObjId=all.length+1, streamObjId=all.length+2;
     pageRefs.push(pageObjId+' 0 R');
     obj('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents '+streamObjId+' 0 R >>');
     obj('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
   }
   all[pageRoot-1]='<< /Type /Pages /Kids ['+pageRefs.join(' ')+'] /Count '+pages.length+' >>';
   let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];
   all.forEach((body,i)=>{offsets.push(out.length);out+=(i+1)+' 0 obj\n'+body+'\nendobj\n'});
   const startX=out.length;out+='xref\n0 '+(all.length+1)+'\n0000000000 65535 f \n';
   offsets.slice(1).forEach(off=>{out+=String(off).padStart(10,'0')+' 00000 n \n'});
   out+='trailer\n<< /Size '+(all.length+1)+' /Root 1 0 R >>\nstartxref\n'+startX+'\n%%EOF\n';
   const b=pdfBytes(out);
   return {output:function(){return b.buffer}};
 }
 window.SebaPDF={fallback};
})();
