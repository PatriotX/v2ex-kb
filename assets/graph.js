/* 无依赖的力导向关系图（canvas）。 */
(function(){
var G=window.KB_GRAPH;if(!G)return;var cv=document.getElementById('graph'),ctx=cv.getContext('2d');
var PAL=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#65a30d','#ea580c','#4f46e5','#0d9488','#9333ea'];
var col={};G.themes.forEach(function(t,i){col[t]=PAL[i%PAL.length];});
var sel=document.getElementById('gtheme');G.themes.forEach(function(t){var o=document.createElement('option');o.value=o.textContent=t;sel.appendChild(o);});
document.getElementById('legend').innerHTML=G.themes.map(function(t){return '<span><i style="background:'+col[t]+'"></i>'+t+'</span>';}).join('')+'<span><i style="background:#888;border-radius:2px"></i>实体</span>';
var N=G.nodes,E=G.edges,deg=N.map(function(){return 0;});E.forEach(function(e){deg[e[0]]++;deg[e[1]]++;});
N.forEach(function(n,i){var a=i*2.399963,r=12*Math.sqrt(i+1);n.x=Math.cos(a)*r;n.y=Math.sin(a)*r;n.vx=0;n.vy=0;n.r=n.k==='theme'?11:n.k==='entity'?7:3.5+Math.min(deg[i],12)*.25;n.c=n.k==='entity'?'#888':(col[n.th]||'#999');});
var adj=N.map(function(){return [];});E.forEach(function(e){adj[e[0]].push(e[1]);adj[e[1]].push(e[0]);});
var W,H,dpr=window.devicePixelRatio||1,view={x:0,y:0,s:1},hover=-1,alpha=1,showAll=false,find='',only='';
function resize(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;}
function visible(n){return !only||n.th===only||(n.k==='entity'&&adj[n.id].some(function(j){return N[j].th===only;}));}
function step(){if(alpha<0.005)return;var i,j,n,m,dx,dy,d2,f;
for(i=0;i<N.length;i++){n=N[i];if(!visible(n))continue;for(j=i+1;j<N.length;j++){m=N[j];if(!visible(m))continue;dx=n.x-m.x;dy=n.y-m.y;d2=dx*dx+dy*dy+.01;if(d2>90000)continue;f=900/d2*alpha;n.vx+=dx*f;n.vy+=dy*f;m.vx-=dx*f;m.vy-=dy*f;}}
E.forEach(function(e){var a=N[e[0]],b=N[e[1]];if(!visible(a)||!visible(b))return;dx=b.x-a.x;dy=b.y-a.y;var d=Math.sqrt(dx*dx+dy*dy)+.01,L=(a.k==='theme'||b.k==='theme')?90:45;f=(d-L)/d*.04*alpha;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f;});
N.forEach(function(n){if(n.fixed){n.vx=n.vy=0;return;}n.vx-=n.x*.004*alpha;n.vy-=n.y*.004*alpha;n.x+=n.vx;n.y+=n.vy;n.vx*=.6;n.vy*=.6;});alpha*=.985;}
function tx(x){return (x-view.x)*view.s+W/2;}function ty(y){return (y-view.y)*view.s+H/2;}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);var dark=matchMedia('(prefers-color-scheme: dark)').matches;
var nb=hover>=0?adj[hover]:[];ctx.lineWidth=1;
E.forEach(function(e){var a=N[e[0]],b=N[e[1]];if(!visible(a)||!visible(b))return;var on=hover>=0&&(e[0]===hover||e[1]===hover);ctx.strokeStyle=on?(dark?'#ddd':'#333'):(dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)');ctx.beginPath();ctx.moveTo(tx(a.x),ty(a.y));ctx.lineTo(tx(b.x),ty(b.y));ctx.stroke();});
N.forEach(function(n,i){if(!visible(n))return;var r=n.r*Math.max(.6,Math.min(view.s,2)),hit=find&&n.t.toLowerCase().indexOf(find)>=0,dim=(hover>=0&&i!==hover&&nb.indexOf(i)<0)||(find&&!hit);
ctx.globalAlpha=dim?.25:1;ctx.fillStyle=n.c;ctx.beginPath();if(n.k==='entity')ctx.rect(tx(n.x)-r,ty(n.y)-r,2*r,2*r);else ctx.arc(tx(n.x),ty(n.y),r,0,7);ctx.fill();
if(hit||i===hover){ctx.strokeStyle=dark?'#fff':'#000';ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;}
if(n.k!=='card'||showAll||i===hover||hit||nb.indexOf(i)>=0&&hover>=0||view.s>2.2){ctx.fillStyle=dark?'#eee':'#222';ctx.font=(n.k==='theme'?'bold 13px':'11px')+' sans-serif';var t=n.t.length>26&&i!==hover?n.t.slice(0,25)+'…':n.t;ctx.fillText(t,tx(n.x)+r+3,ty(n.y)+4);}
ctx.globalAlpha=1;});}
function loop(){step();draw();requestAnimationFrame(loop);}
function pick(px,py){var best=-1,bd=1e9;N.forEach(function(n,i){if(!visible(n))return;var dx=tx(n.x)-px,dy=ty(n.y)-py,d=dx*dx+dy*dy,r=Math.max(n.r*view.s,6);if(d<r*r+30&&d<bd){bd=d;best=i;}});return best;}
var drag=null,moved=false;
cv.addEventListener('pointerdown',function(e){var b=cv.getBoundingClientRect(),i=pick(e.clientX-b.left,e.clientY-b.top);drag={i:i,x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};moved=false;cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',function(e){var b=cv.getBoundingClientRect();if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;
if(drag.i>=0){var n=N[drag.i];n.x=(e.clientX-b.left-W/2)/view.s+view.y*0+view.x;n.y=(e.clientY-b.top-H/2)/view.s+view.y;n.fixed=true;alpha=Math.max(alpha,.3);}else{view.x=drag.vx-dx/view.s;view.y=drag.vy-dy/view.s;}}
else{hover=pick(e.clientX-b.left,e.clientY-b.top);cv.style.cursor=hover>=0?'pointer':'grab';document.getElementById('ginfo').textContent=hover>=0?N[hover].t+'（'+adj[hover].length+' 条连接）':'';}});
cv.addEventListener('pointerup',function(){if(drag&&drag.i>=0){N[drag.i].fixed=false;if(!moved)location.href=N[drag.i].u;}drag=null;});
cv.addEventListener('wheel',function(e){e.preventDefault();view.s*=e.deltaY<0?1.12:1/1.12;view.s=Math.max(.2,Math.min(6,view.s));},{passive:false});
sel.onchange=function(){only=sel.value;alpha=1;};document.getElementById('glabels').onchange=function(e){showAll=e.target.checked;};
document.getElementById('gfind').oninput=function(e){find=e.target.value.trim().toLowerCase();};
window.addEventListener('resize',resize);resize();for(var k=0;k<250;k++)step();view.s=Math.min(W,H)/900;loop();
document.getElementById('ginfo').textContent=N.length+' 个节点 · '+E.length+' 条连线';
})();
