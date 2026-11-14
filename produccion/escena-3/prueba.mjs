// Captura fotogramas sueltos de la escena 3 para revisarlos. Requiere python3 -m http.server 4700 en la raíz.
// Uso: SALIDA=dir PS=0.02,0.5,1 node produccion/escena-3/prueba.mjs 1600 900
import { chromium } from "playwright";
const S = (process.env.SALIDA || "/tmp/escena-3-prueba") + "/"; // capturas de prueba (PS=0.1,0.5 para elegir fotogramas)
import fs from "fs"; fs.mkdirSync(S,{recursive:true});
const [w,h]=process.argv.slice(2).map(Number);
const b=await chromium.launch({args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const p=await b.newPage({viewport:{width:w,height:h}});
p.on("pageerror",e=>console.log("ERR",e.message)); p.on("console",m=>m.type()==="error"&&console.log(m.text()));
await p.goto(`http://localhost:4700/produccion/escena-3/render.html?w=${w}&h=${h}`); await p.waitForFunction(()=>window.listo,null,{timeout:120000});
for (const f of (process.env.PS||"0.02,0.12,0.26,0.4,0.5,0.58,0.66,0.78,1").split(",").map(Number)) { await p.evaluate(f=>window.fotograma(f),f); await p.locator("canvas").screenshot({path:S+`${w}-${f}.png`}); }
await b.close();
