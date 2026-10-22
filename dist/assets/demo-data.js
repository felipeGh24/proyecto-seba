(function(){
  'use strict';
  // Escenarios comerciales FICTICIOS. No corresponden a empresas, RUT ni facturas reales.
  const add=(d,n)=>{let x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const day=(n)=>add(new Date(),n);
  const dv=(b)=>{let s=0,m=2;for(let i=b.length-1;i>=0;i--){s+=Number(b[i])*m;m=m===7?2:m+1;}let r=11-(s%11);return r===11?'0':r===10?'K':String(r)};
  const money=(n)=>Math.round(n);
  const specs=[
    ['Inmobiliaria Altos del Roble (demo)','Edificio oficinas Altos del Roble','Habilitación interior, terminaciones y recepción municipal',36500000,'en_curso',60,-85,45,'Camila Rojas'],
    ['Transportes Río Claro (demo)','Centro logístico Río Claro','Rehabilitación de pavimentos y portones industriales',22800000,'en_curso',35,-70,65,'Javier Soto'],
    ['Servicios Comerciales Nueva Ruta (demo)','Local comercial Nueva Ruta','Habilitación eléctrica y climatización de tienda',15300000,'terminado',100,-155,-20,'Andrea Muñoz'],
    ['Agroindustrial La Quebrada (demo)','Galpón agrícola La Quebrada','Estructura metálica y cubierta de galpón',44600000,'en_curso',26,-60,90,'Cristóbal Vera'],
    ['Comunidad Jardines del Valle (demo)','Mejoramiento Jardines del Valle','Reparación de muros y pavimentos de acceso',10400000,'planificado',0,10,80,'María Pérez'],
    ['Distribuidora Andes Sur (demo)','Bodega Andes Sur','Red húmeda, señalética y accesos de bodega',29600000,'en_curso',74,-110,22,'Felipe Torres'],
    ['Educacional Mirador (demo)','Escuela Mirador','Remodelación de salas, cubierta y accesibilidad',18700000,'pausado',20,-75,75,'Daniela Castro'],
    ['Operaciones Costa Verde (demo)','Taller Costa Verde','Montaje de tableros y adecuación de instalaciones',12750000,'en_curso',42,-45,55,'Ignacio Morales']
  ];
  const extraTitles=['Mantención preventiva de cubierta','Refuerzo de fundaciones','Ampliación de instalaciones sanitarias','Obras exteriores y cierres'];
  const map=new Map();let id=0,seq=0,invoice=0,costid=0,auditid=0;
  const put=(k,v)=>map.set(k,v);
  const addLog=(tipo,ref,descripcion,delta)=>{auditid++;put('bitacora/demo-log-'+String(auditid).padStart(3,'0'),{tipo,refId:ref,descripcion,actor:'Equipo demostración',fecha:Date.now()+delta*86400000})};
  specs.forEach((x,i)=>{
    const [name,title,desc,net,state,progress,begin,end,owner]=x;
    const cId='demo-cli-'+String(i+1).padStart(2,'0');const rutBase=String(76510000+i*103+29);const rut=rutBase+'-'+dv(rutBase);
    const client={id:cId,razon:name,rut,giro:['Inmobiliaria','Logística','Comercio','Agroindustria','Servicios','Distribución','Educación','Operaciones'][i],contacto:['Valentina Díaz','Matías Silva','Paula Araya','Francisco Ríos','Rocío Paredes','Sofía Mena','Esteban Fuentes','Carolina Jiménez'][i]+' (demo)',email:'contacto'+(i+1)+'@ejemplo.invalid',telefono:'',direccion:'Dirección ficticia '+(i+1),comuna:'Santiago',creado:Date.now()-(120-i*3)*86400000,actualizado:Date.now()};
    put('clientes/'+cId,client);
    seq++;const qId='demo-cot-'+String(seq).padStart(3,'0');const qDate=day(begin-20);const total=money(net*1.19);
    const isPart=[1,3,5,6].includes(i);
    const portion=i===1?.72:i===3?.42:i===5?.86:i===6?.25:1;
    const qState=i===4?'enviada':isPart?'aprobada':'facturada';
    const q={tipo:'cotizacion',id:qId,numero:seq,codigo:'COT-'+String(seq).padStart(4,'0'),fecha:qDate,clienteId:cId,clienteSnap:{razon:name,rut},referencia:title,estado:qState,modo:'simple',items:[{d:'Obras y servicios — '+title,q:1,u:'gl',p:net}],descPct:0,sub:net,desc:0,neto:net,iva:money(net*.19),total,validezDias:60,creado:Date.now()-(130-i*4)*86400000,actualizado:Date.now(),responsable:owner,prioridad:i===5?'critica':i===4?'alta':'normal',origen:'Solicitud por correo · demo',proximoContacto:i===4?day(2):'',seguimientoNotas:'Coordinación con mandante. Ejemplo ficticio.',facturadoNeto:i===4?0:money(net*portion)};
    put('documentos/'+qId,q);addLog('cotizacion',qId,'Cotización '+q.codigo+' registrada',-20+i);
    const projectId='demo-pro-'+String(i+1).padStart(2,'0');
    const parts=[['Levantamiento, ingeniería y permisos',.14,0,.16],['Preparación y obras preliminares',.18,.17,.37],['Ejecución principal y especialidades',.48,.38,.83],['Terminaciones, pruebas y entrega',.20,.84,1]];
    const tasks=parts.map(([label,weight,a,b],j)=>{const st=begin+Math.round((end-begin)*a),en=begin+Math.round((end-begin)*b);let av=state==='terminado'?100:state==='planificado'?0:state==='pausado'?[100,65,10,0][j]:Math.max(0,Math.min(100,Math.round((progress/100-a)/(b-a)*100)));return {id:projectId+'-t'+j,nombre:label,inicio:day(st),fin:day(en),avance:av,nivel:0,monto:money(net*weight)}});
    const proj={id:projectId,nombre:title,clienteId:cId,clienteSnap:{razon:name},cotizacionId:qId,cotizacionCodigo:q.codigo,presupuesto:net,estado:state,responsable:owner,fechaInicio:day(begin),fechaFin:day(end),notas:desc+'. Proyecto y etapas de prueba; no representa obra real.',tareas:tasks,creado:Date.now()-(95-i*3)*86400000,actualizado:Date.now()};
    put('proyectos/'+projectId,proj);addLog('proyecto',projectId,'Planificación de obra registrada · '+title,-18+i);
    if(i!==4){
      // Facturación parcial o total ligada a cotización y proyecto.
      invoice++;
      const invNet= i===1?money(net*.72):i===3?money(net*.42):i===5?money(net*.86):i===6?money(net*.25):net;
      const gross=money(invNet*1.19),invId='demo-fac-'+String(invoice).padStart(3,'0');
      let payments=[];
      if(i===2){payments=[{id:invId+'-pay1',monto:gross,fecha:day(-12),medio:'Transferencia',ref:'TRX-DEMO-003'}]}
      else if(i===0){payments=[{id:invId+'-pay1',monto:money(gross*.45),fecha:day(-15),medio:'Transferencia',ref:'TRX-DEMO-001'}]}
      else if(i===5){payments=[{id:invId+'-pay1',monto:money(gross*.65),fecha:day(-5),medio:'Transferencia',ref:'TRX-DEMO-006'}]}
      else if(i===7){payments=[{id:invId+'-pay1',monto:money(gross*.3),fecha:day(-3),medio:'Transferencia',ref:'TRX-DEMO-008'}]}
      const issue=i===1?-66:i===3?-32:i===2?-40:i===0?-40:i===6?-12:-25;
      const plazo=i===1?30:i===3?20:i===0?45:30;
      const doc={id:invId,tipo:'factura',numero:invoice,codigo:'FAC-'+String(invoice).padStart(4,'0'),fecha:day(issue),plazoDias:plazo,clienteId:cId,clienteSnap:{razon:name,rut},referencia:'Estado de pago — '+title,estado:payments.reduce((s,p)=>s+p.monto,0)>=gross?'pagada':'emitida',tipoDte:33,folioSII:'',ordenCompra:'OC-DEMO-'+String(301+invoice),modo:'simple',items:[{d:'Estado de pago de obra: '+title,q:1,u:'gl',p:invNet}],descPct:0,sub:invNet,desc:0,neto:invNet,iva:money(invNet*.19),total:gross,cotizacionId:qId,cotizacionCodigo:q.codigo,proyectoId:projectId,pagos:payments,creado:Date.now()+issue*86400000,actualizado:Date.now()};
      put('documentos/'+invId,doc);addLog('factura',invId,'Documento administrativo '+doc.codigo+' vinculado a '+q.codigo,issue);
      if(payments.length)addLog('pago',invId,'Abono registrado en '+doc.codigo+' · escenario ficticio',-5);
    }
    [0.10,0.15,0.09,0.08].slice(0,state==='planificado'?1:state==='pausado'?2:4).forEach((f,j)=>{
      const cat=['Materiales','Mano de obra','Subcontrato','Transporte y logística'][j];costid++;
      put('costos/demo-cost-'+String(costid).padStart(3,'0'),{id:'demo-cost-'+String(costid).padStart(3,'0'),proyectoId:projectId,clienteId:cId,fecha:day(-70+j*15+i*2),categoria:cat,descripcion:['Hormigón, perfilería y suministros','Cuadrilla de montaje e instalación','Especialistas de terminaciones','Fletes y arriendo de equipo'][j]+' · demo',monto:money(net*f*(state==='terminado'?1.35:state==='pausado'?.75:1.25)),proveedor:'Proveedor ficticio '+(j+1),comprobante:'COSTO-DEMO-'+String(costid).padStart(4,'0'),creado:Date.now(),actualizado:Date.now()});
    });
    if(i<4){seq++;const newId='demo-cot-'+String(seq).padStart(3,'0');const offerNet=money(net*(.22+i*.06));const st=['ingresada','en_preparacion','enviada','rechazada'][i];put('documentos/'+newId,{tipo:'cotizacion',id:newId,numero:seq,codigo:'COT-'+String(seq).padStart(4,'0'),fecha:day(-10+i*2),clienteId:cId,clienteSnap:{razon:name,rut},referencia:extraTitles[i],estado:st,modo:'simple',items:[{d:extraTitles[i],q:1,u:'gl',p:offerNet}],descPct:0,sub:offerNet,desc:0,neto:offerNet,iva:money(offerNet*.19),total:money(offerNet*1.19),validezDias:20,creado:Date.now()-(10-i*2)*86400000,actualizado:Date.now(),responsable:owner,prioridad:i===2?'alta':'normal',proximoContacto:st==='rechazada'?'':day(i===2?-2:i+1),seguimientoNotas:'Contactar para confirmar alcance y disponibilidad de cuadrilla.'});addLog('seguimiento',newId,'Nueva solicitud ingresada · '+extraTitles[i],-5+i)}
  });
  put('meta/empresa',{razon:'Constructora Modelo · DEMO',rut:'',giro:'Construcción y obras menores',direccion:'',comuna:'',ciudad:'',email:'',telefono:'',cotValidez:15,facPlazo:30,logo:'',giros:[],cotNotas:'Cotización de demostración. Sin valor contractual.'});
  put('meta/dataset',{kind:'demo',version:3,generated:new Date().toISOString(),description:'Ocho empresas ficticias y transacciones relacionadas; datos para evaluación de interfaz, NO datos reales.'});
  put('contadores/cotizacion',{n:seq});put('contadores/factura',{n:invoice});
  const returnArray=Array.from(map.entries());
  window.SebaFixtures={make:function(){return returnArray.map(x=>JSON.parse(JSON.stringify(x)))},clientCount:8};
})();