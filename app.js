class GoalBasedStreakSystem {
    constructor(app) {
        this.app = app;
        this.streaks = {
            goalCompletionDays: 0,
            lastGoalCompletionDate: null,
            longestGoalStreak: 0,
            totalGoalsCompleted: 0
        };
        this.loadStreakData();
    }

    checkDailyGoalProgress(date = new Date()) {
        const today = date.toDateString();
        const scheduledGoals = this.getScheduledGoalsForDate(today);
        let goalsMet = 0;
        let totalGoals = scheduledGoals.length;

        scheduledGoals.forEach(goal => {
            if (this.isGoalMetForDate(goal, today)) {
                goalsMet++;
            }
        });

        if (totalGoals > 0 && goalsMet === totalGoals) {
            this.incrementStreak(today);
            this.app.showNotification(`🔥 Goal streak: ${this.streaks.goalCompletionDays} days!`, 'success');
        } else if (totalGoals > 0) {
            this.resetStreak();
            this.app.showNotification('Streak broken. Get back on track tomorrow!', 'warning');
        }
    }

    getScheduledGoalsForDate(date) {
        return this.app.data.aiGeneratedSchedule.filter(schedule => {
            return this.isDateInScheduleRange(date, schedule);
        });
    }

    isGoalMetForDate(schedule, date) {
        const dailyTarget = schedule.monthlyAllocation / 30;
        const savingsForDate = this.getSavingsForDate(date);
        return savingsForDate >= dailyTarget;
    }

    getSavingsForDate(date) {
        const transactions = this.app.data.transactions.filter(t => 
            new Date(t.date).toDateString() === date
        );
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return income - expenses;
    }

    isDateInScheduleRange(date, schedule) {
        const scheduleDate = new Date(schedule.deadline);
        const currentDate = new Date(date);
        return currentDate <= scheduleDate;
    }

    incrementStreak(date) {
        if (this.isConsecutiveDay(this.streaks.lastGoalCompletionDate, date)) {
            this.streaks.goalCompletionDays++;
        } else {
            this.streaks.goalCompletionDays = 1;
        }
        
        this.streaks.lastGoalCompletionDate = date;
        if (this.streaks.goalCompletionDays > this.streaks.longestGoalStreak) {
            this.streaks.longestGoalStreak = this.streaks.goalCompletionDays;
        }
        this.saveStreakData();
    }

    resetStreak() {
        this.streaks.goalCompletionDays = 0;
        this.saveStreakData();
    }

    isConsecutiveDay(lastDate, currentDate) {
        if (!lastDate) return false;
        const last = new Date(lastDate);
        const current = new Date(currentDate);
        const diffTime = current - last;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    saveStreakData() {
        localStorage.setItem(`moneymentor-streaks-${this.app.currentUser.role}`, JSON.stringify(this.streaks));
    }

    loadStreakData() {
        const saved = localStorage.getItem(`moneymentor-streaks-${this.app.currentUser.role}`);
        if (saved) {
            this.streaks = { ...this.streaks, ...JSON.parse(saved) };
        }
    }
}

class AIScheduleGenerator {
    constructor(app) {
        this.app = app;
        this.geminiApiKey = 'AIzaSyANEE80xhtVYnnZjASGfThI9mX9ytcUotY';
    }

    showPlannerModal() {
        const modal = document.createElement('div');
        modal.className = 'modal ai-planner-modal';
        modal.innerHTML = `
            <div class="modal__overlay"></div>
            <div class="modal__content">
                <div class="modal__header">
                    <h3>🤖 AI Financial Planner</h3>
                    <button class="modal__close">&times;</button>
                </div>
                <form id="aiPlannerForm">
                    <div class="form-group">
                        <label class="form-label">Monthly Income (₹)</label>
                        <input type="number" id="plannerIncome" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Monthly Fixed Expenses (₹)</label>
                        <input type="number" id="plannerExpenses" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Financial Goals (one per line)</label>
                        <textarea id="plannerGoals" class="form-control" rows="4" 
                                  placeholder="New Laptop - ₹80000 - 2025-10-15&#10;Emergency Fund - ₹100000 - 2025-12-31&#10;Vacation - ₹50000 - 2025-09-30"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Risk Tolerance</label>
                        <select id="plannerRisk" class="form-control">
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Age</label>
                        <input type="number" id="plannerAge" class="form-control" min="18" max="100">
                    </div>
                    <div class="modal__actions">
                        <button type="button" class="btn btn--outline" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn--primary">Generate AI Plan 🚀</button>
                    </div>
                </form>
                <div id="aiPlanResult" class="ai-plan-result hidden"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#aiPlannerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateAIPlan(modal);
        });

        modal.querySelector('.modal__close').addEventListener('click', () => {
            modal.remove();
        });
    }

    async generateAIPlan(modal) {
        const income = parseFloat(document.getElementById('plannerIncome').value);
        const expenses = parseFloat(document.getElementById('plannerExpenses').value);
        const goalsText = document.getElementById('plannerGoals').value;
        const risk = document.getElementById('plannerRisk').value;
        const age = parseInt(document.getElementById('plannerAge').value);

        const goals = this.parseGoalsFromText(goalsText);
        
        const resultDiv = modal.querySelector('#aiPlanResult');
        resultDiv.className = 'ai-plan-result';
        resultDiv.innerHTML = '<div class="loading">🤖 AI is crafting your personalized plan...</div>';

        try {
            const aiPlan = await this.callGeminiForPlan({ income, expenses, goals, risk, age });
            this.displayAIPlan(resultDiv, aiPlan, goals);
            this.saveGeneratedPlan(aiPlan, goals);
        } catch (error) {
            resultDiv.innerHTML = '<div class="error">❌ Error generating plan. Please try again.</div>';
        }
    }

    async callGeminiForPlan(userData) {
        const prompt = `You are a financial advisor AI. Based on this user data:
        - Monthly Income: ₹${userData.income}
        - Monthly Expenses: ₹${userData.expenses}
        - Available Savings: ₹${userData.income - userData.expenses}
        - Risk Tolerance: ${userData.risk}
        - Age: ${userData.age}
        - Goals: ${JSON.stringify(userData.goals)}

        Generate a detailed financial plan with monthly savings allocation for each goal, investment strategy recommendations, emergency fund suggestions, and timeline feasibility analysis. Keep response concise and actionable.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates.content && data.candidates.content.parts && data.candidates.content.parts) {
                return data.candidates.content.parts.text;
            } else {
                return this.generateFallbackPlan(userData);
            }
        } catch (error) {
            return this.generateFallbackPlan(userData);
        }
    }

    parseGoalsFromText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map(line => {
            const parts = line.split(' - ');
            if (parts.length >= 3) {
                return {
                    name: parts[0].trim(),
                    amount: parseInt(parts[1].replace(/[₹,]/g, '')),
                    deadline: parts[2].trim()
                };
            }
            return null;
        }).filter(goal => goal !== null);
    }

    displayAIPlan(container, aiResponse, goals) {
        const netSavings = this.calculateNetSavings();
        
        container.innerHTML = `
            <div class="ai-plan-success">
                <h4>🎯 Your Personalized Financial Plan</h4>
                <div class="plan-summary">
                    <div class="summary-item">
                        <strong>Monthly Savings Available:</strong> ₹${netSavings.toLocaleString()}
                    </div>
                </div>
                
                <div class="goals-breakdown">
                    <h5>📊 Goal Allocation:</h5>
                    ${goals.map(goal => {
                        const monthsLeft = this.getMonthsUntilDeadline(goal.deadline);
                        const monthlyRequired = goal.amount / monthsLeft;
                        const feasible = monthlyRequired <= netSavings;
                        
                        return `
                            <div class="goal-item ${feasible ? 'feasible' : 'challenging'}">
                                <div class="goal-info">
                                    <strong>${goal.name}</strong>
                                    <span class="goal-amount">₹${goal.amount.toLocaleString()}</span>
                                </div>
                                <div class="goal-timeline">
                                    <span>Monthly: ₹${monthlyRequired.toFixed(0)}</span>
                                    <span class="timeline">${monthsLeft} months</span>
                                    <span class="feasibility ${feasible ? 'green' : 'red'}">
                                        ${feasible ? '✅ Achievable' : '⚠️ Challenging'}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="ai-recommendations">
                    <h5>🤖 AI Recommendations:</h5>
                    <div class="recommendation-text">${aiResponse}</div>
                </div>
                
                <div class="plan-actions">
                    <button class="btn btn--primary" onclick="window.moneyMentorApp.acceptAIPlan('${JSON.stringify(goals).replace(/'/g, "\\'")}')">Accept Plan & Start Tracking</button>
                    <button class="btn btn--outline" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
    }

    saveGeneratedPlan(aiPlan, goals) {
        this.app.data.aiGeneratedSchedule = goals.map(goal => ({
            ...goal,
            monthlyAllocation: goal.amount / this.getMonthsUntilDeadline(goal.deadline),
            status: 'active',
            progress: 0
        }));

        goals.forEach(goal => {
            this.app.data.goals.push({
                ...goal,
                id: Date.now() + Math.random(),
                current: 0,
                target: goal.amount
            });
        });

        this.app.saveAllData();
        this.app.showNotification('🚀 AI Plan saved! Your streak tracking begins now.', 'success');
    }

    getMonthsUntilDeadline(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const monthsDiff = (deadlineDate.getFullYear() - today.getFullYear()) * 12 + 
                          (deadlineDate.getMonth() - today.getMonth());
        return Math.max(monthsDiff, 1);
    }

    calculateNetSavings() {
        const income = parseFloat(document.getElementById('plannerIncome')?.value || 0);
        const expenses = parseFloat(document.getElementById('plannerExpenses')?.value || 0);
        return income - expenses;
    }

    generateFallbackPlan(userData) {
        return `Based on your ₹${userData.income - userData.expenses} monthly savings capacity:

        💡 Recommendations:
        • Emergency Fund: Allocate 30% (₹${((userData.income - userData.expenses) * 0.3).toFixed(0)})
        • Goal Savings: Allocate 50% (₹${((userData.income - userData.expenses) * 0.5).toFixed(0)})
        • Investment: Allocate 20% (₹${((userData.income - userData.expenses) * 0.2).toFixed(0)})

        🎯 Strategy: Start with systematic investment plans (SIPs) and automate your savings to maintain consistency.`;
    }
}

