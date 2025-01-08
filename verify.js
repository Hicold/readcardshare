const fs = require('fs');
const path = require('path');

// 要创建的目录结构
const directories = [
  'text-share-extension',
  'text-share-extension/libs',
  'text-share-extension/styles',
  'text-share-extension/popup',
  'text-share-extension/icons'
];

// 创建目录
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// 检查必需的文件
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'libs/html2canvas.min.js',
  'styles/content.css',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

console.log('\nChecking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join('text-share-extension', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
  }
}); 