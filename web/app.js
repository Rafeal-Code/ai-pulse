/* AI Pulse — zero-dependency progressive web reader. */
const $=id=>document.getElementById(id);
const categories=['全部','大模型','AI 编程','开源模型','科研论文','AI 硬件','行业动态'];
const sample={mode:'demo',updated_at:'2026-10-07T00:00:00Z',articles:[
{id:'demo-claude',title:'Claude Haiku 5.5 正式发布',original_title:'Introducing Claude Haiku 5.5',summary:'Anthropic 推出新一代轻量模型，重点面向高频任务和成本敏感的工作流。',impact:'关注其速度、定价以及在多智能体场景下的实际表现。',source:'Anthropic',category:'大模型',published:'2026-10-07T10:00:00Z',url:'https://www.anthropic.com/claude-haiku-5-5'},
{id:'demo-google',title:'Google 推出 AI 游戏实验平台 Playground',original_title:'An experimental gaming platform',summary:'Google 展示使用 AI 创建互动游戏体验的方向，包括文本生成游戏等玩法。',impact:'未来可能降低个人开发者制作游戏原型的门槛。',source:'Google',category:'AI 编程',published:'2026-10-07T10:00:00Z',url:'https://blog.google/innovation-and-ai/technology/ai/playground-experimental-gaming-platform/'},
{id:'demo-openai',title:'OpenAI 推进 ChatGPT 交互式界面',original_title:'GPT-6 for everyone',summary:'ChatGPT 的回答方式逐步从纯文本扩展到可直接操作的交互界面。',impact:'工具型 AI 应用会越来越强调结果的直接操作和展示。',source:'OpenAI',category:'大模型',published:'2026-10-07T10:00:00Z',url:'https://openai.com/index/gpt-6-for-everyone/'},
{id:'demo-ms',title:'微软探索本地 AI 与安全执行环境',original_title:'Local models, sandboxed tools, GitHub and Windows',summary:'微软介绍在 Windows 上结合本地模型与隔离执行环境运行 AI 工具的思路。',impact:'Agent 可控性与本地运行会成为重要工程方向。',source:'Microsoft',category:'AI 编程',published:'2026-10-07T10:00:00Z',url:'https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/'}
]};
const storage={get(k,def){try{const v=JSON.parse(localStorage.getItem('pulse:'+k));return v??def}catch{return def}},set(k,v){try{localStorage.setItem('pulse:'+k,JSON.stringify(v))}catch{}}};
let payload=sample,tab='feed',category='全部',idx=0;
let saved=new Set(storage.get('saved',[])),seen=new Set(storage.get('seen',[]));
let hideSeen=storage.get('hideSeen',false),onlyLatest=storage.get('onlyLatest',false);
const symbol={'大模型':'✦','AI 编程':'</>','开源模型':'◈','科研论文':'∑','AI 硬件':'⌘','行业动态':'◉'};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function safeLink(raw){try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
const getAll=()=>Array.isArray(payload.articles)?payload.articles:[];
function getVisible(){let data=getAll();if(tab==='saved')data=data.filter(a=>saved.has(a.id));if(tab==='feed'){if(category!=='全部')data=data.filter(a=>a.category===category);if(hideSeen)data=data.filter(a=>!seen.has(a.id));if(onlyLatest){const threshold=Date.now()-48*3600*1000;data=data.filter(a=>Date.parse(a.published||0)>threshold)}}return data}
function formatDate(d){const n=new Date(d);return Number.isNaN(n.getTime())?'日期未知':n.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})}
function renderChips(){const visible=tab==='feed';$('chips').hidden=!visible;if(!visible)return;$('chips').innerHTML=categories.map(c=>`<button class="chip ${c===category?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}
function renderSettings(){return `<section class="settings"><h3>阅读偏好</h3><label class="toggle-row">跳过已经看过的新闻 <input type="checkbox" id="hide-seen" ${hideSeen?'checked':''}></label><label class="toggle-row">只展示最近 48 小时 <input type="checkbox" id="only-latest" ${onlyLatest?'checked':''}></label><p>偏好、收藏和已读状态只保存在当前浏览器中。刷新新闻不会删除收藏记录，但卸载应用或清除网站数据可能丢失它们。</p><h3 style="margin-top:25px">关于资讯来源</h3><p>新闻由 RSS 聚合。配置模型 API 后，后台会尝试生成中文标题、摘要与实用解读。AI 整理可能出错，重要信息请点击原文核实。</p><p id="origin-info"></p><button class="reload" id="reload-settings">检查最新内容</button></section>`}
function draw(){
  document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e.dataset.tab===tab));
  $('page-title').textContent=tab==='feed'?'今天，AI 发生了什么？':tab==='saved'?'你收藏的内容':'你的阅读偏好';
  $('subtitle').textContent=tab==='feed'?'精选模型、工具与科研进展':tab==='saved'?'喜欢的新闻，留给稍后阅读':'本地保存 · 随时调整';
  $('status').textContent=payload.mode==='demo'?'演示模式':payload.mode==='offline'?'离线缓存':'新闻已更新';
  $('updated').textContent=payload.updated_at?'更新 '+formatDate(payload.updated_at):'';
  $('banner').hidden=payload.mode!=='demo';
  if(payload.mode==='demo')$('banner').textContent='当前是演示新闻，用来预览页面。部署到 GitHub Pages 并运行资讯采集工作流后，才会自动更新真实 RSS 资讯。';
  renderChips();
  if(tab==='settings'){$('progress').innerHTML='';$('count').textContent='';$('deck').innerHTML=renderSettings();$('arrows').hidden=true;$('hint').hidden=true;$('hide-seen').addEventListener('change',e=>{hideSeen=e.target.checked;storage.set('hideSeen',hideSeen)});$('only-latest').addEventListener('change',e=>{onlyLatest=e.target.checked;storage.set('onlyLatest',onlyLatest)});$('origin-info').textContent=`数据源模式：${payload.mode||'live'}，总资讯 ${getAll().length} 条`;return;}
  $('arrows').hidden=false;$('hint').hidden=false;
  const data=getVisible();idx=Math.min(Math.max(0,idx),Math.max(data.length-1,0));
  $('count').textContent=tab==='saved'?`已收藏 ${data.length} 条`:`精选 ${data.length} 条资讯`;
  $('index').textContent=data.length?`${idx+1} / ${data.length}`:'0 / 0';
  $('prev').disabled=idx===0;$('next').disabled=idx>=data.length-1;
  const stops=Math.min(data.length,14);
  $('progress').innerHTML=Array.from({length:stops},(_,j)=>`<i class="${Math.floor(idx/(Math.max(1,data.length)/stops))===j?'now':''}"></i>`).join('');
  const a=data[idx];
  if(!a){$('deck').innerHTML=`<div class="empty"><div style="font-size:35px">✧</div><strong>${tab==='saved'?'还没有收藏':'没有符合条件的新闻'}</strong><p>${tab==='saved'?'在新闻卡片上点击收藏按钮，就可以保存到这里。':'尝试其他分类，或在「偏好」中关闭已读过滤。'}</p></div>`;return}
  const isSaved=saved.has(a.id);const icon=symbol[a.category]||'✦';
  $('deck').innerHTML=`<article class="card" data-category="${esc(a.category)}" id="card" tabindex="0" aria-label="${esc(a.title)}"><div class="card-header"><div class="source"><span class="sourceicon">✦</span>${esc(a.source||'资讯')}</div><span class="age">${formatDate(a.published)}</span></div><div class="visual"><div class="hero-orb"><div class="hero-symbol">${esc(icon)}</div></div></div><div class="card-body"><div class="category">${esc(a.category||'行业动态')}</div><h2>${esc(a.title)}</h2><p class="summary">${esc(a.summary||a.original_title||'点击阅读原文。')}</p></div><div class="card-footer"><button class="read-btn" id="read-btn">阅读全文 <span aria-hidden="true">↗</span></button><button aria-label="${isSaved?'取消收藏':'收藏'}" class="bookmark ${isSaved?'saved':''}" id="bookmark">${isSaved?'♥':'♡'}</button></div></article>`;
  installSwipe($('card'));
}
function go(direction){const d=getVisible();let n=idx+direction;if(n<0||n>=d.length)return;idx=n;draw();}
function saveCurrent(){const a=getVisible()[idx];if(!a)return;if(saved.has(a.id))saved.delete(a.id);else saved.add(a.id);storage.set('saved',[...saved]);if(tab==='saved'){idx=Math.max(0,idx-(saved.has(a.id)?0:1))}draw()}
function showDetail(){const a=getVisible()[idx];if(!a)return;seen.add(a.id);storage.set('seen',[...seen]);const url=safeLink(a.url);$('detail').innerHTML=`<div class="pill">${esc(a.category)} · ${esc(a.source||'未知来源')} · ${formatDate(a.published)}</div><h2>${esc(a.title)}</h2><p>${esc(a.summary||'无摘要，请阅读原文。')}</p>${a.impact?`<h3>为什么值得关注</h3><p>${esc(a.impact)}</p>`:''}${a.original_title&&a.title!==a.original_title?`<h3>原文标题</h3><p>${esc(a.original_title)}</p>`:''}<h3>核实提醒</h3><p>摘要由信息源内容或 AI 生成，仅供快速浏览。重大技术结论、性能数字和发布时间以原文为准。</p>${url?`<a class="open-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">查看原始来源 ↗</a>`:'<p>该条新闻没有有效的原文链接。</p>'}`;$('overlay').classList.add('open');$('overlay').setAttribute('aria-hidden','false');}
function closeDetail(){$('overlay').classList.remove('open');$('overlay').setAttribute('aria-hidden','true');if(hideSeen&&tab==='feed'){idx=0;draw()}}
function installSwipe(el){let start=null,moved=false;el.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};moved=false});el.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)){moved=true;el.style.transition='none';el.style.transform=`translateX(${Math.max(-90,Math.min(90,dx))}px) rotate(${dx/48}deg)`}});const finish=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;el.style.transition='';el.style.transform='';if(moved&&Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.25)go(dx<0?1:-1)};el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',()=>{start=null;el.style.transform='';el.style.transition=''})}
async function load(force=false){let v=null;try{const res=await fetch(`./news.json${force?'?t='+Date.now():''}`,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);v=await res.json();if(!Array.isArray(v.articles))throw new Error('无效数据');payload=v;storage.set('lastFeed',v)}catch(e){v=storage.get('lastFeed',null);payload=v?{...v,mode:v.mode==='demo'?'demo':'offline'}:sample}idx=0;draw()}
$('chips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;idx=0;draw()}});
$('deck').addEventListener('click',e=>{if(e.target.closest('#bookmark'))saveCurrent();else if(e.target.closest('#read-btn'))showDetail();else if(e.target.closest('#reload-settings'))load(true)});
$('prev').addEventListener('click',()=>go(-1));$('next').addEventListener('click',()=>go(1));$('refresh').addEventListener('click',()=>load(true));
document.querySelectorAll('[data-tab]').forEach(e=>e.addEventListener('click',()=>{tab=e.dataset.tab;idx=0;draw()}));
$('close').addEventListener('click',closeDetail);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeDetail()});
window.addEventListener('keydown',e=>{if($('overlay').classList.contains('open')){if(e.key==='Escape')closeDetail();return}if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
load();
