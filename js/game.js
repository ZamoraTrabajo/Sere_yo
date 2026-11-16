const $=s=>document.querySelector(s);
const E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick=a=>a[Math.random()*a.length|0];
// Máximo de impostores: siempre más ciudadanos que impostores al empezar
const maxIm=n=>Math.max(1,Math.floor((n-1)/2));
const P=DB.palabras();
let cfg=DB.get('imp_cfg',{jug:['','',''],cats:[],modo:'clasico',im:1,tm:false,min:5});
if(!cfg.cats.length)cfg.cats=Object.keys(P);
let G;

function renderPl(){
  const ul=$('#pl');ul.innerHTML='';
  cfg.jug.forEach((n,i)=>{
    const li=E('li','',`<span class="h">☰</span><input placeholder="Jugador ${i+1}" value="${esc(n)}"><button class="x">✕</button>`);
    li.querySelector('input').oninput=e=>{cfg.jug[i]=e.target.value};
    li.querySelector('.x').onclick=()=>{if(cfg.jug.length>3){cfg.jug.splice(i,1);renderPl()}};
    drag(li.querySelector('.h'),li);
    ul.appendChild(li);
  });
  ajusta();
}
function drag(h,li){
  h.onpointerdown=e=>{
    e.preventDefault();li.style.opacity=.6;
    const mv=m=>{const t=document.elementFromPoint(m.clientX,m.clientY)?.closest('#pl li');
      if(t&&t!==li){const r=t.getBoundingClientRect();t.parentNode.insertBefore(li,m.clientY<r.top+r.height/2?t:t.nextSibling)}};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
      cfg.jug=[...document.querySelectorAll('#pl input')].map(x=>x.value);renderPl()};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  };
}
function renderCats(){
  $('#cats').innerHTML='';
  Object.entries(P).forEach(([k,c])=>{
    const d=E('div','chip'+(cfg.cats.includes(k)?' on':''),`<div style="font-size:1.6rem">${c.icono}</div>${esc(c.nombre)}`);
    d.onclick=()=>{cfg.cats=cfg.cats.includes(k)?cfg.cats.filter(x=>x!=k):[...cfg.cats,k];d.classList.toggle('on')};
    $('#cats').appendChild(d);
  });
}
function ajusta(){
  const m=maxIm(cfg.jug.length),c=$('#modo').value=='caos';
  cfg.im=Math.min(Math.max(1,cfg.im),m);
  $('#im').textContent=c?'?':cfg.im;$('#imm').disabled=$('#imp').disabled=c;
}
$('#add').onclick=()=>{cfg.jug.push('');renderPl()};
$('#imm').onclick=()=>{cfg.im--;ajusta()};
$('#imp').onclick=()=>{cfg.im++;ajusta()};
$('#modo').onchange=ajusta;
$('#modo').value=cfg.modo;$('#tm').checked=cfg.tm;$('#min').value=cfg.min;
renderPl();renderCats();

$('#go').onclick=()=>{
  cfg.modo=$('#modo').value;cfg.tm=$('#tm').checked;cfg.min=+$('#min').value||5;DB.set('imp_cfg',cfg);
  const cats=cfg.cats.filter(k=>P[k]&&P[k].palabras.length);
  if(!cats.length)return alert('Elige al menos una categoría con palabras');
  const nombres=cfg.jug.map((n,i)=>n.trim()||'Jugador '+(i+1)),N=nombres.length,max=maxIm(N);
  const cat=P[pick(cats)],w=pick(cat.palabras);
  const ni=cfg.modo=='caos'?1+(Math.random()*max|0):Math.min(cfg.im,max);
  const idx=[...Array(N).keys()].sort(()=>Math.random()-.5);
  G={nombres,cat,w,imp:new Set(idx.slice(0,ni)),vivos:[...Array(N).keys()],modo:cfg.modo,tm:cfg.tm,min:cfg.min,ini:Math.random()*N|0,paso:0,cur:null};
  reveal();
};

