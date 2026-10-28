/* 离线搜索：多个关键词 AND 子串匹配；无结果时退化为二元组（bigram）模糊匹配。可在 node 中 require 测试。 */
(function(root){
var TY={fact:'事实',consensus:'共识',debate:'分歧',recommendation:'推荐',event:'事件',howto:'操作指南'},CF={high:'高',medium:'中',low:'低'},ST={active:'有效',stale:'可能过时',disputed:'有争议'},KD={card:'卡片',theme:'主题',entity:'实体',page:'页面',src:'原帖'};
function norm(s){return (s||'').toLowerCase();}
function count(h,n){var c=0,i=0;while((i=h.indexOf(n,i))>=0){c++;i+=n.length;}return c;}
function grams(s){var g=[];s=s.replace(/\s+/g,'');if(s.length<2)return s?[s]:[];for(var i=0;i<s.length-1;i++)g.push(s.substr(i,2));return g;}
function search(index,q,opt){opt=opt||{};var terms=norm(q).split(/\s+/).filter(Boolean);if(!terms.length)return {mode:'none',hits:[]};
var docs=index.filter(function(d){return !opt.onlyCards||d.k==='card';});
var hits=[];docs.forEach(function(d){var t=norm(d.t),g=norm(d.g),b=norm(d.b),score=0;
for(var i=0;i<terms.length;i++){var w=terms[i],ct=count(t,w),cg=count(g,w),cb=count(b,w);if(!ct&&!cg&&!cb)return;score+=ct*20+cg*8+Math.min(cb,10)*2;}
if(d.k==='card')score+=1;hits.push({d:d,score:score});});
var mode='exact';
if(!hits.length){mode='fuzzy';var qg=[];terms.forEach(function(w){qg=qg.concat(grams(w));});
docs.forEach(function(d){var t=norm(d.t),all=t+' '+norm(d.g)+' '+norm(d.b),m=0,s=0;qg.forEach(function(x){var c=count(all,x);if(c){m++;s+=(t.indexOf(x)>=0?10:0)+Math.min(c,5);}});
var fr=qg.length?m/qg.length:0;if(fr>=0.5)hits.push({d:d,score:s*fr*fr});});}
hits.sort(function(a,b){return b.score-a.score;});return {mode:mode,terms:terms,hits:hits};}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function hl(text,terms){var s=esc(text);terms.forEach(function(w){if(!w)return;var e=esc(w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');s=s.replace(new RegExp(e,'gi'),function(m){return '<mark>'+m+'</mark>';});});return s;}
function snippet(b,terms){var lb=norm(b),pos=-1;for(var i=0;i<terms.length&&pos<0;i++)pos=lb.indexOf(terms[i]);if(pos<0){var g=grams(terms.join(''));for(var j=0;j<g.length&&pos<0;j++)pos=lb.indexOf(g[j]);}
var st=Math.max(0,pos-50);return (st>0?'…':'')+b.substr(st,160)+(b.length>st+160?'…':'');}
root.KBSearch={search:search,snippet:snippet};
if(typeof document==='undefined')return;
var qi=document.getElementById('q'),out=document.getElementById('results'),info=document.getElementById('sinfo'),oc=document.getElementById('onlycards');
function param(){var m=location.search.match(/[?&]q=([^&]*)/);return m?decodeURIComponent(m[1].replace(/\+/g,' ')):'';}
function run(){var q=qi.value.trim();if(!q){out.innerHTML='';return;}var r=search(root.KB_SEARCH||[],q,{onlyCards:oc.checked});
var hl_terms=r.mode==='exact'?r.terms:grams(r.terms.join(''));
info.textContent=(r.mode==='fuzzy'?'没有完全匹配，以下为模糊匹配结果：':'找到 ')+r.hits.length+' 条结果';
out.innerHTML=r.hits.slice(0,100).map(function(h){var d=h.d,badge='<span class="b">'+KD[d.k]+'</span>';
if(d.k==='card')badge+=' <span class="b t-'+d.ty+'">'+(TY[d.ty]||d.ty)+'</span> <span class="b c-'+d.c+'">置信度 '+(CF[d.c]||d.c)+'</span>'+(d.s&&d.s!=='active'?' <span class="b s-'+d.s+'">'+(ST[d.s]||d.s)+'</span>':'');
return '<li><a class="rt" href="'+d.u+'">'+hl(d.t,hl_terms)+'</a><div class="badges sm">'+badge+'</div><div class="sn">'+hl(snippet(d.b,r.terms),hl_terms)+'</div></li>';}).join('');}
qi.value=param();var t;qi.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){history.replaceState(null,'','?q='+encodeURIComponent(qi.value));run();},150);});
oc.addEventListener('change',run);document.getElementById('sform').addEventListener('submit',function(e){e.preventDefault();history.replaceState(null,'','?q='+encodeURIComponent(qi.value));run();});run();
})(typeof window!=='undefined'?window:globalThis);
