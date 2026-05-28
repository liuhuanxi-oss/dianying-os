// ====== 商家端 - 经营概览 ======
async function rd(a){
 a.innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
 try{
  var r=await Promise.all([api('/overview').catch(function(){return{}}),api('/overview/trend').catch(function(){return{trend:[]}}),api('/overview/alerts').catch(function(){return{items:[]}})]);
  var ov=r[0],trend=r[1],alerts=r[2];var td=trend.trend||trend||[];
  a.innerHTML='<div class="stats">'+
   '<div class="sc"><div class="sl">今日GMV</div><div class="sv">¥'+((ov.gmv_today||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div><div class="ss">'+(ov.orders_today||0)+' 笔订单</div></div>'+
   '<div class="sc g"><div class="sl">平均客单价</div><div class="sv">¥'+(ov.avg_amount||0).toFixed(2)+'</div></div>'+
   '<div class="sc"><div class="sl">店铺评分</div><div class="sv">⭐ '+(ov.rating||0).toFixed(1)+'</div><div class="ss">待回复 '+(ov.pending_reviews||0)+' 条评价</div></div>'+
   '<div class="sc g"><div class="sl">AI调用</div><div class="sv">'+(ov.ai_calls||0)+'<span style="font-size:14px">次</span></div></div>'+
  '</div>'+
  '<div class="g2"><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">GMV趋势（近7天）</h2><div id="chT" style="height:280px"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">实时预警</h2>'+(alerts.items||[]).length?(alerts.items||[]).map(function(a){return'<div style="padding:12px;background:var(--bg3);border-radius:6px;border-left:3px solid '+(a.level==='warning'?'var(--gold)':'var(--blue)')+';margin-bottom:8px"><div style="font-weight:600;font-size:13px">'+(a.type||'')+'</div><div style="font-size:11px;color:var(--t2);margin-top:2px">'+(a.content||'')+'</div></div>'}).join(''):'<div class="em">暂无预警</div>'+
  '</div></div>';
  setTimeout(function(){
   var cd=Q('#chT');if(!cd)return;var c=echarts.init(cd);
   c.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:(Array.isArray(td)?td:[]).map(function(t){return t.date||''}),axisLabel:{color:'#94a3b8'}},yAxis:{type:'value',axisLabel:{color:'#94a3b8'}},series:[{type:'line',data:(Array.isArray(td)?td:[]).map(function(t){return t.gmv||0}),smooth:true,lineStyle:{color:'#F59E0B',width:2},itemStyle:{color:'#F59E0B'},areaStyle:{color:'rgba(245,158,11,.1)'}}]})
  },100)
 }catch(e){a.innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
}
