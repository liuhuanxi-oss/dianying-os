/**
 * 店赢OS - 全局交互JS
 * 包含Toast通知、模态框、侧边栏、登录流程、表格增强、AI对话、CLI终端等功能
 * 约900行，纯原生JS实现
 */

(function() {
    'use strict';
    
    // ========================================
    // 配置常量
    // ========================================
    const CONFIG = {
        toastDuration: 2500,
        modalAnimationDuration: 300,
        pageSize: 10,
        aiTypingSpeed: 50,
        cliTypingSpeed: 20,
        maxHistoryLength: 50
    };
    
    // ========================================
    // 工具函数
    // ========================================
    
    /**
     * 生成唯一ID
     */
    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 防抖函数
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * 节流函数
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ========================================
    // 1. Toast通知系统
    // ========================================
    
    /**
     * 显示Toast通知
     * @param {string} type - 类型: success/error/warning/info
     * @param {string} message - 消息内容
     */
    function showToast(type, message) {
        // 如果页面已有同名函数则不覆盖
        if (typeof window.showToast === 'function' && window.showToast.__original) {
            window.showToast(type, message);
            return;
        }
        
        // 移除已有的toast
        const existingToast = document.querySelector('.global-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'global-toast';
        toast.innerHTML = `
            <div class="toast-icon toast-icon-${type}">
                ${getToastIcon(type)}
            </div>
            <div class="toast-message">${escapeHtml(message)}</div>
        `;
        
        // 添加样式
        addToastStyles();
        
        // 设置类型样式
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        toast.style.borderLeftColor = colors[type] || colors.info;
        
        // 添加到body
        document.body.appendChild(toast);
        
        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });
        
        // 自动消失
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.toastDuration);
    }
    
    /**
     * 获取Toast图标SVG
     */
    function getToastIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * 添加Toast样式
     */
    function addToastStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .global-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border-left: 4px solid #3b82f6;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            .global-toast.toast-show {
                transform: translateX(0);
            }
            .toast-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            .toast-icon svg {
                width: 100%;
                height: 100%;
            }
            .toast-icon-success { color: #10b981; }
            .toast-icon-error { color: #ef4444; }
            .toast-icon-warning { color: #f59e0b; }
            .toast-icon-info { color: #3b82f6; }
            .toast-message {
                font-size: 14px;
                color: #374151;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * HTML转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ========================================
    // 2. 模态框系统
    // ========================================
    
    let currentModalCallback = null;
    
    /**
     * 显示模态框
     * @param {string} title - 标题
     * @param {string|HTMLElement} content - 内容
     * @param {Object} options - 选项
     */
    function showModal(title, content, options = {}) {
        const {
            showCancel = true,
            showConfirm = true,
            confirmText = '确定',
            cancelText = '取消',
            onConfirm = null,
            onCancel = null,
            width = '500px'
        } = options;
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'globalModalOverlay';
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-box';
        modal.id = 'globalModal';
        
        // 构建内容
        let contentHtml = '';
        if (typeof content === 'string') {
            contentHtml = content;
        } else if (content instanceof HTMLElement) {
            contentHtml = content.outerHTML;
        }
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${escapeHtml(title)}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">${contentHtml}</div>
            ${(showCancel || showConfirm) ? `
            <div class="modal-footer">
                ${showCancel ? `<button class="btn btn-secondary" onclick="closeModal()">${cancelText}</button>` : ''}
                ${showConfirm ? `<button class="btn btn-primary" id="modalConfirmBtn">${confirmText}</button>` : ''}
            </div>
            ` : ''}
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 保存回调
        currentModalCallback = { onConfirm, onCancel };
        
        // 绑定确认按钮
        if (showConfirm) {
            const confirmBtn = document.getElementById('modalConfirmBtn');
            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    if (currentModalCallback && currentModalCallback.onConfirm) {
                        currentModalCallback.onConfirm();
                    }
                    closeModal();
                };
            }
        }
        
        // 添加样式
        addModalStyles();
        
        // 设置宽度
        modal.style.maxWidth = width;
        
        // 触发动画
        requestAnimationFrame(() => {
            overlay.classList.add('modal-overlay-show');
            modal.classList.add('modal-box-show');
        });
        
        // ESC关闭
        document.addEventListener('keydown', escHandler);
        
        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
    
    /**
     * 关闭模态框
     */
    function closeModal() {
        const overlay = document.getElementById('globalModalOverlay');
        const modal = document.getElementById('globalModal');
        
        if (overlay) {
            overlay.classList.remove('modal-overlay-show');
            setTimeout(() => overlay.remove(), CONFIG.modalAnimationDuration);
        }
        
        if (currentModalCallback && currentModalCallback.onCancel) {
            currentModalCallback.onCancel();
        }
        currentModalCallback = null;
        
        document.removeEventListener('keydown', escHandler);
    }
    
    /**
     * ESC键处理
     */
    function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
    
    /**
     * 添加模态框样式
     */
    function addModalStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 99998;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .modal-overlay-show { opacity: 1; }
            .modal-box {
                background: #fff;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.9);
                opacity: 0;
                transition: all 0.3s ease;
            }
            .modal-box-show {
                transform: scale(1);
                opacity: 1;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            .modal-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .modal-close:hover { color: #6b7280; }
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                max-height: 50vh;
            }
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .modal-footer .btn {
                padding: 10px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .modal-footer .btn-primary {
                background: #3b82f6;
                color: #fff;
                border: none;
            }
            .modal-footer .btn-primary:hover { background: #2563eb; }
            .modal-footer .btn-secondary {
                background: #fff;
                color: #6b7280;
                border: 1px solid #d1d5db;
            }
            .modal-footer .btn-secondary:hover { background: #f3f4f6; }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // 3. 侧边栏导航增强
    // ========================================
    
    /**
     * 初始化侧边栏导航
     */
    function initSidebar() {
        const navItems = document.querySelectorAll('.nav-item');
        const currentPath = window.location.pathname;
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            const hash = item.getAttribute('data-hash');
            
            // 高亮当前页面
            if (href && (currentPath.endsWith(href) || currentPath.endsWith(href.replace('.html', '')))) {
                item.classList.add('active');
            } else if (hash && window.location.hash === hash) {
                item.classList.add('active');
            }
            
            // 添加点击事件
            item.addEventListener('click', (e) => {
                // 移除其他active
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // 同步URL hash
                if (hash) {
                    history.pushState(null, '', hash);
                }
            });
        });
        
        // 浏览器前进后退支持
        window.addEventListener('popstate', () => {
            const hash = window.location.hash || '#dashboard';
            navItems.forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-hash') === hash);
            });
        });
        
        // 移动端菜单
        initMobileMenu();
    }
    
    /**
     * 初始化移动端菜单
     */
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-open');
                menuToggle.classList.toggle('active');
            });
            
            // 点击遮罩关闭
            sidebar.addEventListener('click', (e) => {
                if (e.target === sidebar) {
                    sidebar.classList.remove('sidebar-open');
                    menuToggle.classList.remove('active');
                }
            });
        }
    }
    
    // ========================================
    // 4. 登录流程
    // ========================================
    
    /**
     * 初始化登录页面
     */
    function initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        // 验证码相关
        let captchaTimer = null;
        let captchaCountdown = 60;
        
        // 发送验证码按钮
        const captchaBtn = document.getElementById('captchaBtn');
        if (captchaBtn) {
            captchaBtn.addEventListener('click', () => {
                const phoneInput = document.getElementById('phone');
                const phone = phoneInput ? phoneInput.value : '';
                
                if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                    showInlineError('phoneError', '请输入正确的手机号');
                    return;
                }
                
                // 模拟发送验证码
                captchaBtn.disabled = true;
                captchaBtn.textContent = `发送中...`;
                
                setTimeout(() => {
                    showToast('success', '验证码已发送');
                    captchaCountdown = 60;
                    captchaBtn.textContent = `${captchaCountdown}秒后重试`;
                    
                    captchaTimer = setInterval(() => {
                        captchaCountdown--;
                        if (captchaCountdown <= 0) {
                            clearInterval(captchaTimer);
                            captchaBtn.disabled = false;
                            captchaBtn.textContent = '获取验证码';
                        } else {
                            captchaBtn.textContent = `${captchaCountdown}秒后重试`;
                        }
                    }, 1000);
                }, 500);
            });
        }
        
        // 表单提交
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value;
            const captcha = document.getElementById('captcha').value;
            
            // 清除之前的错误
            clearInlineError('phoneError');
            clearInlineError('captchaError');
            
            // 验证手机号
            if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                showInlineError('phoneError', '请输入正确的手机号');
                return;
            }
            
            // 验证验证码 - 123456作为万能验证码
            if (!captcha || captcha !== '123456') {
                showInlineError('captchaError', '验证码错误，请输入123456');
                return;
            }
            
            // 模拟登录成功
            const userData = {
                phone: phone,
                role: 'merchant',
                name: '商户用户',
                token: 'mock_token_' + Date.now(),
                loginTime: new Date().toISOString()
            };
            
            // 存储登录信息
            DataStore.set('user', userData);
            
            showToast('success', '登录成功');
            
            // 跳转到merchant页面
            setTimeout(() => {
                window.location.href = 'merchant.html';
            }, 1000);
        });
    }
    
    /**
     * 显示内联错误
     */
    function showInlineError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            // 添加错误样式到输入框
            const inputEl = errorEl.previousElementSibling;
            if (inputEl && inputEl.classList) {
                inputEl.classList.add('input-error');
            }
        }
    }
    
    /**
     * 清除内联错误
     */
    function clearInlineError(elementId) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        
        const inputEl = errorEl ? errorEl.previousElementSibling : null;
        if (inputEl && inputEl.classList) {
            inputEl.classList.remove('input-error');
        }
    }
    
    // ========================================
    // 5. 跨页面导航
    // ========================================
    
    /**
     * 检查登录状态
     */
    function checkAuth() {
        const protectedPages = ['merchant', 'platform', 'agent', 'dashboard'];
        const currentPage = window.location.pathname;
        
        for (const page of protectedPages) {
            if (currentPage.includes(page)) {
                const user = DataStore.get('user');
                if (!user) {
                    showToast('warning', '请先登录');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                    return false;
                }
                return true;
            }
        }
        return true;
    }
    
    /**
     * 退出登录
     */
    function logout() {
        DataStore.remove('user');
        showToast('success', '已退出登录');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
    
    /**
     * 初始化退出按钮
     */
    function initLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showModal('确认退出', '确定要退出登录吗？', {
                    onConfirm: logout
                });
            });
        }
    }
    
    /**
     * 检查index页面按钮href
     */
    function checkIndexButtons() {
        const currentPage = window.location.pathname;
        if (!currentPage.includes('index.html') && !currentPage.endsWith('/')) return;
        
        const buttons = document.querySelectorAll('a[href], button[data-href]');
        buttons.forEach(btn => {
            const href = btn.getAttribute('href') || btn.getAttribute('data-href');
            
            // 检查是否需要添加href
            if (!href && btn.hasAttribute('data-target')) {
                const target = btn.getAttribute('data-target');
                if (target) {
                    btn.setAttribute('href', target);
                }
            }
        });
    }
    
    // ========================================
    // 6. 按钮通用交互
    // ========================================
    
    /**
     * 初始化按钮交互
     */
    function initButtonInteractions() {
        // 查看详情 - toggle展开
        document.querySelectorAll('[data-action="detail"], .btn-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target') || btn.closest('.card-item')?.id;
                if (targetId) {
                    const detailEl = document.getElementById(targetId + '_detail');
                    if (detailEl) {
                        detailEl.classList.toggle('detail-show');
                        const icon = btn.querySelector('i, span');
                        if (icon) {
                            icon.style.transform = detailEl.classList.contains('detail-show') ? 'rotate(180deg)' : '';
                        }
                    }
                }
            });
        });
        
        // 导出 - CSV下载
        document.querySelectorAll('[data-action="export"], .btn-export').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tableId = btn.getAttribute('data-table') || 'dataTable';
                exportTableToCSV(tableId);
            });
        });
        
        // 新增 - 模态框表单
        document.querySelectorAll('[data-action="add"], .btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalTitle = btn.getAttribute('data-title') || '新增';
                showAddModal(modalTitle);
            });
        });
        
        // 保存 - toast成功
        document.querySelectorAll('[data-action="save"], .btn-save').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // 模拟保存
                showToast('success', '保存成功');
            });
        });
        
        // 删除 - 确认模态框
        document.querySelectorAll('[data-action="delete"], .btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemName = btn.getAttribute('data-name') || '此项';
                showModal('确认删除', `确定要删除"${itemName}"吗？`, {
                    onConfirm: () => {
                        showToast('success', '删除成功');
                        // 实际删除逻辑
                        const row = btn.closest('tr');
                        if (row) row.remove();
                    }
                });
            });
        });
    }
    
    /**
     * 显示新增模态框
     */
    function showAddModal(title) {
        const formHtml = `
            <form id="addForm">
                <div class="form-group">
                    <label>名称</label>
                    <input type="text" name="name" required placeholder="请输入名称">
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea name="description" rows="3" placeholder="请输入描述"></textarea>
                </div>
            </form>
        `;
        
        showModal(title, formHtml, {
            confirmText: '保存',
            onConfirm: () => {
                showToast('success', '保存成功');
            }
        });
    }
    
    /**
     * 导出表格为CSV
     */
    function exportTableToCSV(tableId) {
        const table = document.getElementById(tableId);
        if (!table) {
            showToast('error', '未找到数据表');
            return;
        }
        
        const rows = table.querySelectorAll('tr');
        let csv = [];
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            cols.forEach(col => {
                let text = col.textContent.trim().replace(/"/g, '""');
                rowData.push('"' + text + '"');
            });
            csv.push(rowData.join(','));
        });
        
        const csvContent = csv.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'export_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
        
        showToast('success', '导出成功');
    }
    
    // ========================================
    // 7. 表格增强
    // ========================================
    
    /**
     * 初始化表格增强
     */
    function initTableEnhancements() {
        document.querySelectorAll('table[data-sortable]').forEach(table => {
            initTableSort(table);
        });
        
        document.querySelectorAll('table[data-filterable]').forEach(table => {
            initTableFilter(table);
        });
        
        document.querySelectorAll('[data-pagination]').forEach(container => {
            initPagination(container);
        });
    }
    
    /**
     * 表头排序
     */
    function initTableSort(table) {
        const headers = table.querySelectorAll('th');
        let sortColumn = null;
        let sortDirection = 'asc';
        
        headers.forEach((header, index) => {
            if (header.hasAttribute('data-sortable')) {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    const column = header.getAttribute('data-column') || index;
                    
                    if (sortColumn === column) {
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortDirection = 'asc';
                    }
                    sortColumn = column;
                    
                    // 更新排序图标
                    headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                    header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                    
                    sortTable(table, index, sortDirection);
                });
            }
        });
    }
    
    /**
     * 排序表格
     */
    function sortTable(table, columnIndex, direction) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aVal = a.cells[columnIndex]?.textContent.trim() || '';
            const bVal = b.cells[columnIndex]?.textContent.trim() || '';
            
            // 数字比较
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return direction === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // 字符串比较
            return direction === 'asc' 
                ? aVal.localeCompare(bVal) 
                : bVal.localeCompare(aVal);
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }
    
    /**
     * 表格搜索过滤
     */
    function initTableFilter(table) {
        const searchInput = document.getElementById('tableSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', debounce(() => {
            const query = searchInput.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        }, 300));
    }
    
    /**
     * 分页器
     */
    function initPagination(container) {
        const totalPagesSpan = container.querySelector('.total-pages');
        const currentPageSpan = container.querySelector('.current-page');
        const prevBtn = container.querySelector('.prev-page');
        const nextBtn = container.querySelector('.next-page');
        const pageInput = container.querySelector('.page-input');
        
        let totalPages = parseInt(totalPagesSpan?.textContent) || 1;
        let currentPage = parseInt(currentPageSpan?.textContent) || 1;
        
        const updatePagination = () => {
            if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
            if (currentPageSpan) currentPageSpan.textContent = currentPage;
            if (prevBtn) prevBtn.disabled = currentPage <= 1;
            if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
        };
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updatePagination();
                    goToPage(currentPage);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                    goToPage(currentPage);
                }
            });
        }
        
        if (pageInput) {
            pageInput.addEventListener('change', () => {
                const page = parseInt(pageInput.value);
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    updatePagination();
                    goToPage(currentPage);
                }
            });
        }
        
        updatePagination();
    }
    
    /**
     * 跳转到指定页
     */
    function goToPage(page) {
        const event = new CustomEvent('pageChange', { detail: { page } });
        document.dispatchEvent(event);
    }
    
    // ========================================
    // 8. AI对话交互
    // ========================================
    
    /**
     * 初始化AI对话
     */
    function initAIDemo() {
        const aiContainer = document.querySelector('.ai-demo, #ai-demo, .ai-chat');
        if (!aiContainer) return;
        
        const chatMessages = document.getElementById('chatMessages') || aiContainer.querySelector('#chatMessages');
        const chatInput = document.getElementById('chatInput') || aiContainer.querySelector('#chatInput');
        const sendBtn = document.getElementById('sendBtn') || aiContainer.querySelector('#sendBtn');
        
        if (!chatMessages || !chatInput) return;
        
        // 预置Q&A
        const qaPairs = [
            { q: '如何提升店铺评分', a: '提升店铺评分可以从以下方面入手：\n1. 优化服务态度\n2. 加快出餐速度\n3. 提高菜品质量\n4. 改善用餐环境\n5. 积极回复用户评价' },
            { q: '差评怎么处理', a: '差评处理流程：\n1. 第一时间查看差评内容\n2. 分析差评原因\n3. 联系用户了解情况\n4. 在平台公开回复\n5. 私下沟通解决\n6. 改进服务避免再次发生' },
            { q: '本月业绩如何', a: '本月业绩概览：\n- 总订单量：1,256单\n- 营业收入：¥45,680\n- 好评率：94.5%\n- 较上月增长：12.3%' },
            { q: '有什么推广建议', a: '推广建议：\n1. 开通平台会员卡\n2. 参与限时优惠活动\n3. 设置新客优惠\n4. 利用社交媒体宣传\n5. 开展老带新活动' },
            { q: '如何申请优惠券', a: '优惠券申请步骤：\n1. 进入后台管理\n2. 点击"营销中心"\n3. 选择"优惠券管理"\n4. 点击"新建优惠券"\n5. 设置优惠条件和金额\n6. 提交审核' }
        ];
        
        // 发送消息
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // 添加用户消息
            addChatMessage(message, 'user');
            chatInput.value = '';
            
            // 模拟AI回复
            setTimeout(() => {
                const response = getAIResponse(message, qaPairs);
                typeWriter(chatMessages, response, 'ai');
            }, 500);
        };
        
        // 回车发送
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 发送按钮
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
    }
    
    /**
     * 添加聊天消息
     */
    function addChatMessage(content, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '我' : 'AI'}</div>
            <div class="message-content">${escapeHtml(content)}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * 获取AI回复
     */
    function getAIResponse(question, qaPairs) {
        const lowerQ = question.toLowerCase();
        for (const pair of qaPairs) {
            if (lowerQ.includes(pair.q.toLowerCase()) || pair.q.toLowerCase().includes(lowerQ)) {
                return pair.a;
            }
        }
        return '抱歉，我不太理解您的问题。您可以尝试咨询：\n- 如何提升店铺评分\n- 差评怎么处理\n- 本月业绩如何\n- 有什么推广建议\n- 如何申请优惠券';
    }
    
    /**
     * 打字机效果
     */
    function typeWriter(container, text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '我' : 'AI'}</div>
            <div class="message-content"></div>
        `;
        container.appendChild(messageDiv);
        
        const contentDiv = messageDiv.querySelector('.message-content');
        let index = 0;
        
        const timer = setInterval(() => {
            if (index < text.length) {
                contentDiv.textContent += text[index];
                index++;
                container.scrollTop = container.scrollHeight;
            } else {
                clearInterval(timer);
            }
        }, CONFIG.aiTypingSpeed);
    }
    
    // ========================================
    // 9. CLI终端交互
    // ========================================
    
    const cliHistory = [];
    let cliHistoryIndex = -1;
    
    /**
     * 初始化CLI终端
     */
    function initCLIDemo() {
        const cliContainer = document.querySelector('.cli-demo, #cli-demo, .terminal');
        if (!cliContainer) return;
        
        const cliOutput = document.getElementById('cliOutput') || cliContainer.querySelector('#cliOutput');
        const cliInput = document.getElementById('cliInput') || cliContainer.querySelector('#cliInput');
        
        if (!cliOutput || !cliInput) return;
        
        // 显示欢迎信息
        addCLALine(cliOutput, '店赢OS CLI v1.0.0', 'system');
        addCLALine(cliOutput, '输入 help 查看可用命令', 'system');
        addCLALine(cliOutput, '', 'system');
        
        // 命令处理
        const handleCommand = () => {
            const cmd = cliInput.value.trim();
            if (!cmd) return;
            
            // 添加到历史
            cliHistory.unshift(cmd);
            if (cliHistory.length > CONFIG.maxHistoryLength) {
                cliHistory.pop();
            }
            cliHistoryIndex = -1;
            
            // 显示命令
            addCLALine(cliOutput, `$ ${cmd}`, 'command');
            cliInput.value = '';
            
            // 处理命令
            processCLICommand(cliOutput, cmd);
        };
        
        // 回车发送
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cliHistoryIndex < cliHistory.length - 1) {
                    cliHistoryIndex++;
                    cliInput.value = cliHistory[cliHistoryIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cliHistoryIndex > 0) {
                    cliHistoryIndex--;
                    cliInput.value = cliHistory[cliHistoryIndex];
                } else {
                    cliHistoryIndex = -1;
                    cliInput.value = '';
                }
            }
        });
        
        // 清屏命令
        window.clearCLI = () => {
            cliOutput.innerHTML = '';
        };
    }
    
    /**
     * 添加CLI行
     */
    function addCLALine(container, text, type) {
        const line = document.createElement('div');
        line.className = `cli-line cli-${type}`;
        line.innerHTML = type === 'command' ? `<span class="cli-prompt">$</span> ${escapeHtml(text.substring(2))}` : escapeHtml(text);
        container.appendChild(line);
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * 处理CLI命令
     */
    function processCLICommand(container, cmd) {
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch (command) {
            case 'help':
                addCLALine(container, '可用命令:', 'output');
                addCLALine(container, '  help     - 显示帮助信息', 'output');
                addCLALine(container, '  status   - 查看系统状态', 'output');
                addCLALine(container, '  deploy   - 部署应用到生产环境', 'output');
                addCLALine(container, '  analyze  - 分析店铺数据', 'output');
                addCLALine(container, '  clear    - 清屏', 'output');
                addCLALine(container, '  exit     - 退出终端', 'output');
                break;
                
            case 'status':
                addCLALine(container, '系统状态:', 'output');
                addCLALine(container, '  CPU: 23%', 'output');
                addCLALine(container, '  内存: 1.2GB / 8GB', 'output');
                addCLALine(container, '  磁盘: 45GB / 100GB', 'output');
                addCLALine(container, '  运行时间: 15天 6小时', 'output');
                addCLALine(container, '  状态: 运行中 ✓', 'success');
                break;
                
            case 'deploy':
                addCLALine(container, '开始部署...', 'info');
                setTimeout(() => {
                    addCLALine(container, '上传文件...', 'info');
                }, 500);
                setTimeout(() => {
                    addCLALine(container, '编译代码...', 'info');
                }, 1000);
                setTimeout(() => {
                    addCLALine(container, '重启服务...', 'info');
                }, 1500);
                setTimeout(() => {
                    addCLALine(container, '部署成功! ✓', 'success');
                }, 2000);
                break;
                
            case 'analyze':
                addCLALine(container, '正在分析店铺数据...', 'info');
                setTimeout(() => {
                    addCLALine(container, '', 'output');
                    addCLALine(container, '📊 数据分析报告', 'output');
                    addCLALine(container, '==================', 'output');
                    addCLALine(container, '订单量: +12.5% ↑', 'output');
                    addCLALine(container, '好评率: 94.2%', 'output');
                    addCLALine(container, '响应时间: 2.3s', 'output');
                    addCLALine(container, '建议: 优化高峰期服务', 'warning');
                }, 1000);
                break;
                
            case 'clear':
                container.innerHTML = '';
                break;
                
            case 'exit':
                addCLALine(container, '再见!', 'system');
                setTimeout(() => {
                    window.close();
                }, 500);
                break;
                
            default:
                addCLALine(container, `未知命令: ${command}`, 'error');
                addCLALine(container, '输入 help 查看可用命令', 'output');
        }
    }
    
    // ========================================
    // 10. localStorage数据持久化
    // ========================================
    
    /**
     * 数据存储模块
     */
    const DataStore = {
        /**
         * 获取数据
         */
        get(key) {
            try {
                const data = localStorage.getItem('dianying_' + key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('DataStore.get error:', e);
                return null;
            }
        },
        
        /**
         * 设置数据
         */
        set(key, value) {
            try {
                localStorage.setItem('dianying_' + key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('DataStore.set error:', e);
                return false;
            }
        },
        
        /**
         * 删除数据
         */
        remove(key) {
            try {
                localStorage.removeItem('dianying_' + key);
                return true;
            } catch (e) {
                console.error('DataStore.remove error:', e);
                return false;
            }
        },
        
        /**
         * 清空所有数据
         */
        clear() {
            try {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('dianying_')) {
                        localStorage.removeItem(key);
                    }
                });
                return true;
            } catch (e) {
                console.error('DataStore.clear error:', e);
                return false;
            }
        }
    };
    
    // ========================================
    // 11. 搜索功能
    // ========================================
    
    /**
     * 初始化搜索功能
     */
    function initSearch() {
        const searchInputs = document.querySelectorAll('[data-search], .search-input');
        
        searchInputs.forEach(input => {
            const targetSelector = input.getAttribute('data-search');
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            
            if (target) {
                input.addEventListener('input', debounce(() => {
                    const query = input.value.toLowerCase().trim();
                    filterList(target, query);
                }, 300));
            }
        });
    }
    
    /**
     * 过滤列表
     */
    function filterList(container, query) {
        const items = container.querySelectorAll('[data-filter-item], .filter-item, li, .item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const match = !query || text.includes(query);
            item.style.display = match ? '' : 'none';
        });
    }
    
    // ========================================
    // 12. 表单验证
    // ========================================
    
    /**
     * 初始化表单验证
     */
    function initFormValidation() {
        const forms = document.querySelectorAll('[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    /**
     * 验证表单
     */
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('[required]');
        
        inputs.forEach(input => {
            clearInlineError(input.id + 'Error');
            
            if (!input.value.trim()) {
                showInlineError(input.id + 'Error', '此字段为必填项');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // ========================================
    // 13. 卡片翻转动画
    // ========================================
    
    /**
     * 初始化卡片翻转
     */
    function initCardFlip() {
        const flipCards = document.querySelectorAll('[data-flip], .flip-card');
        
        flipCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
    }
    
    // ========================================
    // 14. 数字动画
    // ========================================
    
    /**
     * 初始化数字动画
     */
    function initNumberAnimation() {
        const counters = document.querySelectorAll('[data-count], .count-up');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    /**
     * 动画数字
     */
    function animateNumber(el) {
        const target = parseFloat(el.getAttribute('data-count') || el.textContent);
        const duration = 1500;
        const start = 0;
        const startTime = performance.now();
        
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            el.textContent = prefix + current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // ========================================
    // 初始化入口
    // ========================================
    
    /**
     * DOM加载完成后初始化
     */
    function init() {
        // 检测当前页面类型
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').pop().replace('.html', '') || 'index';
        
        // 1. Toast通知 - 如果页面已有函数则不覆盖
        if (typeof window.showToast !== 'function') {
            window.showToast = showToast;
            window.showToast.__original = true;
        }
        
        // 2. 模态框系统
        window.showModal = showModal;
        window.closeModal = closeModal;
        
        // 3. 侧边栏导航
        initSidebar();
        
        // 4. 登录流程
        if (pageName === 'login') {
            initLoginPage();
        }
        
        // 5. 跨页面导航
        checkAuth();
        initLogoutButton();
        checkIndexButtons();
        
        // 6. 按钮交互
        initButtonInteractions();
        
        // 7. 表格增强
        initTableEnhancements();
        
        // 8. AI对话
        initAIDemo();
        
        // 9. CLI终端
        initCLIDemo();
        
        // 10. 数据存储
        window.DataStore = DataStore;
        
        // 11. 搜索
        initSearch();
        
        // 12. 表单验证
        initFormValidation();
        
        // 13. 卡片翻转
        initCardFlip();
        
        // 14. 数字动画
        initNumberAnimation();
        
        console.log('店赢OS 交互模块初始化完成');
    }
    
    // DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
