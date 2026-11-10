/* Christian Pertez portfolio — nav, auth, and page behaviors */
const $=(s,r=document)=>r.querySelector(s);
const page=location.pathname.split('/').pop()||'index.html';
const LS={users:'pp_users',session:'pp_session'};
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};

/* ---------- Auth: PHP server if available (XAMPP), otherwise localStorage (GitHub Pages) ---------- */
let mode='local';
async function api(action,body){
  const r=await fetch('api/auth.php?action='+action,{method:body?'POST':'GET',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!(r.headers.get('content-type')||'').includes('json'))throw new Error('no-server');
  return r.json();
}
async function sha(t){
  if(!(window.crypto&&crypto.subtle))return btoa(unescape(encodeURIComponent(t)));
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('pp:'+t));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const Auth={
  async me(){
    try{const d=await api('me');mode='server';return d.user||null}
    catch{mode='local';return read(LS.session,null)}
  },
  async login(email,pw){
    if(mode==='server'){const d=await api('login',{email,password:pw});if(d.error)throw new Error(d.error);return d.user}
    const u=read(LS.users,{})[email];
    if(!u||u.h!==await sha(pw))throw new Error('Wrong email or password.');
    const s={name:u.name,email};localStorage.setItem(LS.session,JSON.stringify(s));return s;
  },
  async register(name,email,pw){
    if(mode==='server'){const d=await api('register',{name,email,password:pw});if(d.error)throw new Error(d.error);return d.user}
    const all=read(LS.users,{});
    if(all[email])throw new Error('That email is already registered. Try logging in.');
    all[email]={name,h:await sha(pw)};localStorage.setItem(LS.users,JSON.stringify(all));
    const s={name,email};localStorage.setItem(LS.session,JSON.stringify(s));return s;
  },
  async logout(){
    try{if(mode==='server')await api('logout',{})}catch{}
    localStorage.removeItem(LS.session);
  }
};
const safeNext=()=>{const n=new URLSearchParams(location.search).get('next');return /^[\w-]+\.html$/i.test(n||'')?n:'project.html'};

/* ---------- Shared nav + footer ---------- */
function buildNav(user){
  const links=[['index.html','Home'],['about.html','About'],['skill.html','Skills'],['project.html','Projects'],['contact.html','Contact']];
  const cur=/^project\d/.test(page)?'project.html':page;
  const ini=user?user.name.trim().charAt(0).toUpperCase().replace(/</g,''):'';
  $('#site-nav').innerHTML=`<div class="strip"><i></i>Available for collaborations · christianpertez23@gmail.com</div><header class="nav"><div class="wrap nav-bar">
    <a class="brand" href="index.html"><img src="image/pogi.jpg" alt=""><span>Christian Pertez<small>WEB · VIDEO · MUSIC</small></span></a>
    <button class="burger" aria-label="Menu" aria-expanded="false">☰</button>
    <nav id="menu">${links.map(([h,t])=>`<a href="${h}"${h===cur?' class="on"':''}>${t}</a>`).join('')}
    <button class="kbd" id="kb" type="button" title="Quick jump">Ctrl K</button><button class="kbd" id="snd" type="button" title="Guitar sound on/off">🎸 ♪</button>
    ${user?`<span class="who"><b>${ini}</b>${user.name.replace(/</g,'&lt;')}</span><button class="btn ghost" id="logout">Log out</button>`
          :`<a class="btn" href="login.html">Log in</a>`}
    ${user?'<a class="btn" href="contact.html">Hire me</a>':''}</nav></div></header>`;

    
const b = $('.burger');
const m = $('#menu');

if (b && m) {

    // Toggle hamburger menu
    b.addEventListener('click', () => {
        const isOpen = m.classList.toggle('open');

        b.setAttribute('aria-expanded', isOpen);
        b.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        b.textContent = isOpen ? '✕' : '☰';
    });

    // Close after clicking a navigation link
    m.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            m.classList.remove('open');
            b.setAttribute('aria-expanded', 'false');
            b.setAttribute('aria-label', 'Open menu');
            b.textContent = '☰';
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!b.contains(e.target) && !m.contains(e.target)) {
            m.classList.remove('open');
            b.setAttribute('aria-expanded', 'false');
            b.setAttribute('aria-label', 'Open menu');
            b.textContent = '☰';
        }
    });

    // Reset when returning to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 860) {
            m.classList.remove('open');
            b.setAttribute('aria-expanded', 'false');
            b.textContent = '☰';
        }
    });
}

  const lo=$('#logout');
  if(lo)lo.onclick=async()=>{await Auth.logout();location.href='index.html'};
}
function buildFoot(){
  const f=$('#site-foot');
  if(f)f.innerHTML=`<footer><div class="wrap"><span>© ${new Date().getFullYear()} Christian Pertez · Valenzuela City</span>
    <span><a href="https://www.facebook.com/share/1LwrBkQ3hE/">Facebook</a> &nbsp; <a href="https://www.instagram.com/chrstn_prtz">Instagram</a></span></div></footer>`;
}
function toast(t){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';document.body.append(e)}e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600)}
function modal(html){
  const m=document.createElement('div');m.className='modal open';
  m.innerHTML=`<button class="x" aria-label="Close">×</button>${html}`;
  const close=()=>{m.remove();document.removeEventListener('keydown',esc)};
  const esc=e=>e.key==='Escape'&&close();
  m.onclick=e=>{if(e.target===m||e.target.className==='x')close()};
  document.addEventListener('keydown',esc);document.body.append(m);return m;
}

/* ---------- Page features ---------- */
function features(user){
  // typing role on home
  const role=$('#role');
  if(role){const L=['Web designer','Video editor','Aspiring game developer','Band member'];let i=0,c=0,del=false;
    (function tick(){const w=L[i];role.textContent=w.slice(0,c);
      if(!del&&c===w.length){del=true;return setTimeout(tick,1400)}
      if(del&&c===0){del=false;i=(i+1)%L.length}
      c+=del?-1:1;setTimeout(tick,del?40:80)})();}
  // demo reel
  const ov=$('#openVideo');
  if(ov)ov.onclick=()=>{const m=modal('<video controls autoplay><source src="video/reel.mp4" type="video/mp4"></video>');
    new MutationObserver(()=>{if(!m.isConnected)m.querySelector('video')?.pause()}).observe(document.body,{childList:true})};
  // skill bars
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';io.unobserve(e.target)}}));
  document.querySelectorAll('.bar i').forEach(i=>io.observe(i));
  // gallery lightbox
  document.querySelectorAll('.gallery img').forEach(i=>i.onclick=()=>modal(`<img src="${i.src}" alt="">`));
  // contact form -> opens the visitor's mail app
  const cf=$('#cf');
  if(cf)cf.onsubmit=e=>{e.preventDefault();const d=new FormData(cf);
    location.href=`mailto:christianpertez23@gmail.com?subject=${encodeURIComponent('['+d.get('topic')+'] Portfolio message from '+d.get('name'))}&body=${encodeURIComponent(d.get('message')+'\n\n'+d.get('name')+' <'+d.get('email')+'>')}`};
  // read me: step-by-step guide
  const G={
   'Live GitHub':`<ol><li>Create a free account at <code>github.com</code>, click <b>New repository</b>, name it (e.g. <code>portfolio</code>), set it <b>Public</b>.</li>
   <li>Click <b>uploading an existing file</b> and drag in <b>everything</b>: all <code>.html</code> files plus the <code>css</code>, <code>js</code>, <code>api</code>, <code>image</code>, <code>video</code> and <code>origami</code> folders. Keep folder names lowercase.</li>
   <li>Click <b>Commit changes</b>.</li><li>Go to <b>Settings → Pages</b>. Under <b>Build and deployment</b> choose <b>Deploy from a branch</b>, branch <code>main</code>, folder <code>/ (root)</code>, then <b>Save</b>.</li>
   <li>Wait 1–2 minutes, then open <code>https://YOUR-USERNAME.github.io/portfolio/</code>.</li>
   <li>Create an account on the Log in page. You must log in before any page opens.</li>
   <li>To update later: edit or upload the changed file, commit, and hard refresh with <code>Ctrl+Shift+R</code>.</li></ol>
   <div class="note">GitHub Pages cannot run PHP, so <code>api/auth.php</code> is ignored. Accounts are saved in each visitor's own browser only. This is a demo-level gate, not real security. Use XAMPP or a PHP host for real accounts. Never commit <code>api/users.sqlite</code>.</div>`,
   'Local XAMPP':`<ol><li>Install XAMPP from <code>apachefriends.org</code> (PHP 8+).</li>
   <li>Copy your whole project folder to <code>C:\\xampp\\htdocs\\portfolio</code>. It must contain <code>index.html</code>, <code>css/</code>, <code>js/</code>, <code>api/</code>, <code>image/</code>, <code>video/</code>.</li>
   <li>Open the <b>XAMPP Control Panel</b> and click <b>Start</b> next to <b>Apache</b>.</li>
   <li>Click <b>Config → PHP (php.ini)</b> next to Apache. Find <code>;extension=pdo_sqlite</code> and <code>;extension=sqlite3</code> and delete the leading <code>;</code>. Save.</li>
   <li><b>Stop</b> then <b>Start</b> Apache to apply the change.</li>
   <li>Make sure <code>htdocs\\portfolio\\api</code> is writable: right-click → Properties → untick Read-only. <code>users.sqlite</code> is created there automatically.</li>
   <li>Open <code>http://localhost/portfolio/</code>. You are sent to login, so click <b>Create account</b>.</li>
   <li>Do not double-click the HTML files. Opening <code>file://</code> skips PHP and falls back to browser-only accounts.</li></ol>
   <div class="note">Troubleshooting: "Database unavailable" means pdo_sqlite is not enabled or <code>api/</code> is not writable. Port 80 busy? Change Apache's port in <code>httpd.conf</code> and use <code>localhost:8080/portfolio/</code>.</div>`,
   'Folders':`<ol><li><b>css/style.css</b>: the only stylesheet. Change the colors in the <code>:root</code> block at the top (<code>--blue</code>, <code>--violet</code>, <code>--cyan</code>). Must stay at <code>css/style.css</code> because every page links to it.</li>
   <li><b>js/app.js</b>: navigation, login gate, animations, Ctrl+K palette and this guide. Edit the typing roles in the array <code>L</code>. All pages except <code>login.html</code> require login.</li>
   <li><b>api/auth.php</b>: server login (register, login, logout, session) using SQLite and hashed passwords. Runs on XAMPP or any PHP host. Not used on GitHub Pages.</li>
   <li><b>image/ video/ origami/</b>: your media. File names in the HTML must match exactly, including lowercase.</li>
   <li>Shortcuts: <code>Ctrl+K</code> opens quick navigation. <code>Esc</code> closes popups.</li></ol>`};
  const guideHTML=()=>`<div class="guide"><h3>Read Me · How to run this site</h3><div class="gt-tabs">${Object.keys(G).map((k,i)=>`<button class="${i?'':'on'}">${k}</button>`).join('')}</div><div id="gb">${G['Live GitHub']}</div></div>`;
  const r=document.createElement('button');r.id='rm';r.className='btn ghost';r.textContent='📖 Read Me';
  r.onclick=()=>{const m=modal(guideHTML());m.querySelectorAll('.gt-tabs button').forEach(b=>b.onclick=()=>{
    m.querySelectorAll('.gt-tabs button').forEach(x=>x.classList.toggle('on',x===b));m.querySelector('#gb').innerHTML=G[b.textContent]})};
  document.body.append(r);
  // command palette (Ctrl/Cmd+K)
  const cmds=[['Home','index.html'],['About','about.html'],['Skills','skill.html'],['Projects','project.html'],['Contact','contact.html'],['Read Me guide','#guide'],['Log out','#out']];
  const openPal=()=>{const m=modal('<div class="pal"><input placeholder="Jump to a page or action…" autofocus><div></div></div>');
    const inp=m.querySelector('input'),box=m.querySelector('.pal div');
    const draw=()=>{const q=inp.value.toLowerCase();box.innerHTML=cmds.filter(c=>c[0].toLowerCase().includes(q)).map(c=>`<a data-h="${c[1]}">${c[0]}<span>↵</span></a>`).join('');
      box.querySelectorAll('a').forEach(a=>a.onclick=()=>{const h=a.dataset.h;m.remove();
        if(h==='#guide')r.click();else if(h==='#out')Auth.logout().then(()=>location.href='login.html');else location.href=h})};
    inp.oninput=draw;inp.onkeydown=e=>{if(e.key==='Enter')box.querySelector('a')?.click()};draw();inp.focus()};
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal()}});
  const kb=$('#kb');if(kb)kb.onclick=openPal;
  // spotlight on cards, cursor glow, scroll progress, reveal, counters
  const gl=document.createElement('div');gl.id='glow';const pg=document.createElement('div');pg.id='prog';document.body.append(gl,pg);
  addEventListener('pointermove',e=>{gl.style.left=e.clientX+'px';gl.style.top=e.clientY+'px';
    const c=e.target.closest?.('.card');if(c){const b=c.getBoundingClientRect();c.style.setProperty('--x',e.clientX-b.left+'px');c.style.setProperty('--y',e.clientY-b.top+'px')}});
  addEventListener('scroll',()=>{const h=document.documentElement;pg.style.width=100*h.scrollTop/(h.scrollHeight-h.clientHeight||1)+'%'},{passive:true});
  const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.card,.blk,.hero>*,.showcase>*,.bars>div,.split>*,.band,.stats>div,.tl li,.steps>div,details').forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%4)*70+'ms';rio.observe(el)});
  document.querySelectorAll('[data-n]').forEach(el=>{const t=+el.dataset.n;let v=0;const s=setInterval(()=>{v+=Math.ceil(t/40);if(v>=t){v=t;clearInterval(s)}el.textContent=v+(el.dataset.s||'')},35)});
  if(user&&page==='index.html')toast('Welcome back, '+user.name.split(' ')[0]+' 👋');
  // login page
  const af=$('#af');
  if(af){
    if(user){location.replace(safeNext());return}
    let reg=false;const nm=$('#nm'),pw=$('#pw'),er=$('#er'),go=$('#go'),tl=$('#tl'),tr=$('#tr');
    const setMode=v=>{reg=v;nm.hidden=!v;nm.required=v;go.textContent=v?'Create account':'Log in';
      tl.classList.toggle('on',!v);tr.classList.toggle('on',v);pw.autocomplete=v?'new-password':'current-password';er.textContent=''};
    tl.onclick=()=>setMode(false);tr.onclick=()=>setMode(true);
    af.onsubmit=async e=>{e.preventDefault();er.textContent='';go.disabled=true;
      try{const email=$('#em').value.trim().toLowerCase();
        if(reg)await Auth.register(nm.value.trim(),email,pw.value);else await Auth.login(email,pw.value);
        location.href=safeNext();
      }catch(x){er.textContent=x.message==='no-server'?'Could not reach the server.':x.message;go.disabled=false}};
  }
}

