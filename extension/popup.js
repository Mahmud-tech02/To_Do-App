// DOM Elements
const currentWebsiteEl = document.getElementById('currentWebsite');
const currentTimeEl = document.getElementById('currentTime');
const statusDotEl = document.getElementById('statusDot');
const statusTextEl = document.getElementById('statusText');
const todayTimeEl = document.getElementById('todayTime');
const productiveTimeEl = document.getElementById('productiveTime');
const websitesCountEl = document.getElementById('websitesCount');
const idleTimeEl = document.getElementById('idleTime');
const websiteListEl = document.getElementById('websiteList');
const openAppBtn = document.getElementById('openAppBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentTracking();
    loadStatistics();
    loadRecentWebsites();
    startUpdateTimer();
    
    // Button event listeners
    openAppBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('../index.html') });
    });
    
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all tracking data?')) {
            chrome.runtime.sendMessage({ type: 'CLEAR_DATA' }, (response) => {
                if (response.success) {
                    alert('Data cleared successfully');
                    loadStatistics();
                    loadRecentWebsites();
                }
            });
        }
    });
});

// Load current tracking info
function loadCurrentTracking() {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_WEBSITE' }, (response) => {
        if (response && response.currentWebsite) {
            updateCurrentWebsite(response.currentWebsite, response.activeTime, response.isIdle);
        } else {
            updateCurrentWebsite('Not tracking', 0, false);
        }
    });
}

// Update current website display
function updateCurrentWebsite(website, activeTime, isIdle) {
    currentWebsiteEl.textContent = website;
    
    // Update time
    const minutes = Math.floor(activeTime / 60000);
    const seconds = Math.floor((activeTime % 60000) / 1000);
    currentTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update status
    if (isIdle) {
        statusDotEl.className = 'status-dot idle';
        statusTextEl.textContent = 'Idle';
    } else if (website === 'Not tracking') {
        statusDotEl.className = 'status-dot inactive';
        statusTextEl.textContent = 'Inactive';
    } else {
        statusDotEl.className = 'status-dot active';
        statusTextEl.textContent = 'Active';
    }
}

// Load statistics
function loadStatistics() {
    chrome.runtime.sendMessage({ type: 'GET_TRACKING_DATA' }, (data) => {
        if (!data) {
            setDefaultStats();
            return;
        }
        
        const sessions = data.trackingSessions || [];
        const idleSessions = data.idleSessions || [];
        
        // Calculate today's time
        const today = new Date().toDateString();
        const todaySessions = sessions.filter(s => {
            return new Date(s.timestamp).toDateString() === today;
        });
        
        const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        todayTimeEl.textContent = `${Math.floor(totalSeconds / 3600)}h`;
        
        // Calculate productive time (excluding social/entertainment)
        const productiveSessions = todaySessions.filter(s => {
            const unproductiveSites = ['facebook.com', 'youtube.com', 'twitter.com', 'instagram.com', 'netflix.com'];
            return !unproductiveSites.some(site => s.website.includes(site));
        });
        
        const productiveSeconds = productiveSessions.reduce((sum, s) => sum + s.duration, 0);
        productiveTimeEl.textContent = `${Math.floor(productiveSeconds / 3600)}h`;
        
        // Count unique websites
        const uniqueWebsites = [...new Set(todaySessions.map(s => s.website))];
        websitesCountEl.textContent = uniqueWebsites.length;
        
        // Calculate idle time
        const todayIdle = idleSessions.filter(s => {
            return new Date(s.timestamp).toDateString() === today;
        });
        
        const idleSeconds = todayIdle.reduce((sum, s) => sum + s.duration, 0);
        idleTimeEl.textContent = `${Math.floor(idleSeconds / 60)}m`;
    });
}

// Set default stats when no data
function setDefaultStats() {
    todayTimeEl.textContent = '0h';
    productiveTimeEl.textContent = '0h';
    websitesCountEl.textContent = '0';
    idleTimeEl.textContent = '0m';
}

// Load recent websites
function loadRecentWebsites() {
    chrome.runtime.sendMessage({ type: 'GET_TRACKING_DATA' }, (data) => {
        if (!data) {
            websiteListEl.innerHTML = '<div class="website-item">No data yet</div>';
            return;
        }
        
        const sessions = data.trackingSessions || [];
        
        // Get today's sessions grouped by website
        const today = new Date().toDateString();
        const todaySessions = sessions.filter(s => {
            return new Date(s.timestamp).toDateString() === today;
        });
        
        if (todaySessions.length === 0) {
            websiteListEl.innerHTML = '<div class="website-item">No activity today</div>';
            return;
        }
        
        // Group by website and sum durations
        const websiteMap = {};
        todaySessions.forEach(session => {
            if (!websiteMap[session.website]) {
                websiteMap[session.website] = 0;
            }
            websiteMap[session.website] += session.duration;
        });
        
        // Convert to array and sort by time
        const websiteArray = Object.entries(websiteMap)
            .map(([website, seconds]) => ({
                website,
                minutes: Math.floor(seconds / 60)
            }))
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, 5); // Top 5
        
        // Update UI
        websiteListEl.innerHTML = '';
        websiteArray.forEach(item => {
            const div = document.createElement('div');
            div.className = 'website-item';
            div.innerHTML = `
                <span>${truncateWebsite(item.website)}</span>
                <span class="website-time">${item.minutes}m</span>
            `;
            websiteListEl.appendChild(div);
        });
    });
}

// Truncate long website names - FIXED VERSION
function truncateWebsite(website) {
    if (!website) return 'Unknown';
    
    try {
        // Try to extract domain name
        if (website.includes('://')) {
            const url = new URL(website);
            let domain = url.hostname;
            if (domain.startsWith('www.')) {
                domain = domain.substring(4);
            }
            website = domain;
        }
        
        // Truncate if still too long
        if (website.length > 20) {
            return website.substring(0, 20) + '...';
        }
        return website;
    } catch (error) {
        // If URL parsing fails, truncate the original string
        if (website.length > 20) {
            return website.substring(0, 20) + '...';
        }
        return website;
    }
}

// Start update timer
function startUpdateTimer() {
    // Update current time every second
    setInterval(() => {
        chrome.runtime.sendMessage({ type: 'GET_CURRENT_WEBSITE' }, (response) => {
            if (response && response.currentWebsite) {
                updateCurrentWebsite(response.currentWebsite, response.activeTime, response.isIdle);
            }
        });
    }, 1000);
    
    // Update stats every 30 seconds
    setInterval(() => {
        loadStatistics();
        loadRecentWebsites();
    }, 30000);
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TRACKING_DATA') {
        // Update stats when new data comes in
        loadStatistics();
        loadRecentWebsites();
    }
    return true;
});