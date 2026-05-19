/**
 * 店赢OS - 手机端菜单交互逻辑
 * 统一处理所有页面的手机端适配
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
  });

  function initMobileMenu() {
    // 1. 注入手机端菜单HTML
    injectMobileMenuHTML();

    // 2. 初始化事件监听
    initEventListeners();

    // 3. 检查窗口大小
    checkWindowSize();

    console.log('📱 店赢OS 手机端菜单已初始化');
  }

  function injectMobileMenuHTML() {
    // 检查是否已经注入过
    if (document.querySelector('.mobile-menu-toggle')) {
      return;
    }

    // 1. 添加汉堡菜单按钮到topbar-left
    const topbarLeft = document.querySelector('.topbar-left');
    if (topbarLeft) {
      const menuBtn = document.createElement('button');
      menuBtn.className = 'mobile-menu-toggle';
      menuBtn.innerHTML = '<i data-lucide="menu" style="width:24px;height:24px;"></i>';
      menuBtn.setAttribute('aria-label', '打开菜单');
      topbarLeft.insertBefore(menuBtn, topbarLeft.firstChild);
    }

    // 2. 添加遮罩层
    if (!document.querySelector('.mobile-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'mobile-overlay';
      document.body.appendChild(overlay);
    }

    // 3. 重新初始化lucide图标（如果有新添加的图标）
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  function initEventListeners() {
    // 汉堡菜单点击事件
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');

    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
      });

      overlay.addEventListener('click', function() {
        closeMobileMenu();
      });
    }

    // 侧边栏菜单项点击关闭菜单
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
      item.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          closeMobileMenu();
        }
      });
    });

    // 窗口大小变化监听
    window.addEventListener('resize', function() {
      checkWindowSize();
    });

    // ESC键关闭菜单
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (sidebar && overlay) {
      const isOpen = sidebar.classList.contains('mobile-open');

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }
  }

  function openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (sidebar && overlay) {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('active');

      // 更新图标为关闭
      const icon = menuToggle.querySelector('svg') || menuToggle.querySelector('i');
      if (icon && window.lucide && window.lucide.icons && window.lucide.icons.x) {
        // 替换为X图标
        icon.remove();
        const xIcon = document.createElement('i');
        xIcon.setAttribute('data-lucide', 'x');
        menuToggle.insertBefore(xIcon, menuToggle.firstChild);
        window.lucide.createIcons();
      }
    }
  }

  function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (sidebar && overlay) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');

      // 更新图标为菜单
      const icon = menuToggle.querySelector('svg') || menuToggle.querySelector('i');
      if (icon && window.lucide && window.lucide.icons && window.lucide.icons.menu) {
        icon.remove();
        const menuIcon = document.createElement('i');
        menuIcon.setAttribute('data-lucide', 'menu');
        menuToggle.insertBefore(menuIcon, menuToggle.firstChild);
        window.lucide.createIcons();
      }
    }
  }

  function checkWindowSize() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');

    if (window.innerWidth > 768) {
      // 桌面端：关闭手机菜单，隐藏汉堡按钮
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
      if (menuToggle) {
        menuToggle.style.display = 'none';
      }
    } else {
      // 手机端：显示汉堡按钮
      if (menuToggle) {
        menuToggle.style.display = 'flex';
      }
    }
  }

  // 暴露全局方法
  window.DianyingMobileMenu = {
    open: openMobileMenu,
    close: closeMobileMenu,
    toggle: toggleMobileMenu,
    init: initMobileMenu
  };

})();
