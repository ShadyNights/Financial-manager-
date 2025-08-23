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
            streak: { savingsDays: 5, budgetDays: 7 }
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
                { amount: 1250, category: "Salary", date: "2025-08-20", type: "income", description: "Part-time internship" },
                { amount: 45, category: "Food", date: "2025-08-20", type: "expense", description: "Lunch at cafeteria" },
                { amount: 899, category: "Subscription", date: "2025-08-19", type: "expense", description: "Netflix Premium" }
            ],
            budgetCategories: [
                { name: "Food", limit: 200, spent: 145, color: "#ff6b6b" },
                { name: "Transport", limit: 100, spent: 67, color: "#4ecdc4" },
                { name: "Entertainment", limit: 150, spent: 89, color: "#45b7d1" },
                { name: "Shopping", limit: 300, spent: 234, color: "#96ceb4" }
            ],
            subscriptions: [
                { name: "Netflix", cost: 899, renewalDate: "2025-09-20", category: "Entertainment" },
                { name: "Spotify", cost: 119, renewalDate: "2025-08-28", category: "Music" },
                { name: "Amazon Prime", cost: 329, renewalDate: "2025-09-15", category: "Shopping" },
                { name: "Adobe Creative", cost: 1699, renewalDate: "2025-09-05", category: "Software" }
            ]
        };
        this.data.transactions = sampleData.sampleTransactions.map(t => ({ ...t, id: Date.now() + Math.random() }));
        this.data.budgets = sampleData.budgetCategories.map(b => ({ ...b }));
        this.data.subscriptions = sampleData.subscriptions.map(s => ({ ...s, id: Date.now() + Math.random() }));
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
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => this.handleSubscriptionSubmit(e));
        document.getElementById('budgetForm').addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        document.getElementById('cancelSubscription').addEventListener('click', () => this.hideModal('subscriptionModal'));
        document.getElementById('cancelBudget').addEventListener('click', () => this.hideModal('budgetModal'));
    }
    setupModalHandlers() {
        document.getElementById('subscriptions').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-subscription')) {
                const id = e.target.dataset.id;
                this.deleteSubscription(id);
            }
        });
        document.getElementById('addSubscriptionBtn')?.addEventListener('click', () => {
            this.showModal('subscriptionModal');
        });
        document.getElementById('addBudgetBtn')?.addEventListener('click', () => {
            this.showModal('budgetModal');
        });
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
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'budget':
                this.renderBudgets();
                break;
            case 'subscriptions':
                this.renderSubscriptions();
                break;
        }
    }
    renderDashboard() {
        const dash = document.getElementById('dashboard');
        dash.innerHTML = `
            <div class="dashboard__row">
                <div class="streak-card">
                    <div class="streak-count">Streak: <span>${this.data.streak.savingsDays}🔥 savings, ${this.data.streak.budgetDays}🔥 budget</span></div>
                </div>
            </div>
        `;
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
                    <span class="subscription-renewal">
                        Renews in ${daysUntilRenewal} days
                    </span>
                </div>
            `;
            grid.appendChild(subscriptionElement);
        });
    }
    handleSubscriptionSubmit(e) {
        e.preventDefault();
        const subscription = {
            id: Date.now() + Math.random(),
            name: document.getElementById('subscriptionName').value,
            cost: parseInt(document.getElementById('subscriptionCost').value),
            renewalDate: document.getElementById('subscriptionRenewalDate').value,
            category: document.getElementById('subscriptionCategory').value
        };
        this.data.subscriptions.push(subscription);
        this.hideModal('subscriptionModal');
        this.clearForm('subscriptionForm');
        this.showNotification('Subscription added successfully!', 'success');
        this.renderSubscriptions();
    }
    deleteSubscription(id) {
        this.data.subscriptions = this.data.subscriptions.filter(s => String(s.id) !== String(id));
        this.showNotification('Subscription deleted!', 'success');
        this.renderSubscriptions();
    }
    handleBudgetSubmit(e) {
        e.preventDefault();
        const budget = {
            name: document.getElementById('budgetName').value,
            limit: parseInt(document.getElementById('budgetLimit').value),
            spent: 0,
            color: "#4ecdc4"
        };
        this.data.budgets.push(budget);
        this.hideModal('budgetModal');
        this.clearForm('budgetForm');
        this.showNotification('Budget added successfully!', 'success');
        this.renderBudgets();
    }
    deleteBudget(name) {
        this.data.budgets = this.data.budgets.filter(b => b.name !== name);
        this.showNotification('Budget deleted!', 'success');
        this.renderBudgets();
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
    }
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.getElementById('notifications').appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.moneyMentorApp = new MoneyMentorApp();
});
