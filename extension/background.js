// AI Guardian Extension - Background Service
let currentTab = null;
let currentSession = null;
let trackingData = {
    trackingSessions: [],
    idleSessions: [],
    lastUpdate: new Date().toISOString()
};

// Load saved data on startup
chrome.storage.local.get(['aiGuardianTrackingData'], (result) => {
    if (result.aiGuardianTrackingData) {
        trackingData = result.aiGuardianTrackingData;
        console.log('Tracking data loaded:', trackingData.trackingSessions.length, 'sessions');
    }
});

// Track tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && isTrackableUrl(tab.url)) {
            startNewSession(tab.url, tab.title);
        }
    });
});

// Track tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active && isTrackableUrl(changeInfo.url)) {
        startNewSession(changeInfo.url, tab.title);
    }
});

// Track idle state
chrome.idle.onStateChanged.addListener((state) => {
    if (state === 'idle' || state === 'locked') {
        endCurrentSession(true);
    } else if (state === 'active') {
        // User became active again
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url && isTrackableUrl(tabs[0].url)) {
                startNewSession(tabs[0].url, tabs[0].title);
            }
        });
    }
});

// Check if URL is trackable
function isTrackableUrl(url) {
    return url && (
        url.startsWith('http://') || 
        url.startsWith('https://') ||
        url.startsWith('file://')
    );
}

// Start new tracking session
function startNewSession(url, title) {
    // End previous session if exists
    if (currentSession) {
        endCurrentSession(false);
    }
    
    const domain = extractDomain(url);
    
    currentSession = {
        url: url,
        domain: domain,
        title: title,
        startTime: Date.now(),
        startTimestamp: new Date().toISOString()
    };
    
    currentTab = {
        url: url,
        domain: domain
    };
    
    // Notify popup
    chrome.runtime.sendMessage({
        type: 'CURRENT_WEBSITE',
        website: domain,
        startTime: currentSession.startTime,
        isIdle: false
    });
    
    console.log('New session started:', domain);
}

// End current session
function endCurrentSession(isIdle) {
    if (!currentSession) return;
    
    const duration = Date.now() - currentSession.startTime;
    
    // Only save if duration is significant (more than 5 seconds)
    if (duration > 5000) {
        const sessionData = {
            website: currentSession.domain,
            url: currentSession.url,
            title: currentSession.title,
            duration: duration,
            timestamp: currentSession.startTimestamp,
            endTimestamp: new Date().toISOString(),
            isIdle: isIdle
        };
        
        // Add to tracking data
        trackingData.trackingSessions.push(sessionData);
        
        // Keep only last 1000 sessions
        if (trackingData.trackingSessions.length > 1000) {
            trackingData.trackingSessions = trackingData.trackingSessions.slice(-1000);
        }
        
        trackingData.lastUpdate = new Date().toISOString();
        
        // Save to storage
        saveTrackingData();
        
        // Send to popup and main app
        chrome.runtime.sendMessage({
            type: 'TRACKING_DATA',
            data: sessionData
        });
        
        console.log('Session ended:', currentSession.domain, Math.floor(duration/1000), 'seconds');
    }
    
    currentSession = null;
}

// Extract domain from URL
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        let domain = urlObj.hostname;
        
        // Remove www. prefix
        if (domain.startsWith('www.')) {
            domain = domain.substring(4);
        }
        
        return domain;
    } catch (error) {
        // If URL parsing fails, return the URL as is
        return url;
    }
}

// Save tracking data to storage
function saveTrackingData() {
    chrome.storage.local.set({ 
        aiGuardianTrackingData: trackingData 
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Save failed:', chrome.runtime.lastError);
        }
    });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_CURRENT_WEBSITE':
            const activeTime = currentSession ? Date.now() - currentSession.startTime : 0;
            sendResponse({
                currentWebsite: currentSession ? currentSession.domain : 'No active website',
                activeTime: activeTime,
                isIdle: false
            });
            break;
            
        case 'GET_TRACKING_DATA':
            sendResponse(trackingData);
            break;
            
        case 'CLEAR_DATA':
            trackingData = {
                trackingSessions: [],
                idleSessions: [],
                lastUpdate: new Date().toISOString()
            };
            saveTrackingData();
            sendResponse({ success: true });
            break;
            
        case 'PING':
            sendResponse({ 
                status: 'alive', 
                version: '1.0.0',
                sessionsCount: trackingData.trackingSessions.length
            });
            break;
            
        case 'GET_PAGE_INFO':
            // Forward to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_INFO' }, (response) => {
                        sendResponse(response);
                    });
                }
            });
            return true; // Keep message channel open
            
        case 'USER_ACTIVITY':
            // Handle user activity updates from content script
            if (message.isIdle && currentSession) {
                endCurrentSession(true);
            }
            sendResponse({ received: true });
            break;
    }
    
    return true; // Keep message channel open for async responses
});

// Auto-save every 30 seconds
setInterval(() => {
    if (trackingData.trackingSessions.length > 0) {
        saveTrackingData();
    }
}, 30000);

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
    if (currentSession) {
        endCurrentSession(false);
    }
    saveTrackingData();
    console.log('Extension suspended, data saved');
});