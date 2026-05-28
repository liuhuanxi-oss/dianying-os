// ====== DOM工具模块 ======
function Q(s,p){return(p||document).querySelector(s)}
function QA(s,p){return(p||document).querySelectorAll(s)}
function E(t,a){var e=document.createElement(t);if(a)for(var k in a)e[k]=a[k];return e}

// 分页器
function pgR(c,p,t,s,onP){
 var tp=Math.ceil(t/s)||1;
 var h='<div class="pg-i">共 '+t+' 条 | 第 '+p+'/'+tp+' 页</div><div class="pg-b">';
 h+='<button '+(p<=1?'disabled':'')+' data-p="1">首页</button>';
 h+='<button '+(p<=1?'disabled':'')+' data-p="'+(p-1)+'">上页</button>';
 for(var i=Math.max(1,p-2);i<=Math.min(tp,p+2);i++)h+='<button class="'+(i===p?'ac':'')+'" data-p="'+i+'">'+i+'</button>';
 h+='<button '+(p>=tp?'disabled':'')+' data-p="'+(p+1)+'">下页</button>';
 h+='<button '+(p>=tp?'disabled':'')+' data-p="'+tp+'">末页</button></div>';
 c.innerHTML=h;
 c.querySelectorAll('button[data-p]').forEach(function(b){b.addEventListener('click',function(){onP(parseInt(this.dataset.p))})})
}
