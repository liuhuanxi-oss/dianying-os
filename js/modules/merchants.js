// ====== 商户管理模块 ======
function rm(a){
 a.innerHTML='<div class="pn"><div class="pn-h"><div><h2>商户列表</h2><div class="pn-sub">管理平台所有入驻商户</div></div></div>'+
  '<div class="tb-bar"><input class="in" id="mk" placeholder="搜索商户名称..." style="width:240px"><select class="in sel" id="mi"><option value="">全部行业</option><option>餐饮</option><option>百货零售批发</option><option>商业生活服务</option><option>休闲娱乐</option><option>酒旅景区</option><option>医疗卫生</option><option>教育服务</option></select>'+
  '<button class="bt bt-p" id="msb">🔍 搜索</button><button class="bt bt-o" id="mrb">🔄 刷新</button></div><div class="tb-wrap" id="mtb"></div><div id="mpg"></div></div>';
 var p=1,kw='',ind='';
 var ld=async function(){
  Q('#mtb').innerHTML='<div class="ld"><span class="sp"></span>加载中...</div>';
  try{
   var pr='page='+p+'&size=20';if(kw)pr+='&keyword='+encodeURIComponent(kw);if(ind)pr+='&industry='+encodeURIComponent(ind);
   var r=await api('/merchants/?'+pr);var it=r.items||[];
   Q('#mtb').innerHTML=it.length?'<table><thead><tr><th>ID</th><th>商户名称</th><th>联系人</th><th>行业</th><th>归属机构</th><th>状态</th><th>入驻时间</th><th>操作</th></tr></thead><tbody>'+it.map(function(m){return'<tr><td>'+(m.id||'-')+'</td><td style="color:#fff;font-weight:500">'+(m.name||'-')+'</td><td>'+(m.contact||'-')+'</td><td>'+(m.industry||'-')+'</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis">'+(m.org_name||'-')+'</td><td><span class="tg '+(m.status==='APPROVED'?'tg-ok':'tg-i')+'">'+(m.status==='APPROVED'?'已审核':(m.status||'-'))+'</span></td><td>'+(m.create_time||'').substring(0,10)+'</td><td><button class="bt bt-o bt-s" onclick="vmd('+m.id+')">详情</button></td></tr>'}).join('')+'</tbody></table>':'<div class="em">暂无商户数据</div>';
   pgR(Q('#mpg'),p,r.total||0,20,function(np){p=np;ld()});Q('#mc').textContent=(r.total||0).toLocaleString()
  }catch(e){Q('#mtb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'}
 };
 Q('#msb').addEventListener('click',function(){kw=Q('#mk').value.trim();ind=Q('#mi').value;p=1;ld()});
 Q('#mrb').addEventListener('click',function(){p=1;ld()});
 Q('#mk').addEventListener('keyup',function(e){if(e.key==='Enter'){kw=Q('#mk').value.trim();ind=Q('#mi').value;p=1;ld()}});
 ld()
}

function vmd(id){
 om('商户详情','<div class="ld"><span class="sp"></span>加载中...</div>');
 try{
  api('/merchants/'+id).then(function(r){
   var m=r.merchant||{};
   Q('#mb').innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;font-size:13px;">'+
    '<div style="color:var(--t3);font-size:12px;">商户编号</div><div>'+(r.mno||'-')+'</div><div style="color:var(--t3);font-size:12px;">商户简称</div><div>'+(r.name||'-')+'</div>'+
    '<div style="color:var(--t3);font-size:12px;">注册名称</div><div>'+(m.reg_name||'-')+'</div><div style="color:var(--t3);font-size:12px;">法人</div><div>'+(m.legal_person||'-')+'</div>'+
    '<div style="color:var(--t3);font-size:12px;">联系人</div><div>'+(r.contact||'-')+'</div><div style="color:var(--t3);font-size:12px;">行业/品类</div><div>'+(r.industry||'-')+' / '+(r.category||'-')+'</div>'+
    '<div style="color:var(--t3);font-size:12px;">开户行</div><div>'+(m.bank_name||'-')+'</div><div style="color:var(--t3);font-size:12px;">结算方式</div><div>'+(m.settle_method||'-')+' / '+(m.settle_type||'-')+'</div>'+
    '<div style="color:var(--t3);font-size:12px;">微信子商户号</div><div>'+(m.wx_sub_mch_id||'-')+'</div><div style="color:var(--t3);font-size:12px;">支付宝子商户号</div><div>'+(m.ali_sub_mch_id||'-')+'</div>'+
    '<div style="color:var(--t3);font-size:12px;">归属机构</div><div>'+(m.org_name||'-')+'</div><div style="color:var(--t3);font-size:12px;">业务员</div><div>'+(m.salesman||'-')+'</div>'+
   '</div>'
  }).catch(function(e){Q('#mb').innerHTML='<div class="em">加载失败: '+e.message+'</div>'})
 }catch(e){}
}
