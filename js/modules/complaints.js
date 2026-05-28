// ====== 支付投诉AI处理模块 ======
function rc(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>支付投诉AI处理中心</h2><div class="pn-sub">投诉接入 → AI分诊 → 自动分析 → 天阙退款 → 闭环完成</div></div><button class="bt bt-p" onclick="lcs()">🔄 刷新统计</button></div>'+
  '<div class="stats" id="cst"></div><div class="tb-bar"><select class="in sel" id="cpf"><option value="">全部平台</option><option>wechat_pay</option><option>alipay</option><option>unionpay</option></select>'+
  '<select class="in sel" id="cst_s"><option value="">全部状态</option><option value="pending">待处理</option><option value="analyzing">分析中</option><option value="processing">处理中</option><option value="resolved">已解决</option></select>'+
  '<button class="bt bt-p" id="csb">🔍 筛选</button></div><div class="tb-wrap" id="ctb"></div><div id="cpg"></div></div>';
 lcs();var p=1,pf='',st='';
 var ld=async function(){
  Q('#ctb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var pr='page='+p+'&size=20';if(pf)pr+='&platform='+encodeURIComponent(pf);if(st)pr+='&status='+encodeURIComponent(st);
   var r=await api('/complaints?'+pr);var it=r.items||[];
   Q('#ctb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>商户ID</th><th>平台</th><th>投诉内容</th><th>紧急度</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>'+it.map(function(c){var ops='';
    if(c.status==='pending')ops+='<button class="bt bt-bl bt-s" onclick="alc('+c.id+')">🤖 AI分析</button> ';
    if(c.status==='analyzing'||c.status==='pending')ops+='<button class="bt bt-p bt-s" onclick="ahc('+c.id+')">⚡ 自动处理</button> ';
    if(c.status!=='resolved')ops+='<button class="bt bt-ok bt-s" onclick="clc('+c.id+')">✅ 完成</button> ';
    ops+='<button class="bt bt-er bt-s" onclick="esc('+c.id+')">↑ 升级</button>';
    return'<tr><td>'+(c.id||'-')+'</td><td>'+(c.merchant_id||'-')+'</td><td><span class="tg tg-i">'+(c.platform||'-')+'</span></td><td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(c.content||'-')+'</td><td><span class="tg '+(c.urgency==='high'?'tg-e':c.urgency==='medium'?'tg-w':'tg-i')+'">'+(c.urgency||'-')+'</span></td><td><span class="tg '+(c.status==='resolved'?'tg-ok':c.status==='escalated'?'tg-e':'tg-w')+'">'+(c.status||'-')+'</span></td><td>'+(c.created_at||c.complaint_time||'').substring(0,10)+'</td><td style="display:flex;gap:3px;flex-wrap:wrap">'+ops+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无投诉数据</div>';
   pgR(Q('#cpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#ctb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };
 Q('#csb').addEventListener('click',function(){pf=Q('#cpf').value;st=Q('#cst_s').value;p=1;ld()});ld()
}

function lcs(){
 api('/complaints/stats').then(function(s){
  s=s||{};
  Q('#cst').innerHTML='<div class="sc"><div class="sl">总投诉数</div><div class="sv">'+(s.total||0).toLocaleString()+'</div></div>'+
   '<div class="sc"><div class="sl">待处理</div><div class="sv" style="color:var(--gold)">'+(s.pending||0)+'</div></div>'+
   '<div class="sc g"><div class="sl">AI处理率</div><div class="sv">'+(typeof s.ai_handle_rate==='number'?(s.ai_handle_rate*100).toFixed(0)+'%':(s.ai_handle_rate||'0%'))+'</div><div class="ss">AI自动处理占比</div></div>'+
   '<div class="sc"><div class="sl">平均处理时长</div><div class="sv" style="color:var(--green)">'+(s.avg_handle_time||s.avg_handle_time_h||'0')+'<span style="font-size:14px">'+(s.avg_handle_time_h?'h':'min')+'</span></div></div>';
  var b=Q('#cb');if((s.pending||0)>0){b.style.display='';b.textContent=s.pending}else{b.style.display='none'}
 }).catch(function(){})
}

function alc(id){ta('AI正在分析投诉...','in');api('/complaints/'+id+'/analyze',{m:'POST'}).then(function(){ta('AI分析完成！','ok');nav('complaints')}).catch(function(e){ta('分析失败: '+e.message,'er')})}
function ahc(id){ta('AI自动处理中，将通过天阙发起退款...','in');api('/complaints/'+id+'/auto-handle',{m:'POST'}).then(function(r){ta('AI自动处理完成！退款已发起 '+((r||{}).refund_no||''),'ok');nav('complaints')}).catch(function(e){ta('处理失败: '+e.message,'er')})}
function clc(id){api('/complaints/'+id+'/complete',{m:'POST'}).then(function(){ta('投诉已标记完成','ok');nav('complaints')}).catch(function(){ta('操作失败','er')})}
function esc(id){var rs=prompt('升级原因：');if(!rs)return;api('/complaints/'+id+'/escalate',{m:'POST',b:JSON.stringify({reason:rs})}).then(function(){ta('已升级至运营主管','in');nav('complaints')}).catch(function(){ta('升级失败','er')})}
