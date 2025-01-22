// 功能开关状态
let isFeatureEnabled = true;

// 初始化时获取功能开关状态
chrome.storage.sync.get(['featureEnabled'], function(result) {
  isFeatureEnabled = result.featureEnabled !== false;
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'toggleFeature') {
    isFeatureEnabled = request.enabled;
    if (!isFeatureEnabled) {
      // 如果功能被禁用，移除分享按钮
      const shareButton = document.getElementById('text-share-button');
      if (shareButton) {
        shareButton.style.opacity = '0';
        shareButton.style.transform = 'scale(0.8)';
        setTimeout(() => {
          shareButton.style.display = 'none';
          shareButton.remove(); // 完全移除按钮
        }, 200);
      }
    } else {
      // 如果功能被启用，重新创建按钮
      shareButton = createShareButton();
      // 检查当前是否有选中的文本，如果有，显示按钮
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText) {
        updateButtonPosition(selection);
      }
    }
  }
});

// 创建分享按钮元素
const createShareButton = () => {
  // 如果功能被禁用，直接返回null
  if (!isFeatureEnabled) {
    return null;
  }

  // 先移除可能存在的旧按钮
  const existingButton = document.getElementById('text-share-button');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('div');
  button.id = 'text-share-button';
  button.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    background: white;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    pointer-events: auto;
    opacity: 0;
    transform: scale(0.8);
  `;
  
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #666;">
      <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" stroke-width="2"/>
      <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" stroke-width="2"/>
      <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" stroke-width="2"/>
      <path d="M8.59003 13.51L15.42 17.49" stroke="currentColor" stroke-width="2"/>
      <path d="M15.41 6.51001L8.59003 10.49" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;

  document.body.appendChild(button);

  // 添加悬停效果
  button.addEventListener('mouseover', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    button.querySelector('svg').style.color = '#333';
  });

  button.addEventListener('mouseout', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    button.querySelector('svg').style.color = '#666';
  });

  return button;
};

// 更新按钮位置的函数
const updateButtonPosition = (selection) => {
  if (!isFeatureEnabled || !shareButton) return;

  try {
    const range = selection.getRangeAt(0);
    
    // 获取最后一个字符的位置
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;
    
    // 创建一个新的范围，只包含最后一个字符
    const lastCharRange = document.createRange();
    
    if (endContainer.nodeType === Node.TEXT_NODE) {
      // 如果是文本节点，直接设置范围
      const lastCharOffset = Math.max(0, endOffset - 1);
      lastCharRange.setStart(endContainer, lastCharOffset);
      lastCharRange.setEnd(endContainer, endOffset);
    } else {
      // 如果不是文本节点，尝试获取最后一个子节点
      const lastNode = endContainer.childNodes[endOffset - 1] || endContainer.lastChild;
      if (lastNode) {
        lastCharRange.selectNode(lastNode);
      } else {
        // 如果无法获取最后一个节点，使用整个选区
        lastCharRange.setStart(range.startContainer, range.startOffset);
        lastCharRange.setEnd(range.endContainer, range.endOffset);
      }
    }
    
    // 获取最后一个字符的位置
    const lastCharRect = lastCharRange.getBoundingClientRect();
    
    // 计算按钮位置
    const buttonWidth = 36;
    const buttonHeight = 36;
    const spacing = 8; // 与文本的间距
    
    // 将按钮放在最后一个字符的右侧，垂直居中
    let left = lastCharRect.right + spacing;
    let top = lastCharRect.top + (lastCharRect.height - buttonHeight) / 2;
    
    // 如果按钮会超出视口右边界，将其放在左边
    if (left + buttonWidth > window.innerWidth) {
      left = Math.max(spacing, lastCharRect.left - buttonWidth - spacing);
    }
    
    // 确保按钮在视口内
    if (top < spacing) {
      top = spacing;
    } else if (top + buttonHeight > window.innerHeight) {
      top = window.innerHeight - buttonHeight - spacing;
    }
    
    // 设置按钮位置
    shareButton.style.left = `${left}px`;
    shareButton.style.top = `${top}px`;
    
    // 显示按钮
    shareButton.style.display = 'flex';
    requestAnimationFrame(() => {
      shareButton.style.opacity = '1';
      shareButton.style.transform = 'scale(1)';
    });
  } catch (error) {
    console.error('Error updating button position:', error);
  }
};

// 初始化分享按钮
let shareButton = createShareButton();

// 监听文本选择事件
document.addEventListener('mouseup', (e) => {
  // 如果功能被禁用，直接返回
  if (!isFeatureEnabled) return;

  // 防止在按钮上释放鼠标时触发
  if (e.target.closest('#text-share-button')) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    // 如果按钮不存在，创建它
    if (!shareButton) {
      shareButton = createShareButton();
    }
    
    if (shareButton) {
      updateButtonPosition(selection);
      
      // 添加点击事件
      shareButton.onclick = () => {
        handleShare(selectedText);
        // 点击后隐藏按钮
        shareButton.style.opacity = '0';
        shareButton.style.transform = 'scale(0.8)';
        setTimeout(() => {
          shareButton.style.display = 'none';
        }, 200);
      };
    }
  } else if (shareButton) {
    // 隐藏按钮
    shareButton.style.opacity = '0';
    shareButton.style.transform = 'scale(0.8)';
    setTimeout(() => {
      shareButton.style.display = 'none';
    }, 200);
  }
});

// 监听滚动事件，隐藏按钮
window.addEventListener('scroll', () => {
  if (shareButton) {
    shareButton.style.opacity = '0';
    shareButton.style.transform = 'scale(0.8)';
    setTimeout(() => {
      shareButton.style.display = 'none';
    }, 200);
  }
});

// 修改获取文本上下文的函数
const getTextContext = (selectedText) => {
  console.log('Getting context for:', selectedText);
  
  // 添加文本清理函数
  const cleanText = (text) => {
    return text.replace(/[\n\r]+/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
  };
  
  // 添加文本解码函数
  const decodeText = (text) => {
    // 首先移除所有HTML标签
    let decoded = text.replace(/<[^>]+>/g, '');
    
    // 创建一个临时元素来解码HTML实体
    const textarea = document.createElement('textarea');
    textarea.innerHTML = decoded;
    decoded = textarea.value;
    
    // 处理常见的转义序列
    decoded = decoded.replace(/\\n/g, ' ')
                    .replace(/\\t/g, ' ')
                    .replace(/\\"/g, '"')
                    .replace(/\\'/g, "'")
                    .replace(/\\\\/g, '\\')
                    .replace(/\\u[\dA-F]{4}/gi, match =>
                      String.fromCharCode(parseInt(match.replace('\\u', ''), 16)))
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
                    .replace(/\s+/g, ' ')
                    .trim();
    
    return decoded;
  };

  // 添加文本匹配函数
  const textIncludes = (fullText, searchText) => {
    const cleanFullText = cleanText(decodeText(fullText)).toLowerCase();
    const cleanSearchText = cleanText(decodeText(searchText)).toLowerCase();
    return cleanFullText.includes(cleanSearchText);
  };

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  // 获取选中文本的实际内容
  const selectedTextContent = cleanText(decodeText(selectedText));
  
  // 获取包含选中文本的段落元素
  let container = range.commonAncestorContainer;
  
  // 如果container是文本节点，获取其父元素
  if (container.nodeType === Node.TEXT_NODE) {
    container = container.parentNode;
  }

  // 获取选中文本的起始和结束节点
  let startNode = range.startContainer;
  let endNode = range.endContainer;
  
  // 如果是文本节点，获取其父元素
  if (startNode.nodeType === Node.TEXT_NODE) {
    startNode = startNode.parentNode;
  }
  if (endNode.nodeType === Node.TEXT_NODE) {
    endNode = endNode.parentNode;
  }

  // 尝试多种方式获取包含完整上下文的容器
  let targetContainer = null;
  let fullText = '';

  // 定义可能包含文本的选择器
  const selectors = [
    'p',
    'article',
    'section',
    'div',
    '.article',
    '.content',
    '.post-content',
    '[class*="text"]',
    '[class*="content"]'
  ];

  // 遍历每个选择器
  for (const selector of selectors) {
    // 从起始节点向上查找
    let element = startNode.closest(selector);
    if (element && textIncludes(element.textContent, selectedTextContent)) {
      targetContainer = element;
      break;
    }
  }

  // 如果还没找到，尝试从选区的共同祖先元素开始向上查找
  if (!targetContainer) {
    let parent = container;
    let attempts = 0;
    const maxAttempts = 5; // 限制向上查找的层数

    while (parent && attempts < maxAttempts) {
      if (textIncludes(parent.textContent, selectedTextContent)) {
        targetContainer = parent;
        break;
      }
      parent = parent.parentElement;
      attempts++;
    }
  }

  // 如果仍然没找到，使用最初的容器
  if (!targetContainer) {
    targetContainer = container;
  }

  try {
    // 获取完整文本
    fullText = targetContainer.textContent;
    fullText = decodeText(fullText);
    fullText = cleanText(fullText);

    // 如果当前容器的文本不包含选中文本，尝试获取父元素的文本
    if (!textIncludes(fullText, selectedTextContent)) {
      let parent = targetContainer.parentElement;
      let attempts = 0;
      while (parent && attempts < 3) {
        const parentText = cleanText(decodeText(parent.textContent));
        if (textIncludes(parentText, selectedTextContent)) {
          fullText = parentText;
          break;
        }
        parent = parent.parentElement;
        attempts++;
      }
    }

    // 找到选中文本的位置（不区分大小写）
    const startPos = fullText.toLowerCase().indexOf(selectedTextContent.toLowerCase());
    console.log('Start position:', startPos);
    
    // 获取前后文本
    let preText = '';
    let postText = '';
    
    if (startPos !== -1) {
      // 获取前文，最多30个字符，但不添加开头的省略号
      preText = fullText.substring(Math.max(0, startPos - 30), startPos).trim();
      
      // 获取后文，最多30个字符
      const postEnd = Math.min(fullText.length, startPos + selectedTextContent.length + 30);
      postText = fullText.substring(startPos + selectedTextContent.length, postEnd).trim();
      
      // 只在后文结尾添加省略号
      postText = postText + '...';
    }
    
    console.log('Context:', { before: preText, selected: selectedTextContent, after: postText });
    
    return {
      before: preText,
      selected: selectedText,
      after: postText
    };
  } catch (error) {
    console.error('Error getting full text:', error);
    return {
      before: '',
      selected: selectedText,
      after: ''
    };
  }
};

// 修改生成二维码的函数
const generateQRCodeSVG = (url) => {
  // 使用更美观的 SVG 二维码图案
  return `
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="4" fill="#ffffff"/>
      <g transform="translate(10,10) scale(0.75)">
        <path d="M0 0h20v20h-20z M30 0h20v20h-20z M0 30h20v20h-20z" fill="#000000"/>
        <path d="M30 30h10v10h-10z M50 30h10v20h-10z M30 50h10v10h-10z" fill="#000000"/>
        <circle cx="40" cy="40" r="2" fill="#000000"/>
      </g>
      <text x="40" y="75" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#666666">扫码访问</text>
    </svg>
  `;
};

// 修改生成二维码的函数
const generateQRCodeSVG = (url) => {
  // 使用更美观的 SVG 二维码图案
  return `
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="4" fill="#ffffff"/>
      <g transform="translate(10,10) scale(0.75)">
        <path d="M0 0h20v20h-20z M30 0h20v20h-20z M0 30h20v20h-20z" fill="#000000"/>
        <path d="M30 30h10v10h-10z M50 30h10v20h-10z M30 50h10v10h-10z" fill="#000000"/>
        <circle cx="40" cy="40" r="2" fill="#000000"/>
      </g>
      <text x="40" y="75" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#666666">扫码访问</text>
    </svg>
  `;
};

// 修改生成卡片的函数
const generateCard = (context) => {
  const { before, selected, after } = context;
<<<<<<< HEAD
  const currentUrl = window.location.href;
  const qrCodeSvg = generateQRCodeSVG(currentUrl);
=======
  
  // 处理选中文本，如果太长则截断
  const truncateText = (text, maxHeight) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 350px;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.8;
      padding: 8px 0;
      margin: 4px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    `;
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);
    
    // 如果文本高度超过限制，逐字减少直到符合高度要求
    let truncated = text;
    if (tempDiv.offsetHeight > maxHeight) {
      const words = text.split('');
      let start = 0;
      let end = words.length;
      
      while (start < end) {
        const mid = Math.floor((start + end + 1) / 2);
        tempDiv.textContent = words.slice(0, mid).join('') + '...';
        if (tempDiv.offsetHeight <= maxHeight) {
          start = mid;
        } else {
          end = mid - 1;
        }
      }
      
      truncated = words.slice(0, start).join('') + '...';
    }
    
    document.body.removeChild(tempDiv);
    return truncated;
  };