function show(h){$('#s-cfg').classList.add('hide');const s=$('#s-play');s.classList.remove('hide');s.innerHTML=h;return s}
function reveal(){
  const N=G.nombres.length;if(G.paso>=N)return ronda();
  const i=(G.ini+G.paso)%N;
  show(`<div class="card"><p class="big">${esc(G.nombres[i])}</p><p style="text-align:center">Coge el móvil y pulsa cuando nadie más mire</p></div><button id="ok">Ver mi palabra</button>`);
  $('#ok').onclick=()=>curtain(i);
}
function curtain(i){
  const imp=G.imp.has(i),c=G.cat;
  const txt=imp
    ?`<h2 class="imp" style="margin:0;font-size:1.8rem">IMPOSTOR</h2><p>${c.icono} ${esc(c.nombre)}</p>${G.modo=='pista'?`<p>Pista: <b>${esc(G.w.pista)}</b></p>`:''}`
    :`<div style="font-size:2rem"><b>${esc(G.w.palabra)}</b></div><p>${c.icono} ${esc(c.nombre)}</p>`;
  show(`<div class="curt"><div class="under">${txt}</div><div class="cover" id="cv">⬆ Arrastra hacia arriba</div></div><button id="nx" disabled>Ocultar y pasar el móvil</button>`);
  const cv=$('#cv');let y0=null;
  cv.onpointerdown=e=>{y0=e.clientY;cv.setPointerCapture(e.pointerId)};
  cv.onpointermove=e=>{if(y0==null)return;const d=Math.min(0,e.clientY-y0);cv.style.transform=`translateY(${d}px)`;if(d<-60)$('#nx').disabled=false};
  cv.onpointerup=cv.onpointercancel=()=>{y0=null;cv.style.transition='transform .2s';cv.style.transform=''};
  $('#nx').onclick=()=>{G.paso++;reveal()};
}
function sig(i){const N=G.nombres.length;for(let j=1;j<=N;j++){const k=(i+j)%N;if(G.vivos.includes(k))return k}}
function orden(){const N=G.nombres.length;return [...Array(N).keys()].map(j=>(G.cur+j)%N).filter(i=>G.vivos.includes(i))}
function ronda(){
  G.cur=G.cur==null?G.ini:sig(G.cur);
  show(`<div class="card"><p>Empieza <b>${esc(G.nombres[G.cur])}</b></p><p>Orden: ${orden().map(i=>esc(G.nombres[i])).join(' → ')}</p>${G.tm?'<div class="big" id="t"></div>':''}</div><button id="vt">Votar</button>`);
  if(G.tm)timer(G.min*60);
  $('#vt').onclick=()=>{clearInterval(G.iv);votar()};
}
function timer(t){
  clearInterval(G.iv);
  const f=()=>{const e=$('#t');if(!e)return clearInterval(G.iv);
    e.textContent=`${t/60|0}:${String(t%60).padStart(2,'0')}`;
    if(t--<=0){clearInterval(G.iv);e.textContent='¡Tiempo!';navigator.vibrate&&navigator.vibrate([300,100,300]);beep()}};
  f();G.iv=setInterval(f,1000);
}
function beep(){try{const a=new AudioContext(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=660;o.start();o.stop(a.currentTime+.6)}catch(e){}}
function votar(){
  let sel=null;
  const s=show(`<h2>¿A quién eliminan?</h2>${orden().map(i=>`<button class="sec vote" data-i="${i}">${esc(G.nombres[i])}</button>`).join('')}<button id="ok" class="red" disabled>Eliminar</button>`);
  s.querySelectorAll('.vote').forEach(b=>b.onclick=()=>{sel=+b.dataset.i;s.querySelectorAll('.vote').forEach(x=>x.classList.toggle('sel',x==b));$('#ok').disabled=false});
  $('#ok').onclick=()=>{
    G.vivos=G.vivos.filter(i=>i!=sel);
    const imp=G.imp.has(sel),ni=G.vivos.filter(i=>G.imp.has(i)).length,nc=G.vivos.length-ni;
    const fin=ni==0?'c':nc<=ni?'i':null;
    show(`<div class="card"><p class="big ${imp?'imp':''}">${esc(G.nombres[sel])} ${imp?'era IMPOSTOR':'era ciudadano'}</p></div><button id="nx">${fin?'Ver resultado':'Siguiente ronda'}</button>`);
    $('#nx').onclick=()=>fin?final(fin):ronda();
  };
}
function final(g){
  show(`<div class="card"><p class="big">${g=='c'?'🏆 Ganan los ciudadanos':'😈 Ganan los impostores'}</p><p>Impostores: <b class="imp">${[...G.imp].map(i=>esc(G.nombres[i])).join(', ')}</b></p><p>Palabra: <b>${esc(G.w.palabra)}</b> (${G.cat.icono} ${esc(G.cat.nombre)})</p></div><button id="a">Otra partida</button><button class="sec" id="m">Menú</button>`);
  $('#a').onclick=()=>$('#go').onclick();
  $('#m').onclick=()=>location.reload();
}