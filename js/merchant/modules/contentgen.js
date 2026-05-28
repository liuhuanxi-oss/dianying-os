// ====== 商家端 - AI内容生成 ======
async function rcg(a){
 a.innerHTML='<div class="pn"><h2 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:14px;">AI内容生成</h2><div class="pn-sub">一键生成评价回复、营销文案、公告通知等</div>'+
  '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><select class="in sel" id="cgt" style="width:150px"><option value="review_reply">评价回复</option><option value="marketing">营销文案</option><option value="notice">公告通知</option></select>'+
  '<input class="in" id="cgp" placeholder="输入生成提示..." style="width:350px"><button class="bt bt-p" id="cgg">🤖 生成</button></div><div id="cgr" style="margin-top:14px"></div></div>';
 Q('#cgg').addEventListener('click',async function(){
  var t=Q('#cgt').value,pr=Q('#cgp').value;if(!pr){ta('请输入提示','er');return}
  ta('AI生成中...','in');
  try{var r=await api('/content-gen',{m:'POST',b:JSON.stringify({type:t,prompt:pr})});Q('#cgr').innerHTML='<div style="padding:16px;background:var(--bg3);border-radius:6px;border-left:3px solid var(--gold)">'+(r.result||r.content||'生成完成')+'</div>';ta('生成完成','ok')}catch(e){ta('生成失败','er')}
 })
}
