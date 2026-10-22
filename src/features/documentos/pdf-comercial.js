/**
 * Voltage Obras · Exportación PDF de documentos comerciales
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* ---------- PDF ---------- */
function buildPdf(d){
  const J=window.jspdf&&window.jspdf.jsPDF;if(!J)return window.SebaPDF.fallback(d,emp());
  const e=emp(),cot=d.tipo==='cotizacion',cl=d.clienteSnap,t={sub:d.sub,desc:d.desc,neto:d.neto,iva:d.iva,total:d.total};
  const giroE=(!cot&&d.giroFac)?d.giroFac+(d.giroCod?' - cód. actividad '+d.giroCod:''):e.giro;
  const pdf=new J({unit:'mm',format:'a4'});
  const W=210,H=297,M=16,R=W-M,BLUE=[24,85,214],INK=[24,34,58],MUT=[102,112,133],LN=[213,220,232],SOFT=[243,246,252];
  const T=(s,x,y,o)=>pdf.text(String(s==null?'':s),x,y,o);
  const setC=c=>pdf.setTextColor(c[0],c[1],c[2]);
  let y=M;
  // logo o iniciales
  let lx=M,lw=0;
  if(e.logo&&e.logoW&&e.logoH){const r=e.logoW/e.logoH,mh=16,mw=44;let h=mh,w=h*r;if(w>mw){w=mw;h=w/r}try{pdf.addImage(e.logo,e.logo.indexOf('image/jpeg')>0?'JPEG':'PNG',M,y,w,h);lw=w+4}catch(x){lw=0}}
  if(!lw){pdf.setFillColor(BLUE[0],BLUE[1],BLUE[2]);pdf.roundedRect(M,y,15,15,2.5,2.5,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(10);setC([255,255,255]);T(((e.razon||'EMPRESA').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('')||'EMPRESA').toUpperCase(),M+7.5,y+9.2,{align:'center'});lw=19}
  const tx=M+lw;pdf.setFont('helvetica','bold');pdf.setFontSize(11.5);setC(INK);
  const nm=pdf.splitTextToSize(e.razon||'Empresa',95-lw+20);nm.slice(0,2).forEach((s,i)=>T(s,tx,y+4+i*5));
  pdf.setFont('helvetica','normal');pdf.setFontSize(8.2);setC(MUT);
  let iy=y+4+Math.min(nm.length,2)*5;
  [e.rut?'R.U.T. '+e.rut:'',giroE,[e.direccion,e.comuna,e.ciudad].filter(Boolean).join(', '),[e.email,e.telefono].filter(Boolean).join('  |  ')].filter(Boolean).forEach(s=>{pdf.splitTextToSize(s,100).slice(0,2).forEach(l=>{T(l,tx,iy);iy+=3.8})});
  // caja de tipo
  const bx=R-64,bw=64;pdf.setDrawColor(BLUE[0],BLUE[1],BLUE[2]);pdf.setLineWidth(.7);pdf.roundedRect(bx,y,bw,d.folioSII?27:23,1.5,1.5,'S');
  pdf.setFont('helvetica','bold');pdf.setFontSize(13);setC(BLUE);T(cot?'COTIZACIÓN':'CONTROL DE COBRO',bx+bw/2,y+8,{align:'center'});
  pdf.setFontSize(11);setC(INK);T('N° '+d.codigo,bx+bw/2,y+14.5,{align:'center'});
  pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);setC(MUT);T(fmtD(d.fecha),bx+bw/2,y+19.5,{align:'center'});
  if(d.folioSII)T('Folio SII N° '+d.folioSII,bx+bw/2,y+24,{align:'center'});
  y=Math.max(iy,y+(d.folioSII?27:23))+6;
  // bloque cliente
  const fechaV=cot?addD(d.fecha,num(d.validezDias)):addD(d.fecha,num(d.plazoDias));
  const L1=[['Señor(es)',cl.razon],['R.U.T.',cl.rut?rutFmt(cl.rut):''],['Giro',cl.giro],['Dirección',cl.direccion]];
  const L2=[['Referencia',d.referencia],[cot?'Válida hasta':'Vence',fmtD(fechaV)],[cot?'Atención':'Orden de compra',cot?d.atencion:d.ordenCompra],[cot?'Plazo de ejecución':'Condición de pago',cot?d.plazoEjecucion:(num(d.plazoDias)?num(d.plazoDias)+' días':'Contado')]];
  const bh=4+Math.max(L1.length,L2.length)*5.2+3;
  pdf.setFillColor(SOFT[0],SOFT[1],SOFT[2]);pdf.roundedRect(M,y,R-M,bh,2,2,'F');
  const drawKV=(arr,x,wid,lw)=>{let yy=y+6;arr.forEach(([k,v])=>{pdf.setFont('helvetica','normal');pdf.setFontSize(8);setC(MUT);T(k,x,yy);pdf.setFont('helvetica','bold');pdf.setFontSize(8.6);setC(INK);T(pdf.splitTextToSize(String(v||'-'),wid-lw)[0],x+lw,yy);yy+=5.2})};
  drawKV(L1,M+4,(R-M)/2-4,20);drawKV(L2,M+(R-M)/2+2,(R-M)/2-4,32);
  y+=bh+7;
  const prop=d.modo==='propuesta';
  if(prop){
    const NAVY=[14,77,122],MID=[46,124,192],SUBC=[19,112,182],DARK=[29,30,28],CW=R-M,cs=d.secciones.map(secCalc);
    const fillC=c=>pdf.setFillColor(c[0],c[1],c[2]);
    const need=h=>{if(y+h>H-18){pdf.addPage();y=M;return true}return false};
    const txt=(s,x,yy,fs,bold,col,al)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(fs);setC(col);T(s,x,yy,al?{align:al}:undefined)};
    const bar=(label,c,h,fs,cols)=>{fillC(c);pdf.rect(M,y,CW,h,'F');txt(label,M+2.5,y+h/2+fs*0.127,fs,true,[255,255,255]);(cols||[]).forEach(([s,x])=>txt(s,x,y+h/2+fs*0.127,fs,true,[255,255,255],'right'));y+=h};
    // título e introducción
    need(30);fillC(NAVY);pdf.roundedRect(M,y,CW,d.referencia?14:9,1.5,1.5,'F');
    txt('Propuesta Técnico-Comercial',M+3,y+6,12.5,true,[255,255,255]);
    if(d.referencia)txt(pdf.splitTextToSize(d.referencia,CW-6)[0],M+3,y+11,8.5,false,[255,255,255]);
    y+=(d.referencia?14:9)+4;
    if(d.intro){pdf.setFont('helvetica','normal');pdf.setFontSize(8.8);pdf.splitTextToSize(d.intro,CW).forEach(l=>{need(5);txt(l,M,y+3.5,8.8,false,INK);y+=4.3});y+=3}
    const rowLine=()=>{pdf.setDrawColor(LN[0],LN[1],LN[2]);pdf.setLineWidth(.2);pdf.line(M,y,R,y)};
    const sumRow=(label,vals,xs,kind)=>{ // kind: sub | dsc | iva | tot
      need(7);const h=6.2;
      if(kind==='sub'){fillC(SUBC);pdf.rect(M,y,CW,h,'F')}else if(kind==='tot'){fillC(DARK);pdf.rect(M,y,CW,h,'F')}
      const col=kind==='sub'||kind==='tot'?[255,255,255]:kind==='dsc'?MUT:INK;
      txt(label,M+2.5,y+4.2,7.2,kind!=='dsc'&&kind!=='iva',col);
      vals.forEach((v,i)=>txt(v,xs[i],y+4.2,7.4,kind==='sub'||kind==='tot',col,'right'));
      if(kind==='iva'||kind==='dsc'){y+=h;rowLine()}else y+=h;
    };
    const mz=n=>n?clp(n):'-';
    d.secciones.forEach((s,si)=>{
      const c=cs[si],k=si+1,dl='DESCUENTO ('+(s.descLabel||'Descuento').toUpperCase()+' '+NF2.format(num(s.descPct))+'%)';
      need(7.5+6.5+14);bar(k+' ·  '+(s.titulo||'Sección '+k),NAVY,7.5,9.5);
      if(s.tipo==='lotes'){
        const n=s.lotes.length,vw=Math.min(27,(CW-52)/(n+1)),dw=CW-vw*(n+1),xs=[];for(let i=0;i<=n;i++)xs.push(M+dw+vw*(i+1)-2);
        const hdr=()=>bar('PARTIDA / ESPECIALIDAD',MID,6.5,7,s.lotes.map((l,i)=>[pdf.splitTextToSize(l.toUpperCase(),vw-2)[0],xs[i]]).concat([[ 'TOTAL NETO',xs[n]]]));
        hdr();
        s.filas.forEach((f,ri)=>{
          if(!((f.d||'').trim()||f.v.some(x=>num(x))))return;
          pdf.setFont('helvetica','normal');pdf.setFontSize(7.8);
          const ls=pdf.splitTextToSize(f.d||'',dw-5),rh=Math.max(6,ls.length*3.6+2.6);
          if(need(rh)){hdr()}
          ls.forEach((l,k2)=>txt(l,M+2.5,y+4+k2*3.6,7.8,false,INK));
          s.lotes.forEach((_,i)=>txt(mz(Math.round(num(f.v[i]))),xs[i],y+4,7.6,false,INK,'right'));
          txt(mz(c.filas[ri]),xs[n],y+4,7.6,true,INK,'right');
          y+=rh;rowLine();
        });
        sumRow('SUBTOTAL NETO',c.cols.map(x=>clp(x.sub)).concat(clp(c.sub)),xs,'sub');
        if(c.desc){sumRow(dl,c.cols.map(x=>'-'+clp(x.desc)).concat('-'+clp(c.desc)),xs,'dsc');sumRow('SUBTOTAL NETO',c.cols.map(x=>clp(x.neto)).concat(clp(c.neto)),xs,'sub')}
        sumRow('IVA 19%',c.cols.map(x=>clp(x.iva)).concat(clp(c.iva)),xs,'iva');
        sumRow('TOTAL CON IVA',c.cols.map(x=>clp(x.total)).concat(clp(c.total)),xs,'tot');
      }else{
        const totR=R-2,unR=R-40,qtR=R-56,dw=qtR-M-16,xs=[totR];
        const hdr=()=>bar('PARTIDA / ESPECIALIDAD',MID,6.5,7,[['CANT.',qtR],['UNIDAD',unR],['TOTAL NETO',totR]]);
        hdr();
        s.grupos.forEach((g,gi)=>{
          if(g.t){need(6+7);fillC(SOFT);pdf.rect(M,y,CW,6,'F');txt(g.t,M+2.5,y+4.2,8,true,NAVY);y+=6}
          g.items.forEach(it=>{
            if(!((it.d||'').trim()||num(it.t)))return;
            pdf.setFont('helvetica','normal');pdf.setFontSize(7.8);
            const ls=pdf.splitTextToSize(it.d||'',dw),rh=Math.max(6,ls.length*3.6+2.6);
            if(need(rh))hdr();
            ls.forEach((l,k2)=>txt(l,M+2.5,y+4+k2*3.6,7.8,false,INK));
            if(num(it.q))txt(NF2.format(num(it.q)),qtR,y+4,7.6,false,INK,'right');
            txt(it.u||'',unR,y+4,7.6,false,INK,'right');txt(mz(Math.round(num(it.t))),totR,y+4,7.6,false,INK,'right');
            y+=rh;rowLine();
          });
          if(s.grupos.length>1)sumRow('SUBTOTAL '+(g.t||'GRUPO '+(gi+1)).toUpperCase(),[clp(c.gs[gi])],xs,'sub');
        });
        sumRow('SUBTOTAL NETO',[clp(c.sub)],xs,'sub');
        if(c.desc){sumRow(dl,['-'+clp(c.desc)],xs,'dsc');sumRow('SUBTOTAL NETO',[clp(c.neto)],xs,'sub')}
        sumRow('IVA 19%',[clp(c.iva)],xs,'iva');
        sumRow('TOTAL CON IVA',[clp(c.total)],xs,'tot');
      }
      y+=6;
    });
    // resumen económico
    const TT=totalsOf(d),rx=[R-74,R-38,R-2];
    need(7.5+6.5+6.2*(d.secciones.length+1)+8);
    bar('RESUMEN ECONÓMICO UNIFICADO',NAVY,7.5,9.5);
    bar('CONCEPTO',MID,6.5,7,[['SUBTOTAL NETO',rx[0]],['IVA 19%',rx[1]],['TOTAL CON IVA',rx[2]]]);
    d.secciones.forEach((s,i)=>{need(6.4);txt(pdf.splitTextToSize((i+1)+' ·  '+(s.titulo||'Sección '+(i+1)),rx[0]-M-24)[0],M+2.5,y+4.2,7.8,false,INK);[cs[i].neto,cs[i].iva,cs[i].total].forEach((v,k2)=>txt(clp(v),rx[k2],y+4.2,7.8,false,INK,'right'));y+=6.4;rowLine()});
    need(8);fillC(DARK);pdf.rect(M,y,CW,8,'F');txt('TOTAL OFERTA',M+2.5,y+5.4,9,true,[255,255,255]);[TT.neto,TT.iva,TT.total].forEach((v,k2)=>txt(clp(v),rx[k2],y+5.4,9,true,[255,255,255],'right'));y+=8;
    need(10);pdf.setFont('helvetica','normal');pdf.setFontSize(8);setC(MUT);pdf.splitTextToSize('Son: '+pesosEnLetras(TT.total),CW).forEach(l=>{T(l,M,y+5);y+=3.8});y+=8;
  }
  // tabla
  const cN=M,cD=M+9,cU=R-80,cQ=R-58,cP=R-30,cT=R;
  const descW=cU-cD-12;
  const header=()=>{pdf.setFillColor(BLUE[0],BLUE[1],BLUE[2]);pdf.rect(M,y,R-M,7,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(8);setC([255,255,255]);T('#',cN+2,y+4.8);T('DESCRIPCIÓN',cD,y+4.8);T('UNID.',cU,y+4.8,{align:'right'});T('CANT.',cQ,y+4.8,{align:'right'});T('P. UNIT.',cP,y+4.8,{align:'right'});T('TOTAL',cT-2,y+4.8,{align:'right'});y+=7};
  const footer=()=>{const n=pdf.getNumberOfPages();for(let p=1;p<=n;p++){pdf.setPage(p);pdf.setDrawColor(LN[0],LN[1],LN[2]);pdf.setLineWidth(.2);pdf.line(M,H-14,R,H-14);pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);setC(MUT);T([e.razon,e.rut?'RUT '+e.rut:'',e.email].filter(Boolean).join('  ·  '),M,H-9.5);T('Página '+p+' de '+n,R,H-9.5,{align:'right'})}};
  if(!prop)header();
  (prop?[]:d.items).forEach((l,i)=>{
    pdf.setFont('helvetica','normal');pdf.setFontSize(9);
    const lines=pdf.splitTextToSize(l.d,descW),rh=Math.max(7,lines.length*4.2+3.4);
    if(y+rh>H-30){pdf.addPage();y=M;header()}
    setC(INK);T(i+1,cN+2,y+5);lines.forEach((s,k)=>T(s,cD,y+5+k*4.2));
    T(l.u||'',cU,y+5,{align:'right'});T(NF2.format(l.q),cQ,y+5,{align:'right'});T(clp(l.p),cP,y+5,{align:'right'});T(clp(Math.round(l.q*l.p)),cT-2,y+5,{align:'right'});
    pdf.setDrawColor(LN[0],LN[1],LN[2]);pdf.setLineWidth(.2);pdf.line(M,y+rh,R,y+rh);y+=rh;
  });
  // totales
  if(!prop){
  const rowsT=[['Subtotal',clp(t.sub)]];if(t.desc)rowsT.push(['Descuento '+NF2.format(d.descPct)+'%','-'+clp(t.desc)]);rowsT.push(['Monto neto',clp(t.neto)],[d.tipoDte===34?'IVA (exenta)':'IVA 19%',clp(t.iva)]);
  if(y+rowsT.length*5.5+22>H-18){pdf.addPage();y=M}
  y+=6;const tw=70,tx0=R-tw;
  pdf.setFont('helvetica','normal');pdf.setFontSize(9);setC(INK);
  rowsT.forEach(([k,v])=>{T(k,tx0,y);T(v,R,y,{align:'right'});y+=5.5});
  pdf.setFillColor(BLUE[0],BLUE[1],BLUE[2]);pdf.roundedRect(tx0-2,y-3.8,tw+2,8,1.5,1.5,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(10.5);setC([255,255,255]);T('TOTAL',tx0+1,y+1.6);T(clp(t.total),R-1.5,y+1.6,{align:'right'});
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);setC(MUT);
  pdf.splitTextToSize('Son: '+pesosEnLetras(t.total),R-M-tw-8).forEach((s,k)=>T(s,M,y-8+k*3.8));
  y+=12;
  }
  // condiciones
  const blocks=[];
  if(prop&&d.incluye)blocks.push(['INCLUYE',d.incluye]);
  if(prop&&d.noIncluye)blocks.push(['NO INCLUYE',d.noIncluye]);
  if(cot&&d.condPago)blocks.push(['FORMA DE PAGO',d.condPago]);
  if(prop)blocks.push(['VALIDEZ DE LA OFERTA',num(d.validezDias)+' días corridos desde la fecha de emisión.']);
  if(d.notas)blocks.push([prop?'OTRAS CONSIDERACIONES':cot?'CONDICIONES':'NOTAS',d.notas]);
  if(e.banco&&e.numCuenta)blocks.push(['DATOS PARA TRANSFERENCIA',[e.titular,e.rutTitular?'RUT '+e.rutTitular:'',e.banco+' - '+e.tipoCuenta+' N° '+e.numCuenta,e.emailPagos?'Enviar comprobante a '+e.emailPagos:''].filter(Boolean).join('\n')]);
  blocks.forEach(([h,txt])=>{
    const ls=[];txt.split('\n').forEach(p=>pdf.splitTextToSize(p,R-M).forEach(x=>ls.push(x)));
    if(y+4+ls.length*4>H-20){pdf.addPage();y=M}
    pdf.setFont('helvetica','bold');pdf.setFontSize(7.8);setC(MUT);T(h,M,y);y+=4;
    pdf.setFont('helvetica','normal');pdf.setFontSize(8.8);setC(INK);ls.forEach(s=>{T(s,M,y);y+=4});y+=3;
  });
  if(cot){
    if(y+26>H-18){pdf.addPage();y=M}
    y+=4;pdf.setDrawColor(INK[0],INK[1],INK[2]);pdf.setLineWidth(.25);
    pdf.line(M,y+14,M+60,y+14);pdf.line(M+75,y+14,M+135,y+14);
    pdf.setFont('helvetica','normal');pdf.setFontSize(8);setC(MUT);T('Aceptación del cliente: nombre y firma',M,y+18);T('Fecha',M+75,y+18);
  }else{
    if(y+10>H-18){pdf.addPage();y=M}
    pdf.setFont('helvetica','italic');pdf.setFontSize(7.5);setC(MUT);T('BORRADOR ADMINISTRATIVO - NO VALIDO COMO DTE. La emisión tributaria requiere un sistema autorizado.',M,y+3);
  }
  footer();
  return pdf;
}
const slug=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
async function downloadPdf(d){
  if(!S.dl){toast('La descarga no está disponible en esta vista.',true);return}
  try{
    const pdf=buildPdf(d);
    await S.dl.save({filename:d.codigo+'-'+slug(d.clienteSnap.razon)+'.pdf',data:pdf.output('arraybuffer')});
    toast('PDF de '+d.codigo+' guardado.');
  }catch(e){if(!e||e.code!=='declined')toast((e&&e.message)||'No se pudo generar el PDF.',true)}
}
async function exportCsv(tipo){
  const rows=S.docs.filter(d=>d.tipo===tipo).sort((a,b)=>a.numero-b.numero);
  const head=tipo==='cotizacion'?['Código','Fecha','Cliente','RUT','Referencia','Neto','IVA','Total','Estado','Válida hasta']:['Código','Folio SII','Emisión','Vence','Cliente','RUT','Referencia','OC','Neto','IVA','Total','Estado','Fecha de pago'];
  const q=v=>'"'+String(v==null?'':v).replace(/^[\s]*[=+@-]/,x=>"'"+x).replace(/"/g,'""')+'"';
  const lines=[head.map(q).join(';')].concat(rows.map(d=>{const st=estadoInfo(d).label;
    return (tipo==='cotizacion'?[d.codigo,d.fecha,d.clienteSnap.razon,d.clienteSnap.rut,d.referencia,d.neto,d.iva,d.total,st,addD(d.fecha,num(d.validezDias))]:[d.codigo,d.folioSII,d.fecha,venceFac(d),d.clienteSnap.razon,d.clienteSnap.rut,d.referencia,d.ordenCompra,d.neto,d.iva,d.total,st,d.pagos&&d.pagos.length?d.pagos[d.pagos.length-1].fecha:d.pago?d.pago.fecha:'']).map(q).join(';')}));
  try{await S.dl.save({filename:(tipo==='cotizacion'?'cotizaciones':'facturas')+'-cbc-'+todayS()+'.csv',data:'﻿'+lines.join('\r\n')});toast('Archivo guardado. Ábrelo con Excel.')}catch(e){if(!e||e.code!=='declined')toast('No se pudo guardar el archivo.',true)}
}

