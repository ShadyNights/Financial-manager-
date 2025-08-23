class MoneyMentorApp {
    constructor() {
        this.currentUser = { role: 'student', theme: 'light' };
        this.data = {
            transactions: [],
            budgets: [],
            goals: [],
            subscriptions: [],
            investments: [],
            loans: [],
            achievements: [],
            streak: { savingsDays: 0, budgetDays: 0 }
        };
        this.charts = {};
        this.init();
    }
    
    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderDashboard();
        this.showTab('dashboard');
    }
    
    loadSampleData() {
        const sampleData = {
            sampleTransactions: [
                // Income transactions
                { id: "1", amount: 25000, category: "Salary", date: "2025-08-01", type: "income", description: "Monthly salary" },
                { id: "2", amount: 5000, category: "Freelance", date: "2025-08-05", type: "income", description: "Web design project" },
                { id: "3", amount: 3000, category: "Freelance", date: "2025-08-15", type: "income", description: "Logo design work" },
                { id: "4", amount: 1200, category: "Other", date: "2025-08-20", type: "income", description: "Cashback from credit card" },
                
                // Food expenses
                { id: "5", amount: 150, category: "Food", date: "2025-08-23", type: "expense", description: "Groceries - Supermarket" },
                { id: "6", amount: 80, category: "Food", date: "2025-08-22", type: "expense", description: "Dinner at restaurant" },
                { id: "7", amount: 45, category: "Food", date: "2025-08-21", type: "expense", description: "Lunch delivery" },
                { id: "8", amount: 120, category: "Food", date: "2025-08-20", type: "expense", description: "Weekly groceries" },
                { id: "9", amount: 65, category: "Food", date: "2025-08-19", type: "expense", description: "Coffee and snacks" },
                
                // Transport expenses
                { id: "10", amount: 200, category: "Transport", date: "2025-08-18", type: "expense", description: "Monthly bus pass" },
                { id: "11", amount: 150, category: "Transport", date: "2025-08-16", type: "expense", description: "Uber rides" },
                { id: "12", amount: 80, category: "Transport", date: "2025-08-14", type: "expense", description: "Metro card recharge" },
                
                // Entertainment expenses
                { id: "13", amount: 500, category: "Entertainment", date: "2025-08-17", type: "expense", description: "Movie tickets with friends" },
                { id: "14", amount: 300, category: "Entertainment", date: "2025-08-12", type: "expense", description: "Concert tickets" },
                { id: "15", amount: 180, category: "Entertainment", date: "2025-08-10", type: "expense", description: "Gaming subscription" },
                
                // Shopping expenses
                { id: "16", amount: 1200, category: "Shopping", date: "2025-08-13", type: "expense", description: "New clothes for work" },
                { id: "17", amount: 800, category: "Shopping", date: "2025-08-08", type: "expense", description: "Electronics accessories" },
                { id: "18", amount: 450, category: "Shopping", date: "2025-08-06", type: "expense", description: "Books and stationery" },
                
                // Bills and utilities
                { id: "19", amount: 1500, category: "Bills", date: "2025-08-02", type: "expense", description: "Electricity bill" },
                { id: "20", amount: 899, category: "Bills", date: "2025-08-03", type: "expense", description: "Internet bill" },
                { id: "21", amount: 600, category: "Bills", date: "2025-08-04", type: "expense", description: "Mobile recharge" },
                
                // Healthcare
                { id: "22", amount: 800, category: "Healthcare", date: "2025-08-09", type: "expense", description: "Doctor consultation" },
                { id: "23", amount: 350, category: "Healthcare", date: "2025-08-11", type: "expense", description: "Medicines" },
                
                // Education
                { id: "24", amount: 2500, category: "Education", date: "2025-08-07", type: "expense", description: "Online course subscription" },
                { id: "25", amount: 150, category: "Education", date: "2025-08-14", type: "expense", description: "Study materials" }
            ],
            
            budgetCategories: [
                { name: "Food", limit: 3000, spent: 1460, color: "#ff6b6b" },
                { name: "Transport", limit: 1500, spent: 830, color: "#4ecdc4" },
                { name: "Entertainment", limit: 2000, spent: 1480, color: "#45b7d1" },
                { name: "Shopping", limit: 4000, spent: 2450, color: "#96ceb4" },
                { name: "Bills", limit: 3500, spent: 2999, color: "#feca57" },
                { name: "Healthcare", limit: 2000, spent: 1150, color: "#ff9ff3" },
                { name: "Education", limit: 5000, spent: 2650, color: "#54a0ff" }
            ],
            
            savingsGoals: [
                { name: "Emergency Fund", target: 50000, current: 18500, deadline: "2025-12-31" },
                { name: "New Laptop", target: 80000, current: 45000, deadline: "2025-10-15" },
                { name: "Vacation Trip", target: 35000, current: 12000, deadline: "2025-09-30" },
                { name: "Investment Capital", target: 100000, current: 25000, deadline: "2026-03-15" },
                { name: "Course Certification", target: 15000, current: 8500, deadline: "2025-11-20" }
            ],
            
            subscriptions: [
                { name: "Netflix Premium", cost: 899, renewalDate: "2025-09-20", category: "Entertainment" },
                { name: "Spotify Premium", cost: 119, renewalDate: "2025-08-28", category: "Music" },
                { name: "Amazon Prime", cost: 329, renewalDate: "2025-09-15", category: "Shopping" },
                { name: "Adobe Creative Suite", cost: 1699, renewalDate: "2025-09-05", category: "Software" },
                { name: "GitHub Pro", cost: 349, renewalDate: "2025-09-12", category: "Software" },
                { name: "Canva Pro", cost: 399, renewalDate: "2025-10-01", category: "Software" },
                { name: "YouTube Premium", cost: 129, renewalDate: "2025-09-08", category: "Entertainment" },
                { name: "Microsoft 365", cost: 489, renewalDate: "2025-09-25", category: "Software" },
                { name: "Gym Membership", cost: 1500, renewalDate: "2025-09-30", category: "Fitness" },
                { name: "Coursera Plus", cost: 399, renewalDate: "2025-10-15", category: "Education" }
            ],
            
            investments: [
                { symbol: "RELIANCE", name: "Reliance Industries Ltd", shares: 15, buyPrice: 2400, currentPrice: 2580 },
                { symbol: "TCS", name: "Tata Consultancy Services", shares: 8, buyPrice: 3200, currentPrice: 3450 },
                { symbol: "INFY", name: "Infosys Limited", shares: 12, buyPrice: 1800, currentPrice: 1920 },
                { symbol: "HDFC", name: "HDFC Bank Limited", shares: 10, buyPrice: 1650, currentPrice: 1720 },
                { symbol: "ICICI", name: "ICICI Bank Limited", shares: 20, buyPrice: 850, currentPrice: 920 },
                { symbol: "NIFTY50", name: "Nifty 50 ETF", shares: 50, buyPrice: 180, currentPrice: 195 },
                { symbol: "GOLDBEES", name: "Gold ETF", shares: 25, buyPrice: 45, currentPrice: 48 },
                { symbol: "SENSEX", name: "Sensex ETF", shares: 30, buyPrice: 420, currentPrice: 445 }
            ],
            
            loans: [
                { 
                    id: "1", 
                    type: "Student Loan", 
                    principal: 200000, 
                    interest: 8.5, 
                    emi: 2847, 
                    remaining: 165000, 
                    nextPayment: "2025-09-01",
                    tenure: 84 
                },
                { 
                    id: "2", 
                    type: "Personal Loan", 
                    principal: 50000, 
                    interest: 12.0, 
                    emi: 1567, 
                    remaining: 38500, 
                    nextPayment: "2025-09-05",
                    tenure: 36 
                }
            ],
            
            achievements: [
                { name: "First Budget", description: "Created your first budget", unlocked: true, icon: "🎯" },
                { name: "Savings Streak", description: "Saved money for 7 days straight", unlocked: true, icon: "🔥" },
                { name: "Investment Starter", description: "Made your first investment", unlocked: true, icon: "📈" },
                { name: "Budget Master", description: "Stayed within budget for 3 months", unlocked: true, icon: "💰" },
                { name: "Goal Achiever", description: "Completed your first savings goal", unlocked: true, icon: "🏆" },
                { name: "Debt Reducer", description: "Paid off 25% of debt", unlocked: false, icon: "💪" },
                { name: "Emergency Fund", description: "Built 6 months emergency fund", unlocked: false, icon: "🛡️" },
                { name: "Investment Pro", description: "Portfolio worth ₹1,00,000+", unlocked: false, icon: "💎" },
                { name: "Subscription Optimizer", description: "Cancelled 3+ unused subscriptions", unlocked: false, icon: "✂️" },
                { name: "Financial Guru", description: "Maintained positive cash flow for 6 months", unlocked: false, icon: "🧙‍♂️" }
            ]
        };
        
        // Calculate actual spent amounts for budgets based on transactions
        const expensesByCategory = {};
        sampleData.sampleTransactions.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount);
        });
        
        // Update budget spent amounts
        sampleData.budgetCategories.forEach(budget => {
            if (expensesByCategory[budget.name]) {
                budget.spent = expensesByCategory[budget.name];
            }
        });
        
        this.data.transactions = sampleData.sampleTransactions.map(t => ({ ...t, id: Date.now() + Math.random() }));
        this.data.budgets = sampleData.budgetCategories.map(b => ({ ...b }));
        this.data.goals = sampleData.savingsGoals.map(g => ({ ...g, id: Date.now() + Math.random() }));
        this.data.subscriptions = sampleData.subscriptions.map(s => ({ ...s, id: Date.now() + Math.random() }));
        this.data.investments = sampleData.investments.map(i => ({ ...i, id: Date.now() + Math.random() }));
        this.data.loans = sampleData.loans;
        this.data.achievements = sampleData.achievements;
        this.data.streak = { savingsDays: 12, budgetDays: 8 };
    }
    
    // ... rest of the code remains the same as in the previous version
    
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
        const savedTheme = localStorage.getItem('moneymentor-theme') || 'light';
        this.currentUser.theme = savedTheme;
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentUser.theme === 'light' ? 'dark' : 'light';
        this.currentUser.theme = newTheme;
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('moneymentor-theme', newTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        this.showNotification('Theme switched to ' + newTheme + ' mode', 'success');
    }
    
    switchRole(role) {
        this.currentUser.role = role;
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
                    <h3>Current Streak</h3>
                    <p class="metric-card__value">${this.data.streak.savingsDays}🔥 Savings | ${this.data.streak.budgetDays}🔥 Budget</p>
                </div>
            `;
            streakElement.appendChild(streakCard);
        }
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
        
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#feca57', '#ff9ff3'];
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
            
            // More realistic demo data
            const baseIncome = 1000 + Math.random() * 2000;
            const baseExpense = 800 + Math.random() * 1200;
            incomeData.push(baseIncome);
            expenseData.push(baseExpense);
        }
        
        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Income', data: incomeData, borderColor: '#1FB8CD', backgroundColor: 'rgba(31, 184, 205, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Expenses', data: expenseData, borderColor: '#B4413C', backgroundColor: 'rgba(180, 65, 60, 0.1)', fill: true, tension: 0.4 }
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
                incomeData.push(800 + Math.random() * 1500);
                expenseData.push(600 + Math.random() * 1000);
            }
        } else {
            const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
            labels = months;
            incomeData = [28000, 32000, 35000, 29000, 31000, 34200];
            expenseData = [22000, 24000, 26000, 23000, 25000, 26500];
        }
        
        this.charts.reportChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Income', data: incomeData, backgroundColor: '#1FB8CD', borderColor: '#1FB8CD', borderWidth: 1 },
                    { label: 'Expenses', data: expenseData, backgroundColor: '#B4413C', borderColor: '#B4413C', borderWidth: 1 }
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
        this.hideModal('transactionModal');
        this.clearForm('transactionForm');
        this.showNotification('Transaction added successfully!', 'success');
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
            color: '#4ecdc4'
        });
        
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
        this.hideModal('investmentModal');
        this.clearForm('investmentForm');
        this.showNotification('Investment added successfully!', 'success');
        if (document.getElementById('investments').classList.contains('active')) this.renderInvestments();
    }
    
    deleteBudget(name) {
        if (confirm('Are you sure you want to delete this budget?')) {
            this.data.budgets = this.data.budgets.filter(b => b.name !== name);
            this.showNotification('Budget deleted!', 'success');
            this.renderBudgets();
        }
    }
    
    deleteSubscription(id) {
        if (confirm('Are you sure you want to delete this subscription?')) {
            this.data.subscriptions = this.data.subscriptions.filter(s => String(s.id) !== String(id));
            this.showNotification('Subscription deleted!', 'success');
            this.renderSubscriptions();
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
                            text: `You are a financial advisor AI assistant for MoneyMentor app. User asks: "${message}". Provide helpful, concise financial advice. Keep responses under 150 words.`
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
            console.error('Gemini API Error:', error);
            return this.getAIResponse(message);
        }
    }
    
    getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('budget')) {
            return "Based on your spending patterns, I recommend using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Consider meal planning to reduce food costs!";
        } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
            return "Great question about savings! Start with an emergency fund covering 3-6 months of expenses. Your current savings rate looks good - keep it up!";
        } else if (lowerMessage.includes('invest')) {
            return "For investment advice, consider starting with index funds or ETFs for diversification. Dollar-cost averaging is a great strategy for beginners!";
        } else {
            return "I'm here to help with your financial questions! Ask me about budgeting, saving strategies, investment advice, or goal planning. What would you like to know?";
        }
    }
    
    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `<div class="message__avatar">👤</div><div class="message__content"><p>${message}</p></div>`;
        messagesContainer.appendChild(userMessage);
        input.value = '';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message typing-message';
        typingIndicator.innerHTML = `<div class="message__avatar">🤖</div><div class="message__content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        try {
            const aiResponse = await this.fetchGeminiAIResponse(message);
            typingIndicator.remove();
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `<div class="message__avatar">🤖</div><div class="message__content"><p>${aiResponse}</p></div>`;
            messagesContainer.appendChild(aiMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            typingIndicator.remove();
            this.showNotification('Error fetching AI response', 'error');
        }
    }
    
    exportTransactions() {
        const csv = this.convertToCSV(this.data.transactions, ['date', 'description', 'category', 'type', 'amount']);
        this.downloadCSV(csv, 'transactions.csv');
        this.showNotification('Transactions exported successfully!', 'success');
    }
    
    exportReport() {
        this.showNotification('Report export feature coming soon!', 'info');
    }
    
    convertToCSV(data, headers) {
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');
        return csvContent;
    }
    
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
    
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            if (formId === 'transactionForm') {
                const transactionDate = document.getElementById('transactionDate');
                if (transactionDate) transactionDate.valueAsDate = new Date();
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications');
        if (!notificationsContainer) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notificationsContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

document.addEventListener('DOMContentLoaded', () => {
    window.moneyMentorApp = new MoneyMentorApp();
    
    document.documentElement.style.scrollBehavior = 'smooth';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                window.moneyMentorApp.hideModal(modal.id);
            });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.moneyMentorApp.showModal('transactionModal');
        }
    });
    
    setTimeout(() => {
        if (window.moneyMentorApp) {
            window.moneyMentorApp.showNotification('Welcome to MoneyMentor! 🎉', 'success');
        }
    }, 2000);
});
