// ====== 代理商管理模块 ======
function rag(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>代理商管理</h2><div class="pn-sub">管理所有代理商及其下级商户、佣金结算</div></div></div>'+
  '<div class="stats" id="ags"></div><div class="tb-wrap" id="agb"></div><div id="agpg"></div></div>';
 api('/agents/dashboard').then(function(db){db=db||{};
  Q('#ags').innerHTML='<div class="sc"><div class="sl">代理商总数</div><div class="sv">'+(db.total_agents||0).toLocaleString()+'</div></div>'+
   '<div class="sc g"><div class="sl">下级商户</div><div class="sv">'+(db.total_merchants||0).toLocaleString()+'</div></div>'+
   '<div class="sc"><div class="sl">本月佣金</div><div class="sv">¥'+((db.total_commission||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'
 }).catch(function(){});
 var p=1;
 var ld=function(){
  api('/agents?page='+p+'&size=20').then(function(r){var it=(r||{}).items||[];
   Q('#agb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>名称</th><th>等级</th><th>区域</th><th>下级商户</th><th>状态</th></tr></thead><tbody>'+it.map(function(a){return'<tr><td>'+(a.id||'-')+'</td><td style="color:#fff;font-weight:500">'+(a.name||'-')+'</td><td>'+(a.level||'-')+'</td><td>'+(a.region||'-')+'</td><td>'+(a.merchant_count||0)+'</td><td><span class="tg '+(a.status==='active'?'tg-ok':'tg-w')+'">'+(a.status||'-')+'</span></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无代理商</div>';
   pgR(Q('#agpg'),p,(r||{}).total||0,20,function(np){p=np;ld()})
  }).catch(function(){Q('#agb').innerHTML='<div class="em">加载失败</div>'})
 };ld()
}
