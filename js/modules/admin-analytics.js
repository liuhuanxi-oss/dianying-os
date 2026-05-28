/**
 * 店赢OS - 数据洞察模块
 * 包含：平台总览、行业报告、AI统计、流失预警
 */

// 平台总览 (Dashboard)
function renderOverviewPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">平台总览</h1>
        <p class="page-subtitle">店赢OS核心数据指标</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="download"></i> 导出报告</button>
        <button class="btn btn-primary"><i data-lucide="refresh-cw"></i> 刷新数据</button>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商家总数</div>
          <div class="stat-value" data-animate="12856">0</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> +12.5%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月GMV</div>
          <div class="stat-value">¥${(App.data.merchants.reduce((s,m)=>s+m.gmv,0)/10000).toFixed(0)}万</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> +8.3%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="trending-up"></i></div>
        <div class="stat-content">
          <div class="stat-label">月环比</div>
          <div class="stat-value text-success">+12.5%</div>
          <div class="stat-change positive"><i data-lucide="arrow-up"></i> 持续增长</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="cpu"></i></div>
        <div class="stat-content">
          <div class="stat-label">AI调用量</div>
          <div class="stat-value" data-animate="${(App.data.merchants.reduce((s,m)=>s+m.aiUsage,0))}">0</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> +25.6%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid mb-6">
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">月度GMV趋势</h3>
          <div class="chart-actions">
            <button class="chart-btn active">近30天</button>
            <button class="chart-btn">近90天</button>
          </div>
        </div>
        <div class="chart-wrapper" style="height:280px">
          <canvas id="overviewGmvChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">行业分布</h3>
        </div>
        <div class="chart-wrapper" style="height:280px">
          <canvas id="overviewIndustryChart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3 class="card-title"><i data-lucide="zap"></i> 近期动态</h3></div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon success"><i data-lucide="user-plus"></i></div>
            <div class="activity-content">
              <div class="activity-text">新增商家 <strong>北京湘菜馆</strong></div>
              <div class="activity-time">3分钟前</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon primary"><i data-lucide="credit-card"></i></div>
            <div class="activity-content">
              <div class="activity-text">商家 <strong>深圳火锅店</strong> 升级至旗舰版</div>
              <div class="activity-time">15分钟前</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon warning"><i data-lucide="alert-triangle"></i></div>
            <div class="activity-content">
              <div class="activity-text">商家 <strong>成都串串香</strong> 即将到期</div>
              <div class="activity-time">1小时前</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon success"><i data-lucide="check-circle"></i></div>
            <div class="activity-content">
              <div class="activity-text">工单 <strong>TK202412001</strong> 已解决</div>
              <div class="activity-time">2小时前</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title"><i data-lucide="trophy"></i> TOP商家</h3></div>
        <div class="top-merchants">
          ${App.data.merchants.sort((a,b)=>b.gmv-a.gmv).slice(0,5).map((m,i)=>`
            <div class="top-merchant-item">
              <span class="rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span>
              <div class="merchant-info">
                <span class="merchant-name">${m.name}</span>
                <span class="merchant-gmv">¥${(m.gmv/10000).toFixed(0)}万</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    // Animate stat values
    document.querySelectorAll('.stat-value[data-animate]').forEach(el => {
      animateStatValue(el, parseInt(el.dataset.animate));
    });
    
    // GMV趋势图
    new Chart(document.getElementById('overviewGmvChart'), {
      type: 'line',
      data: {
        labels: App.data.revenueTrend.map(r=>r.month),
        datasets: [{
          label: 'GMV',
          data: App.data.revenueTrend.map(r=>r.amount),
          borderColor: '#5e6ad2',
          backgroundColor: 'rgba(94,106,210,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }
        }
      }
    });
    
    // 行业分布图
    new Chart(document.getElementById('overviewIndustryChart'), {
      type: 'doughnut',
      data: {
        labels: ['餐饮', '零售', '休娱', '健身', '教育'],
        datasets: [{
          data: [3200, 1800, 950, 1200, 680],
          backgroundColor: ['#5e6ad2', '#00b8cc', '#10b981', '#f59e0b', '#ec4899'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', padding: 16 } } }
      }
    });
  }, 100);
}

// 行业报告
function renderIndustryReportPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">行业报告</h1>
        <p class="page-subtitle">各行业商家数据分析</p>
      </div>
    </div>
    
    <div class="tabs mb-4">
      <button class="tab active" data-tab="catering">餐饮行业</button>
      <button class="tab" data-tab="retail">零售行业</button>
      <button class="tab" data-tab="entertainment">休娱行业</button>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-content"><div class="stat-label">商家数</div><div class="stat-value">3,200</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">平均GMV</div><div class="stat-value">¥56.8万</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">平均评分</div><div class="stat-value">4.5 ⭐</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">AI使用率</div><div class="stat-value">72%</div></div></div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-header"><h3 class="chart-title">行业雷达图</h3></div>
        <div class="chart-wrapper" style="height:350px"><canvas id="radarChart"></canvas></div>
      </div>
      <div class="chart-container">
        <div class="chart-header"><h3 class="chart-title">增长趋势</h3></div>
        <div class="chart-wrapper" style="height:350px"><canvas id="growthChart"></canvas></div>
      </div>
    </div>
  `;
  setTimeout(() => {
    new Chart(document.getElementById('radarChart'), {
      type: 'radar',
      data: {
        labels: ['商家数', 'GMV', '评分', 'AI使用率', '续费率'],
        datasets: [{ label: '餐饮', data: [85, 72, 88, 72, 85], borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.2)' }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#6b6b7b' } } } }
    });
    
    new Chart(document.getElementById('growthChart'), {
      type: 'bar',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{ label: '新商家', data: [120, 145, 168, 192, 215, 245], backgroundColor: '#5e6ad2' }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
  }, 100);
}

// AI使用统计
function renderAIStatsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI使用统计</h1>
        <p class="page-subtitle">各Agent调用量分析</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="cpu"></i></div><div class="stat-content"><div class="stat-label">总调用量</div><div class="stat-value" data-animate="85000">0</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="zap"></i></div><div class="stat-content"><div class="stat-label">Token消耗</div><div class="stat-value">3.25亿</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="wallet"></i></div><div class="stat-content"><div class="stat-label">成本</div><div class="stat-value">¥12,580</div></div></div>
    </div>
    
    <div class="chart-container mb-6">
      <div class="chart-header"><h3 class="chart-title">各Agent调用量分布</h3></div>
      <div class="chart-wrapper" style="height:350px"><canvas id="aiCallsChart"></canvas></div>
    </div>
    <div class="chart-container">
      <div class="chart-header"><h3 class="chart-title">Token消耗趋势</h3></div>
      <div class="chart-wrapper" style="height:300px"><canvas id="tokenTrendChart"></canvas></div>
    </div>
  `;
  setTimeout(() => {
    document.querySelectorAll('.stat-value[data-animate]').forEach(el => {
      animateStatValue(el, parseInt(el.dataset.animate));
    });
    
    new Chart(document.getElementById('aiCallsChart'), {
      type: 'bar',
      data: {
        labels: ['智能客服', '营销助手', '数据分析', '海报设计', '运营建议'],
        datasets: [{ label: '调用量', data: [29500, 24200, 20500, 12000, 9500], backgroundColor: ['#5e6ad2', '#00b8cc', '#10b981', '#f59e0b', '#ef4444'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
    
    new Chart(document.getElementById('tokenTrendChart'), {
      type: 'line',
      data: {
        labels: App.data.revenueTrend.map(r=>r.month),
        datasets: [{ label: 'Token', data: App.data.aiUsage?.tokens || [1250000, 1380000, 1520000, 1680000, 1850000, 2020000, 2200000, 2380000, 2580000, 2800000, 3020000, 3250000], borderColor: '#00b8cc', fill: true, tension: 0.4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
  }, 100);
}

// 流失预警
function renderChurnWarningPage(container) {
  const churnData = [
    { id: 1, merchant: '重庆小面', riskLevel: 'high', probability: 78, lastActive: '2024-11-15', reason: '连续30天未登录', suggestion: '立即电话回访' },
    { id: 2, merchant: '合肥小龙虾', riskLevel: 'high', probability: 72, lastActive: '2024-11-18', reason: '功能使用率下降80%', suggestion: '发送专属优惠券' },
    { id: 3, merchant: '厦门沙茶面', riskLevel: 'medium', probability: 55, lastActive: '2024-11-25', reason: '近期差评增加', suggestion: '关注评价回复' },
    { id: 4, merchant: '天津包子铺', riskLevel: 'medium', probability: 48, lastActive: '2024-11-28', reason: '订单量持续下滑', suggestion: '推送营销方案' },
    { id: 5, merchant: '哈尔滨饺子馆', riskLevel: 'low', probability: 25, lastActive: '2024-12-01', reason: '版本即将到期', suggestion: '发送续费提醒' }
  ];
  
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">流失预警</h1>
        <p class="page-subtitle">高风险商家预警和干预</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-content"><div class="stat-label">高风险</div><div class="stat-value">${churnData.filter(c=>c.riskLevel==='high').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="alert-circle"></i></div><div class="stat-content"><div class="stat-label">中风险</div><div class="stat-value">${churnData.filter(c=>c.riskLevel==='medium').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">低风险</div><div class="stat-value">${churnData.filter(c=>c.riskLevel==='low').length}</div></div></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">预警列表</h3></div>
      <table>
        <thead><tr><th>商家</th><th>风险等级</th><th>流失概率</th><th>最后活跃</th><th>原因</th><th>建议操作</th><th>操作</th></tr></thead>
        <tbody>
          ${churnData.map(c => `
            <tr class="${c.riskLevel==='high'?'text-danger':c.riskLevel==='medium'?'text-warning':''}">
              <td class="font-medium">${c.merchant}</td>
              <td><span class="badge badge-${c.riskLevel==='high'?'danger':c.riskLevel==='medium'?'warning':'success'}">${c.riskLevel==='high'?'高':c.riskLevel==='medium'?'中':'低'}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:${c.probability}%"></div></div>
                  <span>${c.probability}%</span>
                </div>
              </td>
              <td>${c.lastActive}</td>
              <td>${c.reason}</td>
              <td><span class="text-accent">${c.suggestion}</span></td>
              <td><button class="btn btn-primary btn-sm" onclick="Toast.info('已通知','客服团队已收到提醒')">干预</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
