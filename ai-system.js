// AI System Integration for Main App
class AISystem {
    constructor(config = {}) {
        this.config = {
            serverUrl: config.serverUrl || 'http://localhost:3001',
            wsUrl: config.wsUrl || 'ws://localhost:3001',
            enableRealtime: config.enableRealtime !== false,
            enableScreenAnalysis: config.enableScreenAnalysis !== false,
            userId: config.userId || this.generateUserId()
        };
        
        this.socket = null;
        this.isConnected = false;
        this.analysisHistory = [];
        this.predictions = {};
        this.screenAnalyzer = null;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing AI System...');
        
        // Generate user ID if not provided
        if (!this.config.userId) {
            this.config.userId = this.generateUserId();
            localStorage.setItem('ai_user_id', this.config.userId);
        }
        
        // Initialize WebSocket connection
        if (this.config.enableRealtime) {
            await this.connectWebSocket();
        }
        
        // Initialize screen analyzer
        if (this.config.enableScreenAnalysis && this.hasScreenCapturePermission()) {
            this.screenAnalyzer = new ScreenCaptureAnalyzer(this.config.userId);
            await this.screenAnalyzer.init();
        }
        
        // Start periodic analysis
        this.startPeriodicAnalysis();
        
        console.log('AI System initialized for user:', this.config.userId);
    }
    
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.config.wsUrl);
            
            this.socket.onopen = () => {
                console.log('AI WebSocket connected');
                this.isConnected = true;
                
                // Join with user ID
                this.socket.send(JSON.stringify({
                    type: 'join',
                    userId: this.config.userId
                }));
                
                resolve();
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleAIMessage(data);
                } catch (error) {
                    console.error('Failed to parse AI message:', error);
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('AI WebSocket error:', error);
                this.isConnected = false;
                reject(error);
            };
            
            this.socket.onclose = () => {
                console.log('AI WebSocket disconnected');
                this.isConnected = false;
                
                // Try to reconnect after 5 seconds
                setTimeout(() => {
                    if (!this.isConnected) {
                        this.connectWebSocket();
                    }
                }, 5000);
            };
        });
    }
    
    handleAIMessage(data) {
        console.log('AI Message received:', data.type);
        
        switch (data.type) {
            case 'ai_analysis':
                this.handleAIAnalysis(data.data);
                break;
                
            case 'ai_predictions':
                this.handleAIPredictions(data.data);
                break;
                
            case 'ai_suggestions':
                this.handleAISuggestions(data.data);
                break;
                
            case 'ai_warning':
                this.handleAIWarning(data.data);
                break;
        }
        
        // Store in history
        this.analysisHistory.push({
            type: data.type,
            data: data.data,
            timestamp: data.timestamp || new Date().toISOString()
        });
        
        // Keep only last 1000 entries
        if (this.analysisHistory.length > 1000) {
            this.analysisHistory.shift();
        }
        
        // Update UI
        this.updateUI(data);
    }
    
    handleAIAnalysis(analysis) {
        console.log('AI Analysis:', analysis);
        
        // Update local storage
        const aiData = JSON.parse(localStorage.getItem('ai_analysis_data') || '[]');
        aiData.push({
            ...analysis,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 analyses
        if (aiData.length > 100) {
            aiData.shift();
        }
        
        localStorage.setItem('ai_analysis_data', JSON.stringify(aiData));
        
        // Update app state
        if (window.app && window.app.updateAIAnalysis) {
            window.app.updateAIAnalysis(analysis);
        }
        
        // Show notification if needed
        if (analysis.is_distracted && analysis.productivity_score < 40) {
            this.showDistractionAlert();
        }
    }
    
    handleAIPredictions(predictions) {
        console.log('AI Predictions:', predictions);
        this.predictions = predictions;
        
        // Update predictions display
        this.updatePredictionsUI(predictions);
        
        // Schedule notifications based on predictions
        this.schedulePredictionNotifications(predictions);
    }
    
    handleAISuggestions(suggestions) {
        console.log('AI Suggestions:', suggestions);
        
        // Add to suggestions list
        const existing = JSON.parse(localStorage.getItem('ai_suggestions') || '[]');
        const newSuggestions = suggestions.filter(s => 
            !existing.some(es => es.text === s.text)
        );
        
        localStorage.setItem('ai_suggestions', 
            JSON.stringify([...newSuggestions, ...existing].slice(0, 50))
        );
        
        // Show latest suggestion
        if (newSuggestions.length > 0) {
            this.showSuggestionNotification(newSuggestions[0]);
        }
    }
    
    handleAIWarning(warning) {
        console.warn('AI Warning:', warning);
        
        // Show warning notification
        this.showWarningNotification(warning);
        
        // Log warning for analytics
        this.logWarning(warning);
    }
    
    async sendActivityData(activity) {
        if (!this.isConnected) {
            console.warn('AI System not connected');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'activity_data',
            userId: this.config.userId,
            activity: activity
        }));
    }
    
    async sendScreenData(imageData, metadata = {}) {
        if (!this.isConnected) {
            console.warn('AI System not connected');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'screen_data',
            userId: this.config.userId,
            imageData: imageData,
            timestamp: new Date().toISOString(),
            metadata: metadata
        }));
    }
    
    async getAIAnalysis(activities) {
        try {
            const response = await fetch(`${this.config.serverUrl}/api/ai/analyze-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.config.userId,
                    activities: activities
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('AI Analysis request failed:', error);
            return this.getFallbackAnalysis(activities);
        }
    }
    
    async generateAIPlan(goals, constraints = {}) {
        try {
            const response = await fetch(`${this.config.serverUrl}/api/ai/generate-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.config.userId,
                    goals: goals,
                    constraints: constraints
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.plan;
            } else {
                throw new Error(data.error || 'Plan generation failed');
            }
        } catch (error) {
            console.error('AI Plan generation failed:', error);
            return this.generateFallbackPlan(goals, constraints);
        }
    }
    
    getFallbackAnalysis(activities) {
        // Fallback analysis when AI server is unavailable
        return {
            success: true,
            analysis: activities.map(activity => ({
                ...activity,
                productivity: this.calculateFallbackProductivity(activity),
                distraction: this.calculateFallbackDistraction(activity),
                suggestions: this.generateFallbackSuggestions(activity)
            })),
            predictions: this.generateFallbackPredictions(activities),
            timestamp: new Date().toISOString()
        };
    }
    
    generateFallbackPlan(goals, constraints) {
        return {
            daily_schedule: this.createBasicSchedule(goals),
            focus_sessions: [
                { start: '09:00', end: '11:00', type: 'deep_work' },
                { start: '14:00', end: '16:00', type: 'deep_work' }
            ],
            break_times: [
                '11:00-11:15',
                '13:00-14:00',
                '16:00-16:15'
            ],
            priority_tasks: goals.tasks.slice(0, 3),
            warnings: ['AI system offline, using basic plan']
        };
    }
    
    updateUI(data) {
        // Update various UI components based on AI data
        this.updateAIDashboard(data);
        this.updateProductivityChart(data);
        this.updateSuggestionsPanel(data);
        this.updatePredictionsDisplay(data);
    }
    
    updateAIDashboard(data) {
        const dashboard = document.getElementById('aiDashboard');
        if (!dashboard) return;
        
        const html = `
            <div class="ai-dashboard">
                <h3><i class="fas fa-brain"></i> AI Analysis Dashboard</h3>
                <div class="ai-metrics">
                    <div class="ai-metric">
                        <span class="metric-label">Current Focus:</span>
                        <span class="metric-value">${data.data?.productivity_score || 0}%</span>
                    </div>
                    <div class="ai-metric">
                        <span class="metric-label">Distraction Level:</span>
                        <span class="metric-value">${data.data?.distraction_level || 0}%</span>
                    </div>
                    <div class="ai-metric">
                        <span class="metric-label">AI Confidence:</span>
                        <span class="metric-value">${data.data?.confidence || 0}%</span>
                    </div>
                </div>
                ${data.data?.suggestions ? `
                    <div class="ai-suggestions">
                        <h4>Suggestions:</h4>
                        <ul>
                            ${data.data.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        dashboard.innerHTML = html;
    }
    
    updatePredictionsUI(predictions) {
        const container = document.getElementById('aiPredictions');
        if (!container || !predictions) return;
        
        const html = `
            <div class="ai-predictions">
                <h3><i class="fas fa-crystal-ball"></i> AI Predictions</h3>
                <div class="prediction-item">
                    <span class="prediction-label">Next Break:</span>
                    <span class="prediction-value">${this.formatTime(predictions.recommended_break)}</span>
                </div>
                <div class="prediction-item">
                    <span class="prediction-label">Productivity Peak:</span>
                    <span class="prediction-value">${predictions.productivity_peak}</span>
                </div>
                <div class="prediction-item">
                    <span class="prediction-label">Focus Duration:</span>
                    <span class="prediction-value">${predictions.focus_duration} minutes</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    startPeriodicAnalysis() {
        // Analyze every 5 minutes
        setInterval(async () => {
            if (!this.isConnected) return;
            
            // Get recent activities
            const activities = this.getRecentActivities();
            
            if (activities.length > 0) {
                await this.sendActivityData({
                    type: 'periodic_analysis',
                    activities: activities,
                    timestamp: new Date().toISOString()
                });
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    getRecentActivities() {
        // Get activities from last hour
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        return sessions.filter(session => 
            new Date(session.timestamp) > oneHourAgo
        ).map(session => ({
            type: session.activity,
            website: session.website || '',
            duration: session.duration,
            timestamp: session.timestamp
        }));
    }
    
    showDistractionAlert() {
        if (!this.config.enableRealtime) return;
        
        // Play alert sound
        const sound = document.getElementById('distractionSound');
        if (sound) {
            sound.play().catch(console.log);
        }
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('AI Guardian Alert', {
                body: 'You seem distracted. Time to refocus!',
                icon: 'icons/icon48.png'
            });
        }
        
        // Update UI
        const alertDiv = document.getElementById('aiAlert');
        if (alertDiv) {
            alertDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    AI detected distraction. Consider taking a short break.
                </div>
            `;
            
            setTimeout(() => {
                alertDiv.innerHTML = '';
            }, 10000);
        }
    }
    
    showSuggestionNotification(suggestion) {
        // Add to notification panel
        if (window.app && window.app.addNotification) {
            window.app.addNotification(`🤖 AI Suggestion: ${suggestion.text}`, 'info');
        }
    }
    
    showWarningNotification(warning) {
        const message = warning.message || 'AI detected an issue with your productivity';
        
        if (window.app && window.app.addNotification) {
            window.app.addNotification(`⚠️ AI Warning: ${message}`, 'warning');
        }
    }
    
    formatTime(timeString) {
        if (!timeString) return 'N/A';
        try {
            const time = new Date(timeString);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeString;
        }
    }
    
    hasScreenCapturePermission() {
        // Check if browser supports screen capture
        return navigator.mediaDevices && 
               navigator.mediaDevices.getDisplayMedia &&
               typeof navigator.mediaDevices.getDisplayMedia === 'function';
    }
}