>>>>>>> 8612bb3 (Initial commit: Chrome extension for text sharing)
  
  return `
    <div class="text-content" style="
      width: 350px;
      min-width: 350px;
      max-height: 500px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      text-align: left;
      padding: 24px;
      background: white;
      border-radius: 12px;
      margin: 0 auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      word-break: break-word;
      overflow: hidden;
    ">
      <div style="
        color: #666;
        font-size: 12px;
        margin-bottom: 16px;
      ">${new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')}</div>
      <div style="
        display: flex;
        flex-direction: column;
        gap: 0;
<<<<<<< HEAD
        margin-bottom: 24px;
=======
        margin-bottom: 20px;
        flex-grow: 1;
        overflow: hidden;
>>>>>>> 8612bb3 (Initial commit: Chrome extension for text sharing)
      ">
        ${before ? `
          <div style="
            color: #666;
            font-size: 14px;
            line-height: 1.8;
            opacity: 0.85;
            filter: blur(0.5px);
            margin-bottom: 12px;
            -webkit-font-smoothing: antialiased;
          ">${before}</div>
        ` : ''}
        <div class="selected-text" style="
          color: #333;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.8;
          padding: 8px 0;
          margin: 4px 0;
          overflow: hidden;
        ">${selected}</div>
        ${after ? `
          <div style="
            color: #666;
            font-size: 14px;
            line-height: 1.8;
            opacity: 0.85;
            filter: blur(0.5px);
            margin-top: 12px;
            -webkit-font-smoothing: antialiased;
          ">${after}</div>
        ` : ''}
      </div>
      <div style="
<<<<<<< HEAD
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 20px;
        border-top: 1px solid #eee;
      ">
        <div style="
          flex: 1;
          margin-right: 20px;
        ">
          <div style="
            color: #666;
            font-size: 12px;
            margin-bottom: 4px;
          ">分享自</div>
          <div style="
            color: #333;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${document.title}</div>
          <div style="
            color: #666;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${currentUrl}</div>
        </div>
        <div style="
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">
          ${qrCodeSvg}
        </div>
      </div>
=======
        padding-top: 16px;
        border-top: 1px solid rgba(0,0,0,0.08);
        font-size: 13px;
        color: #999;
        text-align: center;
        font-style: italic;
      ">好的话语，值得以后重温</div>
>>>>>>> 8612bb3 (Initial commit: Chrome extension for text sharing)
    </div>
  `;
};

