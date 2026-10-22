import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root,'src/manifest.json'),'utf8'));
const read = file=>fs.readFileSync(path.join(root,file),'utf8');
test('El manifiesto organiza componentes y todos existen',()=>{
 assert.ok(cfg.scripts.length >= 20);
 for (const f of cfg.scripts) assert.ok(fs.existsSync(path.join(root,'src',f)),f);
 for (const f of cfg.styles) assert.ok(fs.existsSync(path.join(root,'src',f)),f);
});
test('El archivo portable no depende de rutas locales assets',()=>{
 const s=read('dist/ABRIR_VOLTAGE_OBRAS_V7.html');
 assert.match(s,/Voltage Obras/i);
 assert.ok(!s.includes('<script src="./assets/'));
 assert.ok(!s.includes('<link rel="stylesheet" href="./assets/'));
 assert.ok(s.includes('SebaLocal')&&s.includes('SebaReportPDF'));
});
test('El motor principal tiene sintaxis JavaScript valida',()=>{
 new vm.Script(read('dist/assets/app.js'));
});
test('Dominio: descuentos, IVA y RUT',()=>{
 const code=[read('src/core/formatters.js'),read('src/domain/rut-y-texto.js'),read('src/domain/documentos.js')].join(String.fromCharCode(10));
 const f=new Function(code+'; return {rutValid,totalsOf};')();
 assert.equal(f.rutValid('12.345.678-5'),true);
 assert.equal(f.rutValid('12.345.678-9'),false);
 const r=f.totalsOf({tipo:'factura',tipoDte:33,descPct:10,items:[{q:2,p:10000}]});
 assert.equal(r.neto,18000);assert.equal(r.iva,3420);assert.equal(r.total,21420);
 const e=f.totalsOf({tipo:'factura',tipoDte:34,descPct:0,items:[{q:1,p:10000}]});
 assert.equal(e.iva,0);
});
test('El almacenamiento local no afirma autenticación/tributación real',()=>{
 assert.match(read('src/infrastructure/local-adapter.js'),/demo-local-sin-autenticacion/);
 assert.match(read('src/features/tributario/preparacion-y-avisos.js'),/NO emisión electrónica/);
});
