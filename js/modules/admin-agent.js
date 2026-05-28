/**
 * 店赢OS - 代理商模块
 */
function renderAgentsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">代理商管理</h1><p class="page-subtitle">代理商体系管理</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新增代理</button></div></div>
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="users"></i></div><div class="stat-content"><div class="stat-label">代理商总数</div><div class="stat-value">${App.data.agents.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="store"></i></div><div class="stat-content"><div class="stat-label">覆盖商家</div><div class="stat-value">${App.data.agents.reduce((s,a)=>s+a.merchants,0)}</div></div></div>
    </div>
    <div class="table-container"><table><thead><tr><th>代理商</th><th>等级</th><th>商家数</th><th>月GMV</th><th>状态</th><th>操作</th></tr></thead><tbody>${App.data.agents.map(a=>`<tr><td><div class="flex items-center gap-3"><div class="avatar sm">${a.name.charAt(0)}</div><span class="font-medium">${a.name}</span></div></td><td><span class="badge badge-${Utils.getLevelClass(a.level)}">${Utils.getLevelLabel(a.level)}</span></td><td>${a.merchants}</td><td>¥${(a.monthlyGmv/10000).toFixed(0)}万</td><td><span class="badge badge-${Utils.getStatusClass(a.status)}">${Utils.getStatusLabel(a.status)}</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button><button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i></button></td></tr>`).join('')}</tbody></table></div>`;
}
function renderAgentMerchantsPage(container) { container.innerHTML += `<div class="page-header"><div><h1 class="page-title">下级商家</h1><p class="page-subtitle">代理商下级商家管理</p></div></div><div class="table-container"><table><thead><tr><th>商家名称</th><th>上级代理</th><th>版本</th><th>状态</th></tr></thead><tbody>${App.data.merchants.map(m=>`<tr><td>${m.name}</td><td>华东区代理中心</td><td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td><td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td></tr>`).join('')}</tbody></table></div>`; }
function renderAgentCommissionPage(container) { container.innerHTML += `<div class="page-header"><div><h1 class="page-title">佣金分润</h1><p class="page-subtitle">代理商佣金结算</p></div></div><div class="card"><div class="card-header"><h3 class="card-title">分润规则</h3></div><div class="detail-list"><div class="detail-row"><span class="detail-label">佣金比例</span><span class="detail-value text-primary">10%</span></div></div></div>`; }
function renderServiceProvidersPage(container) { container.innerHTML += `<div class="page-header"><div><h1 class="page-title">服务商管理</h1><p class="page-subtitle">第三方服务商管理</p></div></div><div class="table-container"><table><thead><tr><th>服务商名称</th><th>服务范围</th><th>资质状态</th><th>操作</th></tr></thead><tbody><tr><td>杭州技术服务公司</td><td>技术支持</td><td><span class="badge badge-success">已认证</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button></td></tr></tbody></table></div>`; }
function renderAgentDashboardPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">代理商看板</h1><p class="page-subtitle">代理商整体运营数据概览</p></div></div>
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="users"></i></div><div class="stat-content"><div class="stat-label">代理商总数</div><div class="stat-value">${App.data.agents.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="store"></i></div><div class="stat-content"><div class="stat-label">覆盖商家</div><div class="stat-value">${App.data.agents.reduce((s,a)=>s+a.merchants,0)}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="wallet"></i></div><div class="stat-content"><div class="stat-label">总GMV</div><div class="stat-value">¥${(App.data.agents.reduce((s,a)=>s+a.monthlyGmv,0)/10000).toFixed(0)}万</div></div></div>
    </div>
    <div class="charts-grid"><div class="chart-container"><div class="chart-header"><h3 class="chart-title">拓店趋势</h3></div><div class="chart-wrapper" style="height:250px"><canvas id="agentTrendChart"></canvas></div></div></div>`;
  setTimeout(()=>{ new Chart(document.getElementById('agentTrendChart'),{type:'line',data:{labels:['7月','8月','9月','10月','11月','12月'],datasets:[{label:'新增商家数',data:[45,52,48,65,72,85],borderColor:'#5e6ad2',fill:true,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#6b6b7b'}},y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#6b6b7b'}}}}})},100);
}
