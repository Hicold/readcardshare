// 初始化时设置默认语言
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['language'], function(result) {
    const defaultLanguage = result.language || 'en';
    chrome.storage.sync.set({ language: defaultLanguage });
  });
});

// 监听语言变更消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'languageChanged') {
    // 可以在这里处理其他需要响应语言变更的逻辑
    console.log('Language changed to:', message.language);
  }
}); 