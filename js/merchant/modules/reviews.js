// ====== 商家端 - 评价管理 ======
async function rr(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>评价管理</h2><div class="pn-sub">AI智能回复，自动同步到平台</div></div></div>'+
  '<div class="tb-bar"><select class="in sel" id="rrt"><option value="0">全部评分</option><option value="5">5星</option><option value="4">4星</option><option value="3">3星</option><option value="2">2星</option><option value="1">1星</option></select>'+
  '<button class="bt bt-p" id="rsb">🔍 筛选</button></div><div id="rst" style="display:flex;gap:10px;margin-bottom:14px;"></div><div class="tb-wrap" id="rtb"></div><div id="rpg"></div></div>';
 var p=1,rt=0;
 var ld=async function(){
  Q('#rtb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var st=await api('/reviews/stats').catch(function(){return{}});
   Q('#rst').innerHTML='<div class="sc" style="flex:1;min-width:100px"><div class="sl">总评价</div><div class="sv" style="font-size:18px">'+(st.total||0).toLocaleString()+'</div></div><div class="sc" style="flex:1;min-width:100px"><div class="sl">均分</div><div class="sv" style="font-size:18px">⭐ '+(st.avg_rating||0).toFixed(1)+'</div></div><div class="sc" style="flex:1;min-width:100px"><div class="sl">待回复</div><div class="sv" style="font-size:18px;color:var(--gold)">'+(st.pending||0)+'</div></div>';
   var pr='page='+p+'&size=20';if(rt)pr+='&rating='+rt;
   var r=await api('/reviews?'+pr);var it=r.items||[];
   Q('#rtb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>用户</th><th>评分</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>'+it.map(function(rv){return'<tr><td>'+(rv.id||'-')+'</td><td>'+(rv.user_name||'-')+'</td><td>'+'⭐'.repeat(rv.rating||0)+'</td><td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(rv.content||'-')+'</td><td><span class="tg '+(rv.status==='REPLIED'?'tg-ok':'tg-w')+'">'+(rv.status==='REPLIED'?'已回复':'待回复')+'</span></td><td>'+(rv.created_at||'').substring(0,10)+'</td><td>'+(rv.status!=='REPLIED'?'<button class="bt bt-p bt-s" onclick="mair('+rv.id+')">🤖 AI回复</button>':'<span style="color:var(--t3);font-size:11px">已完成</span>')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无评价</div>';
   pgR(Q('#rpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#rtb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };
 Q('#rsb').addEventListener('click',function(){rt=parseInt(Q('#rrt').value);p=1;ld()});ld()
}
async function mair(id){ta('AI正在生成回复...','in');try{await api('/reviews/ai-reply',{m:'POST',b:JSON.stringify({review_id:id,style:'professional'})});ta('AI回复已生成！','ok');nav('reviews')}catch(e){ta('失败: '+e.message,'er')}}