class MoneyMentorApp {
    constructor() {
        this.currentUser = { role: 'student', theme: 'light' };
        this.loadUserSettings();
        this.data = {
            transactions: [],
            budgets: [],
            goals: [],
            subscriptions: [],
            investments: [],
            loans: [],
            achievements: [],
            streak: { savingsDays: 0, budgetDays: 0 },
            aiGeneratedSchedule: []
        };
        this.charts = {};
        this.streakSystem = new GoalBasedStreakSystem(this);
        this.aiScheduler = new AIScheduleGenerator(this);
        this.init();
    }
    
    init() {
        this.loadAllData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderDashboard();
        this.showTab('dashboard');
    }

    loadUserSettings() {
        const savedRole = localStorage.getItem('moneymentor-role');
        const savedTheme = localStorage.getItem('moneymentor-theme');
        if (savedRole) this.currentUser.role = savedRole;
        if (savedTheme) this.currentUser.theme = savedTheme;
    }

    saveUserSettings() {
        localStorage.setItem('moneymentor-role', this.currentUser.role);
        localStorage.setItem('moneymentor-theme', this.currentUser.theme);
    }

    loadAllData() {
        const roleKey = this.currentUser.role;
        const savedData = localStorage.getItem(`moneymentor-data-${roleKey}`);
        
        if (savedData) {
            this.data = { ...this.data, ...JSON.parse(savedData) };
        } else {
            this.loadDefaultData();
        }
    }

