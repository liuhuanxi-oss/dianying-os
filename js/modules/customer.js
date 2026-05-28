// ====== 客户成功模块 ======
function rcu(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">客户健康度</h2><div class="tb-wrap" id="cuh"></div></div><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">流失预警</h2><div class="tb-wrap" id="cuc"></div></div>';
 api('/customer/health-score?page=1&size=20').then(function(h){h=h||{};
  Q('#cuh').innerHTML=(h.items||[]).length?'<table><thead><tr><th>商户</th><th>健康分</th><th>风险</th></tr></thead><tbody>'+(h.items||[]).map(function(i){return'<tr><td>'+(i.merchant_name||i.name||'-')+'</td><td style="font-weight:700;color:'+((i.score||0)>=80?'var(--green)':'var(--gold)')+'">'+(i.score||0)+'</td><td><span class="tg '+(i.risk==='high'?'tg-e':'tg-ok')+'">'+(i.risk||'低')+'</span></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无数据</div>'
 }).catch(function(){});
 api('/analytics/churn-warning?page=1&size=20').then(function(ch){ch=ch||{};
  Q('#cuc').innerHTML=(ch.items||[]).length?'<table><thead><tr><th>商户</th><th>级别</th><th>原因</th></tr></thead><tbody>'+(ch.items||[]).map(function(i){return'<tr><td>'+(i.merchant_name||i.name||'-')+'</td><td><span class="tg '+(i.level==='high'?'tg-e':'tg-w')+'">'+(i.level||'-')+'</span></td><td>'+(i.reason||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无预警</div>'
 }).catch(function(){});
}
