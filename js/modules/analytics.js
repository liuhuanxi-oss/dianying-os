// ====== 数据分析模块 ======
function ran(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">平台数据总览</h2><div class="stats" id="aov"></div></div>'+
  '<div class="g2"><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">GMV趋势（近12月）</h2><div id="chGmv" style="height:300px"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">AI使用统计</h2><div id="aai"></div></div></div>';
 api('/analytics/overview').then(function(ov){ov=ov||{};
  Q('#aov').innerHTML='<div class="sc"><div class="sl">总GMV</div><div class="sv">¥'+((ov.total_gmv||0)/100000000).toFixed(2)+'<span style="font-size:14px">亿</span></div></div>'+
   '<div class="sc g"><div class="sl">活跃商户</div><div class="sv">'+(ov.active_merchants||0).toLocaleString()+'</div></div>'+
   '<div class="sc"><div class="sl">月环比增长</div><div class="sv">'+(ov.growth||'0%')+'</div></div>'+
   '<div class="sc g"><div class="sl">AI调用次数</div><div class="sv">'+(ov.ai_calls||0).toLocaleString()+'</div></div>'
 }).catch(function(){});
 setTimeout(function(){
  var cd=Q('#chGmv');if(!cd)return;var c=echarts.init(cd);
  api('/analytics/gmv-trend?months=12').then(function(r){var td=Array.isArray(r)?r:((r||{}).trend||[]);
   c.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:td.map(function(t){return t.date||t.month||''}),axisLabel:{color:'#94a3b8'}},yAxis:{type:'value',axisLabel:{color:'#94a3b8'}},series:[{type:'line',data:td.map(function(t){return t.gmv||t.value||0}),smooth:true,lineStyle:{color:'#F59E0B',width:2},itemStyle:{color:'#F59E0B'},areaStyle:{color:'rgba(245,158,11,.1)'}}]})
  }).catch(function(){})
 },200);
 api('/analytics/ai-stats').then(function(ai){ai=ai||{};
  Q('#aai').innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="sc"><div class="sl">评价回复</div><div class="sv" style="font-size:18px">'+(ai.review_replies||0).toLocaleString()+'</div></div><div class="sc"><div class="sl">投诉处理</div><div class="sv" style="font-size:18px">'+(ai.complaint_handles||0).toLocaleString()+'</div></div><div class="sc"><div class="sl">内容生成</div><div class="sv" style="font-size:18px">'+(ai.content_generations||0).toLocaleString()+'</div></div><div class="sc"><div class="sl">成功率</div><div class="sv" style="font-size:18px">'+(ai.success_rate||'0%')+'</div></div></div>'
 }).catch(function(){});
}
