// ====== 代理商端 - 业绩统计 ======
async function rp(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">业绩概览</h2><div class="stats" id="pov"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">下属商户排行</h2><div class="tb-wrap" id="prk"></div></div>';
 try{
  var d=await api('/agents/dashboard').catch(function(){return{}});
  Q('#pov').innerHTML='<div class="sc"><div class="sl">本月GMV</div><div class="sv">¥'+((d.monthly_gmv||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
   '<div class="sc g"><div class="sl">活跃商户</div><div class="sv">'+(d.active_agents||0).toLocaleString()+'</div></div>'+
   '<div class="sc"><div class="sl">总商户</div><div class="sv">'+(d.total_merchants||0).toLocaleString()+'</div></div>'+
   '<div class="sc g"><div class="sl">佣金率</div><div class="sv">'+(d.avg_commission||0).toFixed(1)+'%</div></div>';
  var ta=(d.top_agents||[]);
  Q('#prk').innerHTML=ta.length?'<table><thead><tr><th>排名</th><th>名称</th><th>GMV</th><th>商户数</th></tr></thead><tbody>'+ta.map(function(a,i){return'<tr><td>'+(i+1)+'</td><td style="color:#fff;font-weight:500">'+(a.name||'-')+'</td><td>¥'+((a.gmv||0)/10000).toFixed(1)+'万</td><td>'+(a.merchants||0)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无数据</div>';
 }catch(e){a.innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
}