/* ---------- Copy buttons + playable guitar cursor ---------- */
function extras(){
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.copy);toast('Copied: '+b.dataset.copy)});
  if(!matchMedia('(pointer:fine)').matches){$('#snd')?.remove();return}
  document.documentElement.classList.add('gc');
  const g=document.createElement('div');g.id='gtr';
  g.innerHTML='<svg viewBox="0 0 56 56" width="56" height="56"><line x1="4" y1="4" x2="10" y2="10" stroke="#2b1a0e" stroke-width="7" stroke-linecap="round"/><line x1="9" y1="9" x2="35" y2="35" stroke="#b9794a" stroke-width="5" stroke-linecap="round"/><circle cx="33" cy="33" r="9" fill="#e0792b"/><circle cx="41" cy="41" r="11" fill="#e0792b"/><circle cx="41" cy="41" r="11" fill="none" stroke="#7a3a10" stroke-width="1.5"/><circle cx="39" cy="39" r="3.5" fill="#2b1608"/><line x1="9" y1="9" x2="40" y2="40" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/></svg>';
  document.body.append(g);
  let on=true,AC,lx=0;const sb=$('#snd');
  if(sb)sb.onclick=()=>{on=!on;sb.style.opacity=on?1:.4;toast(on?'Guitar sound on 🎸':'Guitar sound off')};
  addEventListener('pointermove',e=>{const r=Math.max(-25,Math.min(25,(e.clientX-lx)*1.4));lx=e.clientX;
    g.style.transform=`translate(${e.clientX}px,${e.clientY}px) rotate(${r}deg)`;
    g.style.opacity=e.target.closest?.('input,textarea,select')?0:1});
  addEventListener('pointerdown',e=>{g.classList.add('hit');setTimeout(()=>g.classList.remove('hit'),160);
    for(let i=0;i<3;i++){const n=document.createElement('span');n.className='note-p';n.textContent=['♪','♫','♬'][i];
      n.style.cssText=`left:${e.clientX+10+i*8}px;top:${e.clientY+10}px;--dx:${(i-1)*28}px;--rt:${(i-1)*25}deg`;document.body.append(n);setTimeout(()=>n.remove(),1000)}
    if(!on)return;AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t0=AC.currentTime;
    [82.41,123.47,164.81,196,246.94,329.63].forEach((f,i)=>{const o=AC.createOscillator(),a=AC.createGain(),t=t0+i*.045;
      o.type='triangle';o.frequency.value=f;a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.13,t+.01);a.gain.exponentialRampToValueAtTime(.001,t+1.3);
      o.connect(a).connect(AC.destination);o.start(t);o.stop(t+1.4)})});
}

(async()=>{
  const user=await Auth.me();
  if(page!=='login.html'&&!user){location.replace('login.html?next='+encodeURIComponent(page));return}
  document.body.classList.add('ok');
  buildNav(user);buildFoot();features(user);extras();
})();