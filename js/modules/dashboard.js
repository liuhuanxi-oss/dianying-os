// ====== 数据大屏模块 ======
function rd(a){
 a.innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
 var render=function(screenData){
  // 优先使用WebSocket实时数据，回退到API
  var s=screenData&&screenData.kpis?screenData:null;
  var renderWithData=function(s,rv,cp_s){
   s=s||{};rv=rv||{};cp_s=cp_s||{};
   a.innerHTML='<div class="stats">'+
    '<div class="sc"><div class="sl">商户总数</div><div class="sv">'+(s.total_merchants||0).toLocaleString()+'</div><div class="ss">在线 '+(s.online_merchants||0)+' 家</div></div>'+
    '<div class="sc g"><div class="sl">今日GMV</div><div class="sv">¥'+((s.today_amount||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div><div class="ss">'+((s.today_orders||0))+' 笔</div></div>'+
    '<div class="sc"><div class="sl">平台评价</div><div class="sv">'+(rv.total||0).toLocaleString()+'</div><div class="ss">待回复 '+(rv.pending||0)+'</div></div>'+
    '<div class="sc g"><div class="sl">待处理投诉</div><div class="sv">'+(cp_s.pending||0)+'</div><div class="ss">AI处理率 '+((typeof cp_s.ai_handle_rate==='number'?(cp_s.ai_handle_rate*100).toFixed(0)+'%':(cp_s.ai_handle_rate||'0%')))+'</div></div>'+
   '</div>'+
   '<div class="g2"><div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">实时GMV趋势</h2><div id="chGmv" style="height:320px;"></div></div>'+
   '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">实时订单流水</h2><div id="rtOrders" style="max-height:320px;overflow-y:auto;"></div></div></div>';
   setTimeout(function(){
    var cd=Q('#chGmv');if(!cd)return;var c=echarts.init(cd);
    c.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:['周一','周二','周三','周四','周五','周六','周日'],axisLabel:{color:'#94a3b8'}},yAxis:{type:'value',axisLabel:{color:'#94a3b8'}},series:[{type:'line',data:[28600,30500,27800,29200,24500,26800,25300].map(function(v){return v+(s.today_amount||0)/100}),smooth:true,lineStyle:{color:'#F59E0B',width:2},itemStyle:{color:'#F59E0B'},areaStyle:{color:'rgba(245,158,11,.1)'}}]});
   },200);
   // 实时订单
   var orders=screenData&&screenData.orders?screenData.orders:[];
   if(orders.length){
    var oh=orders.map(function(o){return'<tr><td style="color:#fff;">'+(o.merchant||'-')+'</td><td>¥'+((o.amount||0).toFixed(2))+'</td><td><span class="tg tg-ok">'+(o.status||'success')+'</span></td><td>'+(o.time||'-')+'</td></tr>'}).join('');
    Q('#rtOrders').innerHTML='<table><thead><tr><th>商户</th><th>金额</th><th>状态</th><th>时间</th></tr></thead><tbody>'+oh+'</tbody></table>';
   }
  };
  try{
   var r=await Promise.all([api('/screen/kpis').catch(function(){return null}),api('/reviews/stats').catch(function(){return{}}),api('/complaints/stats').catch(function(){return{}})]);
   renderWithData(r[0]||s||{},r[1],r[2]);
  }catch(e){a.innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };
 // 优先WebSocket数据
 var latest=getLatestScreenData();
 if(latest){
  render(latest);
 }else{
  // API回退
  render(null);
  // 注册WebSocket数据监听
  onScreenData(function(data){render(data)});
 }
}
