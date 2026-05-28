// ====== 代理商端路由 ======
var cp='dashboard';
var titles={
 dashboard:['数据概览','代理端 / 数据概览'],merchants:['下属商户','核心业务 / 下属商户'],
 performance:['业绩统计','核心业务 / 业绩统计'],commission:['分佣结算','财务管理 / 分佣结算'],
 providers:['服务商管理','财务管理 / 服务商管理'],settlement:['结算记录','账户管理 / 结算记录'],
 profile:['个人中心','账户管理 / 个人中心']
};

function nav(pg){
 cp=pg;
 QA('.sb-nav a').forEach(function(a){a.classList.remove('ac')});
 var n=Q('.sb-nav a[data-pg="'+pg+'"]');if(n)n.classList.add('ac');
 Q('#pt').textContent=titles[pg][0];Q('#pb').textContent=titles[pg][1];
 load(pg);localStorage.setItem('dyos_agent_pg',pg)
}

function load(pg){
 var a=Q('#ca');
 switch(pg){
  case'dashboard':rd(a);break;case'merchants':rm(a);break;case'performance':rp(a);break;
  case'commission':rc(a);break;case'providers':rpr(a);break;case'settlement':rsl(a);break;
  case'profile':rpf(a);break
 }
}
