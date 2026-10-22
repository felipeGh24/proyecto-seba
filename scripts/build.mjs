/**
 * Compilador estático reproducible para VOLTAGE OBRAS.
 * No utiliza dependencias externas ni servidor: genera un HTML portátil.
 * Conserva la única IIFE compartida heredada de V6 durante esta etapa de refactor.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
const manifest = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
const read = name => fs.readFileSync(path.join(src, name), 'utf8');
fs.mkdirSync(assets,{recursive:true});
const code = `(function(){\n'use strict';\n\n${manifest.scripts.map(read).join('\n\n')}\n})();\n`;
const css = manifest.styles.map(read).join('\n\n');
fs.writeFileSync(path.join(assets, 'app.js'), code);
fs.writeFileSync(path.join(assets, 'app.css'), css);
for(const {src:source,dist:name} of manifest.adapters) fs.copyFileSync(path.join(src,source),path.join(assets,name));
let html = read(manifest.entry);
fs.writeFileSync(path.join(dist,'index.html'), html);
const replaceScript=(match,filename,attributes)=>{
  const data=fs.readFileSync(path.join(assets,filename),'utf8');
  // Escapar terminadores de etiqueta para preservar el contenido del JS embebido.
  return `<script${attributes||''}>\n${data.replace(/<\/script/ig,'<\\/script')}\n</script>`;
};
let portable=html.replace(/<link rel="stylesheet" href="\.\/assets\/app\.css">/,
  () => `<style>\n${css.replace(/<\/style/ig,'<\\/style')}\n</style>`);
for (const scriptName of [...manifest.adapters.map(x=>x.dist),'app.js']) {
  const tag = `<script src="./assets/${scriptName}"></script>`;
  if(!portable.includes(tag)) throw Error('No existe etiqueta de dependencia: '+tag);
  portable=portable.replace(tag,()=>replaceScript('',scriptName,''));
}
fs.writeFileSync(path.join(dist, 'ABRIR_VOLTAGE_OBRAS_V7.html'), portable);
console.log('V7 compilada:',manifest.scripts.length,'archivos de lógica;',manifest.styles.length,'archivos de estilos;',portable.length,'caracteres portátiles.');