    saveAllData() {
        const roleKey = this.currentUser.role;
        localStorage.setItem(`moneymentor-data-${roleKey}`, JSON.stringify(this.data));
    }

    loadDefaultData() {
        if (this.currentUser.role === 'student') {
            const studentData = {
                sampleTransactions: [
                    { id: "1", amount: 5000, category: "Scholarship", date: "2025-08-01", type: "income", description: "Merit scholarship" },
                    { id: "2", amount: 2000, category: "Freelance", date: "2025-08-05", type: "income", description: "Content writing" },
                    { id: "3", amount: 1500, category: "Part-time", date: "2025-08-15", type: "income", description: "Campus job" },
                    { id: "4", amount: 300, category: "Food", date: "2025-08-23", type: "expense", description: "Mess fees" },
                    { id: "5", amount: 150, category: "Food", date: "2025-08-22", type: "expense", description: "Canteen snacks" },
                    { id: "6", amount: 80, category: "Transport", date: "2025-08-21", type: "expense", description: "Bus fare" },
                    { id: "7", amount: 200, category: "Books", date: "2025-08-20", type: "expense", description: "Course materials" },
                    { id: "8", amount: 500, category: "Entertainment", date: "2025-08-19", type: "expense", description: "Movie with friends" },
                    { id: "9", amount: 100, category: "Stationery", date: "2025-08-18", type: "expense", description: "Notebooks and pens" }
                ],
                budgetCategories: [
                    { name: "Food", limit: 1500, spent: 450, color: "#ff6b6b" },
                    { name: "Transport", limit: 500, spent: 280, color: "#4ecdc4" },
                    { name: "Entertainment", limit: 800, spent: 500, color: "#45b7d1" },
                    { name: "Books", limit: 1000, spent: 400, color: "#96ceb4" },
                    { name: "Stationery", limit: 300, spent: 150, color: "#feca57" }
                ],
                savingsGoals: [
                    { name: "Laptop for Studies", target: 40000, current: 15000, deadline: "2025-12-31" },
                    { name: "Certification Course", target: 10000, current: 3500, deadline: "2025-10-15" },
                    { name: "Emergency Fund", target: 25000, current: 8000, deadline: "2025-11-30" }
                ],
                subscriptions: [
                    { name: "Netflix Student", cost: 149, renewalDate: "2025-09-20", category: "Entertainment" },
                    { name: "Spotify Student", cost: 59, renewalDate: "2025-08-28", category: "Music" },
                    { name: "Notion Pro", cost: 99, renewalDate: "2025-09-15", category: "Productivity" },
                    { name: "Coursera Plus", cost: 399, renewalDate: "2025-10-01", category: "Education" }
                ],
                investments: [
                    { symbol: "NIFTY50", name: "Nifty 50 ETF", shares: 10, buyPrice: 180, currentPrice: 195 },
                    { symbol: "GOLDBEES", name: "Gold ETF", shares: 5, buyPrice: 45, currentPrice: 48 }
                ],
                achievements: [
                    { name: "First Savings", description: "Saved your first ₹1000", unlocked: true, icon: "💰" },
                    { name: "Budget Beginner", description: "Created your first budget", unlocked: true, icon: "🎯" },
                    { name: "Study Smart", description: "Used education budget wisely", unlocked: true, icon: "📚" },
                    { name: "Investment Starter", description: "Made your first investment", unlocked: false, icon: "📈" }
                ]
            };
            
            this.data.transactions = studentData.sampleTransactions.map(t => ({ ...t, id: Date.now() + Math.random() }));
            this.data.budgets = studentData.budgetCategories;
            this.data.goals = studentData.savingsGoals.map(g => ({ ...g, id: Date.now() + Math.random() }));
            this.data.subscriptions = studentData.subscriptions.map(s => ({ ...s, id: Date.now() + Math.random() }));
            this.data.investments = studentData.investments.map(i => ({ ...i, id: Date.now() + Math.random() }));
            this.data.achievements = studentData.achievements;
            this.data.streak = { savingsDays: 3, budgetDays: 5 };
        } else {
            const professionalData = {
                sampleTransactions: [
                    { id: "1", amount: 85000, category: "Salary", date: "2025-08-01", type: "income", description: "Monthly salary" },
                    { id: "2", amount: 15000, category: "Freelance", date: "2025-08-05", type: "income", description: "Consulting project" },
                    { id: "3", amount: 3000, category: "Investment", date: "2025-08-15", type: "income", description: "Dividend income" },
                    { id: "4", amount: 25000, category: "Housing", date: "2025-08-02", type: "expense", description: "Monthly rent" },
                    { id: "5", amount: 8000, category: "Food", date: "2025-08-22", type: "expense", description: "Groceries and dining" },
                    { id: "6", amount: 3500, category: "Transport", date: "2025-08-21", type: "expense", description: "Car EMI" },
                    { id: "7", amount: 5000, category: "Insurance", date: "2025-08-20", type: "expense", description: "Health & life insurance" },
                    { id: "8", amount: 2000, category: "Entertainment", date: "2025-08-19", type: "expense", description: "Weekend activities" },
                    { id: "9", amount: 1500, category: "Utilities", date: "2025-08-18", type: "expense", description: "Electricity & water" }
                ],
                budgetCategories: [
                    { name: "Housing", limit: 30000, spent: 25000, color: "#ff6b6b" },
                    { name: "Food", limit: 10000, spent: 8000, color: "#4ecdc4" },
                    { name: "Transport", limit: 5000, spent: 3500, color: "#45b7d1" },
                    { name: "Insurance", limit: 6000, spent: 5000, color: "#96ceb4" },
                    { name: "Entertainment", limit: 4000, spent: 2000, color: "#feca57" },
                    { name: "Utilities", limit: 2500, spent: 1500, color: "#ff9ff3" }
                ],
                savingsGoals: [
                    { name: "House Down Payment", target: 500000, current: 125000, deadline: "2026-12-31" },
                    { name: "Car Upgrade", target: 800000, current: 200000, deadline: "2025-10-15" },
                    { name: "Emergency Fund", target: 300000, current: 85000, deadline: "2025-12-31" },
                    { name: "Vacation Europe", target: 150000, current: 45000, deadline: "2025-09-30" }
                ],
                subscriptions: [
                    { name: "Netflix Premium", cost: 899, renewalDate: "2025-09-20", category: "Entertainment" },
                    { name: "Spotify Premium", cost: 119, renewalDate: "2025-08-28", category: "Music" },
                    { name: "Amazon Prime", cost: 329, renewalDate: "2025-09-15", category: "Shopping" },
                    { name: "Adobe Creative Suite", cost: 1699, renewalDate: "2025-09-05", category: "Software" },
                    { name: "Microsoft 365", cost: 489, renewalDate: "2025-09-25", category: "Software" },
                    { name: "Gym Premium", cost: 2500, renewalDate: "2025-09-30", category: "Fitness" }
                ],
                investments: [
                    { symbol: "RELIANCE", name: "Reliance Industries", shares: 50, buyPrice: 2400, currentPrice: 2580 },
                    { symbol: "TCS", name: "Tata Consultancy Services", shares: 25, buyPrice: 3200, currentPrice: 3450 },
                    { symbol: "INFY", name: "Infosys Limited", shares: 30, buyPrice: 1800, currentPrice: 1920 },
                    { symbol: "NIFTY50", name: "Nifty 50 ETF", shares: 100, buyPrice: 180, currentPrice: 195 },
                    { symbol: "GOLDBEES", name: "Gold ETF", shares: 75, buyPrice: 45, currentPrice: 48 }
                ],
                achievements: [
                    { name: "Salary Saver", description: "Saved 20% of salary", unlocked: true, icon: "💰" },
                    { name: "Investment Pro", description: "Built diversified portfolio", unlocked: true, icon: "📈" },
                    { name: "Budget Master", description: "Maintained budget for 6 months", unlocked: true, icon: "🎯" },
                    { name: "Emergency Builder", description: "Built substantial emergency fund", unlocked: true, icon: "🛡️" },
                    { name: "Goal Achiever", description: "Completed major financial goal", unlocked: false, icon: "🏆" }
                ]
            };
            
            this.data.transactions = professionalData.sampleTransactions.map(t => ({ ...t, id: Date.now() + Math.random() }));
            this.data.budgets = professionalData.budgetCategories;
            this.data.goals = professionalData.savingsGoals.map(g => ({ ...g, id: Date.now() + Math.random() }));
            this.data.subscriptions = professionalData.subscriptions.map(s => ({ ...s, id: Date.now() + Math.random() }));
            this.data.investments = professionalData.investments.map(i => ({ ...i, id: Date.now() + Math.random() }));
            this.data.achievements = professionalData.achievements;
            this.data.streak = { savingsDays: 15, budgetDays: 12 };
        }
        
        this.saveAllData();
    }
    
    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('studentRole').addEventListener('click', () => this.switchRole('student'));
        document.getElementById('professionalRole').addEventListener('click', () => this.switchRole('professional'));
        