// Screen Capture Analyzer
class ScreenCaptureAnalyzer {
    constructor(userId) {
        this.userId = userId;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.isCapturing = false;
        this.captureInterval = null;
    }
    
    async init() {
        console.log('Initializing Screen Capture Analyzer');
        
        // Create hidden video and canvas elements
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.video.style.display = 'none';
        this.canvas.style.display = 'none';
        
        document.body.appendChild(this.video);
        document.body.appendChild(this.canvas);
    }
    
    async startCapture() {
        if (this.isCapturing) {
            console.warn('Screen capture already running');
            return;
        }
        
        try {
            // Request screen capture permission
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'monitor',
                    logicalSurface: true,
                    cursor: 'always'
                },
                audio: false
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            this.isCapturing = true;
            
            // Start capturing frames
            this.captureInterval = setInterval(() => {
                this.captureFrame();
            }, 30000); // Capture every 30 seconds
            
            console.log('Screen capture started');
            
            return true;
        } catch (error) {
            console.error('Screen capture failed:', error);
            return false;
        }
    }
    
    stopCapture() {
        if (!this.isCapturing) return;
        
        this.isCapturing = false;
        
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        console.log('Screen capture stopped');
    }
    
    captureFrame() {
        if (!this.video || !this.canvas || !this.ctx) return;
        
        try {
            // Set canvas dimensions to video dimensions
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            // Draw video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Convert to data URL
            const imageData = this.canvas.toDataURL('image/jpeg', 0.5);
            
            // Send to AI system
            if (window.aiSystem) {
                window.aiSystem.sendScreenData(imageData, {
                    width: this.canvas.width,
                    height: this.canvas.height,
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('Frame capture failed:', error);
        }
    }
    
    async captureSingleFrame() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.7);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            return imageData;
        } catch (error) {
            console.error('Single frame capture failed:', error);
            return null;
        }
    }
}