// ====== 商家端 - 会员管理 ======
async function rmb(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">会员管理</h2><div class="tb-wrap" id="mtb"></div><div id="mpg"></div></div>';
 var p=1;
 var ld=async function(){
  try{var r=await api('/members?page='+p+'&size=20').catch(function(){return{items:[],total:0}});var it=r.items||[];
   Q('#mtb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>姓名</th><th>积分</th><th>等级</th><th>注册时间</th></tr></thead><tbody>'+it.map(function(m){return'<tr><td>'+(m.id||'-')+'</td><td>'+(m.name||'-')+'</td><td>'+(m.points||0)+'</td><td>'+(m.level||'-')+'</td><td>'+(m.created_at||'-')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无会员</div>';
   pgR(Q('#mpg'),p,r.total||0,20,function(np){p=np;ld()})
  }catch(e){Q('#mtb').innerHTML='<div class="em">加载失败</div>'}
 };ld()
}