        document.querySelectorAll('.nav__item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
            });
        });
        
        this.setupModalHandlers();
        
        const transactionForm = document.getElementById('transactionForm');
        const goalForm = document.getElementById('goalForm');
        const investmentForm = document.getElementById('investmentForm');
        const subscriptionForm = document.getElementById('subscriptionForm');
        const budgetForm = document.getElementById('budgetForm');
        
        if (transactionForm) transactionForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        if (goalForm) goalForm.addEventListener('submit', (e) => this.handleGoalSubmit(e));
        if (investmentForm) investmentForm.addEventListener('submit', (e) => this.handleInvestmentSubmit(e));
        if (subscriptionForm) subscriptionForm.addEventListener('submit', (e) => this.handleSubscriptionSubmit(e));
        if (budgetForm) budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        
        const sendBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendChatMessage());
        if (chatInput) chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        
        const exportTransBtn = document.getElementById('exportTransactions');
        const exportReportBtn = document.getElementById('exportReport');
        if (exportTransBtn) exportTransBtn.addEventListener('click', () => this.exportTransactions());
        if (exportReportBtn) exportReportBtn.addEventListener('click', () => this.exportReport());
        
        const transactionDate = document.getElementById('transactionDate');
        if (transactionDate) transactionDate.valueAsDate = new Date();
    }
    
    setupModalHandlers() {
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        const addGoalBtn = document.getElementById('addGoalBtn');
        const addInvestmentBtn = document.getElementById('addInvestmentBtn');
        
        if (addTransactionBtn) addTransactionBtn.addEventListener('click', () => this.showModal('transactionModal'));
        if (addGoalBtn) addGoalBtn.addEventListener('click', () => this.showModal('goalModal'));
        if (addInvestmentBtn) addInvestmentBtn.addEventListener('click', () => this.showModal('investmentModal'));
        
        document.querySelectorAll('.modal__close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
        
        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
        
        const cancelButtons = [
            'cancelTransaction', 'cancelGoal', 'cancelInvestment', 
            'cancelSubscription', 'cancelBudget'
        ];
        
        cancelButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                const modalId = id.replace('cancel', '').toLowerCase() + 'Modal';
                btn.addEventListener('click', () => this.hideModal(modalId));
            }
        });
    }
    
    setupTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentUser.theme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentUser.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentUser.theme === 'light' ? 'dark' : 'light';
        this.currentUser.theme = newTheme;
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        this.saveUserSettings();
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        this.showNotification('Theme switched to ' + newTheme + ' mode', 'success');
    }
    
    switchRole(role) {
        this.saveAllData();
        this.currentUser.role = role;
        this.saveUserSettings();
        
        this.data = {
            transactions: [],
            budgets: [],
            goals: [],
            subscriptions: [],
            investments: [],
            loans: [],
            achievements: [],
            streak: { savingsDays: 0, budgetDays: 0 },
            aiGeneratedSchedule: []
        };
        
        this.loadAllData();
        this.streakSystem = new GoalBasedStreakSystem(this);
        
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        const roleBtn = document.getElementById(role + 'Role');
        if (roleBtn) roleBtn.classList.add('active');
        
        this.renderDashboard();
        this.showNotification(`Switched to ${role} dashboard`, 'success');
    }
    
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav__item').forEach(nav => nav.classList.remove('active'));
        
        const tabContent = document.getElementById(tabName);
        const navItem = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tabContent) tabContent.classList.add('active');
        if (navItem) navItem.classList.add('active');
        
        switch (tabName) {
            case 'dashboard': this.renderDashboard(); break;
            case 'transactions': this.renderTransactions(); break;
            case 'budget': this.renderBudgets(); break;
            case 'subscriptions': this.renderSubscriptions(); break;
            case 'investments': this.renderInvestments(); break;
            case 'reports': this.renderReports(); break;
        }
    }
    
    renderDashboard() {
        this.updateMetrics();
        this.renderExpenseChart();
        this.renderTrendChart();
        this.renderGoals();
        this.renderAchievements();
        
        const streakElement = document.querySelector('.dashboard__row');
        if (streakElement && !streakElement.querySelector('.streak-card')) {
            const streakCard = document.createElement('div');
            streakCard.className = 'streak-card metric-card';
            streakCard.innerHTML = `
                <div class="metric-card__icon">
                    <i class="fas fa-fire"></i>
                </div>
                <div class="metric-card__content">
                    <h3>Goal Streak</h3>
                    <p class="metric-card__value">${this.streakSystem.streaks.goalCompletionDays}🔥 Days</p>
                    <small>Best: ${this.streakSystem.streaks.longestGoalStreak} days</small>
                </div>
            `;
            streakElement.appendChild(streakCard);
        }

        if (!streakElement.querySelector('.ai-planner-btn')) {
            const aiPlannerBtn = document.createElement('div');
            aiPlannerBtn.className = 'metric-card ai-planner-card';
            aiPlannerBtn.innerHTML = `
                <div class="metric-card__icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="metric-card__content">
                    <h3>AI Planner</h3>
                    <p class="metric-card__value">Generate Plan</p>
                    <button class="btn btn--primary ai-planner-btn">🤖 Start AI Planning</button>
                </div>
            `;
            streakElement.appendChild(aiPlannerBtn);
            
            aiPlannerBtn.querySelector('.ai-planner-btn').addEventListener('click', () => {
                this.aiScheduler.showPlannerModal();
            });
        }
        
        this.streakSystem.checkDailyGoalProgress();
    }
    
    updateMetrics() {
        const totalIncome = this.data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = this.data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0;
        
        const totalBalanceEl = document.getElementById('totalBalance');
        const monthlyIncomeEl = document.getElementById('monthlyIncome');
        const monthlyExpensesEl = document.getElementById('monthlyExpenses');
        const savingsRateEl = document.getElementById('savingsRate');
        
        if (totalBalanceEl) totalBalanceEl.textContent = `₹${totalBalance.toLocaleString()}`;
        if (monthlyIncomeEl) monthlyIncomeEl.textContent = `₹${totalIncome.toLocaleString()}`;
        if (monthlyExpensesEl) monthlyExpensesEl.textContent = `₹${totalExpenses.toLocaleString()}`;
        if (savingsRateEl) savingsRateEl.textContent = `${savingsRate}%`;
    }
    
    renderExpenseChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;
        if (this.charts.expenseChart) this.charts.expenseChart.destroy();
        
        const expensesByCategory = {};
        this.data.transactions.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount);
        });
        
        const colors = ['#1E3A8A', '#C5A880', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
        this.charts.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expensesByCategory),
                datasets: [{ data: Object.values(expensesByCategory), backgroundColor: colors, borderWidth: 0 }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }
    
    renderTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        if (this.charts.trendChart) this.charts.trendChart.destroy();
        
        const days = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            const baseIncome = this.currentUser.role === 'student' ? 500 + Math.random() * 1000 : 3000 + Math.random() * 5000;
            const baseExpense = this.currentUser.role === 'student' ? 300 + Math.random() * 600 : 2000 + Math.random() * 3000;
            incomeData.push(baseIncome);
            expenseData.push(baseExpense);
        }
        
        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Income', data: incomeData, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Expenses', data: expenseData, borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { callback: value => '₹' + value.toLocaleString() } } }
            }
        });
    }
    
    renderGoals() {
        const container = document.getElementById('goalsList');
        if (!container) return;
        container.innerHTML = '';
        
        this.data.goals.forEach(goal => {
            const progress = (goal.current / goal.target) * 100;
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item fade-in';
            goalElement.innerHTML = `
                <div class="goal-header">
                    <span class="goal-name">${goal.name}</span>
                    <span class="goal-amount">₹${goal.current.toLocaleString()} / ₹${goal.target.toLocaleString()}</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="goal-deadline">Target: ${new Date(goal.deadline).toLocaleDateString()}</div>
            `;
            container.appendChild(goalElement);
        });
    }
    
    renderAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;
        container.innerHTML = '';
        
        const unlockedCount = this.data.achievements.filter(a => a.unlocked).length;
        const achievementScore = document.getElementById('achievementScore');
        if (achievementScore) {
            achievementScore.textContent = `${unlockedCount}/${this.data.achievements.length}`;
        }
        
        this.data.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            `;
            container.appendChild(achievementElement);
        });
    }
    
    renderTransactions() {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        container.innerHTML = '';
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            const categories = [...new Set(this.data.transactions.map(t => t.category))];
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(cat => categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`);
        }
        
        let filteredTransactions = [...this.data.transactions];
        
        const typeFilter = document.getElementById('typeFilter');
        const catFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (typeFilter && typeFilter.value !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter.value);
        }
        if (catFilter && catFilter.value !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === catFilter.value);
        }
        if (dateFilter && dateFilter.value) {
            filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter.value);
        }
        
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredTransactions.forEach(transaction => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item fade-in';
            transactionEl.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <span class="transaction-category">${transaction.category}</span>
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}₹${parseFloat(transaction.amount).toLocaleString()}</div>
                    <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                    <button class="btn btn--sm btn--outline btn-remove-transaction" data-id="${transaction.id}">Remove</button>
                </div>
            `;
            container.appendChild(transactionEl);
        });
        
        container.querySelectorAll('.btn-remove-transaction').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.target.dataset.id;
                this.deleteTransaction(id);
            });
        });
        
        ['typeFilter', 'categoryFilter', 'dateFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.renderTransactions());
            }
        });
    }
    
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.data.transactions = this.data.transactions.filter(t => t.id != id);
            this.saveAllData();
            this.showNotification('Transaction removed', 'success');
            this.renderTransactions();
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.renderDashboard();
            }
        }
    }
    
    renderBudgets() {
        const container = document.getElementById('budget');
        if (!container) return;
        
        container.innerHTML = `
            <div class="budget__header">
                <h2>Budget Overview</h2>
                <button class="btn btn--primary" id="addBudgetBtn">
                    <i class="fas fa-plus"></i> Add Budget
                </button>
            </div>
            <div class="budget__grid" id="budgetGrid"></div>
        `;
        
        const grid = container.querySelector('#budgetGrid');
        this.data.budgets.forEach(budget => {
            const percentage = (budget.spent / budget.limit) * 100;
            const remaining = budget.limit - budget.spent;
            const budgetElement = document.createElement('div');
            budgetElement.className = 'budget-card fade-in';
            budgetElement.innerHTML = `
                <div class="budget-header">
                    <div class="budget-name">${budget.name}</div>
                    <div class="budget-amount">₹${budget.spent.toLocaleString()} / ₹${budget.limit.toLocaleString()}</div>
                    <button class="delete-budget btn btn--sm btn--outline" data-id="${budget.name}">Delete</button>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${Math.min(percentage, 100)}%; background-color: ${budget.color}"></div>
                </div>
                <div class="budget-stats">
                    <span class="budget-remaining">₹${remaining.toLocaleString()} remaining</span>
                    <span class="budget-percentage">${percentage.toFixed(1)}%</span>
                </div>
            `;
            grid.appendChild(budgetElement);
            budgetElement.querySelector('.delete-budget').onclick = () => this.deleteBudget(budget.name);
        });
        
        const addBudgetBtn = document.getElementById('addBudgetBtn');
        if (addBudgetBtn) {
            addBudgetBtn.addEventListener('click', () => this.showModal('budgetModal'));
        }
    }
    
    renderSubscriptions() {
        const container = document.getElementById('subscriptions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="subscriptions__header">
                <h2>Subscriptions</h2>
                <button class="btn btn--primary" id="addSubscriptionBtn">
                    <i class="fas fa-plus"></i> Add Subscription
                </button>
            </div>
            <div class="subscriptions__grid" id="subscriptionsGrid"></div>
        `;
        
        const grid = container.querySelector('#subscriptionsGrid');
        this.data.subscriptions.forEach(subscription => {
            const renewalDate = new Date(subscription.renewalDate);
            const daysUntilRenewal = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
            const subscriptionElement = document.createElement('div');
            subscriptionElement.className = 'subscription-card fade-in';
            subscriptionElement.innerHTML = `
                <div class="subscription-header">
                    <div class="subscription-name">${subscription.name}</div>
                    <div class="subscription-cost">₹${subscription.cost}</div>
                    <button class="delete-subscription btn btn--sm btn--outline" data-id="${subscription.id}">Delete</button>
                </div>
                <div class="subscription-info">
                    <span class="subscription-category">${subscription.category}</span>
                    <span class="subscription-renewal">Renews in ${daysUntilRenewal} days</span>
                </div>
            `;
            grid.appendChild(subscriptionElement);
        });
        
        grid.querySelectorAll('.delete-subscription').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.target.dataset.id;
                this.deleteSubscription(id);
            });
        });
        
        const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
        if (addSubscriptionBtn) {
            addSubscriptionBtn.addEventListener('click', () => this.showModal('subscriptionModal'));
        }
    }
    
    renderInvestments() {
        const container = document.getElementById('investmentsList');
        if (!container) return;
        container.innerHTML = '';
        
        let totalValue = 0;
        let totalGain = 0;
        let totalInvested = 0;
        
        this.data.investments.forEach(investment => {
            const currentValue = investment.shares * investment.currentPrice;
            const buyValue = investment.shares * investment.buyPrice;
            const gain = currentValue - buyValue;
            const gainPercent = ((gain / buyValue) * 100).toFixed(2);
            const priceChange = ((investment.currentPrice - investment.buyPrice) / investment.buyPrice * 100).toFixed(2);
            
            totalValue += currentValue;
            totalGain += gain;
            totalInvested += buyValue;
            
            const investmentElement = document.createElement('div');
            investmentElement.className = 'investment-item fade-in';
            investmentElement.innerHTML = `
                <div class="investment-info">
                    <h4>${investment.name}</h4>
                    <span class="investment-symbol">${investment.symbol} • ${investment.shares} shares</span>
                    <span class="price-change ${priceChange >= 0 ? 'positive' : 'negative'}">
                        Price Change: ${priceChange >= 0 ? '+' : ''}${priceChange}%
                    </span>
                </div>
                <div class="investment-stats">
                    <div class="investment-value">₹${currentValue.toLocaleString()}</div>
                    <div class="investment-gain ${gain >= 0 ? 'positive' : 'negative'}">
                        ${gain >= 0 ? '+' : ''}₹${gain.toLocaleString()} (${gainPercent}%)
                    </div>
                    <div class="investment-prices">
                        Buy: ₹${investment.buyPrice} | Current: ₹${investment.currentPrice}
                    </div>
                </div>
            `;
            container.appendChild(investmentElement);
        });
        
        const returnPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
        
        const totalPortfolioValue = document.getElementById('totalPortfolioValue');
        const totalGains = document.getElementById('totalGains');
        const returnPercentEl = document.getElementById('returnPercent');
        
        if (totalPortfolioValue) totalPortfolioValue.textContent = `₹${totalValue.toLocaleString()}`;
        if (totalGains) {
            totalGains.textContent = `₹${totalGain.toLocaleString()}`;
            totalGains.className = totalGain >= 0 ? 'positive' : 'negative';
        }
        if (returnPercentEl) {
            returnPercentEl.textContent = `${returnPercent}%`;
            returnPercentEl.className = totalGain >= 0 ? 'positive' : 'negative';
        }
    }
    
    renderReports() {
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;
        if (this.charts.reportChart) this.charts.reportChart.destroy();
        
        const reportPeriod = document.getElementById('reportPeriod');
        const period = reportPeriod ? reportPeriod.value : 'monthly';
        
        let labels = [];
        let incomeData = [];
        let expenseData = [];
        
        if (period === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const baseIncome = this.currentUser.role === 'student' ? 200 + Math.random() * 800 : 2000 + Math.random() * 3000;
                const baseExpense = this.currentUser.role === 'student' ? 150 + Math.random() * 500 : 1500 + Math.random() * 2000;
                incomeData.push(baseIncome);
                expenseData.push(baseExpense);
            }
        } else {
            const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
            labels = months;
            if (this.currentUser.role === 'student') {
                incomeData = [6000, 7500, 8000, 7200, 8500, 8500];
                expenseData = [4500, 5200, 5800, 5000, 5600, 5800];
            } else {
                incomeData = [95000, 98000, 105000, 102000, 110000, 103000];
                expenseData = [65000, 68000, 72000, 70000, 75000, 73000];
            }
        }
        
        this.charts.reportChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Income', data: incomeData, backgroundColor: '#10B981', borderColor: '#10B981', borderWidth: 1 },
                    { label: 'Expenses', data: expenseData, backgroundColor: '#EF4444', borderColor: '#EF4444', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { callback: value => '₹' + value.toLocaleString() } } }
            }
        });
        
        if (reportPeriod) {
            reportPeriod.addEventListener('change', () => this.renderReports());
        }
    }
    
    handleTransactionSubmit(e) {
        e.preventDefault();
        const transaction = {
            id: Date.now() + Math.random(),
            amount: document.getElementById('transactionAmount').value,
            type: document.getElementById('transactionType').value,
            category: document.getElementById('transactionCategory').value,
            description: document.getElementById('transactionDescription').value,
            date: document.getElementById('transactionDate').value
        };
        this.data.transactions.push(transaction);
        this.saveAllData();
        this.hideModal('transactionModal');
        this.clearForm('transactionForm');
        this.showNotification('Transaction added successfully!', 'success');
        this.streakSystem.checkDailyGoalProgress();
        if (document.getElementById('dashboard').classList.contains('active')) this.renderDashboard();
        if (document.getElementById('transactions').classList.contains('active')) this.renderTransactions();
    }
    
    handleBudgetSubmit(e) {
        e.preventDefault();
        const nameField = document.getElementById('budgetName');
        const limitField = document.getElementById('budgetLimit');
        
        if (!nameField.value || !limitField.value) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (this.data.budgets.find(b => b.name.toLowerCase() === nameField.value.trim().toLowerCase())) {
            this.showNotification('Budget for this category already exists', 'error');
            return;
        }
        
        this.data.budgets.push({
            name: nameField.value.trim(),
            limit: parseFloat(limitField.value),
            spent: 0,
            color: '#1E3A8A'
        });
        
        this.saveAllData();
        this.showNotification('Budget added successfully!', 'success');
        this.hideModal('budgetModal');
        this.clearForm('budgetForm');
        this.renderBudgets();
    }
    
    handleSubscriptionSubmit(e) {
        e.preventDefault();
        const nameField = document.getElementById('subscriptionName');
        const costField = document.getElementById('subscriptionCost');
        const renewalField = document.getElementById('subscriptionRenewalDate');
        const categoryField = document.getElementById('subscriptionCategory');
        
        if (!nameField.value || !costField.value || !renewalField.value || !categoryField.value) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (this.data.subscriptions.find(s => s.name.toLowerCase() === nameField.value.trim().toLowerCase())) {
            this.showNotification('Subscription already exists', 'error');
            return;
        }
        
        this.data.subscriptions.push({
            id: Date.now() + Math.random(),
            name: nameField.value.trim(),
            cost: parseFloat(costField.value),
            renewalDate: renewalField.value,
            category: categoryField.value
        });
        
        this.saveAllData();
        this.showNotification('Subscription added successfully!', 'success');
        this.hideModal('subscriptionModal');
        this.clearForm('subscriptionForm');
        this.renderSubscriptions();
    }
    
    handleGoalSubmit(e) {
        e.preventDefault();
        const goal = {
            id: Date.now() + Math.random(),
            name: document.getElementById('goalName').value,
            target: parseFloat(document.getElementById('goalTarget').value),
            current: parseFloat(document.getElementById('goalCurrent').value),
            deadline: document.getElementById('goalDeadline').value
        };
        this.data.goals.push(goal);
        this.saveAllData();
        this.hideModal('goalModal');
        this.clearForm('goalForm');
        this.showNotification('Savings goal added successfully!', 'success');
        this.renderGoals();
    }
    
    handleInvestmentSubmit(e) {
        e.preventDefault();
        const investment = {
            id: Date.now() + Math.random(),
            symbol: document.getElementById('investmentSymbol').value,
            name: document.getElementById('investmentName').value,
            shares: parseFloat(document.getElementById('investmentShares').value),
            buyPrice: parseFloat(document.getElementById('investmentBuyPrice').value),
            currentPrice: parseFloat(document.getElementById('investmentCurrentPrice').value)
        };
        this.data.investments.push(investment);
        this.saveAllData();
        this.hideModal('investmentModal');
        this.clearForm('investmentForm');
        this.showNotification('Investment added successfully!', 'success');
        if (document.getElementById('investments').classList.contains('active')) this.renderInvestments();
    }
    
    deleteBudget(name) {
        if (confirm('Are you sure you want to delete this budget?')) {
            this.data.budgets = this.data.budgets.filter(b => b.name !== name);
            this.saveAllData();
            this.showNotification('Budget deleted!', 'success');
            this.renderBudgets();
        }
    }
    
    deleteSubscription(id) {
        if (confirm('Are you sure you want to delete this subscription?')) {
            this.data.subscriptions = this.data.subscriptions.filter(s => String(s.id) !== String(id));
            this.saveAllData();
            this.showNotification('Subscription deleted!', 'success');
            this.renderSubscriptions();
        }
    }

    acceptAIPlan(goalsJson) {
        try {
            const goals = JSON.parse(goalsJson);
            this.aiScheduler.saveGeneratedPlan('', goals);
            this.renderDashboard();
            document.querySelector('.ai-planner-modal').remove();
        } catch (error) {
            this.showNotification('Error accepting plan', 'error');
        }
    }
    
    async fetchGeminiAIResponse(message) {
        const API_KEY = 'AIzaSyANEE80xhtVYnnZjASGfThI9mX9ytcUotY';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a financial advisor AI assistant for MoneyMentor app. The user is a ${this.currentUser.role}. User asks: "${message}". Provide helpful, concise financial advice tailored to their role. Keep responses under 150 words.`
                        }]
                    }]
                })
            });
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates.content && data.candidates.content.parts && data.candidates.content.parts) {
                return data.candidates.content.parts.text;
            } else {
                return this.getAIResponse(message);
            }
        } catch (error) {
            return this.getAIResponse(message);
        }
    }
    
    getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        const rolePrefix = this.currentUser.role === 'student' ? 'As a student, ' : 'As a professional, ';
        
        if (lowerMessage.includes('budget')) {
            return rolePrefix + (this.currentUser.role === 'student' ? 
                "focus on the 70/20/10 rule: 70% for needs, 20% for wants, 10% for savings. Track meal expenses and find student discounts!" :
                "I recommend the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Consider automated investments and tax-saving options.");
        } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
            return rolePrefix + (this.currentUser.role === 'student' ?
                "start with small amounts! Even ₹500/month builds habits. Use student savings accounts and look for scholarship opportunities." :
                "aim for 6 months emergency fund first, then diversify into SIPs, PPF, and ELSS for tax benefits. Automate your savings!");
        } else if (lowerMessage.includes('invest')) {
            return rolePrefix + (this.currentUser.role === 'student' ?
                "begin with low-cost mutual funds and SIPs. Start with ₹500/month in diversified equity funds. Learn before you invest!" :
                "diversify across equity, debt, and international funds. Consider ELSS for tax savings and increase SIP amounts annually.");
        } else {
