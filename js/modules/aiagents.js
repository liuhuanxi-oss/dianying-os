// ====== AI Agent协同模块 ======
function rai(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>AI Agent 协同中心</h2><div class="pn-sub">5大AI Agent 7×24小时智能运营</div></div></div><div class="g3" id="agc"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">任务历史</h2><div class="tb-wrap" id="atb"></div><div id="apg"></div></div>';
 api('/ai-agents').then(function(r){var ag=(r||{}).items||[];
  Q('#agc').innerHTML=ag.length?ag.map(function(a){return'<div class="pn" style="text-align:center"><div style="font-size:28px;margin-bottom:6px">'+(a.icon==='trending-up'?'📈':a.icon==='target'?'🎯':a.icon==='message-square'?'💬':a.icon==='truck'?'🚚':a.icon==='pen-tool'?'✍️':'🤖')+'</div><div style="font-size:15px;font-weight:600;color:#fff">'+(a.name||a.type||'-')+'</div><div style="font-size:11px;color:var(--t3);margin:4px 0">'+(a.desc||a.description||'')+'</div><div style="margin:8px 0"><span class="tg tg-ok">活跃</span></div><button class="bt bt-p bt-s" onclick="tga(\''+(a.type||a.name)+'\')">▶ 手动触发</button></div>'}).join(''):'<div class="em" style="grid-column:1/-1">暂未配置AI Agent</div>'
 }).catch(function(){});
 var p=1;
 var lt=function(){
  api('/ai-agents/tasks?page='+p+'&size=20').then(function(r){var it=(r||{}).items||[];
   Q('#atb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>Agent</th><th>状态</th><th>时间</th></tr></thead><tbody>'+it.map(function(t){return'<tr><td>'+(t.id||'-')+'</td><td>'+(t.agent_type||'-')+'</td><td><span class="tg '+(t.status==='completed'?'tg-ok':t.status==='running'?'tg-i':'tg-w')+'">'+(t.status||'-')+'</span></td><td>'+(t.created_at||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无任务记录</div>';
   pgR(Q('#apg'),p,(r||{}).total||0,20,function(np){p=np;lt()})
  }).catch(function(){Q('#atb').innerHTML='<div class="em">加载失败</div>'})
 };lt()
}

function tga(tp){ta('正在触发 '+tp+' Agent...','in');api('/ai-agents/'+tp+'/trigger',{m:'POST',b:JSON.stringify({})}).then(function(){ta('Agent '+tp+' 已触发执行','ok')}).catch(function(e){ta('触发失败: '+e.message,'er')})}
