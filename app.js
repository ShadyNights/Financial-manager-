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
                { id: "1", amount: 1250, category: "Salary", date: "2025-08-20", type: "income", description: "Part-time internship" },
                { id: "2", amount: 45, category: "Food", date: "2025-08-20", type: "expense", description: "Lunch at cafeteria" },
                { id: "3", amount: 899, category: "Subscription", date: "2025-08-19", type: "expense", description: "Netflix Premium" }
            ],
            budgetCategories: [
                { name: "Food", limit: 200, spent: 145, color: "#ff6b6b" },
                { name: "Transport", limit: 100, spent: 67, color: "#4ecdc4" },
                { name: "Entertainment", limit: 150, spent: 89, color: "#45b7d1" },
                { name: "Shopping", limit: 300, spent: 234, color: "#96ceb4" }
            ],
            savingsGoals: [
                { name: "Emergency Fund", target: 5000, current: 1200, deadline: "2025-12-31" },
                { name: "Laptop", target: 80000, current: 32000, deadline: "2025-10-15" },
                { name: "Vacation", target: 25000, current: 8500, deadline: "2025-09-30" }
            ],
            subscriptions: [
                { name: "Netflix", cost: 899, renewalDate: "2025-09-20", category: "Entertainment" },
                { name: "Spotify", cost: 119, renewalDate: "2025-08-28", category: "Music" },
                { name: "Amazon Prime", cost: 329, renewalDate: "2025-09-15", category: "Shopping" },
                { name: "Adobe Creative", cost: 1699, renewalDate: "2025-09-05", category: "Software" }
            ],
            investments: [
                { symbol: "AAPL", name: "Apple Inc", shares: 2, buyPrice: 150, currentPrice: 175 },
                { symbol: "GOOGL", name: "Alphabet", shares: 1, buyPrice: 2800, currentPrice: 2950 },
                { symbol: "BTC", name: "Bitcoin", shares: 0.1, buyPrice: 50000, currentPrice: 52000 }
            ],
            achievements: [
                { name: "First Budget", description: "Created your first budget", unlocked: true, icon: "🎯" },
                { name: "Savings Streak", description: "Saved money for 7 days straight", unlocked: true, icon: "🔥" },
                { name: "Investment Starter", description: "Made your first investment", unlocked: false, icon: "📈" },
                { name: "Debt Reducer", description: "Paid off 25% of debt", unlocked: false, icon: "💪" }
            ]
        };
        
        this.data.transactions = sampleData.sampleTransactions.map(t => ({ ...t, id: Date.now() + Math.random() }));
        this.data.budgets = sampleData.budgetCategories.map(b => ({ ...b }));
        this.data.goals = sampleData.savingsGoals.map(g => ({ ...g, id: Date.now() + Math.random() }));
        this.data.subscriptions = sampleData.subscriptions.map(s => ({ ...s, id: Date.now() + Math.random() }));
        this.data.investments = sampleData.investments.map(i => ({ ...i, id: Date.now() + Math.random() }));
        this.data.achievements = sampleData.achievements;
        this.data.streak = { savingsDays: 5, budgetDays: 7 };
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
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('goalForm').addEventListener('submit', (e) => this.handleGoalSubmit(e));
        document.getElementById('investmentForm').addEventListener('submit', (e) => this.handleInvestmentSubmit(e));
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => this.handleSubscriptionSubmit(e));
        document.getElementById('budgetForm').addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        document.getElementById('exportTransactions').addEventListener('click', () => this.exportTransactions());
        document.getElementById('exportReport').addEventListener('click', () => this.exportReport());
        document.getElementById('transactionDate').valueAsDate = new Date();
    }
    
    setupModalHandlers() {
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.showModal('transactionModal'));
        document.getElementById('addGoalBtn').addEventListener('click', () => this.showModal('goalModal'));
        document.getElementById('addInvestmentBtn').addEventListener('click', () => this.showModal('investmentModal'));
        document.getElementById('addSubscriptionBtn').addEventListener('click', () => this.showModal('subscriptionModal'));
        document.getElementById('addBudgetBtn').addEventListener('click', () => this.showModal('budgetModal'));
        
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
        
        document.getElementById('cancelTransaction').addEventListener('click', () => this.hideModal('transactionModal'));
        document.getElementById('cancelGoal').addEventListener('click', () => this.hideModal('goalModal'));
        document.getElementById('cancelInvestment').addEventListener('click', () => this.hideModal('investmentModal'));
        document.getElementById('cancelSubscription').addEventListener('click', () => this.hideModal('subscriptionModal'));
        document.getElementById('cancelBudget').addEventListener('click', () => this.hideModal('budgetModal'));
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('moneymentor-theme') || 'light';
        this.currentUser.theme = savedTheme;
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggleTheme() {
        const newTheme = this.currentUser.theme === 'light' ? 'dark' : 'light';
        this.currentUser.theme = newTheme;
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('moneymentor-theme', newTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        this.showNotification('Theme switched to ' + newTheme + ' mode', 'success');
    }
    
    switchRole(role) {
        this.currentUser.role = role;
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(role + 'Role').classList.add('active');
        this.renderDashboard();
        this.showNotification(`Switched to ${role} dashboard`, 'success');
    }
    
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav__item').forEach(nav => nav.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
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
        
        document.getElementById('totalBalance').textContent = `₹${totalBalance.toLocaleString()}`;
        document.getElementById('monthlyIncome').textContent = `₹${totalIncome.toLocaleString()}`;
        document.getElementById('monthlyExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;
        document.getElementById('savingsRate').textContent = `${savingsRate}%`;
    }
    
    renderExpenseChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;
        if (this.charts.expenseChart) this.charts.expenseChart.destroy();
        
        const expensesByCategory = {};
        this.data.transactions.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount);
        });
        
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'];
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
            incomeData.push(Math.random() * 1000 + 500);
            expenseData.push(Math.random() * 800 + 200);
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
        document.getElementById('achievementScore').textContent = `${unlockedCount}/${this.data.achievements.length}`;
        
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
        const categories = [...new Set(this.data.transactions.map(t => t.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`);
        
        let filteredTransactions = [...this.data.transactions];
        const typeFilter = document.getElementById('typeFilter').value;
        const catFilter = document.getElementById('categoryFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        if (typeFilter !== 'all') filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        if (catFilter !== 'all') filteredTransactions = filteredTransactions.filter(t => t.category === catFilter);
        if (dateFilter) filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter);
        
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
            document.getElementById(id).addEventListener('change', () => this.renderTransactions());
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
        
        document.getElementById('addBudgetBtn').addEventListener('click', () => this.showModal('budgetModal'));
    }
    
    renderSubscriptions() {
        const container = document.getElementById('subscriptions');
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
        
        document.getElementById('addSubscriptionBtn').addEventListener('click', () => this.showModal('subscriptionModal'));
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
        document.getElementById('totalPortfolioValue').textContent = `₹${totalValue.toLocaleString()}`;
        document.getElementById('totalGains').textContent = `₹${totalGain.toLocaleString()}`;
        document.getElementById('totalGains').className = totalGain >= 0 ? 'positive' : 'negative';
        document.getElementById('returnPercent').textContent = `${returnPercent}%`;
        document.getElementById('returnPercent').className = totalGain >= 0 ? 'positive' : 'negative';
    }
    
    renderReports() {
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;
        if (this.charts.reportChart) this.charts.reportChart.destroy();
        
        const period = document.getElementById('reportPeriod').value;
        let labels = [];
        let incomeData = [];
        let expenseData = [];
        
        if (period === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                incomeData.push(Math.random() * 800 + 200);
                expenseData.push(Math.random() * 600 + 100);
            }
        } else {
            const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels = months;
            incomeData = [15000, 18000, 22000, 19000, 21000, 23000];
            expenseData = [12000, 14000, 16000, 15000, 17000, 18000];
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
        
        document.getElementById('reportPeriod').addEventListener('change', () => this.renderReports());
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
        const API_KEY = 'AIzaSyBzYE95khwWrlXNIHQsNGA9xZDZQFykrYU';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a financial advisor AI assistant. User asks: "${message}". Provide helpful financial advice based on their MoneyMentor app data.`
                        }]
                    }]
                })
            });
            
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.?.text || 'Sorry, I could not process your request.';
        } catch (error) {
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
            return "For investment advice, consider starting with index funds or ETFs for diversification. Dollar-cost averaging is a great strategy!";
        } else {
            return "I'm here to help with your financial questions! Ask me about budgeting, saving strategies, investment advice, or goal planning.";
        }
    }
    
    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        
        const messagesContainer = document.getElementById('chatMessages');
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
        document.getElementById(modalId).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    clearForm(formId) {
        document.getElementById(formId).reset();
        if (formId === 'transactionForm') {
            document.getElementById('transactionDate').valueAsDate = new Date();
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.getElementById('notifications').appendChild(notification);
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
