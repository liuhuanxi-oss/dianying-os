// ====== 商家端路由 ======
var cp='dashboard';
var titles={dashboard:'经营概览',reviews:'评价管理',complaints:'支付投诉',finance:'财务管理',pricing:'智能定价',members:'会员管理',sentiment:'舆情监控',reports:'数据报表',contentgen:'AI内容生成',settings:'门店设置'};

function nav(pg){
 cp=pg;QA('.sb-nav a').forEach(function(a){a.classList.remove('ac')});
 var n=Q('.sb-nav a[data-pg="'+pg+'"]');if(n)n.classList.add('ac');
 Q('#pt').textContent=titles[pg];load(pg);localStorage.setItem('dyos_merchant_pg',pg)
}

function load(pg){
 var a=Q('#ca');
 switch(pg){
  case'dashboard':rd(a);break;case'reviews':rr(a);break;case'complaints':rc(a);break;
  case'finance':rf(a);break;case'pricing':rp(a);break;case'members':rmb(a);break;
  case'sentiment':rse(a);break;case'reports':rrp(a);break;case'contentgen':rcg(a);break;case'settings':rst(a);break
 }
}
