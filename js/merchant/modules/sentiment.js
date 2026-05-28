// ====== 商家端 - 舆情监控 ======
async function rse(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">舆情监控</h2><div class="stats" id="sov"></div></div><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">舆情详情</h2><div class="tb-wrap" id="sdt"></div></div>';
 try{var ov=await api('/sentiment/overview').catch(function(){return{}});
  Q('#sov').innerHTML='<div class="sc"><div class="sl">正面舆情</div><div class="sv" style="color:var(--green);font-size:20px">'+(ov.positive||0)+'%</div></div><div class="sc"><div class="sl">负面舆情</div><div class="sv" style="color:var(--red);font-size:20px">'+(ov.negative||0)+'%</div></div><div class="sc"><div class="sl">预警</div><div class="sv" style="color:var(--gold);font-size:20px">'+(ov.alerts||0)+'</div></div>'
 }catch(e){}
 try{var d=await api('/sentiment/detail?page=1&size=20').catch(function(){return{items:[]}});
  Q('#sdt').innerHTML=(d.items||[]).length?'<table><thead><tr><th>来源</th><th>内容</th><th>情感</th></tr></thead><tbody>'+(d.items||[]).map(function(s){return'<tr><td>'+(s.source||'-')+'</td><td>'+(s.content||'-')+'</td><td><span class="tg '+(s.sentiment==='negative'?'tg-e':'tg-ok')+'">'+(s.sentiment||'-')+'</span></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无数据</div>'
 }catch(e){}
}
