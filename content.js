// 创建分享按钮元素
const createShareButton = () => {
  const button = document.createElement('div');
  button.id = 'text-share-button';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" stroke-width="2"/>
      <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" stroke-width="2"/>
      <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" stroke-width="2"/>
      <path d="M8.59003 13.51L15.42 17.49" stroke="currentColor" stroke-width="2"/>
      <path d="M15.41 6.51001L8.59003 10.49" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;
  button.style.display = 'none';
  document.body.appendChild(button);
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

// 监听文本选择事件
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 显示分享按钮
    shareButton.style.display = 'block';
    shareButton.style.top = `${window.scrollY + rect.top - 30}px`;
    shareButton.style.left = `${window.scrollX + rect.right + 10}px`;
    
    // 点击分享按钮时生成卡片
    shareButton.onclick = () => {
      const context = getTextContext(selectedText);
      chrome.runtime.sendMessage({
        action: 'createCard',
        data: context
      });
    };
  } else {
    shareButton.style.display = 'none';
  }
});

// 点击其他地方时隐藏分享按钮
document.addEventListener('mousedown', (e) => {
  if (e.target !== shareButton) {
    shareButton.style.display = 'none';
  }
});

// 创建卡片预览容器
const createPreviewCard = () => {
  const container = document.createElement('div');
  container.id = 'text-share-preview-container';
  container.innerHTML = `
    <div class="preview-wrapper">
      <div class="card-preview">
        <div class="card-content"></div>
      </div>
      <div class="preview-actions">
        <button class="download-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 13L12 16L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 20H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          下载图片
        </button>
        <button class="close-btn">关闭</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  return container;
};

// 生成卡片内容
const generateCard = (context) => {
  const { before, selected, after } = context;
  return `
    <div class="text-content">
      <span class="blur-text">${before}</span>
      <span class="selected-text">${selected}</span>
      <span class="blur-text">${after}</span>
    </div>
  `;
};

// 修改分享按钮点击事件
shareButton.onclick = () => {
  const context = getTextContext(selectedText);
  const previewContainer = createPreviewCard();
  const cardContent = previewContainer.querySelector('.card-content');
  cardContent.innerHTML = generateCard(context);
  
  // 下载按钮点击事件
  previewContainer.querySelector('.download-btn').onclick = async () => {
    const card = previewContainer.querySelector('.card-preview');
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
      });
      
      const link = document.createElement('a');
      link.download = '分享卡片.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('生成图片失败:', error);
    }
  };
  
  // 关闭按钮点击事件
  previewContainer.querySelector('.close-btn').onclick = () => {
    previewContainer.remove();
  };
  
  // 点击外部关闭预览
  previewContainer.onclick = (e) => {
    if (e.target === previewContainer) {
      previewContainer.remove();
    }
  };
}; 