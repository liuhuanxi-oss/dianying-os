// ====== 代理商端 - 分佣结算 ======
async function rc(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>分佣结算</h2><div class="pn-sub">代理商佣金结算查询</div></div></div><div class="tb-bar"><select class="in sel" id="cm"><option value="2026-05">2026年5月</option><option value="2026-04">2026年4月</option><option value="2026-03">2026年3月</option><option value="2026-02">2026年2月</option></select><button class="bt bt-p" id="csb">🔍 查询</button></div><div class="stats" id="ccs"></div><div class="tb-wrap" id="ccb"></div><div id="cpg"></div></div>';
 var p=1,mon='2026-05';
 var ld=async function(){
  Q('#ccb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var aid=_user.agent_id||_user.id||1;
   var cm=await api('/agents/'+aid+'/commission').catch(function(){return{}});
   Q('#ccs').innerHTML='<div class="sc"><div class="sl">累计佣金</div><div class="sv">¥'+((cm.total_commission||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
    '<div class="sc g"><div class="sl">已结算</div><div class="sv">¥'+((cm.paid||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
    '<div class="sc"><div class="sl">待结算</div><div class="sv" style="color:var(--gold)">¥'+((cm.pending||0)/10000).toFixed(1)+'<span style="font-size:14px">万</span></div></div>'+
    '<div class="sc g"><div class="sl">佣金比例</div><div class="sv">'+(cm.rate||0).toFixed(1)+'%</div></div>';
   var r=await api('/agents/settlements?month='+mon+'&page='+p+'&size=20').catch(function(){return{items:[],total:0}});
   var it=r.items||[];
   Q('#ccb').innerHTML=it.length?'<table><thead><tr><th>代理商</th><th>月份</th><th>应付</th><th>实付</th><th>状态</th><th>结算日期</th></tr></thead><tbody>'+it.map(function(s){return'<tr><td style="color:#fff;font-weight:500">'+(s.agent||'-')+'</td><td>'+(s.month||'-')+'</td><td>¥'+((s.payable||0)/10000).toFixed(2)+'万</td><td>¥'+((s.actual||0)/10000).toFixed(2)+'万</td><td><span class="tg '+(s.status==='已结算'?'tg-ok':'tg-w')+'">'+(s.status||'-')+'</span></td><td>'+(s.settle_time||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无结算记录</div>';
   pgR(Q('#cpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#ccb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };
 Q('#csb').addEventListener('click',function(){mon=Q('#cm').value;p=1;ld()});ld()
}
