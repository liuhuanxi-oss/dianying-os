// ====== 商家端 - 财务管理 ======
async function rf(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">财务总览</h2><div class="stats" id="fov"></div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">交易流水</h2><div class="tb-wrap" id="ftb"></div><div id="fpg"></div></div>';
 try{var ov=await api('/finance/overview').catch(function(){return{}});
  Q('#fov').innerHTML='<div class="sc"><div class="sl">今日GMV</div><div class="sv">¥'+((ov.today_gmv||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
   '<div class="sc g"><div class="sl">今日订单</div><div class="sv">'+(ov.today_orders||0)+'<span style="font-size:14px">笔</span></div></div>'+
   '<div class="sc"><div class="sl">本月GMV</div><div class="sv">¥'+((ov.month_gmv||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
   '<div class="sc g"><div class="sl">待结算</div><div class="sv">¥'+((ov.pending_settlement||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'
 }catch(e){}
 var p=1;
 var ld=async function(){
  try{var r=await api('/finance/transactions?page='+p+'&size=20').catch(function(){return{items:[],total:0}});var it=r.items||[];
   Q('#ftb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>金额</th><th>类型</th><th>状态</th><th>时间</th></tr></thead><tbody>'+it.map(function(t){return'<tr><td>'+(t.id||t.transaction_id||'-')+'</td><td>¥'+((t.amount||0).toFixed(2))+'</td><td>'+(t.type||'支付')+'</td><td><span class="tg '+(t.status==='success'?'tg-ok':'tg-w')+'">'+(t.status||'-')+'</span></td><td>'+(t.created_at||t.time||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无交易</div>';
   pgR(Q('#fpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#ftb').innerHTML='<div class="em">加载失败</div>'}
 };ld()
}
