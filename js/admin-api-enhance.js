/**
 * 店赢OS - API增强脚本
 * 覆盖原有函数以支持API调用
 * 在admin.js之后加载
 */

(function() {
  'use strict';
  
  // ============================================
  // 增强商家列表页面
  // ============================================
  
  const originalRenderMerchantsPage = window.renderMerchantsPage;
  
  window.renderMerchantsPage = async function(container) {
    // 如果API不可用或没有API客户端，使用原函数
    if (!window.API || !API.merchants) {
      return originalRenderMerchantsPage.call(this, container);
    }
    
    // 显示加载状态
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">商家列表</h1>
          <p class="page-subtitle">管理所有入驻商家 <span class="badge badge-success" style="font-size:10px;padding:2px 6px;">API</span></p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="showAddMerchantModal()">
            <i data-lucide="plus"></i> 新增商家
          </button>
        </div>
      </div>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    `;
    lucide.createIcons();
    
    try {
      // 尝试从API获取数据
      let result;
      if (App.useAPI) {
        result = await API.merchants.list({page: 1, size: 100});
      }
      
      // Fallback到Mock数据
      if (!result || !result.items || result.items.length === 0) {
        result = API.merchants.mockList();
      }
      
      const merchants = result.items || result || [];
      window._merchantData = merchants;
      
      const stats = {
        total: merchants.length,
        active: merchants.filter(m => m.status === 'active').length,
        expiring: merchants.filter(m => m.status === 'expiring').length,
        inactive: merchants.filter(m => m.status === 'inactive').length
      };
      
      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">商家列表</h1>
            <p class="page-subtitle">管理所有入驻商家 ${App.useAPI ? '<span class="badge badge-success" style="font-size:10px;padding:2px 6px;">API</span>' : '<span class="badge badge-warning" style="font-size:10px;padding:2px 6px;">MOCK</span>'}</p>
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
              <div class="stat-value">${stats.total}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
            <div class="stat-content">
              <div class="stat-label">活跃商家</div>
              <div class="stat-value">${stats.active}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
            <div class="stat-content">
              <div class="stat-label">即将到期</div>
              <div class="stat-value">${stats.expiring}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger"><i data-lucide="user-x"></i></div>
            <div class="stat-content">
              <div class="stat-label">停用商家</div>
              <div class="stat-value">${stats.inactive}</div>
            </div>
          </div>
        </div>
        
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">状态</span>
            <select class="filter-select" id="filterStatus">
              <option value="">全部</option>
              <option value="active">正常</option>
              <option value="expiring">即将到期</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">版本</span>
            <select class="filter-select" id="filterVersion">
              <option value="">全部</option>
              <option value="免费版">免费版</option>
              <option value="专业版">专业版</option>
              <option value="旗舰版">旗舰版</option>
            </select>
          </div>
          <div class="filter-group">
            <input type="text" class="filter-input" id="searchMerchant" placeholder="搜索商家名称...">
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>商家名称</th>
                <th>行业</th>
                <th>版本</th>
                <th>状态</th>
                <th>注册时间</th>
                <th>到期时间</th>
                <th>GMV</th>
                <th>订单数</th>
                <th>AI使用</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="merchantsTableBody">
              ${renderMerchantTableHTML(merchants)}
            </tbody>
          </table>
        </div>
      `;
      
      lucide.createIcons();
      
      // 绑定筛选事件
      document.getElementById('filterVersion')?.addEventListener('change', filterMerchants);
      document.getElementById('filterStatus')?.addEventListener('change', filterMerchants);
      document.getElementById('searchMerchant')?.addEventListener('input', debounce(filterMerchants, 300));
      
    } catch (e) {
      console.error('加载商家列表失败:', e);
      container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">商家列表</h1>
          <p class="page-subtitle">管理所有入驻商家</p>
        </div>
        <div class="card">
          <p class="text-danger">加载失败: ${e.message}</p>
          <button class="btn btn-primary" onclick="renderMerchantsPage(document.getElementById('contentArea'))">重试</button>
        </div>
      `;
    }
  };
  
  // 渲染商家表格HTML
  function renderMerchantTableHTML(merchants) {
    return merchants.map(m => {
      const statusClass = getStatusClass(m.status);
      const statusLabel = getStatusLabel(m.status);
      const versionClass = m.version === '旗舰版' ? 'primary' : m.version === '专业版' ? 'info' : 'gray';
      
      return `
        <tr>
          <td class="font-medium">${m.name}</td>
          <td>${m.industry || '餐饮'}</td>
          <td><span class="badge badge-${versionClass}">${m.version || '免费版'}</span></td>
          <td><span class="badge badge-${statusClass}">${statusLabel}</span></td>
          <td>${m.registerTime || m.register_time || '-'}</td>
          <td>${m.expireTime || m.expire_time || '-'}</td>
          <td class="text-success">¥${formatMoney(m.gmv || 0)}</td>
          <td>${(m.orders || 0).toLocaleString()}</td>
          <td>${m.aiUsage || 0}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="viewMerchantDetail(${m.id})">
              <i data-lucide="eye"></i>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="editMerchantById(${m.id})">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="btn btn-ghost btn-sm text-danger" onclick="deleteMerchantById(${m.id})">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  // 筛选商家
  function filterMerchants() {
    const status = document.getElementById('filterStatus')?.value || '';
    const version = document.getElementById('filterVersion')?.value || '';
    const keyword = document.getElementById('searchMerchant')?.value || '';
    
    let filtered = window._merchantData || App.data.merchants;
    
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    if (version) {
      filtered = filtered.filter(m => m.version === version);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(m => 
        (m.name && m.name.toLowerCase().includes(kw)) ||
        (m.contact && m.contact.toLowerCase().includes(kw))
      );
    }
    
    const tbody = document.getElementById('merchantsTableBody');
    if (tbody) {
      tbody.innerHTML = renderMerchantTableHTML(filtered);
      lucide.createIcons({nodes: tbody.querySelectorAll('i[data-lucide]')});
    }
  }
  
  // 辅助函数
  function getStatusClass(status) {
    const map = {
      'active': 'success', 'inactive': 'gray', 'expiring': 'warning',
      'pending': 'warning', 'success': 'success', 'failed': 'danger'
    };
    return map[status] || 'gray';
  }
  
  function getStatusLabel(status) {
    const map = {
      'active': '正常', 'inactive': '停用', 'expiring': '即将到期',
      'pending': '待处理', 'success': '成功', 'failed': '失败'
    };
    return map[status] || status;
  }
  
  function formatMoney(amount) {
    if (amount >= 10000) {
      return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toLocaleString();
  }
  
  function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  // ============================================
  // 增强商家操作函数
  // ============================================
  
  // 编辑商家
  window.editMerchantById = async function(id) {
    let merchant = null;
    
    // 尝试从API获取
    if (App.useAPI && API.merchants) {
      try {
        merchant = await API.merchants.get(id);
      } catch (e) {}
    }
    
    // Fallback到本地数据
    if (!merchant) {
      merchant = (window._merchantData || App.data.merchants).find(m => m.id === id);
    }
    
    if (!merchant) {
      UI.error('商家不存在');
      return;
    }
    
    const ind = merchant.industry || '餐饮';
    const ver = merchant.version || '免费版';
    
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">编辑商家</h2>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
      </div>
      <form id="editMerchantForm" class="modal-body">
        <div class="form-group">
          <label class="form-label">商家名称</label>
          <input type="text" class="form-input" name="name" value="${merchant.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">行业</label>
          <select class="form-select" name="industry">
            <option value="餐饮" ${ind === '餐饮' ? 'selected' : ''}>餐饮</option>
            <option value="零售" ${ind === '零售' ? 'selected' : ''}>零售</option>
            <option value="服务" ${ind === '服务' ? 'selected' : ''}>服务</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">版本</label>
          <select class="form-select" name="version">
            <option value="免费版" ${ver === '免费版' ? 'selected' : ''}>免费版</option>
            <option value="专业版" ${ver === '专业版' ? 'selected' : ''}>专业版</option>
            <option value="旗舰版" ${ver === '旗舰版' ? 'selected' : ''}>旗舰版</option>
          </select>
        </div>
        <input type="hidden" name="id" value="${id}">
      </form>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="submitEditMerchant()">保存</button>
      </div>
    `);
    lucide.createIcons();
  };
  
  // 提交编辑
  window.submitEditMerchant = async function() {
    const form = document.getElementById('editMerchantForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = parseInt(data.id);
    
    try {
      if (App.useAPI && API.merchants) {
        await API.merchants.update(id, data);
      } else {
        const idx = App.data.merchants.findIndex(m => m.id === id);
        if (idx !== -1) {
          App.data.merchants[idx] = { ...App.data.merchants[idx], ...data };
        }
      }
      
      closeModal();
      UI.success('商家信息已更新');
      
      // 刷新表格
      if (App.currentPage === 'merchants') {
        renderMerchantsPage(document.getElementById('contentArea'));
      }
    } catch (e) {
      UI.error('更新失败: ' + e.message);
    }
  };
  
  // 删除商家
  window.deleteMerchantById = async function(id) {
    const confirmed = await UI.confirm('删除商家', '确定要删除该商家吗？此操作不可撤销。');
    if (!confirmed) return;
    
    try {
      if (App.useAPI && API.merchants) {
        await API.merchants.delete(id);
      } else {
        App.data.merchants = App.data.merchants.filter(m => m.id !== id);
        if (window._merchantData) {
          window._merchantData = window._merchantData.filter(m => m.id !== id);
        }
      }
      
      UI.success('商家已删除');
      
      if (App.currentPage === 'merchants') {
        renderMerchantsPage(document.getElementById('contentArea'));
      }
    } catch (e) {
      UI.error('删除失败: ' + e.message);
    }
  };
  
  // 提交新增
  const originalSubmitAddMerchant = window.submitAddMerchant;
  window.submitAddMerchant = async function() {
    const form = document.getElementById('addMerchantForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.name.trim()) {
      UI.error('请输入商家名称');
      return;
    }
    
    try {
      if (App.useAPI && API.merchants) {
        await API.merchants.create(data);
      } else {
        const newId = Math.max(...App.data.merchants.map(m => m.id), 0) + 1;
        const now = new Date().toISOString().split('T')[0];
        App.data.merchants.unshift({
          id: newId,
          name: data.name,
          industry: data.industry || '餐饮',
          version: data.version || '免费版',
          status: 'pending',
          registerTime: now,
          expireTime: now,
          gmv: 0,
          orders: 0,
          rating: 5.0,
          aiUsage: 0,
          ...data
        });
      }
      
      closeModal();
      UI.success('商家创建成功');
      
      if (App.currentPage === 'merchants') {
        renderMerchantsPage(document.getElementById('contentArea'));
      }
    } catch (e) {
      UI.error('创建失败: ' + e.message);
    }
  };
  
  console.log('店赢OS: API增强脚本已加载');
})();
