/**
 * 店赢OS - 商家管理模块
 * 包含：商家列表、商家详情、开通续费、权限配置、商家审核
 */

// 1. 商家列表
function renderMerchantsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家列表</h1>
        <p class="page-subtitle">管理所有入驻商家信息</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showAddMerchantModal()">
          <i data-lucide="plus"></i> 新增商家
        </button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商家总数</div>
          <div class="stat-value" data-animate="${App.data.merchants.length}">${App.data.merchants.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商家</div>
          <div class="stat-value" data-animate="${App.data.merchants.filter(m => m.status === 'active').length}">${App.data.merchants.filter(m => m.status === 'active').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">即将到期</div>
          <div class="stat-value" data-animate="${App.data.merchants.filter(m => m.status === 'expiring').length}">${App.data.merchants.filter(m => m.status === 'expiring').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger"><i data-lucide="user-x"></i></div>
        <div class="stat-content">
          <div class="stat-label">停用商家</div>
          <div class="stat-value" data-animate="${App.data.merchants.filter(m => m.status === 'inactive').length}">${App.data.merchants.filter(m => m.status === 'inactive').length}</div>
        </div>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">行业</span>
        <select class="filter-select" id="filterIndustry">
          <option value="">全部行业</option>
          <option value="餐饮">餐饮</option>
        </select>
      </div>
      <div class="filter-group">
        <span class="filter-label">版本</span>
        <select class="filter-select" id="filterVersion">
          <option value="">全部版本</option>
          <option value="旗舰版">旗舰版</option>
          <option value="专业版">专业版</option>
          <option value="免费版">免费版</option>
        </select>
      </div>
      <div class="filter-group">
        <span class="filter-label">状态</span>
        <select class="filter-select" id="filterStatus">
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="expiring">即将到期</option>
          <option value="inactive">停用</option>
        </select>
      </div>
      <div class="filter-group search-input">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索商家名称..." id="searchMerchant" style="width:200px">
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">商家列表</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="sortable" data-sort="name">商家名称 <span class="sort-icon"><i data-lucide="chevrons-up-down"></i></span></th>
              <th>行业</th>
              <th class="sortable" data-sort="version">版本 <span class="sort-icon"><i data-lucide="chevrons-up-down"></i></span></th>
              <th>状态</th>
              <th>注册时间</th>
              <th>到期时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="merchantsTableBody">
            ${renderMerchantsTable(App.data.merchants)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('filterVersion')?.addEventListener('change', filterMerchants);
    document.getElementById('filterStatus')?.addEventListener('change', filterMerchants);
    document.getElementById('searchMerchant')?.addEventListener('input', filterMerchants);

    // Animate stat values
    document.querySelectorAll('.stat-value[data-animate]').forEach(el => {
      animateStatValue(el, parseInt(el.dataset.animate));
    });
  }, 100);
}

function renderMerchantsTable(merchants) {
  return merchants.map(m => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar">${m.name.charAt(0)}</div>
          <span class="font-medium">${m.name}</span>
        </div>
      </td>
      <td>${m.industry}</td>
      <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
      <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
      <td>${m.registerTime}</td>
      <td class="${m.status === 'expiring' ? 'text-warning' : ''}">${m.expireTime}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="viewMerchantDetail(${m.id})" title="查看">
            <i data-lucide="eye"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="openUpgradeModal(${m.id})" title="开通/续费">
            <i data-lucide="credit-card"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="toggleMerchantStatus(${m.id})" title="${m.status === 'active' ? '停用' : '启用'}">
            <i data-lucide="${m.status === 'active' ? 'user-x' : 'user-check'}"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterMerchants() {
  const version = document.getElementById('filterVersion')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const search = (document.getElementById('searchMerchant')?.value || '').toLowerCase();
  
  let filtered = App.data.merchants.filter(m => {
    if (version && m.version !== version) return false;
    if (status && m.status !== status) return false;
    if (search && !m.name.toLowerCase().includes(search)) return false;
    return true;
  });
  
  document.getElementById('merchantsTableBody').innerHTML = renderMerchantsTable(filtered);
}

function showAddMerchantModal() {
  Modal.show(`
    <div class="modal-header">
      <h2 class="modal-title">新增商家</h2>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">商家名称 <span class="text-danger">*</span></label>
        <input type="text" class="form-input" placeholder="请输入商家名称">
      </div>
      <div class="form-group">
        <label class="form-label">行业类别 <span class="text-danger">*</span></label>
        <select class="form-select">
          <option value="">请选择行业</option>
          <option value="餐饮">餐饮</option>
          <option value="零售">零售</option>
          <option value="休娱">休娱</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">联系人</label>
        <input type="text" class="form-input" placeholder="请输入联系人姓名">
      </div>
      <div class="form-group">
        <label class="form-label">联系电话</label>
        <input type="tel" class="form-input" placeholder="请输入联系电话">
      </div>
      <div class="form-group">
        <label class="form-label">开通版本</label>
        <select class="form-select">
          <option value="免费版">免费版</option>
          <option value="专业版">专业版</option>
          <option value="旗舰版">旗舰版</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">取消</button>
      <button class="btn btn-primary" onclick="confirmAddMerchant()">确认添加</button>
    </div>
  `);
}

function confirmAddMerchant() {
  Toast.success('添加成功', '商家信息已添加');
  Modal.hide();
}

function viewMerchantDetail(id) {
  const merchant = App.data.merchants.find(m => m.id === id);
  if (!merchant) return;
  
  Modal.show(`
    <div class="modal-header">
      <h2 class="modal-title">商家详情</h2>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="detail-section">
        <h4 class="detail-title">基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">商家名称</span>
            <span class="detail-value">${merchant.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">行业</span>
            <span class="detail-value">${merchant.industry}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">版本</span>
            <span class="badge badge-${Utils.getVersionClass(merchant.version)}">${merchant.version}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="badge badge-${Utils.getStatusClass(merchant.status)}">${Utils.getStatusLabel(merchant.status)}</span>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h4 class="detail-title">经营数据</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">累计GMV</span>
            <span class="detail-value text-success">¥${merchant.gmv.toLocaleString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单数</span>
            <span class="detail-value">${merchant.orders.toLocaleString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">评分</span>
            <span class="detail-value">⭐ ${merchant.rating}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">AI使用量</span>
            <span class="detail-value">${merchant.aiUsage.toLocaleString()}次</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">关闭</button>
    </div>
  `, { large: true });
}

function openUpgradeModal(id) {
  const merchant = App.data.merchants.find(m => m.id === id);
  if (!merchant) return;
  
  Modal.show(`
    <div class="modal-header">
      <h2 class="modal-title">开通/续费 - ${merchant.name}</h2>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="upgrade-plans">
        <div class="upgrade-plan ${merchant.version === '免费版' ? 'selected' : ''}" data-version="免费版">
          <div class="plan-name">免费版</div>
          <div class="plan-price">¥0/年</div>
          <div class="plan-features">基础功能</div>
        </div>
        <div class="upgrade-plan ${merchant.version === '专业版' ? 'selected' : ''}" data-version="专业版">
          <div class="plan-name">专业版</div>
          <div class="plan-price">¥980/年</div>
          <div class="plan-features">完整AI套件</div>
        </div>
        <div class="upgrade-plan ${merchant.version === '旗舰版' ? 'selected' : ''}" data-version="旗舰版">
          <div class="plan-name">旗舰版</div>
          <div class="plan-price">¥2980/年</div>
          <div class="plan-features">全部AI能力</div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">取消</button>
      <button class="btn btn-primary" onclick="confirmUpgrade(${id})">确认开通</button>
    </div>
  `);
}

function confirmUpgrade(id) {
  Toast.success('开通成功', '商家版本已更新');
  Modal.hide();
}

function toggleMerchantStatus(id) {
  const merchant = App.data.merchants.find(m => m.id === id);
  if (!merchant) return;
  
  const action = merchant.status === 'active' ? '停用' : '启用';
  ConfirmDialog.show(
    `${action}商家`,
    `确定要${action}商家"${merchant.name}"吗？`,
    () => {
      Toast.success('操作成功', `商家已${action}`);
    },
    merchant.status === 'active'
  );
}

// 2. 商家详情
function renderMerchantDetailPage(container) {
  const merchant = App.data.merchants[0];
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家详情</h1>
        <p class="page-subtitle">查看商家详细信息</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="edit-2"></i> 编辑</button>
        <button class="btn btn-primary"><i data-lucide="credit-card"></i> 续费</button>
      </div>
    </div>
    
    <div class="detail-cards">
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="avatar lg">${merchant.name.charAt(0)}</div>
          <div>
            <h3 class="font-bold">${merchant.name}</h3>
            <span class="badge badge-${Utils.getVersionClass(merchant.version)}">${merchant.version}</span>
            <span class="badge badge-${Utils.getStatusClass(merchant.status)}">${Utils.getStatusLabel(merchant.status)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid-2 mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">基本信息</h3></div>
        <div class="detail-list">
          <div class="detail-row"><span class="detail-label">商家名称</span><span class="detail-value">${merchant.name}</span></div>
          <div class="detail-row"><span class="detail-label">行业</span><span class="detail-value">${merchant.industry}</span></div>
          <div class="detail-row"><span class="detail-label">注册时间</span><span class="detail-value">${merchant.registerTime}</span></div>
          <div class="detail-row"><span class="detail-label">到期时间</span><span class="detail-value">${merchant.expireTime}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">经营数据</h3></div>
        <div class="detail-list">
          <div class="detail-row"><span class="detail-label">累计GMV</span><span class="detail-value text-success">¥${merchant.gmv.toLocaleString()}</span></div>
          <div class="detail-row"><span class="detail-label">订单数</span><span class="detail-value">${merchant.orders.toLocaleString()}</span></div>
          <div class="detail-row"><span class="detail-label">评分</span><span class="detail-value">⭐ ${merchant.rating}</span></div>
          <div class="detail-row"><span class="detail-label">AI使用量</span><span class="detail-value">${merchant.aiUsage.toLocaleString()}次</span></div>
        </div>
      </div>
    </div>
  `;
}

// 3. 开通续费
function renderMerchantUpgradePage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">开通续费</h1>
        <p class="page-subtitle">商家版本管理和续费</p>
      </div>
    </div>
    
    <div class="filter-bar mb-6">
      <div class="filter-group">
        <span class="filter-label">商家</span>
        <select class="filter-select">
          <option value="">全部商家</option>
          ${App.data.merchants.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <span class="filter-label">版本</span>
        <select class="filter-select">
          <option value="">全部版本</option>
          <option value="旗舰版">旗舰版</option>
          <option value="专业版">专业版</option>
          <option value="免费版">免费版</option>
        </select>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead><tr><th>商家</th><th>当前版本</th><th>到期时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.merchants.map(m => `
            <tr>
              <td><div class="flex items-center gap-3"><div class="avatar sm">${m.name.charAt(0)}</div><span class="font-medium">${m.name}</span></div></td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td class="${m.status === 'expiring' ? 'text-warning' : ''}">${m.expireTime}</td>
              <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
              <td><button class="btn btn-primary btn-sm" onclick="openUpgradeModal(${m.id})">续费</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 4. 权限配置
function renderMerchantPermissionPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">权限配置</h1>
        <p class="page-subtitle">商家功能权限管理</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="save"></i> 保存配置</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">功能权限</h3></div>
      <div class="permission-list">
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-name">AI智能客服</div>
            <div class="permission-desc">7×24小时自动回复</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-name">数据分析看板</div>
            <div class="permission-desc">经营数据可视化</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-name">营销工具</div>
            <div class="permission-desc">优惠券、满减等活动</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-name">API接口</div>
            <div class="permission-desc">对接第三方系统</div>
          </div>
          <label class="switch"><input type="checkbox"><span class="switch-slider"></span></label>
        </div>
      </div>
    </div>
  `;
}

// 5. 商家审核
function renderMerchantAuditPage(container) {
  const pendingMerchants = App.data.merchants.filter(m => m.status === 'pending' || Math.random() > 0.7);
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家审核</h1>
        <p class="page-subtitle">新商家入驻审核管理</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-content"><div class="stat-label">待审核</div><div class="stat-value">${pendingMerchants.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">本月通过</div><div class="stat-value">12</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="x-circle"></i></div><div class="stat-content"><div class="stat-label">本月驳回</div><div class="stat-value">3</div></div></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">待审核商家</h3></div>
      <table>
        <thead><tr><th>商家名称</th><th>行业</th><th>申请时间</th><th>资质文件</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.merchants.slice(0, 5).map(m => `
            <tr>
              <td><div class="flex items-center gap-3"><div class="avatar sm">${m.name.charAt(0)}</div><span class="font-medium">${m.name}</span></div></td>
              <td>${m.industry}</td>
              <td>${m.registerTime}</td>
              <td><button class="btn btn-ghost btn-sm"><i data-lucide="file-text"></i> 查看</button></td>
              <td><span class="badge badge-warning">待审核</span></td>
              <td><button class="btn btn-primary btn-sm">通过</button><button class="btn btn-ghost btn-sm">驳回</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
