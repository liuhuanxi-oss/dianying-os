// ====== 代理商端核心 API / 认证 / Toast / 模态框 v2.0 ======
var A='/api/admin';
var _token=localStorage.getItem('dyos_agent_token')||'';
var _user=JSON.parse(localStorage.getItem('dyos_agent_user')||'{}');

// 页面加载时校验认证
(function(){
  if(!_token){ window.location.href='login.html'; return; }
  if(_user.role&&_user.role!=='agent'&&_user.role!=='admin'){
    var pages={merchant:'merchant.html'};
    var target=pages[_user.role];
    if(target){ window.location.href=target; return; }
  }
  if(_user.role==='admin'){ window.location.href='admin.html'; return; }
})();

async function api(u,o){
 o=o||{};
 var h={'Content-Type':'application/json'};
 if(_token)h['Authorization']='Bearer '+_token;
 var r=await fetch(A+u,{headers:h,method:o.m||'GET',body:o.b});
 if(r.status===401){logout();throw new Error('登录已过期，请重新登录');}
 if(r.status===403){throw new Error('无权限访问此资源');}
 var d=await r.json();
 if(d.code===0)return d.data;
 throw new Error(d.message||'请求失败');
}

function saveLogin(token,user){
 _token=token;_user=user;
 localStorage.setItem('dyos_agent_token',token);
 localStorage.setItem('dyos_agent_user',JSON.stringify(user));
 try{ Q('#lo').classList.remove('on'); }catch(e){}
 try{ Q('#lu').textContent=(user.name||user.username||'代理商').charAt(0).toUpperCase(); }catch(e){}
 try{ Q('#un').textContent=user.name||user.username||'代理商'; }catch(e){}
}

function logout(){
 _token='';_user={};
 localStorage.removeItem('dyos_agent_token');
 localStorage.removeItem('dyos_agent_user');
 try{ Q('#lo').classList.add('on'); Q('#ca').innerHTML=''; Q('#lu').textContent='A';Q('#un').textContent='代理商'; }catch(e){}
 window.location.href='login.html';
}

async function doLogin(){
 var u=Q('#liu').value.trim(),p=Q('#lip').value.trim();
 if(!u||!p){ta('请输入用户名和密码','er');return}
 var b=Q('#lib');b.disabled=true;b.textContent='登录中...';
 try{
  var r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  var d=await r.json();
  if(d.code===0&&d.data&&d.data.token){
   var user=d.data.user;
   // 角色路由
   if(user.role==='merchant'){
    localStorage.setItem('dyos_merchant_token',d.data.token);
    localStorage.setItem('dyos_merchant_user',JSON.stringify(user));
    location.href='merchant.html';
    return;
   }
   if(user.role==='admin'){
    localStorage.setItem('dyos_admin_token',d.data.token);
    localStorage.setItem('dyos_admin_user',JSON.stringify(user));
    location.href='admin.html';
    return;
   }
   saveLogin(d.data.token,user);
   ta('登录成功','ok');
   nav('dashboard');
  }else{ta(d.message||'登录失败','er')}
 }catch(e){ta('登录失败: '+e.message,'er')}
 finally{b.disabled=false;b.textContent='登 录'}
}

function ta(m,ty){ty=ty||'in';var e=document.createElement('div');e.className='ts-msg ts-'+ty;e.textContent=m;Q('#tc').appendChild(e);setTimeout(function(){e.style.opacity='0';e.style.transition='opacity .3s';setTimeout(function(){e.remove()},300)},3000)}

function om(t,h){Q('#mt').textContent=t;Q('#mb').innerHTML=h;Q('#mo').classList.add('on')}
function cm(){Q('#mo').classList.remove('on')}
