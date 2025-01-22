// 语言配置
const i18n = {
  zh: {
    title: '一键图文摘抄',
    description: '开启后即可划词生成精美卡片',
    toggleFeature: '划词分享',
    languageSettings: '语言设置'
  },
  en: {
    title: 'Text Capture & Share',
    description: 'Select text to create beautiful share cards',
    toggleFeature: 'Text Selection',
    languageSettings: 'Language'
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('featureToggle');
  const languageSelect = document.getElementById('languageSelect');
  
  // 加载保存的开关状态和语言设置
  chrome.storage.sync.get(['featureEnabled', 'language'], function(result) {
    // 设置开关状态
    toggle.checked = result.featureEnabled !== false;
    
    // 设置语言，默认为英语
    const currentLang = result.language || 'en';
    languageSelect.value = currentLang;
    updateLanguage(currentLang);
  });

  // 监听开关变化
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    // 保存开关状态
    chrome.storage.sync.set({ featureEnabled: isEnabled }, function() {
      // 通知当前标签页更新状态
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'toggleFeature',
          enabled: isEnabled
        });
      });
    });
  });

  // 监听语言选择变化
  languageSelect.addEventListener('change', function() {
    const selectedLang = languageSelect.value;
    chrome.storage.sync.set({ language: selectedLang }, function() {
      updateLanguage(selectedLang);
      // 通知其他页面更新语言
      chrome.runtime.sendMessage({
        type: 'languageChanged',
        language: selectedLang
      });
    });
  });
});

// 更新界面语言
function updateLanguage(lang) {
  const texts = i18n[lang];
  document.querySelector('h1').textContent = texts.title;
  document.querySelector('.description').textContent = texts.description;
  document.querySelector('.switch-title').textContent = texts.toggleFeature;
  document.querySelector('.setting-label').textContent = texts.languageSettings;
}
