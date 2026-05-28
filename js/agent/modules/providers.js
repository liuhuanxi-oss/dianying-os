// ====== 代理商端 - 服务商管理 ======
async function rpr(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>服务商管理</h2><div class="pn-sub">支付对接、技术运维等服务提供商</div></div></div><div class="tb-wrap" id="prb"></div><div id="pppg"></div></div>';
 var p=1;
 var ld=async function(){
  try{
   var r=await api('/agents/service-providers?page='+p+'&size=20').catch(function(){return{items:[],total:0}});
   var it=r.items||[];
   Q('#prb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>名称</th><th>服务范围</th><th>服务区域</th><th>资质</th><th>商户数</th></tr></thead><tbody>'+it.map(function(s){return'<tr><td>'+(s.id||'-')+'</td><td style="color:#fff;font-weight:500">'+(s.name||'-')+'</td><td>'+(s.scope||'-')+'</td><td>'+(s.region||'-')+'</td><td>'+'<span class="tg tg-i">'+(s.qualification||'-')+'</span></td><td>'+(s.merchants||0)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无服务商</div>';
   pgR(Q('#pppg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#prb').innerHTML='<div class="em">加载失败</div>'}
 };ld()
}
