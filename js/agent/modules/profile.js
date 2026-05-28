// ====== 代理商端 - 个人中心 ======
async function rpf(a){
 a.innerHTML='<div class="g2">'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">个人信息</h2>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;font-size:13px;">'+
  '<div style="color:var(--t3);font-size:12px;">用户名</div><div>'+(_user.username||_user.name||'-')+'</div>'+
  '<div style="color:var(--t3);font-size:12px;">角色</div><div><span class="tg tg-i">'+(_user.role||'agent')+'</span></div>'+
  '<div style="color:var(--t3);font-size:12px;">代理商ID</div><div>'+(_user.agent_id||_user.id||'-')+'</div>'+
  '<div style="color:var(--t3);font-size:12px;">手机号</div><div>'+(_user.phone||'-')+'</div>'+
  '<div style="color:var(--t3);font-size:12px;">邮箱</div><div>'+(_user.email||'-')+'</div>'+
  '</div></div>'+
  '<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">修改密码</h2>'+
  '<div style="display:flex;flex-direction:column;gap:10px">'+
  '<input class="in" id="op" type="password" placeholder="原密码" style="width:100%">'+
  '<input class="in" id="np" type="password" placeholder="新密码" style="width:100%">'+
  '<input class="in" id="cp" type="password" placeholder="确认密码" style="width:100%">'+
  '<button class="bt bt-p" style="width:100%" onclick="chp()">修改密码</button></div></div>'+
  '</div>';
}
async function chp(){
 var op=Q('#op').value,np=Q('#np').value,cp=Q('#cp').value;
 if(!op||!np||!cp){ta('请填写所有密码字段','er');return}
 if(np!==cp){ta('两次新密码不一致','er');return}
 ta('密码修改功能暂未开放','in');
}
