/* AI Pulse — 纸面书卷风阅读器：目录页快讯 + 点击进入阅读页。零依赖。 */
const $=id=>document.getElementById(id);
const categories=['全部','大模型','AI 编程','开源模型','科研论文','AI 硬件','行业动态'];
const sample={mode:'demo',updated_at:'2026-10-07T00:00:00Z',articles:[
{id:'demo-claude',title:'Claude Haiku 5.5 正式发布',original_title:'Introducing Claude Haiku 5.5',summary:'Anthropic 推出新一代轻量模型，重点面向高频任务和成本敏感的工作流。',impact:'关注其速度、定价以及在多智能体场景下的实际表现。',source:'Anthropic',category:'大模型',published:'2026-10-07T10:00:00Z',url:'https://www.anthropic.com/claude-haiku-5-5'},
{id:'demo-google',title:'Google 推出 AI 游戏实验平台 Playground',original_title:'An experimental gaming platform',summary:'Google 展示使用 AI 创建互动游戏体验的方向，包括文本生成游戏等玩法。',impact:'未来可能降低个人开发者制作游戏原型的门槛。',source:'Google',category:'AI 编程',published:'2026-10-07T10:00:00Z',url:'https://blog.google/innovation-and-ai/technology/ai/playground-experimental-gaming-platform/'},
{id:'demo-openai',title:'OpenAI 推进 ChatGPT 交互式界面',original_title:'GPT-6 for everyone',summary:'ChatGPT 的回答方式逐步从纯文本扩展到可直接操作的交互界面。',impact:'工具型 AI 应用会越来越强调结果的直接操作和展示。',source:'OpenAI',category:'大模型',published:'2026-10-07T10:00:00Z',url:'https://openai.com/index/gpt-6-for-everyone/'},
{id:'demo-ms',title:'微软探索本地 AI 与安全执行环境',original_title:'Local models, sandboxed tools, GitHub and Windows',summary:'微软介绍在 Windows 上结合本地模型与隔离执行环境运行 AI 工具的思路。',impact:'Agent 可控性与本地运行会成为重要工程方向。',source:'Microsoft',category:'AI 编程',published:'2026-10-07T10:00:00Z',url:'https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/'}
]};
const storage={get(k,def){try{const v=JSON.parse(localStorage.getItem('pulse:'+k));return v??def}catch{return def}},set(k,v){try{localStorage.setItem('pulse:'+k,JSON.stringify(v))}catch{}}};
let payload=sample,tab='feed',category='全部',openId=null;
let saved=new Set(storage.get('saved',[])),seen=new Set(storage.get('seen',[]));
let hideSeen=storage.get('hideSeen',false),onlyLatest=storage.get('onlyLatest',false);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function safeLink(raw){try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
const getAll=()=>Array.isArray(payload.articles)?payload.articles:[];
function getVisible(){let data=getAll();if(tab==='saved')data=data.filter(a=>saved.has(a.id));if(tab==='feed'){if(category!=='全部')data=data.filter(a=>a.category===category);if(hideSeen)data=data.filter(a=>!seen.has(a.id));if(onlyLatest){const threshold=Date.now()-48*3600*1000;data=data.filter(a=>Date.parse(a.published||0)>threshold)}}return data}
const shortDate=d=>{const n=new Date(d);return Number.isNaN(n.getTime())?'日期未知':`${n.getMonth()+1}月${n.getDate()}日`};
const fullDate=d=>{const n=new Date(d);return Number.isNaN(n.getTime())?'日期未知':`${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日`};
const modeText=()=>payload.mode==='demo'?'演示模式':payload.mode==='offline'?'离线缓存':'已更新';
function renderChips(){const show=tab==='feed';$('chips').hidden=!show;if(!show)return;$('chips').innerHTML=categories.map(c=>`<button class="chip ${c===category?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}
function renderPrefs(){return `<section class="settings"><h3>阅读偏好</h3>
<label class="toggle-row">跳过已读新闻 <input type="checkbox" id="hide-seen" ${hideSeen?'checked':''}></label>
<label class="toggle-row">只看最近 48 小时 <input type="checkbox" id="only-latest" ${onlyLatest?'checked':''}></label>
<p>收藏、已读和偏好只保存在当前浏览器里，不会上传。卸载应用或清除网站数据会丢失这些记录。</p>
<h3>关于内容</h3>
<p>快讯由多个公开 RSS 源聚合而来。若配置了模型接口，后台会生成中文标题与摘要；AI 整理可能出错，重要结论请以原文为准。</p>
<p id="origin-info"></p>
<button class="reload-btn" id="reload-settings">检查最新内容 ↻</button></section>`}
function entryHTML(a,i){const isSaved=saved.has(a.id),isRead=seen.has(a.id);
return `<article class="entry ${isRead?'read':''}" data-id="${esc(a.id)}">
<div class="entry-no">${String(i+1).padStart(2,'0')}</div>
<div class="entry-main">
<h3 class="entry-title">${esc(a.title)}</h3>
<p class="entry-snippet">${esc(a.summary||a.original_title||'点击进入阅读。')}</p>
<div class="entry-meta"><span class="cat">${esc(a.category||'快讯')}</span><span>${esc(a.source||'未知来源')}</span><span>${shortDate(a.published)}</span></div>
</div>
<button class="fav ${isSaved?'saved':''}" data-fav="${esc(a.id)}" aria-label="${isSaved?'取消收藏':'收藏'}">${isSaved?'♥':'♡'}</button>
</article>`}
function render(){
document.querySelectorAll('[data-tab]').forEach(e=>e.classList.toggle('active',e.dataset.tab===tab));
$('mast-date').textContent=payload.updated_at?'更新 · '+shortDate(payload.updated_at):'';
$('banner').hidden=payload.mode!=='demo';
if(payload.mode==='demo')$('banner').innerHTML='<div class="note">当前是演示数据，仅用于预览版式。部署后由采集任务自动更新为真实资讯。</div>';
renderChips();
const list=$('list');
if(tab==='prefs'){list.innerHTML=renderPrefs();$('origin-info').textContent=`当前数据源：${payload.mode||'live'} 模式，共 ${getAll().length} 条。`;return}
const data=getVisible();
list.innerHTML=data.length?data.map(entryHTML).join(''):`<div class="empty">${tab==='saved'?'书签页还是空的。<br>在快讯里点 ♥，就会收在这一页。':'这一版没有符合条件的快讯。<br>换个分类，或在偏好里放宽过滤条件。'}</div>`;
const updated=payload.updated_at?shortDate(payload.updated_at):'—';
$('colophon').textContent=`${tab==='saved'?`收藏 ${data.length} 条`:`本版 ${data.length} 则`}`
+` · ${modeText()} · 更新于 ${updated}`;
}
function renderReader(){
const all=getAll();const a=all.find(x=>x.id===openId);
if(!a){hideReader();return}
const vis=getVisible();const pos=vis.findIndex(x=>x.id===a.id);
const prev=pos>0?vis[pos-1]:null,next=pos>=0&&pos<vis.length-1?vis[pos+1]:null;
const isSaved=saved.has(a.id);const url=safeLink(a.url);
$('reader-body').innerHTML=`
<div class="reader-head"><div class="kicker">${esc(a.category||'快讯')} · ${esc(a.source||'未知来源')} · ${fullDate(a.published)}</div>
<button class="fav ${isSaved?'saved':''}" data-fav="${esc(a.id)}" aria-label="${isSaved?'取消收藏':'收藏'}">${isSaved?'♥':'♡'}</button></div>
<h2>${esc(a.title)}</h2><hr class="reader-rule">
<div class="body"><p>${esc(a.summary||'暂无摘要，请直接阅读原文。')}</p></div>
${a.impact?`<h3 class="sec">为什么值得关注</h3><div class="body"><p>${esc(a.impact)}</p></div>`:''}
${a.original_title&&a.original_title!==a.title?`<h3 class="sec">原文标题</h3><div class="body"><p class="fine">${esc(a.original_title)}</p></div>`:''}
<p class="fine">※ 摘要来自信息源或 AI 整理，仅供快速浏览；关键数据与结论以原文为准。</p>
${url?`<a class="src-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a>`:'<p class="fine">该条没有有效的原文链接。</p>'}
<nav class="pager">
<button id="prev-entry" ${prev?'':'disabled'}>${prev?`<span class="dir">上一篇</span>${esc(prev.title)}`:''}</button>
<button class="next" id="next-entry" ${next?'':'disabled'}>${next?`<span class="dir">下一篇</span>${esc(next.title)}`:''}</button>
</nav>`;
}
function showReader(){const el=$('reader');if(el.hidden){el.hidden=false;document.body.style.overflow='hidden';el.scrollTop=0}}
function hideReader(){const el=$('reader');if(!el.hidden){el.hidden=true;document.body.style.overflow=''}}
function openReader(id){openId=id;seen.add(id);storage.set('seen',[...seen]);renderReader();showReader();render();if(!(history.state&&history.state.reader===1))history.pushState({reader:1},'')}
function requestClose(){if(history.state&&history.state.reader===1)history.back();else{hideReader();openId=null;render()}}
function step(dir){const vis=getVisible();const pos=vis.findIndex(x=>x.id===openId);const n=vis[pos+dir];if(n)openReader(n.id)}
async function load(force=false){let v=null;try{const res=await fetch(`./news.json${force?'?t='+Date.now():''}`,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);v=await res.json();if(!Array.isArray(v.articles))throw new Error('无效数据');payload=v;storage.set('lastFeed',v)}catch(e){v=storage.get('lastFeed',null);payload=v?{...v,mode:v.mode==='demo'?'demo':'offline'}:sample}openId=null;hideReader();render()}
function toggleFav(id){if(!id)return;if(saved.has(id))saved.delete(id);else saved.add(id);storage.set('saved',[...saved]);render();if(openId&&!$('reader').hidden)renderReader()}

$('list').addEventListener('click',e=>{const fav=e.target.closest('[data-fav]');if(fav){toggleFav(fav.dataset.fav);return}
const entry=e.target.closest('.entry');if(entry)openReader(entry.dataset.id);
if(e.target.closest('#reload-settings'))load(true);
if(e.target.closest('#hide-seen')){hideSeen=e.target.checked;storage.set('hideSeen',hideSeen)}
if(e.target.closest('#only-latest')){onlyLatest=e.target.checked;storage.set('onlyLatest',onlyLatest)}});
$('chips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;render()}});
document.querySelectorAll('[data-tab]').forEach(e=>e.addEventListener('click',()=>{tab=e.dataset.tab;render()}));
$('refresh').addEventListener('click',()=>load(true));
$('reader-body').addEventListener('click',e=>{const fav=e.target.closest('[data-fav]');if(fav){toggleFav(fav.dataset.fav);return}
if(e.target.closest('#prev-entry'))step(-1);if(e.target.closest('#next-entry'))step(1)});
$('back').addEventListener('click',requestClose);
window.addEventListener('popstate',()=>{hideReader();openId=null;render()});
window.addEventListener('keydown',e=>{if(!$('reader').hidden){if(e.key==='Escape')requestClose();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)}});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
load();
