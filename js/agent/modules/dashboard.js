// ====== 代理商端 - 数据概览 ======
async function rd(a){
 a.innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
 try{
  var d=await api('/agents/dashboard').catch(function(){return{}});
  a.innerHTML='<div class="stats">'+
   '<div class="sc"><div class="sl">代理商总数</div><div class="sv">'+(d.total_agents||0).toLocaleString()+'</div><div class="ss">活跃 '+(d.active_agents||0)+' 家</div></div>'+
   '<div class="sc g"><div class="sl">下级商户</div><div class="sv">'+(d.total_merchants||0).toLocaleString()+'</div><div class="ss">覆盖全平台商户</div></div>'+
   '<div class="sc"><div class="sl">月GMV</div><div class="sv">¥'+((d.monthly_gmv||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
   '<div class="sc g"><div class="sl">平均佣金率</div><div class="sv">'+(d.avg_commission||0).toFixed(1)+'%</div></div>'+
  '</div>'+
  '<div class="g2"><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">GMV趋势（近5月）</h2><div id="chGmv" style="height:300px"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">Top代理商</h2><div id="topAg"></div></div></div>';
  setTimeout(function(){
   var cd=Q('#chGmv');if(!cd)return;var c=echarts.init(cd);
   var td=d.trend||[];
   c.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:td.map(function(t){return t.month||''}),axisLabel:{color:'#94a3b8'}},yAxis:{type:'value',axisLabel:{color:'#94a3b8'}},series:[{type:'line',data:td.map(function(t){return t.gmv||0}),smooth:true,lineStyle:{color:'#F59E0B',width:2},itemStyle:{color:'#F59E0B'},areaStyle:{color:'rgba(245,158,11,.1)'}}]})
  },100);
  var ta=(d.top_agents||[]);
  Q('#topAg').innerHTML=ta.length?'<table><thead><tr><th>名称</th><th>GMV</th><th>商户数</th></tr></thead><tbody>'+ta.map(function(a){return'<tr><td style="color:#fff;font-weight:500">'+(a.name||'-')+'</td><td>¥'+((a.gmv||0)/10000).toFixed(1)+'万</td><td>'+(a.merchants||0)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无数据</div>';
 }catch(e){a.innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
}
