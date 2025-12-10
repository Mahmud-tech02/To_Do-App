// Content Script - Injected into web pages
let lastActivityTime = Date.now();
let isIdle = false;
let activityCheckInterval;

// Initialize activity tracking
function initActivityTracking() {
    // Track mouse movements
    document.addEventListener('mousemove', updateActivity);
    
    // Track keyboard presses
    document.addEventListener('keydown', updateActivity);
    
    // Track clicks
    document.addEventListener('click', updateActivity);
    
    // Track scrolls
    document.addEventListener('scroll', updateActivity);
    
    // Start idle detection
    startIdleDetection();
}

// Update activity timestamp
function updateActivity() {
    lastActivityTime = Date.now();
    if (isIdle) {
        isIdle = false;
        notifyActivityChange(false);
    }
}

// Start idle detection
function startIdleDetection() {
    if (activityCheckInterval) {
        clearInterval(activityCheckInterval);
    }
    
    activityCheckInterval = setInterval(() => {
        const idleTime = Date.now() - lastActivityTime;
        const nowIdle = idleTime > 30000; // 30 seconds idle threshold
        
        if (nowIdle !== isIdle) {
            isIdle = nowIdle;
            notifyActivityChange(nowIdle);
        }
    }, 5000); // Check every 5 seconds
}

// Notify background script about activity change
function notifyActivityChange(idle) {
    chrome.runtime.sendMessage({
        type: 'USER_ACTIVITY',
        isIdle: idle,
        idleTime: Date.now() - lastActivityTime,
        url: window.location.href,
        timestamp: new Date().toISOString()
    });
}

// Get current page information
function getPageInfo() {
    return {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        timestamp: new Date().toISOString(),
        isIdle: isIdle,
        idleTime: Date.now() - lastActivityTime
    };
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_PAGE_INFO':
            sendResponse(getPageInfo());
            break;
            
        case 'PING':
            sendResponse({ status: 'alive', page: document.title });
            break;
    }
    return true; // Keep message channel open
});

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivityTracking);
} else {
    initActivityTracking();
}

// Send initial page info
setTimeout(() => {
    chrome.runtime.sendMessage({
        type: 'PAGE_LOADED',
        data: getPageInfo()
    });
}, 1000);