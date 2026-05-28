// ====== 代理商端 - 下属商户 ======
async function rm(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>下属商户列表</h2><div class="pn-sub">代理商管辖的所有商户</div></div></div>'+
  '<div class="tb-wrap" id="mtb"></div><div id="mpg"></div></div>';
 var p=1;
 var ld=async function(){
  Q('#mtb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var aid=_user.agent_id||_user.id||1;
   var r=await api('/agents/'+aid+'/merchants?page='+p+'&size=20').catch(function(){return{items:[],total:0}});
   var it=r.items||[];
   Q('#mtb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>名称</th><th>行业</th><th>月GMV</th><th>状态</th><th>入驻时间</th></tr></thead><tbody>'+it.map(function(m){return'<tr><td>'+(m.id||'-')+'</td><td style="color:#fff;font-weight:500">'+(m.name||'-')+'</td><td>'+(m.industry||'-')+'</td><td>¥'+((m.monthly_gmv||0)/10000).toFixed(1)+'万</td><td><span class="tg '+(m.status==='active'?'tg-ok':'tg-w')+'">'+(m.status||'-')+'</span></td><td>'+(m.join_time||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无下属商户</div>';
   pgR(Q('#mpg'),p,r.total||0,20,function(np){p=np;ld()});Q('#mc').textContent=(r.total||0).toLocaleString()
  }catch(e){Q('#mtb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };ld()
}
