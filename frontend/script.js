document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const welcomeScreen = document.getElementById("welcomeScreen");
  const chatMessages = document.getElementById("chatMessages");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const attachBtn = document.getElementById("attachBtn");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const newChatBtn = document.getElementById("newChatBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const toggleThemeBtn = document.getElementById("toggleThemeBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const exportBtn = document.getElementById("exportBtn");
  const settingsBtnSidebar = document.getElementById("settingsBtnSidebar");
  
  // Settings modal elements
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");
  const saveSettings = document.getElementById("saveSettings");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const autoSaveToggle = document.getElementById("autoSaveToggle");
  const typingIndicatorToggle = document.getElementById("typingIndicatorToggle");
  const aiModelSelect = document.getElementById("aiModelSelect");
  const exportAllData = document.getElementById("exportAllData");
  const clearAllData = document.getElementById("clearAllData");
  
  // Notification elements
  const notificationBanner = document.getElementById("notificationBanner");
  const notificationMessage = document.getElementById("notificationMessage");
  const notificationClose = document.getElementById("notificationClose");
  
  // Scroll to top elements
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  // State
  let isSidebarOpen = true;
  let isGenerating = false;
  let currentChatId = null;
  let chatHistory = [];
  let chatSessions = [];
  let backendConnected = false;

  // Initialize
  initializeApp();

  function initializeApp() {
    // Load saved theme
    loadTheme();
    
    // Show welcome message immediately
    showWelcomeMessage();
    
    // Load chat history
    loadChatHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Handle responsive behavior
    handleResponsiveBehavior();
    
    // Auto-resize textarea
    setupTextareaAutoResize();
    
    // Test backend connection
    testBackendConnection();
  }

  async function testBackendConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await fetch('http://127.0.0.1:5000/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
        backendConnected = true;
        hideNotification();
        
        // Show success notification if Ollama is connected
        if (data.ollama === 'connected') {
          showNotification('Backend and Ollama connected successfully!', 'success');
        } else {
          showNotification('Backend connected, but Ollama is not running', 'warning');
        }
      } else {
        console.warn('⚠️ Backend responded but with error status:', response.status);
        backendConnected = false;
        showNotification('Backend connection failed', 'error');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      backendConnected = false;
      showNotification('Cannot connect to backend server', 'error');
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
      updateThemeIcon(true);
    } else {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      updateThemeIcon(false);
    }
  }

  function toggleTheme() {
    const isLight = document.body.classList.toggle("light");
    document.body.classList.toggle("dark", !isLight);
    updateThemeIcon(isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }

  function updateThemeIcon(isLight) {
    const themeIcon = toggleThemeBtn.querySelector("i");
    themeIcon.className = isLight ? "fas fa-moon" : "fas fa-sun";
  }

  function loadChatHistory() {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      chatHistory = JSON.parse(savedHistory);
    }
    
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      chatSessions = JSON.parse(savedSessions);
    }
    
    renderDynamicSidebar();
    // Welcome message is already shown in initializeApp()
  }

  function showWelcomeMessage() {
    console.log("Showing welcome message...");
    if (welcomeScreen) {
      welcomeScreen.style.display = "flex";
    }
    if (chatMessages) {
      chatMessages.innerHTML = "";
      chatMessages.style.display = "none";
    }
    console.log("Welcome message displayed successfully");
  }

  function hideWelcomeMessage() {
    if (welcomeScreen) {
      welcomeScreen.style.display = "none";
    }
    if (chatMessages) {
      chatMessages.style.display = "block";
    }
  }

  function appendMessage(sender, text, messageId = null, sessionId = null) {
    // Hide welcome message when first message is sent
    hideWelcomeMessage();

    if (!chatMessages) {
      console.error("Chat messages container not found");
      return;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.dataset.messageId = messageId || Date.now();
    
    // Check if message should be collapsible (assistant messages longer than 150 words)
    const shouldCollapse = sender === 'assistant' && text.split(' ').length > 150;
    const messageTextClass = shouldCollapse ? 'message-text collapsed' : 'message-text';
    const expandButton = shouldCollapse ? `
      <button class="message-expand-btn" onclick="toggleMessageCollapse('${messageDiv.dataset.messageId}')">
        <span>Show More</span>
        <i class="fas fa-chevron-down"></i>
      </button>
    ` : '';

    // Create proper ChatGPT-style message structure
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
      </div>
      <div class="message-content">
        <div class="${messageTextClass}">${text}</div>
        ${expandButton}
        <div class="message-actions">
          <button class="message-action" onclick="copyMessage('${text.replace(/'/g, "\\'")}')" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
          ${sender === "assistant" ? `<button class="message-action" onclick="regenerateMessage('${messageDiv.dataset.messageId}')" title="Regenerate">
            <i class="fas fa-redo"></i>
          </button>` : ''}
        </div>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom with smooth behavior
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 10);
    
    // Save to history
    if (messageId) {
      const message = chatHistory.find(m => m.id === messageId);
      if (message) {
        message.text = text;
        message.timestamp = new Date().toISOString();
      }
    } else {
      const newMessage = {
        id: messageDiv.dataset.messageId,
        sender,
        text,
        timestamp: new Date().toISOString(),
        sessionId: sessionId || currentChatId || 'default'
      };
      chatHistory.push(newMessage);
    }
    
    saveChatHistory();
    renderHistory();
  }

  function showTypingIndicator() {
    if (!chatMessages) {
      console.error("Chat messages container not found");
      return null;
    }

    const typingDiv = document.createElement("div");
    typingDiv.className = "message assistant typing";
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="typing-indicator">
          <span>NEXUS is typing</span>
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom with smooth behavior
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 10);
    
    return typingDiv;
  }

  function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async function sendMessage() {
    if (!userInput) {
      console.error("User input element not found");
      return;
    }
    
    const msg = userInput.value.trim();
    if (!msg || isGenerating) return;

    // Create new chat if needed
    if (!currentChatId) {
      currentChatId = Date.now().toString();
    }

    // Add user message with session ID
    appendMessage("user", msg, null, currentChatId);
    userInput.value = "";
    adjustTextareaHeight();

    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Disable send button
    isGenerating = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-stop"></i>';

    try {
      console.log('📤 Sending message to backend:', msg);
      
      // Get AI model from settings
      const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const aiModel = settings.aiModel || 'gemma:2b';
      
      const res = await fetch('http://127.0.0.1:5000/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          command: msg,
          model: aiModel
        })
      });
      
      console.log('📥 Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📥 Response data:', data);
      
      // Remove typing indicator
      removeTypingIndicator();
      
      // Add assistant response with session ID
      const responseText = data.response || "I'm sorry, I couldn't generate a response.";
      appendMessage("assistant", responseText, null, currentChatId);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      removeTypingIndicator();
      
      let errorMessage = "I'm sorry, I'm having trouble connecting to the server.";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "I'm sorry, I can't connect to the backend server. Please make sure the backend is running on http://localhost:5000";
        showNotification("Backend connection failed", "error");
      } else if (error.message.includes('HTTP error')) {
        errorMessage = "I'm sorry, there was a server error. Please try again.";
      }
      
      appendMessage("assistant", errorMessage, null, currentChatId);
    } finally {
      // Re-enable send button
      isGenerating = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
  }

  // Notification functions
  function showNotification(message, type = 'warning') {
    if (!notificationBanner || !notificationMessage) return;
    
    notificationMessage.textContent = message;
    notificationBanner.className = `notification-banner ${type}`;
    notificationBanner.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }

  function hideNotification() {
    if (notificationBanner) {
      notificationBanner.classList.add('hidden');
    }
  }

  function renderDynamicSidebar() {
    // Group messages by session
    const sessions = groupMessagesBySession(chatHistory);
    
    // Update Recent section
    updateSidebarSection('recentContent', sessions.recent || [], 'Recent');
    
    // Update Previous 7 Days section
    updateSidebarSection('historyContent', sessions.last7Days || [], 'Previous 7 Days');
    
    // Update Previous 30 Days section
    updateSidebarSection('archivedContent', sessions.last30Days || [], 'Previous 30 Days');
  }

  function groupMessagesBySession(messages) {
    const now = new Date();
    const sessions = {
      recent: [],
      last7Days: [],
      last30Days: []
    };

    // Group messages by session ID
    const sessionMap = {};
    messages.forEach(msg => {
      const sessionId = msg.sessionId || 'default';
      if (!sessionMap[sessionId]) {
        sessionMap[sessionId] = {
          id: sessionId,
          title: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
          lastMessage: msg.text,
          timestamp: new Date(msg.timestamp),
          messageCount: 0
        };
      }
      sessionMap[sessionId].messageCount++;
      if (new Date(msg.timestamp) > sessionMap[sessionId].timestamp) {
        sessionMap[sessionId].timestamp = new Date(msg.timestamp);
        sessionMap[sessionId].lastMessage = msg.text;
      }
    });

    // Categorize sessions by date
    Object.values(sessionMap).forEach(session => {
      const daysDiff = (now - session.timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 1) {
        sessions.recent.push(session);
      } else if (daysDiff <= 7) {
        sessions.last7Days.push(session);
      } else if (daysDiff <= 30) {
        sessions.last30Days.push(session);
      }
    });

    // Sort by timestamp (newest first)
    Object.keys(sessions).forEach(key => {
      sessions[key].sort((a, b) => b.timestamp - a.timestamp);
    });

    return sessions;
  }

  function updateSidebarSection(sectionId, sessions, title) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (sessions.length === 0) {
      section.innerHTML = `<div class="empty-state">
        <i class="fas fa-message"></i>
        <p>No conversations yet</p>
        <small>Start a new chat to see it here</small>
      </div>`;
      return;
    }

    section.innerHTML = sessions.map(session => `
      <div class="chat-item" onclick="loadChatSession('${session.id}')">
        <i class="fas fa-message"></i>
        <span class="chat-item-text">${session.title}</span>
        <div class="chat-item-menu">
          <button class="chat-menu-btn" onclick="event.stopPropagation(); deleteChatSession('${session.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderHistory() {
    // This function is kept for compatibility but not used in the new UI
    // The sidebar now shows dynamic chat items
    renderDynamicSidebar();
  }

  function loadChatSession(sessionId) {
    const sessionMessages = chatHistory.filter(msg => (msg.sessionId || "default") === sessionId);
    chatMessages.innerHTML = "";
    hideWelcomeMessage();
    
    sessionMessages.forEach(msg => {
      appendMessage(msg.sender, msg.text, msg.id);
    });
    
    currentChatId = sessionId;
    
    // Scroll to bottom after loading all messages
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }

  function deleteChatSession(sessionId) {
    if (confirm('Are you sure you want to delete this conversation?')) {
      chatHistory = chatHistory.filter(msg => (msg.sessionId || "default") !== sessionId);
      saveChatHistory();
      renderDynamicSidebar();
      
      // If this was the current session, show welcome message
      if (currentChatId === sessionId) {
        newChat();
      }
    }
  }

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  function saveChatHistory() {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }

  function newChat() {
    currentChatId = null;
    if (chatMessages) {
      chatMessages.innerHTML = "";
    }
    showWelcomeMessage();
    if (userInput) {
      userInput.focus();
    }
  }

  function exportChat() {
    if (chatHistory.length === 0) {
      alert("No chat history to export.");
      return;
    }
    
    const content = chatHistory.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}] ${m.sender.toUpperCase()}: ${m.text}`
    ).join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus_chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearHistory() {
    if (confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      chatHistory = [];
      localStorage.removeItem("chatHistory");
      if (chatMessages) {
        chatMessages.innerHTML = "";
      }
      showWelcomeMessage();
      renderHistory();
    }
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    
    if (window.innerWidth <= 768) {
      // Mobile behavior
      sidebar.classList.toggle("open", isSidebarOpen);
      sidebarOverlay.classList.toggle("active", isSidebarOpen);
      document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    } else {
      // Desktop behavior
      document.body.classList.toggle("sidebar-collapsed", !isSidebarOpen);
    }
  }

  function toggleSection(toggleBtn, content) {
    const isCollapsed = content.classList.contains('collapsed');
    content.classList.toggle('collapsed', !isCollapsed);
    toggleBtn.classList.toggle('collapsed', !isCollapsed);
  }

  function setupTextareaAutoResize() {
    if (!userInput) {
      console.error("User input element not found");
      return;
    }
    
    userInput.addEventListener("input", adjustTextareaHeight);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function adjustTextareaHeight() {
    if (!userInput) {
      console.error("User input element not found");
      return;
    }
    
    userInput.style.height = "auto";
    const newHeight = Math.min(userInput.scrollHeight, 128);
    userInput.style.height = newHeight + "px";
    
    // Adjust input wrapper height
    const inputWrapper = userInput.parentElement;
    if (inputWrapper) {
      inputWrapper.style.minHeight = Math.max(2.5, newHeight / 16) + "rem";
    }
  }

  function setupEventListeners() {
    // Message sending
    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
    }

    // Sidebar controls
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", toggleSidebar);
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        if (isSidebarOpen) {
          toggleSidebar();
        }
      });
    }

    // Theme toggle
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener("click", toggleTheme);
    }

    // History controls
    if (newChatBtn) {
      newChatBtn.addEventListener("click", newChat);
    }

    // Section toggles
    const recentToggle = document.getElementById('recentToggle');
    const historyToggle = document.getElementById('historyToggle');
    const archivedToggle = document.getElementById('archivedToggle');

    const recentContent = document.getElementById('recentContent');
    const historyContent = document.getElementById('historyContent');
    const archivedContent = document.getElementById('archivedContent');

    if (recentToggle && recentContent) {
      recentToggle.addEventListener('click', () => toggleSection(recentToggle, recentContent));
    }
    if (historyToggle && historyContent) {
      historyToggle.addEventListener('click', () => toggleSection(historyToggle, historyContent));
    }
    if (archivedToggle && archivedContent) {
      archivedToggle.addEventListener('click', () => toggleSection(archivedToggle, archivedContent));
    }

    // Sidebar buttons
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", clearHistory);
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", exportChat);
    }

    if (settingsBtnSidebar) {
      settingsBtnSidebar.addEventListener("click", openSettings);
    }

    // Settings modal
    if (closeSettings) {
      closeSettings.addEventListener("click", closeSettingsModal);
    }

    if (saveSettings) {
      saveSettings.addEventListener("click", saveSettingsData);
    }

    if (exportAllData) {
      exportAllData.addEventListener("click", exportAllChatData);
    }

    if (clearAllData) {
      clearAllData.addEventListener("click", clearAllChatData);
    }

    // Theme options in settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        setThemeFromSettings(theme);
      });
    });

    // Attach button
    if (attachBtn) {
      attachBtn.addEventListener("click", () => {
        alert("File attachment coming soon!");
      });
    }

    // Notification close button
    if (notificationClose) {
      notificationClose.addEventListener("click", hideNotification);
    }

    // Scroll to top button
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener("click", scrollToTop);
    }

    // Chat messages scroll listener
    if (chatMessages) {
      chatMessages.addEventListener("scroll", handleChatScroll);
    }
  }

  function handleResponsiveBehavior() {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        // Desktop: reset mobile states
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
      } else {
        // Mobile: close sidebar by default
        if (isSidebarOpen) {
          toggleSidebar();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
  }

  // Settings modal functions
  function openSettings() {
    settingsModal.classList.add('active');
    loadSettingsData();
    updateThemeOptions();
  }

  function closeSettingsModal() {
    settingsModal.classList.remove('active');
  }

  function loadSettingsData() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if (usernameInput) usernameInput.value = settings.username || 'NEXUS User';
    if (emailInput) emailInput.value = settings.email || 'user@nexus.com';
    if (autoSaveToggle) autoSaveToggle.checked = settings.autoSave !== false;
    if (typingIndicatorToggle) typingIndicatorToggle.checked = settings.typingIndicator !== false;
    if (aiModelSelect) aiModelSelect.value = settings.aiModel || 'gemma:2b';
  }

  function saveSettingsData() {
    const settings = {
      username: usernameInput?.value || 'NEXUS User',
      email: emailInput?.value || 'user@nexus.com',
      autoSave: autoSaveToggle?.checked || true,
      typingIndicator: typingIndicatorToggle?.checked || true,
      aiModel: aiModelSelect?.value || 'gemma:2b'
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    closeSettingsModal();
    
    // Show success message
    showNotification('Settings saved successfully!', 'success');
  }

  function setThemeFromSettings(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
    updateThemeIcon(theme === 'light');
    localStorage.setItem('theme', theme);
    updateThemeOptions();
  }

  function updateThemeOptions() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.theme === currentTheme);
    });
  }

  function exportAllChatData() {
    if (chatHistory.length === 0) {
      alert('No chat data to export.');
      return;
    }
    
    const content = chatHistory.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}] ${m.sender.toUpperCase()}: ${m.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_complete_chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAllChatData() {
    if (confirm('Are you sure you want to clear ALL chat data? This action cannot be undone.')) {
      chatHistory = [];
      localStorage.removeItem('chatHistory');
      chatMessages.innerHTML = '';
      showWelcomeMessage();
  renderHistory();
      closeSettingsModal();
      alert('All chat data has been cleared.');
    }
  }

  // Right panel functions - removed as they're not used in the new UI

  // Scroll to top functionality
  function handleChatScroll() {
    if (!chatMessages || !scrollToTopBtn) return;
    
    const scrollTop = chatMessages.scrollTop;
    const scrollThreshold = 200;
    
    if (scrollTop > scrollThreshold) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    if (!chatMessages) return;
    
    chatMessages.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Message collapse functionality
  function toggleMessageCollapse(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const messageText = messageElement.querySelector('.message-text');
    const expandBtn = messageElement.querySelector('.message-expand-btn');
    const btnText = expandBtn.querySelector('span');
    const btnIcon = expandBtn.querySelector('i');
    
    if (messageText.classList.contains('collapsed')) {
      // Expand the message
      messageText.classList.remove('collapsed');
      btnText.textContent = 'Show Less';
      btnIcon.className = 'fas fa-chevron-up';
      expandBtn.classList.add('expanded');
    } else {
      // Collapse the message
      messageText.classList.add('collapsed');
      btnText.textContent = 'Show More';
      btnIcon.className = 'fas fa-chevron-down';
      expandBtn.classList.remove('expanded');
    }
  }

  // Global functions
  window.sendExamplePrompt = sendExamplePrompt;
  window.loadChatSession = loadChatSession;
  window.deleteChatSession = deleteChatSession;
  window.toggleMessageCollapse = toggleMessageCollapse;
  
  // Global functions for message actions
  window.copyMessage = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show brief feedback
      const button = event.target.closest('.message-action');
      const originalIcon = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        button.innerHTML = originalIcon;
      }, 1000);
    });
  };

  window.regenerateMessage = function(messageId) {
    // Find the message and regenerate
    const message = chatHistory.find(m => m.id === messageId);
    if (message) {
      userInput.value = message.text;
      sendMessage();
    }
  };

  // Example prompt function
  function sendExamplePrompt(prompt) {
    if (userInput) {
      userInput.value = prompt;
      sendMessage();
    } else {
      console.error("User input element not found");
    }
  }

  // Auto-focus input
  if (userInput) {
    userInput.focus();
  }
  
  // Ensure welcome message is shown on page load
  setTimeout(() => {
    if (chatMessages && chatMessages.children.length === 0) {
      showWelcomeMessage();
    }
  }, 100);
  
  // Additional fallback after a longer delay
  setTimeout(() => {
    if (chatMessages && chatMessages.children.length === 0) {
      showWelcomeMessage();
    }
  }, 500);
});
