// ====== 商家端 - 支付投诉 ======
async function rc(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>支付投诉</h2><div class="pn-sub">AI智能分诊，自动退款处理</div></div></div>'+
  '<div class="tb-bar"><select class="in sel" id="cst_s"><option value="">全部状态</option><option value="pending">待处理</option><option value="processing">处理中</option><option value="resolved">已解决</option></select>'+
  '<button class="bt bt-p" id="csb">🔍 筛选</button></div><div class="tb-wrap" id="ctb"></div><div id="cpg"></div></div>';
 var p=1,st='';
 var ld=async function(){
  Q('#ctb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var pr='page='+p+'&size=20';if(st)pr+='&status='+encodeURIComponent(st);
   var r=await api('/complaints?'+pr);var it=r.items||[];
   Q('#ctb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>平台</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>'+it.map(function(c){var ops='';
    if(c.status==='pending')ops+='<button class="bt bt-bl bt-s" onclick="malc('+c.id+')">🤖 AI分析</button> ';
    if(c.status!=='resolved')ops+='<button class="bt bt-p bt-s" onclick="mahc('+c.id+')">⚡ 自动处理</button> ';
    ops+='<button class="bt bt-er bt-s" onclick="mesc('+c.id+')">↑ 升级</button>';
    return'<tr><td>'+(c.id||'-')+'</td><td>'+(c.platform||'-')+'</td><td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(c.content||'-')+'</td><td><span class="tg '+(c.status==='resolved'?'tg-ok':'tg-w')+'">'+(c.status||'-')+'</span></td><td>'+(c.created_at||c.complaint_time||'').substring(0,10)+'</td><td>'+ops+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无投诉</div>';
   pgR(Q('#cpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#ctb').innerHTML='<div class="em">加载失败</div>'}
 };
 Q('#csb').addEventListener('click',function(){st=Q('#cst_s').value;p=1;ld()});ld()
}
async function malc(id){ta('AI分析中...','in');try{await api('/complaints/'+id+'/analyze',{m:'POST'});ta('分析完成','ok');nav('complaints')}catch(e){ta('失败','er')}}
async function mahc(id){ta('AI自动处理中...','in');try{await api('/complaints/'+id+'/auto-handle',{m:'POST'});ta('已自动退款处理','ok');nav('complaints')}catch(e){ta('失败','er')}}
async function mesc(id){var rs=prompt('升级原因：');if(!rs)return;try{await api('/complaints/'+id+'/escalate',{m:'POST',b:JSON.stringify({reason:rs})});ta('已升级','in');nav('complaints')}catch(e){ta('失败','er')}}
