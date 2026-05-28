// ====== 舆情管控模块 ======
function rse(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">舆情监控</h2><div class="stats" id="sov"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">舆情预警</h2><div class="tb-wrap" id="sab"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">突发事件</h2><div class="tb-wrap" id="sib"></div></div>';
 api('/sentiment/overview').then(function(ov){ov=ov||{};
  Q('#sov').innerHTML='<div class="sc"><div class="sl">正面舆情</div><div class="sv" style="color:var(--green)">'+(ov.positive||0)+'%</div></div>'+
   '<div class="sc"><div class="sl">负面舆情</div><div class="sv" style="color:var(--red)">'+(ov.negative||0)+'%</div></div>'+
   '<div class="sc"><div class="sl">预警数量</div><div class="sv" style="color:var(--gold)">'+(ov.alerts||0)+'</div></div>'+
   '<div class="sc"><div class="sl">突发事件</div><div class="sv" style="color:var(--red)">'+(ov.incidents||0)+'</div></div>'
 }).catch(function(){});
 api('/sentiment/alerts').then(function(al){al=al||{};
  Q('#sab').innerHTML=(al.items||[]).length?'<table><thead><tr><th>ID</th><th>类型</th><th>内容</th><th>等级</th></tr></thead><tbody>'+(al.items||[]).map(function(a){return'<tr><td>'+a.id+'</td><td>'+(a.type||'-')+'</td><td>'+(a.content||'-')+'</td><td><span class="tg '+(a.level==='high'?'tg-e':'tg-w')+'">'+(a.level||'-')+'</span></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无预警</div>'
 }).catch(function(){});
 api('/sentiment/incidents?page=1&size=10').then(function(inc){inc=inc||{};
  Q('#sib').innerHTML=(inc.items||[]).length?'<table><thead><tr><th>ID</th><th>事件</th><th>等级</th></tr></thead><tbody>'+(inc.items||[]).map(function(i){return'<tr><td>'+i.id+'</td><td>'+(i.title||i.content||'-')+'</td><td><span class="tg '+(i.level==='critical'?'tg-e':'tg-w')+'">'+(i.level||'-')+'</span></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无突发事件</div>'
 }).catch(function(){});
}
