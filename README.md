# 一键图文摘抄 (Text Capture & Share)

一个优雅的浏览器扩展，让你能够一键生成精美的文字摘录卡片。

## 🌟 功能特点

- 🎯 **便捷选择**：在任何网页上选择文字，即可触发悬浮分享按钮
- 🎨 **精美卡片**：将选中文字转换为设计精美的分享卡片
- 💫 **简单操作**：无需复杂设置，选中文字即可使用
- 🔒 **安全可靠**：仅请求必要的浏览器权限

## 🛠️ 技术架构

### 核心组件
- `popup/`: 扩展弹出窗口界面
- `content.js`: 核心功能实现（文本选择、卡片生成）
- `background.js`: 后台服务进程
- `styles/`: 样式文件目录
- `libs/`: 第三方库（html2canvas等）

### 技术特点
- 基于 Manifest V3 开发
- 使用 html2canvas 进行页面元素截图
- 支持本地数据存储
- 全网页兼容（<all_urls>）

### 权限说明
- `activeTab`: 访问当前标签页
- `contextMenus`: 右键菜单功能
- `storage`: 本地数据存储

## 🚀 使用方法

1. 在任意网页选择想要摘录的文字
2. 点击出现的悬浮分享按钮
3. 生成精美的文字摘录卡片
4. 保存或分享卡片

## 🔧 开发说明

本扩展采用原生 JavaScript 开发，无需额外框架，保持轻量级和高性能。主要文件说明：

- `manifest.json`: 扩展配置文件
- `content.js`: 页面交互核心逻辑
- `popup/`: 弹出窗口相关文件
- `styles/`: 样式文件
- `icons/`: 扩展图标资源

## 📝 版本历史

- v1.0: 初始版本发布
  - 基础文本选择功能
  - 卡片生成功能
  - 分享按钮实现 