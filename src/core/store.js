/**
 * Voltage Obras · Estado de la aplicación y configuración predeterminada
 * Fuente extraída de V6 para facilitar el mantenimiento.
 * Nota: el ensamblador agrupa estos archivos bajo un único ámbito por compatibilidad.
 */
/* estado global */
const HOLDER='h'+Math.random().toString(36).slice(2,10);
const S={db:null,user:null,dl:null,canWrite:false,connected:false,ready:false,loaded:{cli:false,doc:false,emp:false,pro:false,bit:false,costos:false},
  clientes:[],docs:[],proyectos:[],bitacora:[],costos:[],empresa:{},view:'panel',pjView:'cards',fil:{cotizaciones:'all',facturas:'all',proyectos:'all'},q:{cotizaciones:'',facturas:'',clientes:'',proyectos:''},editor:null};
const EMP_DEF={razon:'',rut:'',giro:'',direccion:'',comuna:'',ciudad:'',email:'',telefono:'',web:'',banco:'',tipoCuenta:'Cuenta corriente',numCuenta:'',titular:'',rutTitular:'',emailPagos:'',cotValidez:15,facPlazo:30,giros:[],
  cotNotas:'Valores expresados en pesos chilenos, más IVA.\nLos precios consideran las condiciones descritas en esta cotización; cualquier trabajo adicional se cotizará por separado.',logo:'',logoW:0,logoH:0};
S.pjOpen=new Set();S.pjCollapsed=new Set();
const emp=()=>Object.assign({},EMP_DEF,S.empresa||{});
const girosList=()=>{const e=emp();return (e.giros&&e.giros.length)?e.giros:(e.giro?[{nombre:e.giro,codigo:'',tipo:33,notas:''}]:[])};
const clientById=id=>S.clientes.find(c=>c.id===id);

