/**
 * 店赢OS - 商家端独立初始化
 * 解决：菜单不显示、页面空白问题
 */

// 商家端菜单配置
const merchantMenuConfig = [
  {
    section: '核心功能',
    icon: 'layout-dashboard',
    items: [
      { id: 'merchant-overview', name: '运营概览', icon: 'layout-dashboard' },
      { id: 'merchant-ai-chat', name: 'AI对话', icon: 'bot' },
      { id: 'merchant-report', name: '数据报表', icon: 'bar-chart' },
      { id: 'merchant-alipay', name: 'AI支付宝', icon: 'qr-code' },
      { id: 'merchant-knowledge', name: '知识库', icon: 'book-open' },
      { id: 'merchant-log', name: '决策日志', icon: 'history' }
    ]
  },
  {
    section: '智能分析',
    icon: 'heart-pulse',
    items: [
      { id: 'merchant-health', name: '门店健康', icon: 'heart-pulse' },
      { id: 'merchant-calendar', name: '运营日历', icon: 'calendar' },
      { id: 'merchant-report-center', name: '报表中心', icon: 'file-spreadsheet' },
      { id: 'merchant-roi', name: 'ROI计算', icon: 'calculator' },
      { id: 'merchant-competitor', name: '竞品监控', icon: 'radar' },
      { id: 'merchant-inventory', name: '库存预警', icon: 'package' }
    ]
  },
  {
    section: 'AI能力',
    icon: 'sparkles',
    items: [
      { id: 'merchant-marketing', name: 'AI内容创作', icon: 'sparkles' },
      { id: 'merchant-insight', name: 'AI洞察日报', icon: 'newspaper' },
      { id: 'merchant-digital', name: '门店数字孪生', icon: 'scan' },
      { id: 'merchant-voice', name: '语音交互', icon: 'mic' }
    ]
  },
  {
    section: '运营管理',
    icon: 'store',
    items: [
      { id: 'merchant-campaigns', name: '营销工具', icon: 'megaphone' },
      { id: 'merchant-tickets', name: '工单系统', icon: 'ticket' },
      { id: 'merchant-permission', name: '权限管理', icon: 'shield' },
      { id: 'merchant-notify', name: '消息通知', icon: 'bell' },
      { id: 'merchant-multi-store', name: '多门店管理', icon: 'building-2' },
      { id: 'merchant-member', name: '会员体系', icon: 'users' },
      { id: 'merchant-payment', name: '支付分账', icon: 'credit-card' },
      { id: 'merchant-supply', name: '供应链管理', icon: 'truck' },
      { id: 'merchant-pricing', name: '智能定价', icon: 'trending-up' }
    ]
  },
  {
    section: '系统',
    icon: 'settings',
    items: [
      { id: 'merchant-changelog', name: '更新日志', icon: 'git-branch' },
      { id: 'merchant-alert', name: '智能预警', icon: 'alert-triangle' },
      { id: 'merchant-inspect', name: '门店巡检', icon: 'clipboard-check' },
      { id: 'merchant-deploy', name: '私有化部署', icon: 'cloud' },
      { id: 'merchant-export', name: '数据导出', icon: 'download' }
    ]
  }
];

// 当前激活的菜单项
let currentMerchantPage = 'merchant-overview';

// 渲染商家端侧边栏
function renderMerchantSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let html = `
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon"><i data-lucide="store"></i></div>
        <div class="logo-text">
          <div class="logo-title">店赢OS</div>
          <div class="logo-subtitle">商家端</div>
        </div>
      </div>
    </div>
    
    <div class="sidebar-menu">
  `;

  merchantMenuConfig.forEach(section => {
    html += `<div class="menu-section">
      <div class="menu-section-title"><i data-lucide="${section.icon}"></i> ${section.section}</div>
    `;
    
    section.items.forEach(item => {
      const isActive = currentMerchantPage === item.id ? 'active' : '';
      html += `<div class="menu-item ${isActive}" onclick="navigateMerchant('${item.id}')">
        <i data-lucide="${item.icon}"></i>
        <span>${item.name}</span>
      </div>`;
    });
    
    html += `</div>`;
  });

  html += `
    </div>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar"><i data-lucide="user"></i></div>
        <div class="user-details">
          <div class="user-name">演示商家</div>
          <div class="user-role">旗舰版</div>
        </div>
      </div>
    </div>
  `;

  sidebar.innerHTML = html;
  lucide.createIcons();
}

// 商家端页面路由
function navigateMerchant(pageId) {
  currentMerchantPage = pageId;
  renderMerchantSidebar();
  
  const content = document.getElementById('contentArea');
  if (!content) return;
  
  // 显示加载
  content.innerHTML = `<div class="page-content" style="animation:fadeIn 0.3s ease"><div class="loading-spinner"><i data-lucide="loader-2" class="animate-spin"></i> 加载中...</div></div>`;
  lucide.createIcons();
  
  // 渲染页面
  setTimeout(() => {
    if (typeof merchantPages !== 'undefined' && merchantPages[pageId]) {
      merchantPages[pageId](content);
    } else {
      // 默认显示运营概览
      if (typeof renderMerchantOverviewPage === 'function') {
        renderMerchantOverviewPage(content);
      } else {
        content.innerHTML = `<div class="page-content"><h2>页面加载中...</h2><p>请刷新页面重试</p></div>`;
      }
    }
    setTimeout(() => lucide.createIcons(), 50);
  }, 100);
}

// 初始化商家端
document.addEventListener('DOMContentLoaded', function() {
  console.log('商家端初始化开始...');
  
  // 先渲染侧边栏
  renderMerchantSidebar();
  
  // 侧边栏切换
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
  });
  
  // 加载默认页面
  setTimeout(() => {
    navigateMerchant('merchant-overview');
    console.log('商家端初始化完成');
  }, 200);
});
