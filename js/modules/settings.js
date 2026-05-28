// ====== 系统设置模块 ======
function rst(a){
 a.innerHTML='<div class="g2"><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">角色权限</h2><div class="tb-wrap" id="sro"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">操作日志</h2><div class="tb-wrap" id="slo"></div></div></div>';
 api('/settings/roles?page=1&size=20').then(function(rl){rl=rl||{};
  Q('#sro').innerHTML=(rl.items||[]).length?'<table><thead><tr><th>角色</th><th>用户数</th></tr></thead><tbody>'+(rl.items||[]).map(function(r){return'<tr><td>'+(r.name||r.role_name||'-')+'</td><td>'+(r.user_count||r.permissions||0)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无角色</div>'
 }).catch(function(){});
 api('/settings/operation-logs?page=1&size=20').then(function(lg){lg=lg||{};
  Q('#slo').innerHTML=(lg.items||[]).length?'<table><thead><tr><th>操作人</th><th>类型</th><th>时间</th></tr></thead><tbody>'+(lg.items||[]).map(function(l){return'<tr><td>'+(l.operator||'-')+'</td><td>'+(l.type||'-')+'</td><td>'+(l.created_at||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无记录</div>'
 }).catch(function(){});
}
