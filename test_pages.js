const { chromium } = require('playwright');

async function testPages() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 收集控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ url: page.url(), msg: msg.text() });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({ url: page.url(), error: error.message });
  });
  
  await page.goto('https://liuhuanxi-oss.github.io/dianying-os/', { waitUntil: 'networkidle' });
  
  // 截图首页
  await page.screenshot({ path: './screenshots/00_home.png', fullPage: false });
  console.log('Screenshot saved: 00_home.png');
  
  // 获取侧边栏导航项
  const navItems = await page.locator('.sidebar-nav-item').all();
  console.log(`Found ${navItems.length} navigation items`);
  
  for (const item of navItems) {
    const pageName = await item.getAttribute('data-page');
    const title = await item.getAttribute('data-title');
    console.log(`Testing page: ${pageName} - ${title}`);
    
    await item.click();
    await page.waitForTimeout(500);
    
    // 检查页面是否可见
    const sectionId = 'section' + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const section = page.locator(`#${sectionId}`);
    const isVisible = await section.isVisible().catch(() => false);
    
    // 检查是否有canvas元素
    const canvases = await page.locator(`#${sectionId} canvas`).count();
    
    // 检查数据卡片
    const cards = await page.locator(`#${sectionId} .stat-card, #${sectionId} .data-card, #${sectionId} .metric-card`).all();
    let cardValues = [];
    for (const card of cards) {
      const text = await card.textContent();
      cardValues.push(text.substring(0, 50));
    }
    
    // 截图
    const safeName = pageName.padEnd(15).substring(0, 15);
    const filename = `./screenshots/${safeName.replace(/\s/g, '_')}_${pageName}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`  - Section visible: ${isVisible}`);
    console.log(`  - Canvas elements: ${canvases}`);
    console.log(`  - Data cards: ${cards.length}`);
    console.log(`  - Screenshot: ${filename}`);
  }
  
  console.log('\n=== Console Errors ===');
  if (errors.length === 0) {
    console.log('No console errors detected');
  } else {
    errors.forEach(e => console.log(JSON.stringify(e)));
  }
  
  await browser.close();
}

testPages().catch(console.error);
