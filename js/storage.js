const DB={
  get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))},
  palabras(){let p=this.get('imp_palabras');if(!p){p=JSON.parse(JSON.stringify(window.PALABRAS_DEFECTO));this.set('imp_palabras',p)}return p},
  guardarPalabras(p){this.set('imp_palabras',p)},
  usuarios(){return this.get('imp_usuarios',null)},
  guardarUsuarios(u){this.set('imp_usuarios',u)}
};
async function hash(s){
  const b=new TextEncoder().encode(s);
  if(window.crypto&&crypto.subtle){const h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h=5381;for(const c of s)h=(h*33)^c.charCodeAt(0);return 'f'+(h>>>0);
}