const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`店赢OS 本地服务器已启动`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`========================================\n`);
  console.log(`页面列表:`);
  console.log(`- 首页: http://localhost:${PORT}/index.html`);
  console.log(`- 登录: http://localhost:${PORT}/login.html`);
  console.log(`- 管理后台: http://localhost:${PORT}/admin.html`);
  console.log(`- 数据大屏: http://localhost:${PORT}/dashboard.html`);
  console.log(`- AI演示: http://localhost:${PORT}/ai-demo.html`);
  console.log(`- 架构图: http://localhost:${PORT}/architecture.html`);
  console.log(`- CLI演示: http://localhost:${PORT}/cli-demo.html`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
