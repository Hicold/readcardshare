// 创建分享按钮元素
const createShareButton = () => {
  // 先移除可能存在的旧按钮
  const existingButton = document.getElementById('text-share-button');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('div');
  button.id = 'text-share-button';
  button.style.cssText = `
    position: absolute;
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
    button.style.transform = 'none';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    button.querySelector('svg').style.color = '#666';
  });

  return button;
};

// 获取选中文本的上下文
const getTextContext = (selectedText) => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  
  let fullText = container.textContent || container.innerText;
  let startPos = fullText.indexOf(selectedText);
  
  // 获取前后15个字符
  let preText = fullText.substr(Math.max(0, startPos - 15), Math.min(15, startPos));
  let postText = fullText.substr(startPos + selectedText.length, 15);
  
  return {
    before: preText,
    selected: selectedText,
    after: postText
  };
};

// 初始化分享按钮
const shareButton = createShareButton();

// 生成卡片内容
const generateCard = (context) => {
  const { before, selected, after } = context;
  return `
    <div class="text-content" style="
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      text-align: left;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 0;
    ">
      <span class="blur-text" style="
        color: #999;
        filter: blur(1px);
        opacity: 0.8;
      ">${before}</span>
      <span class="selected-text" style="
        color: #000;
        font-weight: 500;
        padding: 0 4px;
      ">${selected}</span>
      <span class="blur-text" style="
        color: #999;
        filter: blur(1px);
        opacity: 0.8;
      ">${after}</span>
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
  `;
  
  // 生成卡片内容
  const cardHtml = generateCard(context);
  console.log('3. Card HTML generated:', cardHtml);
  
  container.innerHTML = `
    <div class="preview-wrapper" style="
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      max-width: 90%;
      width: 480px;
    ">
      <div class="card-preview" style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      ">
        <div class="card-content">
          ${cardHtml}
        </div>
      </div>
      <div class="preview-actions" style="
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      ">
        <button class="download-btn" style="
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          background: #007AFF;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 13L12 16L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 20H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          下载图片
        </button>
        <button class="close-btn" style="
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          background: #F5F5F5;
          color: #666;
        ">关闭</button>
      </div>
    </div>
  `;
  
  console.log('4. Container created with HTML');
  document.body.appendChild(container);
  console.log('5. Container added to document');

  // 下载按钮点击事件
  const downloadBtn = container.querySelector('.download-btn');
  downloadBtn.addEventListener('click', () => {
    console.log('Download button clicked');
    const cardPreview = container.querySelector('.card-preview');
    handleDownload(cardPreview);
  });

  // 关闭按钮点击事件
  const closeBtn = container.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    console.log('Close button clicked');
    container.remove();
  });

  // 点击外部区域关闭
  container.addEventListener('click', (e) => {
    if (e.target === container) {
      console.log('Outside area clicked');
      container.remove();
    }
  });
};

// 修改文本选择事件处理
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    console.log('Text selected:', selectedText);
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 显示分享按钮
    shareButton.style.display = 'flex';
    shareButton.style.position = 'absolute';
    shareButton.style.top = `${window.scrollY + rect.top - 40}px`;
    shareButton.style.left = `${window.scrollX + rect.right + 10}px`;
    
    // 设置点击事件
    shareButton.onclick = (event) => {
      event.stopPropagation();
      console.log('Share button clicked');
      handleShare(selectedText);
    };
  } else {
    shareButton.style.display = 'none';
  }
});

// 点击其他地方时隐藏分享按钮
document.addEventListener('mousedown', (e) => {
  if (e.target !== shareButton && 
      !shareButton.contains(e.target) && 
      !e.target.closest('#text-share-preview-container')) {
    shareButton.style.display = 'none';
  }
});

// 修改下载按钮点击事件
const handleDownload = async (cardPreview) => {
  try {
    console.log('Starting download...');
    
    // 创建一个新的容器
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.appendChild(cardPreview.cloneNode(true));
    document.body.appendChild(container);

    // 使用 html2canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    // 清理
    document.body.removeChild(container);

    // 下载
    const link = document.createElement('a');
    link.download = '分享卡片.png';
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('截图失败:', error);
    alert('生成图片失败，请稍后重试');
  }
};