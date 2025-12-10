// Main Application
class AIGuardianApp {
    constructor() {
        try {
            this.initializeApp();
            this.loadData();
            this.startServices();
            this.cleanupOldData();
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showErrorMessage('অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
        }
    }

    initializeApp() {
        try {
            // Navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target.closest('.nav-btn').dataset.target;
                    if (target) this.switchScreen(target);
                });
            });

            // Timer functionality
            this.timer = {
                running: false,
                startTime: null,
                elapsed: 0,
                interval: null
            };

            // Safely bind event listeners
            this.safeAddEventListener('startTimerBtn', 'click', () => this.startTimer());
            this.safeAddEventListener('pauseTimerBtn', 'click', () => this.pauseTimer());
            this.safeAddEventListener('stopTimerBtn', 'click', () => this.stopTimer());

            // To-Do functionality
            this.safeAddEventListener('addTodoBtn', 'click', () => this.showTodoForm());
            this.safeAddEventListener('cancelTodoBtn', 'click', () => this.hideTodoForm());
            this.safeAddEventListener('saveTodoBtn', 'click', () => this.addTodo());

            // Log functionality
            this.safeAddEventListener('saveLogBtn', 'click', () => this.saveLog());

            // AI Guardian controls
            this.safeAddEventListener('toggleMonitoringBtn', 'click', (e) => {
                this.toggleAIMonitoring(e.target);
            });

            this.safeAddEventListener('generateRealityBtn', 'click', () => {
                this.generateRealityCheck();
            });

            // Notification panel
            this.safeAddEventListener('notificationBtn', 'click', () => {
                this.toggleNotificationPanel();
            });

            this.safeAddEventListener('closeNotificationBtn', 'click', () => {
                this.toggleNotificationPanel();
            });

            // Download report
            this.safeAddEventListener('downloadReportBtn', 'click', () => {
                this.downloadReport();
            });

            // Initialize time display
            this.updateTime();
            setInterval(() => this.updateTime(), 1000);

            // Initialize charts
            this.initCharts();

            // Initialize AI monitoring simulation
            this.simulateAIMonitoring();

        } catch (error) {
            console.error('Initialize app failed:', error);
        }
    }

    // Safe event listener helper
    safeAddEventListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element ${elementId} not found for event binding`);
        }
    }

    // Error message display
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message glass-card';
        errorDiv.innerHTML = `
            <h3><i class="fas fa-exclamation-triangle"></i> ত্রুটি</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()" class="btn-primary">ঠিক আছে</button>
        `;
        document.body.appendChild(errorDiv);
    }

    switchScreen(screenId) {
        try {
            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeBtn = document.querySelector(`[data-target="${screenId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            // Update screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            // Update specific screen data
            if (screenId === 'progress') {
                this.updateCharts();
            }
        } catch (error) {
            console.error('Screen switch failed:', error);
        }
    }

    // Time and Date Management
    updateTime() {
        try {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            
            const banglaMonths = {
                'January': 'জানুয়ারি',
                'February': 'ফেব্রুয়ারি',
                'March': 'মার্চ',
                'April': 'এপ্রিল',
                'May': 'মে',
                'June': 'জুন',
                'July': 'জুলাই',
                'August': 'আগস্ট',
                'September': 'সেপ্টেম্বর',
                'October': 'অক্টোবর',
                'November': 'নভেম্বর',
                'December': 'ডিসেম্বর'
            };
            
            const banglaDays = {
                'Monday': 'সোমবার',
                'Tuesday': 'মঙ্গলবার',
                'Wednesday': 'বুধবার',
                'Thursday': 'বৃহস্পতিবার',
                'Friday': 'শুক্রবার',
                'Saturday': 'শনিবার',
                'Sunday': 'রবিবার'
            };
            
            const dateStr = now.toLocaleDateString('en-US', options);
            let [weekday, month, day, year, time] = dateStr.split(' ');
            
            const banglaDate = `${banglaDays[weekday.replace(',', '')] || weekday}, ${day} ${banglaMonths[month] || month}, ${year} ${time}`;
            
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = banglaDate;
            }
        } catch (error) {
            console.error('Update time failed:', error);
        }
    }

    // Timer functionality
    startTimer() {
        try {
            if (this.timer.running) return;
            
            this.timer.running = true;
            this.timer.startTime = Date.now() - this.timer.elapsed;
            
            this.timer.interval = setInterval(() => {
                this.timer.elapsed = Date.now() - this.timer.startTime;
                this.updateTimerDisplay();
            }, 1000);
            
            this.addNotification('টাইমার শুরু হয়েছে!', 'success');
        } catch (error) {
            console.error('Start timer failed:', error);
            this.addNotification('টাইমার শুরু করতে সমস্যা হয়েছে', 'error');
        }
    }

    pauseTimer() {
        try {
            if (!this.timer.running) return;
            
            this.timer.running = false;
            clearInterval(this.timer.interval);
            
            // Save current session
            this.saveSession();
            
            this.addNotification('টাইমার বিরতিতে আছে', 'warning');
        } catch (error) {
            console.error('Pause timer failed:', error);
        }
    }

    stopTimer() {
        try {
            this.timer.running = false;
            if (this.timer.interval) {
                clearInterval(this.timer.interval);
            }
            
            // Save session and reset
            this.saveSession();
            this.timer.elapsed = 0;
            this.updateTimerDisplay();
            
            this.addNotification('টাইমার বন্ধ হয়েছে', 'info');
            
            // Play alert sound
            const alertSound = document.getElementById('alertSound');
            if (alertSound) {
                alertSound.play().catch(e => console.log('Sound play failed:', e));
            }
        } catch (error) {
            console.error('Stop timer failed:', error);
        }
    }

    updateTimerDisplay() {
        try {
            const totalSeconds = Math.floor(this.timer.elapsed / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        } catch (error) {
            console.error('Update timer display failed:', error);
        }
    }

    saveSession() {
        try {
            const activitySelect = document.getElementById('activitySelect');
            if (!activitySelect) return;
            
            const activity = activitySelect.value;
            const duration = Math.floor(this.timer.elapsed / 1000 / 60); // in minutes
            
            if (duration > 0 && activity) {
                const session = {
                    activity,
                    duration,
                    timestamp: new Date().toISOString(),
                    date: new Date().toLocaleDateString()
                };
                
                // Save to localStorage
                const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
                sessions.push(session);
                
                // Keep only last 1000 sessions
                const trimmedSessions = sessions.slice(-1000);
                localStorage.setItem('sessions', JSON.stringify(trimmedSessions));
                
                // Update progress
                this.updateProgress();
                
                // Update AI analysis
                this.updateAIAnalysis();
            }
        } catch (error) {
            console.error('Save session failed:', error);
        }
    }

    // To-Do List functionality
    showTodoForm() {
        const form = document.getElementById('quickAddForm');
        const input = document.getElementById('newTodoInput');
        if (form && input) {
            form.style.display = 'block';
            input.focus();
        }
    }

    hideTodoForm() {
        const form = document.getElementById('quickAddForm');
        const input = document.getElementById('newTodoInput');
        if (form) form.style.display = 'none';
        if (input) input.value = '';
    }

    addTodo() {
        try {
            const input = document.getElementById('newTodoInput');
            if (!input) return;
            
            let text = input.value.trim();
            
            if (text) {
                // Sanitize input
                text = this.sanitizeInput(text);
                
                const todo = {
                    id: Date.now(),
                    text,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                // Save to localStorage
                const todos = JSON.parse(localStorage.getItem('todos') || '[]');
                todos.push(todo);
                
                // Keep only last 100 todos
                const trimmedTodos = todos.slice(-100);
                localStorage.setItem('todos', JSON.stringify(trimmedTodos));
                
                // Update UI
                this.renderTodoItem(todo);
                
                // Hide form and clear input
                this.hideTodoForm();
                
                this.addNotification('নতুন কাজ যোগ করা হয়েছে', 'success');
            }
        } catch (error) {
            console.error('Add todo failed:', error);
            this.addNotification('কাজ যোগ করতে সমস্যা হয়েছে', 'error');
        }
    }

    sanitizeInput(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderTodoItem(todo) {
        try {
            const todoList = document.getElementById('todoList');
            if (!todoList) return;
            
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.dataset.id = todo.id;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-title">${todo.text}</div>
                    <div class="todo-time">${new Date(todo.createdAt).toLocaleString('bn-BD')}</div>
                </div>
                <div class="todo-actions">
                    <button class="btn-todo-action" data-id="${todo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add checkbox event listener
            const checkbox = todoItem.querySelector('.todo-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleTodoComplete(todo.id, e.target.checked);
                });
            }
            
            // Add delete button listener
            const deleteBtn = todoItem.querySelector('.btn-todo-action');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteTodo(todo.id);
                });
            }
            
            todoList.appendChild(todoItem);
        } catch (error) {
            console.error('Render todo failed:', error);
        }
    }

    toggleTodoComplete(id, completed) {
        try {
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            const todoIndex = todos.findIndex(todo => todo.id === id);
            
            if (todoIndex !== -1) {
                todos[todoIndex].completed = completed;
                localStorage.setItem('todos', JSON.stringify(todos));
                
                if (completed) {
                    this.addNotification('কাজ সম্পন্ন হয়েছে!', 'success');
                    // Play success sound
                    const breakSound = document.getElementById('breakSound');
                    if (breakSound) {
                        breakSound.play().catch(e => console.log('Sound play failed:', e));
                    }
                }
            }
        } catch (error) {
            console.error('Toggle todo complete failed:', error);
        }
    }

    deleteTodo(id) {
        try {
            let todos = JSON.parse(localStorage.getItem('todos') || '[]');
            todos = todos.filter(todo => todo.id !== id);
            localStorage.setItem('todos', JSON.stringify(todos));
            
            // Remove from UI
            const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
            if (todoItem) {
                todoItem.remove();
            }
            
            this.addNotification('কাজ মুছে ফেলা হয়েছে', 'warning');
        } catch (error) {
            console.error('Delete todo failed:', error);
            this.addNotification('কাজ মুছতে সমস্যা হয়েছে', 'error');
        }
    }

    // Log functionality
    saveLog() {
        try {
            const todayLogInput = document.getElementById('todayLog');
            const tomorrowPlanInput = document.getElementById('tomorrowPlan');
            
            if (!todayLogInput || !tomorrowPlanInput) return;
            
            const todayLog = todayLogInput.value;
            const tomorrowPlan = tomorrowPlanInput.value;
            
            if (todayLog || tomorrowPlan) {
                const log = {
                    date: new Date().toLocaleDateString(),
                    todayLog,
                    tomorrowPlan,
                    timestamp: new Date().toISOString()
                };
                
                // Save to localStorage
                const logs = JSON.parse(localStorage.getItem('logs') || '[]');
                logs.push(log);
                
                // Keep only last 30 days logs
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const filteredLogs = logs.filter(log => {
                    return new Date(log.timestamp) >= thirtyDaysAgo;
                });
                
                localStorage.setItem('logs', JSON.stringify(filteredLogs));
                
                this.addNotification('লগ সংরক্ষণ করা হয়েছে', 'success');
            }
        } catch (error) {
            console.error('Save log failed:', error);
            this.addNotification('লগ সেভ করতে সমস্যা হয়েছে', 'error');
        }
    }

    // Progress tracking
    updateProgress() {
        try {
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            const today = new Date().toLocaleDateString();
            
            const todaySessions = sessions.filter(session => 
                new Date(session.timestamp).toLocaleDateString() === today
            );
            
            // Calculate totals
            let totalMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
            let blenderMinutes = todaySessions
                .filter(s => s.activity === 'blender')
                .reduce((sum, session) => sum + session.duration, 0);
            let programmingMinutes = todaySessions
                .filter(s => s.activity === 'programming')
                .reduce((sum, session) => sum + session.duration, 0);
            
            // Update progress ring
            const progressPercent = Math.min(Math.floor((totalMinutes / 480) * 100), 100); // 8 hours target
            const progressRing = document.querySelector('.progress-fill');
            if (progressRing) {
                const circumference = 565; // 2 * π * r (r=90)
                const offset = circumference - (progressPercent / 100) * circumference;
                progressRing.style.strokeDashoffset = offset;
            }
            
            const progressPercentEl = document.getElementById('progressPercent');
            if (progressPercentEl) {
                progressPercentEl.textContent = `${progressPercent}%`;
            }
            
            // Update time displays
            const totalHours = (totalMinutes / 60).toFixed(1);
            const blenderHours = (blenderMinutes / 60).toFixed(1);
            const programmingHours = (programmingMinutes / 60).toFixed(1);
            
            this.updateElementText('todayTime', `${totalHours} ঘণ্টা`);
            this.updateElementText('blenderTime', `${blenderHours} ঘণ্টা`);
            this.updateElementText('programmingTime', `${programmingHours} ঘণ্টা`);
            
            // Calculate focus score
            const focusScore = Math.min(Math.floor((totalMinutes / 300) * 100), 100); // 5 hours = 100%
            this.updateElementText('focusScore', focusScore);
            
            // Update streak
            this.updateStreak();
        } catch (error) {
            console.error('Update progress failed:', error);
        }
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    updateStreak() {
        try {
            const logs = JSON.parse(localStorage.getItem('logs') || '[]');
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            
            // Simple streak calculation
            const dates = [...new Set([
                ...logs.map(log => new Date(log.timestamp).toLocaleDateString()),
                ...sessions.map(session => new Date(session.timestamp).toLocaleDateString())
            ])];
            
            // Sort dates and calculate consecutive days
            dates.sort((a, b) => new Date(a) - new Date(b));
            let streak = 0;
            let currentDate = new Date();
            
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date();
                checkDate.setDate(currentDate.getDate() - i);
                const dateStr = checkDate.toLocaleDateString();
                
                if (dates.includes(dateStr)) {
                    streak++;
                } else {
                    break;
                }
            }
            
            this.updateElementText('streakCount', streak);
            this.updateElementText('currentStreak', `${streak} দিন`);
        } catch (error) {
            console.error('Update streak failed:', error);
        }
    }

    // Charts
    initCharts() {
        try {
            // Weekly chart
            const weeklyCtx = document.getElementById('weeklyChart')?.getContext('2d');
            if (!weeklyCtx) return;
            
            this.weeklyChart = new Chart(weeklyCtx, {
                type: 'bar',
                data: {
                    labels: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'],
                    datasets: [{
                        label: 'কাজের সময় (ঘণ্টা)',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(14, 165, 233, 0.7)',
                        borderColor: 'rgba(14, 165, 233, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#d1d5db'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#d1d5db'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });

            // Distribution chart
            const distributionCtx = document.getElementById('distributionChart')?.getContext('2d');
            if (!distributionCtx) return;
            
            this.distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Blender', 'Programming', 'Research', 'অন্যান্য'],
                    datasets: [{
                        data: [25, 25, 25, 25],
                        backgroundColor: [
                            'rgba(14, 165, 233, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(10, 184, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)'
                        ],
                        borderColor: [
                            'rgba(14, 165, 233, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(10, 184, 129, 1)',
                            'rgba(245, 158, 11, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#ffffff',
                                padding: 20
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Init charts failed:', error);
        }
    }

    updateCharts() {
        try {
            if (!this.weeklyChart || !this.distributionChart) return;
            
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            
            // Update weekly chart
            const last7Days = Array.from({length: 7}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toLocaleDateString();
            }).reverse();
            
            const weeklyData = last7Days.map(day => {
                const daySessions = sessions.filter(session => 
                    new Date(session.timestamp).toLocaleDateString() === day
                );
                const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
                return parseFloat((totalMinutes / 60).toFixed(1));
            });
            
            this.weeklyChart.data.datasets[0].data = weeklyData;
            this.weeklyChart.update('none');
            
            // Update distribution chart
            const blenderTotal = sessions
                .filter(s => s.activity === 'blender')
                .reduce((sum, session) => sum + session.duration, 0);
            
            const programmingTotal = sessions
                .filter(s => s.activity === 'programming')
                .reduce((sum, session) => sum + session.duration, 0);
            
            const researchTotal = sessions
                .filter(s => s.activity === 'research')
                .reduce((sum, session) => sum + session.duration, 0);
            
            const otherTotal = sessions
                .filter(s => s.activity === 'other')
                .reduce((sum, session) => sum + session.duration, 0);
            
            this.distributionChart.data.datasets[0].data = [
                blenderTotal,
                programmingTotal,
                researchTotal,
                otherTotal
            ];
            this.distributionChart.update('none');
        } catch (error) {
            console.error('Update charts failed:', error);
        }
    }

    // AI Guardian functionality
    toggleAIMonitoring(button) {
        try {
            if (!button) return;
            
            button.classList.toggle('active');
            
            if (button.classList.contains('active')) {
                button.innerHTML = '<i class="fas fa-eye"></i> পর্যবেক্ষণ সক্রিয়';
                this.addNotification('AI অভিভাবক সক্রিয় হয়েছে', 'success');
                
                // Start AI monitoring simulation
                this.startAIMonitoring();
            } else {
                button.innerHTML = '<i class="fas fa-eye-slash"></i> পর্যবেক্ষণ নিষ্ক্রিয়';
                this.addNotification('AI অভিভাবক নিষ্ক্রিয় হয়েছে', 'warning');
                
                // Stop AI monitoring simulation
                this.stopAIMonitoring();
            }
        } catch (error) {
            console.error('Toggle AI monitoring failed:', error);
        }
    }

    simulateAIMonitoring() {
        try {
            // Simulate website tracking
            const websites = [
                { name: 'ফেইসবুক', time: '45 মিনিট', category: 'social', productivity: 'নিম্ন' },
                { name: 'ইউটিউব', time: '30 মিনিট', category: 'entertainment', productivity: 'নিম্ন' },
                { name: 'Blender Docs', time: '60 মিনিট', category: 'learning', productivity: 'উচ্চ' },
                { name: 'GitHub', time: '90 মিনিট', category: 'work', productivity: 'উচ্চ' },
                { name: 'Stack Overflow', time: '25 মিনিট', category: 'learning', productivity: 'মধ্যম' }
            ];
            
            const websiteList = document.getElementById('websiteList');
            if (websiteList) {
                websiteList.innerHTML = '';
                
                websites.forEach(site => {
                    const websiteItem = document.createElement('div');
                    websiteItem.className = 'website-item';
                    websiteItem.innerHTML = `
                        <div>
                            <strong>${site.name}</strong>
                            <div class="site-category">${site.category}</div>
                        </div>
                        <div>
                            <div>${site.time}</div>
                            <div class="productivity-badge ${site.productivity}">${site.productivity}</div>
                        </div>
                    `;
                    websiteList.appendChild(websiteItem);
                });
            }
            
            // Update current activity
            const activities = [
                'Blender এ কাজ করছেন',
                'প্রোগ্রামিং শিখছেন',
                'ডকুমেন্টেশন পড়ছেন',
                'প্রজেক্ট কাজ করছেন',
                'বিরতিতে আছেন'
            ];
            
            let currentIndex = 0;
            
            this.aiActivityInterval = setInterval(() => {
                try {
                    this.updateElementText('currentActivity', activities[currentIndex]);
                    this.updateElementText('activityDuration', `${Math.floor(Math.random() * 60) + 15} মিনিট`);
                    
                    // Simulate productivity score
                    const score = Math.floor(Math.random() * 30) + 70;
                    this.updateElementText('productivityScore', `${score}%`);
                    
                    // Simulate waste detection
                    const wastes = ['নিষ্ক্রিয়', 'ফেইসবুক ব্রাউজিং', 'ইউটিউব ভিডিও', 'অপ্রয়োজনীয় ব্রাউজিং'];
                    this.updateElementText('wasteDetection', wastes[Math.floor(Math.random() * wastes.length)]);
                    
                    currentIndex = (currentIndex + 1) % activities.length;
                } catch (error) {
                    console.error('AI activity update failed:', error);
                }
            }, 5000);
        } catch (error) {
            console.error('Simulate AI monitoring failed:', error);
        }
    }

    startAIMonitoring() {
        try {
            console.log('AI monitoring started');
            
            // Simulate real-time updates
            this.aiUpdateInterval = setInterval(() => {
                this.updateAIAnalysis();
            }, 10000);
        } catch (error) {
            console.error('Start AI monitoring failed:', error);
        }
    }

    stopAIMonitoring() {
        if (this.aiUpdateInterval) {
            clearInterval(this.aiUpdateInterval);
        }
        if (this.aiActivityInterval) {
            clearInterval(this.aiActivityInterval);
        }
        console.log('AI monitoring stopped');
    }

    updateAIAnalysis() {
        try {
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            
            const today = new Date().toLocaleDateString();
            const todaySessions = sessions.filter(session => 
                new Date(session.timestamp).toLocaleDateString() === today
            );
            
            // Calculate analytics
            const totalMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
            const completedTodos = todos.filter(todo => todo.completed).length;
            const totalTodos = todos.length;
            
            // Generate AI analysis
            let analysis = '';
            let recommendations = '';
            
            if (totalMinutes < 60) {
                analysis = '⚠️ আজ আপনি খুব কম সময় কাজ করেছেন। আপনার টার্গেট থেকে পিছিয়ে আছেন।';
                recommendations = '<div class="recommendation-item"><i class="fas fa-lightbulb"></i> আরও ২ ঘণ্টা কাজ করে আজকের টার্গেট পূরণ করুন</div>';
            } else if (totalMinutes < 180) {
                analysis = '📊 আপনার আজকের পারফরম্যান্স মধ্যম পর্যায়ের। কিছু উন্নতি সম্ভব।';
                recommendations = '<div class="recommendation-item"><i class="fas fa-lightbulb"></i> সামাজিক মিডিয়া ব্যবহার কমিয়ে আরও ১ ঘণ্টা কাজ করুন</div>';
            } else {
                analysis = '🎉 চমৎকার! আপনি আজ ভালো পরিমাণ কাজ করেছেন। লক্ষ্যের দিকে এগিয়ে যাচ্ছেন।';
                recommendations = '<div class="recommendation-item"><i class="fas fa-lightbulb"></i> এই গতি বজায় রাখুন এবং আগামীকালের জন্য পরিকল্পনা করুন</div>';
            }
            
            // Add waste analysis
            const wasteTime = Math.floor(Math.random() * 120);
            if (wasteTime > 60) {
                analysis += `<br><br>⏰ আপনি আজ প্রায় ${wasteTime} মিনিট অপ্রয়োজনীয় কাজে ব্যয় করেছেন।`;
                recommendations += '<div class="recommendation-item"><i class="fas fa-exclamation-triangle"></i> ফেইসবুক/ইউটিউব ব্যবহার সীমিত করুন</div>';
            }
            
            // Update UI
            const aiAnalysisEl = document.getElementById('aiAnalysis');
            if (aiAnalysisEl) {
                aiAnalysisEl.innerHTML = `
                    <div class="ai-analysis-content">
                        <p>${analysis}</p>
                        <div class="ai-stats">
                            <div class="ai-stat">
                                <span>আজকের কাজ:</span>
                                <strong>${totalMinutes} মিনিট</strong>
                            </div>
                            <div class="ai-stat">
                                <span>সম্পন্ন কাজ:</span>
                                <strong>${completedTodos}/${totalTodos}</strong>
                            </div>
                            <div class="ai-stat">
                                <span>ফোকাস লেভেল:</span>
                                <strong>${Math.min(Math.floor((totalMinutes / 300) * 100), 100)}%</strong>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const aiRecommendationsEl = document.getElementById('aiRecommendations');
            if (aiRecommendationsEl) {
                aiRecommendationsEl.innerHTML = `
                    <h3><i class="fas fa-comment-medical"></i> AI পরামর্শ</h3>
                    ${recommendations}
                `;
            }
        } catch (error) {
            console.error('Update AI analysis failed:', error);
        }
    }

    generateRealityCheck() {
        try {
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            const logs = JSON.parse(localStorage.getItem('logs') || '[]');
            
            const today = new Date().toLocaleDateString();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            // Calculate statistics
            const todaySessions = sessions.filter(session => 
                new Date(session.timestamp).toLocaleDateString() === today
            );
            
            const weekSessions = sessions.filter(session => 
                new Date(session.timestamp) >= weekAgo
            );
            
            const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
            const weekMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
            
            // Calculate waste (simulated)
            const wasteMinutes = Math.floor(Math.random() * 180) + 60;
            const productiveMinutes = todayMinutes - wasteMinutes;
            
            // Generate reality check message
            let realityMessage = '';
            
            if (productiveMinutes < 60) {
                realityMessage = `
                    <div class="reality-alert danger">
                        <h3><i class="fas fa-exclamation-triangle"></i> সতর্কতা!</h3>
                        <p>আপনি আজ মাত্র <strong>${productiveMinutes} মিনিট</strong> উৎপাদনশীল কাজ করেছেন।</p>
                        <p><strong>${wasteMinutes} মিনিট</strong> অপ্রয়োজনীয় কাজে নষ্ট করেছেন।</p>
                        <p class="reality-impact">এইভাবে চললে আপনার লক্ষ্য পূরণ করতে <strong>৬ মাস</strong> দেরি হবে!</p>
                    </div>
                `;
            } else if (productiveMinutes < 180) {
                realityMessage = `
                    <div class="reality-alert warning">
                        <h3><i class="fas fa-info-circle"></i> উন্নতির সুযোগ</h3>
                        <p>আপনি আজ <strong>${productiveMinutes} মিনিট</strong> উৎপাদনশীল কাজ করেছেন।</p>
                        <p><strong>${wasteMinutes} মিনিট</strong> কম গুরুত্বপূর্ণ কাজে ব্যয় করেছেন।</p>
                        <p class="reality-impact>আরও <strong>১ ঘণ্টা</strong> কাজ করলে সাপ্তাহিক লক্ষ্য পূরণ হবে।</p>
                    </div>
                `;
            } else {
                realityMessage = `
                    <div class="reality-alert success">
                        <h3><i class="fas fa-check-circle"></i> চমৎকার পারফরম্যান্স!</h3>
                        <p>আপনি আজ <strong>${productiveMinutes} মিনিট</strong> উৎপাদনশীল কাজ করেছেন।</p>
                        <p>অপ্রয়োজনীয় কাজে ব্যয় করেছেন মাত্র <strong>${wasteMinutes} মিনিট</strong>।</p>
                        <p class="reality-impact">এই গতি বজায় রাখলে লক্ষ্য সময়ের <strong>২ সপ্তাহ</strong> আগে পূরণ হবে!</p>
                    </div>
                `;
            }
            
            // Add specific recommendations
            realityMessage += `
                <div class="reality-recommendations">
                    <h4><i class="fas fa-bullseye"></i> আজকের বাকি সময়ের জন্য পরামর্শ:</h4>
                    <ul>
                        <li>ফেইসবুক ব্যবহার ১৫ মিনিটে সীমিত করুন</li>
                        <li>Blender টিউটোরিয়াল দেখে প্র্যাকটিস করুন (৪৫ মিনিট)</li>
                        <li>প্রোগ্রামিং প্রজেক্টে কাজ করুন (৬০ মিনিট)</li>
                        <li>আগামীকালের জন্য পরিকল্পনা তৈরি করুন (১৫ মিনিট)</li>
                    </ul>
                </div>
            `;
            
            const realityCheckEl = document.getElementById('realityCheck');
            if (realityCheckEl) {
                realityCheckEl.innerHTML = realityMessage;
            }
            
            // Play appropriate sound
            let soundToPlay;
            if (productiveMinutes < 60) {
                soundToPlay = document.getElementById('distractionSound');
            } else if (productiveMinutes < 180) {
                soundToPlay = document.getElementById('breakSound');
            } else {
                soundToPlay = document.getElementById('alertSound');
            }
            
            if (soundToPlay) {
                soundToPlay.play().catch(e => console.log('Sound play failed:', e));
            }
        } catch (error) {
            console.error('Generate reality check failed:', error);
            this.addNotification('রিয়েলিটি চেক তৈরি করতে সমস্যা হয়েছে', 'error');
        }
    }

    // Notification system
    addNotification(message, type = 'info') {
        try {
            const notificationList = document.getElementById('notificationList');
            if (!notificationList) return;
            
            const notification = document.createElement('div');
            notification.className = `notification-item ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${message}</div>
                    <div class="notification-time">${new Date().toLocaleTimeString('bn-BD')}</div>
                </div>
            `;
            
            // Add to top
            if (notificationList.firstChild) {
                notificationList.insertBefore(notification, notificationList.firstChild);
            } else {
                notificationList.appendChild(notification);
            }
            
            // Limit to 10 notifications
            while (notificationList.children.length > 10) {
                notificationList.removeChild(notificationList.lastChild);
            }
            
            // Show notification panel briefly
            this.showNotificationBriefly();
        } catch (error) {
            console.error('Add notification failed:', error);
        }
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    showNotificationBriefly() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.add('active');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                if (panel.classList.contains('active')) {
                    panel.classList.remove('active');
                }
            }, 5000);
        }
    }

    // Download report
    downloadReport() {
        try {
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            const logs = JSON.parse(localStorage.getItem('logs') || '[]');
            
            const report = {
                generatedAt: new Date().toISOString(),
                summary: {
                    totalSessions: sessions.length,
                    totalLearningHours: (sessions.reduce((sum, session) => sum + session.duration, 0) / 60).toFixed(1),
                    completedTodos: todos.filter(todo => todo.completed).length,
                    totalTodos: todos.length,
                    logsCount: logs.length
                },
                sessions: sessions.slice(-100), // Last 100 sessions only
                todos: todos.slice(-50), // Last 50 todos only
                logs: logs.slice(-30) // Last 30 logs only
            };
            
            const dataStr = JSON.stringify(report, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `ai-guardian-report-${new Date().toISOString().slice(0, 10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.addNotification('রিপোর্ট ডাউনলোড শুরু হয়েছে', 'success');
        } catch (error) {
            console.error('Download report failed:', error);
            this.addNotification('রিপোর্ট ডাউনলোড করতে সমস্যা হয়েছে', 'error');
        }
    }

    // Data cleanup
    cleanupOldData() {
        try {
            // Keep only last 1000 sessions
            const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            if (sessions.length > 1000) {
                localStorage.setItem('sessions', 
                    JSON.stringify(sessions.slice(-1000)));
            }
            
            // Keep only last 100 todos
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            if (todos.length > 100) {
                localStorage.setItem('todos', 
                    JSON.stringify(todos.slice(-100)));
            }
            
            // Keep only last 30 days logs
            const logs = JSON.parse(localStorage.getItem('logs') || '[]');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const filteredLogs = logs.filter(log => {
                try {
                    return new Date(log.timestamp) >= thirtyDaysAgo;
                } catch {
                    return false; // Remove invalid dates
                }
            });
            
            localStorage.setItem('logs', JSON.stringify(filteredLogs));
            
        } catch (error) {
            console.error('Error cleaning up data:', error);
        }
    }

    // Load initial data
    loadData() {
        try {
            // Load todos
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            todos.forEach(todo => this.renderTodoItem(todo));
            
            // Load today's log
            const logs = JSON.parse(localStorage.getItem('logs') || '[]');
            const today = new Date().toLocaleDateString();
            const todayLog = logs.find(log => log.date === today);
            
            if (todayLog) {
                this.updateElementValue('todayLog', todayLog.todayLog || '');
                this.updateElementValue('tomorrowPlan', todayLog.tomorrowPlan || '');
            }
            
            // Update progress
            this.updateProgress();
            this.updateCharts();
            
            // Update AI analysis
            this.updateAIAnalysis();
            
            // Add welcome notification
            setTimeout(() => {
                this.addNotification('AI Guardian এ আপনাকে স্বাগতম! আপনার অভিভাবক সক্রিয় হয়েছে।', 'success');
            }, 1000);
        } catch (error) {
            console.error('Load data failed:', error);
        }
    }

    updateElementValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    startServices() {
        // Auto-save every 5 seconds
        setInterval(() => {
            if (this.timer.running) {
                this.saveSession();
            }
        }, 5000);
        
        // 25-minute reminder
        setInterval(() => {
            if (this.timer.running && this.timer.elapsed >= 25 * 60 * 1000) {
                this.addNotification('২৫ মিনিট পূর্ণ হয়েছে! ৫ মিনিট বিরতি নিন।', 'warning');
                const alertSound = document.getElementById('alertSound');
                if (alertSound) {
                    alertSound.play().catch(e => console.log('Sound play failed:', e));
                }
            }
        }, 60000); // Check every minute
        
        // Break notifications
        setInterval(() => {
            if (this.timer.running && this.timer.elapsed >= 50 * 60 * 1000) {
                this.addNotification('৫০ মিনিট কাজ করেছেন। ১০ মিনিট দীর্ঘ বিরতি নিন।', 'info');
                const breakSound = document.getElementById('breakSound');
                if (breakSound) {
                    breakSound.play().catch(e => console.log('Sound play failed:', e));
                }
            }
        }, 60000);
        
        // Auto-cleanup every 10 minutes
        setInterval(() => this.cleanupOldData(), 10 * 60 * 1000);
    }
}

// Extension Integration Code - FIXED VERSION
class ExtensionIntegration {
    constructor() {
        this.extensionConnected = false;
        this.checkExtension();
        this.setupExtensionListeners();
    }

    // Check if extension is installed
    checkExtension() {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.log('Chrome extension API not available');
            this.showBrowserCompatibilityNotice();
            return;
        }

        try {
            chrome.runtime.sendMessage(
                { type: 'PING' },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Extension not installed');
                        this.showExtensionPrompt();
                    } else {
                        console.log('Extension connected');
                        this.extensionConnected = true;
                        this.syncExtensionData();
                    }
                }
            );
        } catch (error) {
            console.error('Extension check failed:', error);
        }
    }

    // Show extension install prompt
    showExtensionPrompt() {
        try {
            const promptHTML = `
                <div class="extension-prompt glass-card">
                    <h3><i class="fas fa-puzzle-piece"></i> Real-time Tracking চালু করুন</h3>
                    <p>AI Guardian Extension ইন্সটল করে Real-time website tracking চালু করুন।</p>
                    <div class="extension-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <span>Chrome Web Store থেকে Extension ডাউনলোড করুন</span>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <span>Chrome এ Extension যোগ করুন</span>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <span>পেজ রিফ্রেশ করুন</span>
                        </div>
                    </div>
                    <div class="extension-actions">
                        <button class="btn-secondary" id="hidePromptBtn">পরবর্তীতে</button>
                        <button class="btn-primary" id="installExtensionBtn">Extension ইন্সটল করুন</button>
                    </div>
                </div>
            `;

            // Add to home screen
            const homeScreen = document.getElementById('home');
            if (homeScreen) {
                const promptDiv = document.createElement('div');
                promptDiv.innerHTML = promptHTML;
                homeScreen.insertBefore(promptDiv, homeScreen.firstChild);

                // Add event listeners
                setTimeout(() => {
                    const hideBtn = document.getElementById('hidePromptBtn');
                    const installBtn = document.getElementById('installExtensionBtn');
                    
                    if (hideBtn) {
                        hideBtn.addEventListener('click', () => {
                            promptDiv.remove();
                        });
                    }
                    
                    if (installBtn) {
                        installBtn.addEventListener('click', () => {
                            window.open('https://chrome.google.com/webstore', '_blank');
                        });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Show extension prompt failed:', error);
        }
    }

    showBrowserCompatibilityNotice() {
        const noticeHTML = `
            <div class="browser-notice glass-card">
                <h3><i class="fas fa-info-circle"></i> ব্রাউজার কম্প্যাটিবিলিটি</h3>
                <p>রিয়েল-টাইম ট্র্যাকিং শুধুমাত্র Chrome ব্রাউজারে available।</p>
                <p>অন্যান্য ব্রাউজারে ম্যানুয়াল ট্র্যাকিং available আছে।</p>
            </div>
        `;
        
        const aiGuardianScreen = document.getElementById('ai-guardian');
        if (aiGuardianScreen) {
            const noticeDiv = document.createElement('div');
            noticeDiv.innerHTML = noticeHTML;
            aiGuardianScreen.appendChild(noticeDiv);
        }
    }

    // Setup extension message listeners
    setupExtensionListeners() {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
            return;
        }

        try {
            // Listen for tracking data from extension
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                try {
                    if (message.type === 'TRACKING_DATA') {
                        this.processTrackingData(message.data);
                    }
                    
                    if (message.type === 'WEBSITE_CATEGORY') {
                        this.updateWebsiteCategory(message.category, message.url);
                    }
                    
                    if (message.type === 'USER_ACTIVITY') {
                        this.updateUserActivity(message.active);
                    }
                    
                    // Send response if needed
                    if (sendResponse) {
                        sendResponse({ received: true });
                    }
                } catch (error) {
                    console.error('Extension message processing failed:', error);
                }
                return true; // Keep message channel open for async response
            });
        } catch (error) {
            console.error('Setup extension listeners failed:', error);
        }
    }

    // Process tracking data from extension - FIXED METHOD
    processTrackingData(sessionData) {
        try {
            console.log('Received tracking data:', sessionData);
            
            // Convert to app session format
            const appSession = {
                activity: this.categorizeWebsite(sessionData.website),
                duration: sessionData.duration,
                timestamp: sessionData.timestamp || new Date().toISOString(),
                source: 'extension',
                website: sessionData.website,
                isProductive: this.isWebsiteProductive(sessionData.website)
            };
            
            // Save to local storage
            this.saveExtensionSession(appSession);
            
            // Update UI in real-time
            this.updateRealTimeDisplay(appSession);
            
            // AI Analysis update
            this.updateAIAnalysisWithExtensionData(appSession); // FIXED: This method now exists
            
            // Update main app
            if (typeof app !== 'undefined') {
                app.updateProgress();
                app.updateCharts();
            }
        } catch (error) {
            console.error('Process tracking data failed:', error);
        }
    }

    // Categorize website
    categorizeWebsite(website) {
        if (!website) return 'other';
        
        const categories = {
            'blender': ['blender.org', 'blendermarket.com'],
            'programming': ['github.com', 'stackoverflow.com', 'w3schools.com', 'codepen.io'],
            'research': ['google.com', 'wikipedia.org', 'scholar.google.com'],
            'social': ['facebook.com', 'twitter.com', 'instagram.com'],
            'entertainment': ['youtube.com', 'netflix.com'],
            'shopping': ['amazon.com', 'daraz.com'],
            'news': ['prothomalo.com', 'bdnews24.com']
        };
        
        for (const [category, sites] of Object.entries(categories)) {
            if (sites.some(site => website.includes(site))) {
                return category;
            }
        }
        
        return 'other';
    }

    // Check if website is productive
    isWebsiteProductive(website) {
        if (!website) return null;
        
        const productiveSites = [
            'blender.org', 'github.com', 'stackoverflow.com', 
            'w3schools.com', 'udemy.com', 'coursera.org', 'freecodecamp.org'
        ];
        
        const unproductiveSites = [
            'facebook.com', 'youtube.com', 'twitter.com',
            'instagram.com', 'netflix.com', 'tiktok.com'
        ];
        
        if (productiveSites.some(site => website.includes(site))) {
            return true;
        }
        
        if (unproductiveSites.some(site => website.includes(site))) {
            return false;
        }
        
        return null; // Unknown
    }

    // Save extension session
    saveExtensionSession(session) {
        try {
            const sessions = JSON.parse(localStorage.getItem('extensionSessions') || '[]');
            sessions.push(session);
            
            // Keep only last 500 extension sessions
            const trimmedSessions = sessions.slice(-500);
            localStorage.setItem('extensionSessions', JSON.stringify(trimmedSessions));
            
            // Also add to main sessions
            const mainSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            mainSessions.push({
                activity: session.activity,
                duration: session.duration,
                timestamp: session.timestamp
            });
            
            // Keep only last 1000 main sessions
            const trimmedMainSessions = mainSessions.slice(-1000);
            localStorage.setItem('sessions', JSON.stringify(trimmedMainSessions));
        } catch (error) {
            console.error('Save extension session failed:', error);
        }
    }

    // Update real-time display
    updateRealTimeDisplay(session) {
        try {
            // Update current activity in AI Guardian screen
            const currentActivityEl = document.getElementById('currentActivity');
            if (currentActivityEl) {
                const activityName = this.getActivityName(session.activity);
                currentActivityEl.textContent = `${activityName} - ${session.website}`;
            }
            
            // Update website tracking list
            this.updateWebsiteTrackingList(session);
        } catch (error) {
            console.error('Update real-time display failed:', error);
        }
    }

    getActivityName(activity) {
        const names = {
            'blender': 'Blender',
            'programming': 'Programming',
            'research': 'Research',
            'social': 'Social Media',
            'entertainment': 'Entertainment',
            'shopping': 'Shopping',
            'news': 'News',
            'other': 'Other'
        };
        return names[activity] || activity;
    }

    // Update website tracking list in AI Guardian screen
    updateWebsiteTrackingList(session) {
        try {
            const websiteListEl = document.getElementById('websiteList');
            if (!websiteListEl) return;
            
            // Check if website already exists
            const existingItems = websiteListEl.querySelectorAll('.website-item');
            let existingItem = null;
            
            existingItems.forEach(item => {
                const siteName = item.querySelector('strong')?.textContent;
                if (siteName === session.website) {
                    existingItem = item;
                }
            });
            
            if (existingItem) {
                // Update existing item
                const durationEl = existingItem.querySelector('div > div');
                if (durationEl) {
                    const currentTime = durationEl.textContent;
                    const currentMinutes = parseInt(currentTime) || 0;
                    const newMinutes = currentMinutes + Math.floor(session.duration / 60);
                    durationEl.textContent = `${newMinutes} মিনিট`;
                }
            } else {
                // Create new item
                const websiteItem = document.createElement('div');
                websiteItem.className = 'website-item';
                const productivityClass = session.isProductive === true ? 'high' : 
                                        session.isProductive === false ? 'low' : 'medium';
                const productivityText = session.isProductive === true ? 'উচ্চ' : 
                                       session.isProductive === false ? 'নিম্ন' : 'মধ্যম';
                
                websiteItem.innerHTML = `
                    <div>
                        <strong>${session.website}</strong>
                        <div class="site-category">${session.activity}</div>
                    </div>
                    <div>
                        <div>${Math.floor(session.duration / 60)} মিনিট</div>
                        <div class="productivity-badge ${productivityClass}">
                            ${productivityText}
                        </div>
                    </div>
                `;
                
                websiteListEl.insertBefore(websiteItem, websiteListEl.firstChild);
            }
            
            // Limit to 10 items
            while (websiteListEl.children.length > 10) {
                websiteListEl.removeChild(websiteListEl.lastChild);
            }
        } catch (error) {
            console.error('Update website tracking list failed:', error);
        }
    }

    updateWebsiteCategory(category, url) {
        // Update category in UI
        console.log(`Website ${url} categorized as ${category}`);
    }

    updateUserActivity(active) {
        const statusElement = document.getElementById('userActivityStatus');
        if (statusElement) {
            statusElement.textContent = active ? 'সক্রিয়' : 'নিষ্ক্রিয়';
            statusElement.className = active ? 'active' : 'inactive';
        }
    }

    // Update AI Analysis with extension data - NEW METHOD ADDED
    updateAIAnalysisWithExtensionData(session) {
        try {
            const analysisEl = document.getElementById('aiAnalysis');
            if (!analysisEl) return;
            
            // Get current analysis
            let analysis = analysisEl.innerHTML;
            
            // Add warning for unproductive sites
            if (session.isProductive === false) {
                const warning = `
                    <div class="ai-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        আপনি ${session.website} এ ${Math.floor(session.duration / 60)} মিনিট ব্যয় করেছেন
                    </div>
                `;
                
                // Add to beginning
                analysisEl.innerHTML = warning + analysis;
                
                // Show notification
                this.showNotification(`অনুৎপাদনশীল সাইট: ${session.website}`, 'warning');
            }
        } catch (error) {
            console.error('Update AI analysis with extension data failed:', error);
        }
    }

    // Sync data from extension
    async syncExtensionData() {
        if (typeof chrome === 'undefined' || !chrome.runtime) return;
        
        try {
            chrome.runtime.sendMessage({ type: 'GET_TRACKING_DATA' }, (data) => {
                if (chrome.runtime.lastError) {
                    console.log('No response from extension:', chrome.runtime.lastError);
                    return;
                }
                
                if (data && data.trackingSessions) {
                    console.log('Syncing extension data:', data.trackingSessions.length, 'sessions');
                    
                    // Process all sessions
                    data.trackingSessions.forEach(session => {
                        this.processTrackingData(session);
                    });
                    
                    // Update charts
                    if (typeof app !== 'undefined') {
                        app.updateCharts();
                    }
                    
                    // Show success message
                    this.showNotification('Extension data synced successfully', 'success');
                }
            });
        } catch (error) {
            console.error('Sync extension data failed:', error);
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Use existing notification system
        if (typeof app !== 'undefined' && app.addNotification) {
            app.addNotification(message, type);
        } else {
            console.log('Notification:', message);
        }
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new AIGuardianApp();
        
        // Initialize extension integration after app
        setTimeout(() => {
            try {
                new ExtensionIntegration();
            } catch (error) {
                console.error('Extension integration failed:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.error('App initialization failed:', error);
        alert('অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে। পেজটি রিফ্রেশ করুন।');
    }
});

// Global helper for app access
window.getAppInstance = () => app;