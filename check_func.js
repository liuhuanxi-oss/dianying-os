const fs = require('fs');
const code = fs.readFileSync('js/app.js', 'utf8');

// 找到所有函数及其范围
let braceCount = 0;
let lines = code.split('\n');
let inFunc = false;
let funcStart = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 查找函数开始
  if (line.match(/^function\s+\w+\s*\(/)) {
    // 找对应的结束大括号
    let tempBrace = 0;
    let foundOpen = false;
    for (let j = i; j < lines.length; j++) {
      const l = lines[j];
      for (const c of l) {
        if (c === '{') { tempBrace++; foundOpen = true; }
        if (c === '}') tempBrace--;
      }
      if (foundOpen && tempBrace === 0) {
        console.log(`Function ${lines[i].trim().substring(0,40)}... at lines ${i+1}-${j+1}`);
        break;
      }
    }
  }
}
