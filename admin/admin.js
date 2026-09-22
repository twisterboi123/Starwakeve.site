const raw = path => `https://raw.githubusercontent.com/twisterboi123/Starwakeve.site/main/${path}`;
const login = document.querySelector('#login'), editor = document.querySelector('#editor'), file = document.querySelector('#file'), content = document.querySelector('#content'), message = document.querySelector('#message');
async function load(){message.textContent='Loading…'; const r=await fetch(raw(file.value),{cache:'no-store'});content.value=await r.text();message.textContent='';}
fetch('/api/admin/status').then(r=>r.json()).then(s=>{if(s.authenticated){login.hidden=true;editor.hidden=false;load();}});
document.querySelector('#load').onclick=load;
document.querySelector('#save').onclick=async()=>{message.textContent='Saving…';const r=await fetch('/api/admin/file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:file.value,content:content.value})});const data=await r.json();message.textContent=data.ok?'Saved. Vercel is deploying your change.':data.error||'Save failed.';};
