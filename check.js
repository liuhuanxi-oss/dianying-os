const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  await page.setCacheEnabled(false);
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if(msg.type()==='error') errors.push('CONSOLE: ' + msg.text()); });
  
  const filePath = '/app/data/所有对话/主对话/参赛项目/WAIC_OPC_企服OS/dianying-os/index.html';
  await page.goto('file://' + filePath, {waitUntil: 'domcontentloaded', timeout: 15000}).catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));
  
  // Enter demo
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('button, a')) {
      if (el.textContent.includes('免费体验') || el.textContent.includes('立即体验')) { el.click(); break; }
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // 逐页检查所有页面
  const pages = ['overview','chat','platform','aipay','knowledge','logs','marketing','security','ticket','inventory','competitor','health','calendar','report','workflow','roi','creation','twin','location','journey','safety','employee','supply','member','sentiment','pricing','changelog','alert','inspection','datalab','aidaily','export'];
  
  const allIssues = [];
  
  for (const pg of pages) {
    await page.evaluate((p) => {
      for (const el of document.querySelectorAll('.sidebar-nav-item')) {
        if (el.dataset.page === p) el.click();
      }
    }, pg);
    await new Promise(r => setTimeout(r, 1200));
    
    const result = await page.evaluate(() => {
      const s = document.querySelector('.demo-section.active');
      if (!s) return {page: 'unknown', error: 'no active section'};
      
      // 检查所有canvas
      const canvases = Array.from(s.querySelectorAll('canvas')).map(c => ({
        id: c.id || '(no-id)', w: c.width, h: c.height, ok: c.width > 0 && c.height > 0
      }));
      
      // 检查大片空白（高度为0的区域）
      const emptyAreas = Array.from(s.querySelectorAll('[class*="card"], [class*="panel"], [class*="chart"], [class*="container"]')).filter(el => {
        return el.offsetHeight === 0 && el.id;
      }).map(el => ({id: el.id, class: el.className.substring(0, 50)}));
      
      return {
        page: s.id,
        canvases: canvases.filter(c => c.id !== '(no-id)'),
        emptyAreas: emptyAreas,
        sectionHeight: s.offsetHeight
      };
    });
    
    // 记录问题
    const badCanvases = result.canvases?.filter(c => !c.ok) || [];
    if (badCanvases.length > 0 || (result.emptyAreas?.length || 0) > 0) {
      allIssues.push({
        page: pg,
        badCanvases: badCanvases,
        emptyAreas: result.emptyAreas || []
      });
    }
  }
  
  // 竞品页tab切换测试
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('.sidebar-nav-item')) {
      if (el.dataset.page === 'competitor') el.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // 点击口碑分析tab
  await page.evaluate(() => {
    for (const tab of document.querySelectorAll('.competitor-tab')) {
      if (tab.dataset.compTab === 'review') tab.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  const reviewChart = await page.evaluate(() => {
    const c = document.getElementById('compSentimentTrendChart');
    return c ? {w: c.width, h: c.height, ok: c.width > 0} : null;
  });
  
  // 数据大屏测试
  await page.evaluate(() => { 
    // 先确保demoPage是隐藏的，然后打开数据大屏
    const demo = document.getElementById('demoPage');
    if (demo) demo.classList.add('hidden');
    const btn = document.getElementById('topbarDashboard');
    if (btn) btn.click();
    else {
      // 如果topbarDashboard不存在，尝试通过landingDashboardBtn
      const landingBtn = document.getElementById('landingDashboardBtn');
      if (landingBtn) landingBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 5000));
  
  const dataScreen = await page.evaluate(() => {
    const map = document.getElementById('chinaMapChart');
    const radar = document.getElementById('dsScreenRadarChart');
    const mapInstance = typeof echarts !== 'undefined' && map ? echarts.getInstanceByDom(map) : null;
    
    // 检查数据大屏所有图表
    const dsCanvases = Array.from(document.querySelectorAll('#dataScreen canvas')).map(c => ({
      id: c.id || '(no-id)', w: c.width, h: c.height, ok: c.width > 0 && c.height > 0
    }));
    
    return {
      map: map ? {w: map.offsetWidth, h: map.offsetHeight, hasInstance: !!mapInstance, htmlLen: map.innerHTML.length} : null,
      radar: radar ? {w: radar.width, h: radar.height, ok: radar.width > 0} : null,
      allCanvases: dsCanvases.filter(c => c.id !== '(no-id)')
    };
  });
  
  // 手机端测试
  await page.setViewport({width: 375, height: 812});
  await page.evaluate(() => {
    const close = document.getElementById('closeDataScreen');
    if (close) close.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const demo = document.getElementById('demoPage');
    if (demo) demo.classList.remove('hidden');
    const ds = document.getElementById('dataScreen');
    if (ds) ds.classList.add('hidden');
    const landing = document.querySelector('.landing-page');
    if (landing) landing.classList.add('hidden');
  });
  await new Promise(r => setTimeout(r, 500));
  
  const mobileResult = await page.evaluate(() => {
    const sidebar = document.querySelector('.demo-sidebar');
    const mobileNav = document.querySelector('.mobile-nav');
    const content = document.querySelector('.demo-content');
    return {
      sidebarVisible: sidebar ? window.getComputedStyle(sidebar).display !== 'none' : false,
      mobileNavVisible: mobileNav ? window.getComputedStyle(mobileNav).display !== 'none' : false,
      contentOverflow: content ? content.scrollWidth > content.clientWidth : false
    };
  });
  
  console.log('=== PAGE ISSUES ===');
  console.log(JSON.stringify(allIssues, null, 2));
  console.log('\n=== COMPETITOR REVIEW TAB ===');
  console.log(JSON.stringify(reviewChart));
  console.log('\n=== DATA SCREEN ===');
  console.log(JSON.stringify(dataScreen, null, 2));
  console.log('\n=== MOBILE ===');
  console.log(JSON.stringify(mobileResult));
  console.log('\n=== JS ERRORS ===');
  console.log(errors.slice(0, 15).join('\n'));
  
  await browser.close();
})();
