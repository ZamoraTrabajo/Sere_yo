const $=s=>document.querySelector(s),R=$('#r');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let P,cat;
const save=()=>DB.guardarPalabras(P);
const nuevaSal=()=>Math.random().toString(36).slice(2);

(function init(){const u=DB.usuarios();u?login(u):crear()})();

function crear(){
  R.innerHTML=`<div class="card"><h2>Crear administrador</h2><input id="u" placeholder="Usuario"><br><br><input id="p" type="password" placeholder="Contraseña (mín. 4)"><button id="ok">Crear</button></div>`;
  $('#ok').onclick=async()=>{
    const u=$('#u').value.trim(),p=$('#p').value;
    if(!u||p.length<4)return alert('Usuario y contraseña de al menos 4 caracteres');
    const sal=nuevaSal();DB.guardarUsuarios({usuario:u,sal,hash:await hash(sal+p)});panel();
  };
}
function login(u){
  R.innerHTML=`<div class="card"><h2>Acceso</h2><input id="u" placeholder="Usuario"><br><br><input id="p" type="password" placeholder="Contraseña"><button id="ok">Entrar</button></div>`;
  $('#ok').onclick=async()=>{
    if($('#u').value.trim()==u.usuario&&await hash(u.sal+$('#p').value)==u.hash)panel();else alert('Datos incorrectos');
  };
}
function panel(){P=DB.palabras();if(!cat||!P[cat])cat=Object.keys(P)[0];draw()}
function draw(){
  const c=P[cat];
  R.innerHTML=`<h2>Categoría</h2>
  <select id="c">${Object.keys(P).map(k=>`<option value="${k}" ${k==cat?'selected':''}>${P[k].icono} ${esc(P[k].nombre)} (${P[k].palabras.length})</option>`).join('')}</select>
  <div class="row" style="margin-top:8px"><input id="ni" placeholder="Icono" style="width:80px"><input id="nn" placeholder="Nueva categoría"><button class="x" id="nc">+</button></div>
  <button class="sec" id="dc">Borrar esta categoría</button>
  <h2>Palabras</h2>
  <div class="row"><input id="np" placeholder="Palabra"><input id="nh" placeholder="Pista"><button class="x" id="na">+</button></div>
  <div id="ws">${c.palabras.map((w,i)=>`<div class="row" style="margin:4px 0"><input data-i="${i}" data-f="palabra" value="${esc(w.palabra)}"><input data-i="${i}" data-f="pista" value="${esc(w.pista)}"><button class="x" data-d="${i}">✕</button></div>`).join('')}</div>
  <h2>Datos</h2>
  <button class="sec" id="ex">Exportar copia (JSON)</button>
  <button class="sec" id="im">Importar copia (JSON)</button><input type="file" id="f" accept=".json" class="hide">
  <button class="sec" id="pw">Cambiar contraseña</button>
  <button class="red" id="rs">Restablecer palabras de fábrica</button>`;
  $('#c').onchange=e=>{cat=e.target.value;draw()};
  $('#nc').onclick=()=>{const n=$('#nn').value.trim();if(!n)return;const k='c'+Date.now();P[k]={nombre:n,icono:$('#ni').value.trim()||'❓',palabras:[]};cat=k;save();draw()};
  $('#dc').onclick=()=>{if(Object.keys(P).length>1&&confirm('¿Borrar la categoría y sus palabras?')){delete P[cat];cat=Object.keys(P)[0];save();draw()}};
  $('#na').onclick=()=>{const p=$('#np').value.trim();if(!p)return;P[cat].palabras.unshift({palabra:p,pista:$('#nh').value.trim()});save();draw()};
  document.querySelectorAll('#ws input').forEach(i=>i.onchange=()=>{P[cat].palabras[i.dataset.i][i.dataset.f]=i.value;save()});
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{P[cat].palabras.splice(b.dataset.d,1);save();draw()});
  $('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({palabras:P,usuarios:DB.usuarios()})],{type:'application/json'}));a.download='impostor-copia.json';a.click()};
  $('#im').onclick=()=>$('#f').click();
  $('#f').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(j.palabras)DB.guardarPalabras(j.palabras);if(j.usuarios)DB.guardarUsuarios(j.usuarios);panel()}catch(x){alert('Archivo no válido')}};
  $('#pw').onclick=async()=>{const p=prompt('Nueva contraseña (mín. 4)');if(!p||p.length<4)return;const u=DB.usuarios();u.sal=nuevaSal();u.hash=await hash(u.sal+p);DB.guardarUsuarios(u);alert('Contraseña cambiada')};
  $('#rs').onclick=()=>{if(confirm('¿Restablecer todas las palabras?')){DB.guardarPalabras(JSON.parse(JSON.stringify(window.PALABRAS_DEFECTO)));panel()}};
}