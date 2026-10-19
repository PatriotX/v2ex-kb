(function(){
var tb=document.querySelector('#cards tbody');if(!tb)return;var rows=[].slice.call(tb.rows);
var sels=[].slice.call(document.querySelectorAll('#filters [data-f]'));var sortSel=document.getElementById('sort');
var confRank={high:0,medium:1,low:2};
function readHash(){var h=decodeURIComponent(location.hash.slice(1));var o={};h.split('&').forEach(function(kv){if(!kv)return;var i=kv.indexOf('=');o[kv.slice(0,i)]=kv.slice(i+1);});return o;}
function writeHash(){var p=[];sels.forEach(function(s){if(s.value)p.push(s.dataset.f+'='+encodeURIComponent(s.value));});if(sortSel.value!=='title')p.push('sort='+sortSel.value);history.replaceState(null,'',p.length?'#'+p.join('&'):location.pathname);}
function apply(){var n=0;var f={};sels.forEach(function(s){f[s.dataset.f]=s.value.toLowerCase();});
rows.forEach(function(r){var ok=true;
['type','conf','status'].forEach(function(k){if(f[k]&&r.dataset[k]!==f[k])ok=false;});
['theme','tag','entity'].forEach(function(k){if(f[k]&&r.dataset[k].toLowerCase().split('|').indexOf(f[k])<0)ok=false;});
if(f.text&&r.cells[0].textContent.toLowerCase().indexOf(f.text)<0)ok=false;
r.style.display=ok?'':'none';if(ok)n++;});
var key=sortSel.value;rows.sort(function(a,b){if(key==='updated')return (b.dataset.updated||'').localeCompare(a.dataset.updated||'');if(key==='src')return b.dataset.src-a.dataset.src;
if(key==='conf')return (confRank[a.dataset.conf]||9)-(confRank[b.dataset.conf]||9);return a.cells[0].textContent.localeCompare(b.cells[0].textContent,'zh');});
rows.forEach(function(r){tb.appendChild(r);});document.getElementById('count').textContent='筛选结果 '+n+' / '+rows.length+' 张';}
function load(){var h=readHash();sels.forEach(function(s){var v=h[s.dataset.f]||'';if(s.tagName==='SELECT'&&v&&![].some.call(s.options,function(o){return o.value===v;})){var o=document.createElement('option');o.value=v;o.textContent=v;s.appendChild(o);}s.value=v;});sortSel.value=h.sort||'title';apply();}
sels.forEach(function(s){s.addEventListener(s.tagName==='SELECT'?'change':'input',function(){writeHash();apply();});});
sortSel.addEventListener('change',function(){writeHash();apply();});
document.getElementById('reset').onclick=function(){sels.forEach(function(s){s.value='';});sortSel.value='title';writeHash();apply();};
window.addEventListener('hashchange',load);load();
})();
