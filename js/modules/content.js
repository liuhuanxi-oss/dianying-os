// ====== 内容中心模块 ======
function rco(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">知识库</h2><div class="tb-wrap" id="cok"></div></div><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">系统公告</h2><div class="tb-wrap" id="coa"></div></div>';
 api('/content/knowledge?page=1&size=10').then(function(k){k=k||{};
  Q('#cok').innerHTML=(k.items||[]).length?'<table><thead><tr><th>标题</th><th>分类</th><th>状态</th></tr></thead><tbody>'+(k.items||[]).map(function(i){return'<tr><td>'+(i.title||'-')+'</td><td>'+(i.category||'-')+'</td><td>'+(i.status||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无内容</div>'
 }).catch(function(){});
 api('/content/announcements?page=1&size=10').then(function(ann){ann=ann||{};
  Q('#coa').innerHTML=(ann.items||[]).length?'<table><thead><tr><th>标题</th><th>状态</th><th>时间</th></tr></thead><tbody>'+(ann.items||[]).map(function(i){return'<tr><td>'+(i.title||'-')+'</td><td>'+(i.status||'-')+'</td><td>'+(i.created_at||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无公告</div>'
 }).catch(function(){});
}
