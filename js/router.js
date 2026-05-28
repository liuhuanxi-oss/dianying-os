// ====== 单页路由模块 (Hash + History API) ======
var cp='dashboard';
var titles={
 dashboard:['数据大屏','首页 / 数据大屏'],merchants:['商户管理','核心业务 / 商户管理'],
 reviews:['评价管理','核心业务 / 评价管理'],complaints:['支付投诉','核心业务 / 支付投诉'],
 aiagents:['AI Agent','核心业务 / AI Agent'],finance:['财务中心','运营管理 / 财务中心'],
 agents:['代理商管理','运营管理 / 代理商'],sentiment:['舆情管控','运营管理 / 舆情管控'],
 analytics:['数据分析','运营管理 / 数据分析'],customer:['客户成功','系统管理 / 客户成功'],
 content:['内容中心','系统管理 / 内容中心'],settings:['系统设置','系统管理 / 系统设置']
};

// 读取当前路由（hash优先，localStorage兜底）
function currentRoute(){
 var h=window.location.hash.replace(/^#\/?/,'');
 if(h&&titles[h])return h;
 var s=localStorage.getItem('dyos_admin_pg');
 return (s&&titles[s])?s:'dashboard';
}

// 导航核心（不改动原有逻辑，追加hash同步）
function nav(pg){
 cp=pg;
 QA('.sb-nav a').forEach(function(a){a.classList.remove('ac')});
 var n=Q('.sb-nav a[data-pg="'+pg+'"]');if(n)n.classList.add('ac');
 Q('#pt').textContent=titles[pg][0];Q('#pb').textContent=titles[pg][1];
 load(pg);localStorage.setItem('dyos_admin_pg',pg);
 // 同步更新URL hash
 if(window.location.hash!=='#/'+pg){
  history.pushState({pg:pg},'','#/'+pg);
 }
}

// 浏览器前进/后退
window.addEventListener('popstate',function(e){
 var pg=(e.state&&e.state.pg)?e.state.pg:currentRoute();
 if(pg!==cp){nav(pg)}
});

// 侧边栏点击
QA('.sb-nav a').forEach(function(a){a.addEventListener('click',function(){nav(this.dataset.pg)})});

// 页面刷新后保持当前模块
window.addEventListener('DOMContentLoaded',function(){
 // 如果URL有hash，用它覆盖localStorage
 var h=window.location.hash.replace(/^#\/?/,'');
 if(h&&titles[h]){localStorage.setItem('dyos_admin_pg',h)}
 // 初始化登录状态
 if(_token){
  Q('#lo').classList.remove('on');
  Q('#lu').textContent=(_user.name||_user.username||'管理员').charAt(0).toUpperCase();
  Q('#un').textContent=_user.name||_user.username||'管理员';
 }else{
  Q('#lo').classList.add('on');
 }
 var sp=currentRoute();
 nav(sp);
 // 初始hash（不触发popstate）
 if(!window.location.hash||window.location.hash===''){
  history.replaceState({pg:sp},'','#/'+sp);
 }
});