// 修改分享按钮点击事件处理函数
const handleShare = (selectedText) => {
  console.log('1. handleShare called with text:', selectedText);
  const context = getTextContext(selectedText);
  console.log('2. Context generated:', context);
  
  // 创建预览容器
  const container = document.createElement('div');
  container.id = 'text-share-preview-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // 生成卡片内容
  const cardHtml = generateCard(context);
  console.log('3. Card HTML generated:', cardHtml);
  
  container.innerHTML = `
    <div class="preview-wrapper" style="
      background: #f5f7fa;
      border-radius: 12px;
      padding: 24px;
      width: fit-content;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease;
      box-sizing: border-box;
      margin: 0 auto;
      max-height: calc(100vh - 48px);
      overflow: auto;
    ">
      <div class="card-preview">
        ${cardHtml}
      </div>
      <div class="preview-actions" style="
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 20px;
        width: 350px;
        margin: 20px auto 0;
      ">
        <button class="close-btn" style="
          padding: 8px 24px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          background: #e2e8f0;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          关闭
        </button>
        <button class="download-btn" style="
          padding: 8px 24px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          background: #4a5568;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 13L12 16L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 20H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          下载图片
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // 添加动画
  requestAnimationFrame(() => {
    container.style.opacity = '1';
    const wrapper = container.querySelector('.preview-wrapper');
    wrapper.style.opacity = '1';
    wrapper.style.transform = 'none';
    
    // 检查并处理内容高度
    const cardContent = wrapper.querySelector('.text-content');
    const selectedTextDiv = cardContent.querySelector('.selected-text');
    
    // 计算可用高度（卡片总高度减去其他元素的高度）
    const dateHeight = cardContent.querySelector('div').offsetHeight; // 日期div
    const footerHeight = cardContent.lastElementChild.offsetHeight; // 底部文字
    const maxSelectedTextHeight = 500 - dateHeight - footerHeight - 72; // 72px for margins and paddings
    
    // 如果选中文本超出高度限制，进行截断
    if (selectedTextDiv.offsetHeight > maxSelectedTextHeight) {
      selectedTextDiv.textContent = truncateText(selectedTextDiv.textContent, maxSelectedTextHeight);
    }
  });

  // 下载按钮点击事件
  const downloadBtn = container.querySelector('.download-btn');
  downloadBtn.addEventListener('click', async () => {
    console.log('Download button clicked');
    const cardPreview = container.querySelector('.card-preview');
    
    try {
      // 创建临时容器用于截图
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.appendChild(cardPreview.cloneNode(true));
      document.body.appendChild(tempContainer);

      // 使用 html2canvas 生成图片
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // 清理临时容器
      document.body.removeChild(tempContainer);

      // 创建下载链接
      const link = document.createElement('a');
      link.download = '分享内容.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  });

  // 关闭按钮点击事件
  const closeBtn = container.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    container.style.opacity = '0';
    const wrapper = container.querySelector('.preview-wrapper');
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(20px)';
    setTimeout(() => container.remove(), 300);
  });

  // 点击背景关闭
  container.addEventListener('click', (e) => {
    if (e.target === container) {
      container.style.opacity = '0';
      const wrapper = container.querySelector('.preview-wrapper');
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'translateY(20px)';
      setTimeout(() => container.remove(), 300);
    }
  });
};