// ====== 代理商端 - 结算记录 ======
async function rsl(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">结算记录</h2><div class="tb-wrap" id="slb"></div><div id="slpg"></div></div>';
 var p=1;
 var ld=async function(){
  try{
   var r=await api('/agents/settlements?page='+p+'&size=20').catch(function(){return{items:[],total:0}});
   var it=r.items||[];
   Q('#slb').innerHTML=it.length?'<table><thead><tr><th>代理商</th><th>月份</th><th>应付佣金</th><th>实付佣金</th><th>状态</th><th>结算日期</th></tr></thead><tbody>'+it.map(function(s){return'<tr><td style="color:#fff;font-weight:500">'+(s.agent||'-')+'</td><td>'+(s.month||'-')+'</td><td>¥'+((s.payable||0)/10000).toFixed(2)+'万</td><td>¥'+((s.actual||0)/10000).toFixed(2)+'万</td><td><span class="tg '+(s.status==='已结算'?'tg-ok':'tg-w')+'">'+(s.status||'-')+'</span></td><td>'+(s.settle_time||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无结算记录</div>';
   pgR(Q('#slpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#slb').innerHTML='<div class="em">加载失败</div>'}
 };ld()
}
