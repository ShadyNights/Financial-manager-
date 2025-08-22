class FinanceHubApp {
    constructor() {
        this.version = '2.0.0';
        this.currentUser = {
            role: 'student',
            theme: 'light',
            id: this.generateUserId(),
            preferences: {
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY',
                notifications: true,
                darkMode: false
            }
        };
        
        this.data = {
            transactions: [],
            budgets: [],
            goals: [],
            subscriptions: [],
            investments: [],
            loans: [],
            bills: [],
            splitExpenses: [],
            achievements: [],
            insights: [],
            categories: {
                income: ['Salary', 'Freelance', 'Business', 'Investment Returns', 'Gifts', 'Other Income'],
                expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Rent', 'Insurance', 'Other']
            }
        };
        
        this.charts = {};
        this.services = {};
        this.components = {};
        
        this.init();
    }

    async init() {
        try {
            this.showLoadingScreen();
            
            this.initializeServices();
            
            await this.loadData();
            
            this.setupEventListeners();
            this.setupTheme();
            this.setupAccessibility();
            this.setupPWA();
            
            this.initializeComponents();
            
            if (this.data.transactions.length === 0) {
                this.loadSampleData();
            }
            
            this.renderDashboard();
            this.showTab('dashboard');
            
            this.setupPeriodicTasks();
            
            this.hideLoadingScreen();
            
            setTimeout(() => {
                this.showNotification('Welcome to FinanceHub! 🎉 Your smart financial companion is ready.', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.hideLoadingScreen();
            this.showNotification('Failed to load application. Please refresh the page.', 'error');
        }
    }

    initializeServices() {
        this.services = {
            storage: new StorageService(),
            api: new APIService(),
            analytics: new AnalyticsService(),
            ai: new AIService(),
            sync: new SyncService(),
            export: new ExportService(),
            validation: new ValidationService(),
            notifications: new NotificationService()
        };
    }

    initializeComponents() {
        this.components = {
            dashboard: new DashboardComponent(this),
            transactions: new TransactionComponent(this),
            budget: new BudgetComponent(this),
            investments: new InvestmentComponent(this),
            loans: new LoanComponent(this),
            bills: new BillComponent(this),
            reports: new ReportComponent(this),
            aiChat: new AIChatComponent(this)
        };
    }

    async loadData() {
        try {
            const savedData = await this.services.storage.load('financehub-data');
            if (savedData) {
                this.data = { ...this.data, ...savedData };
            }
            
            const preferences = await this.services.storage.load('user-preferences');
            if (preferences) {
                this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async saveData() {
        try {
            await this.services.storage.save('financehub-data', this.data);
            await this.services.storage.save('user-preferences', this.currentUser.preferences);
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Failed to save data', 'error');
        }
    }

    loadSampleData() {
        const sampleData = {
            transactions: [
                {
                    id: this.generateId(),
                    amount: 25000,
                    category: 'Salary',
                    date: this.formatDate(new Date()),
                    type: 'income',
                    description: 'Monthly internship salary',
                    paymentMethod: 'bank-transfer',
                    tags: ['monthly', 'salary', 'internship']
                },
                {
                    id: this.generateId(),
                    amount: 350,
                    category: 'Food',
                    date: this.formatDate(new Date(Date.now() - 86400000)),
                    type: 'expense',
                    description: 'Lunch with friends',
                    paymentMethod: 'upi',
                    tags: ['food', 'social', 'lunch']
                },
                {
                    id: this.generateId(),
                    amount: 1200,
                    category: 'Transport',
                    date: this.formatDate(new Date(Date.now() - 172800000)),
                    type: 'expense',
                    description: 'Metro card recharge',
                    paymentMethod: 'debit-card',
                    tags: ['transport', 'monthly', 'metro']
                }
            ],
            budgets: [
                {
                    id: this.generateId(),
                    name: 'Food & Dining',
                    limit: 8000,
                    spent: 3250,
                    period: 'monthly',
                    color: '#FF6B6B',
                    alerts: { 50: false, 75: false, 90: false, 100: false }
                },
                {
                    id: this.generateId(),
                    name: 'Transportation',
                    limit: 3000,
                    spent: 1200,
                    period: 'monthly',
                    color: '#4ECDC4',
                    alerts: { 50: false, 75: false, 90: false, 100: false }
                }
            ],
            goals: [
                {
                    id: this.generateId(),
                    name: 'Emergency Fund',
                    target: 50000,
                    current: 15000,
                    deadline: '2025-12-31',
                    priority: 'high',
                    category: 'savings'
                },
                {
                    id: this.generateId(),
                    name: 'New Laptop',
                    target: 80000,
                    current: 25000,
                    deadline: '2025-10-15',
                    priority: 'medium',
                    category: 'purchase'
                }
            ],
            subscriptions: [
                {
                    id: this.generateId(),
                    name: 'Netflix',
                    cost: 899,
                    renewalDate: '2025-09-22',
                    category: 'Entertainment',
                    status: 'active',
                    billingCycle: 'monthly'
                },
                {
                    id: this.generateId(),
                    name: 'Spotify Premium',
                    cost: 119,
                    renewalDate: '2025-09-05',
                    category: 'Music',
                    status: 'active',
                    billingCycle: 'monthly'
                }
            ],
            investments: [
                {
                    id: this.generateId(),
                    symbol: 'RELIANCE',
                    name: 'Reliance Industries',
                    shares: 10,
                    buyPrice: 2450,
                    currentPrice: 2680,
                    type: 'stocks',
                    exchange: 'NSE'
                },
                {
                    id: this.generateId(),
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    shares: 0.05,
                    buyPrice: 4200000,
                    currentPrice: 4350000,
                    type: 'crypto',
                    exchange: 'Binance'
                }
            ],
            loans: [
                {
                    id: this.generateId(),
                    type: 'Student Loan',
                    principal: 500000,
                    currentBalance: 425000,
                    interestRate: 8.5,
                    emi: 6500,
                    tenure: 84,
                    remainingMonths: 62,
                    nextPayment: '2025-09-01',
                    lender: 'SBI Education Loan'
                }
            ],
            bills: [
                {
                    id: this.generateId(),
                    name: 'Electricity Bill',
                    amount: 2500,
                    dueDate: '2025-09-05',
                    category: 'Utilities',
                    recurring: true,
                    frequency: 'monthly',
                    status: 'pending'
                }
            ],
            achievements: [
                {
                    id: this.generateId(),
                    name: 'First Transaction',
                    description: 'Added your first transaction',
                    unlocked: true,
                    unlockedDate: new Date().toISOString(),
                    icon: '🎯',
                    points: 10
                },
                {
                    id: this.generateId(),
                    name: 'Budget Creator',
                    description: 'Created your first budget',
                    unlocked: false,
                    icon: '💰',
                    points: 25
                },
                {
                    id: this.generateId(),
                    name: 'Savings Starter',
                    description: 'Set your first savings goal',
                    unlocked: false,
                    icon: '🎯',
                    points: 20
                },
                {
                    id: this.generateId(),
                    name: 'Investment Beginner',
                    description: 'Made your first investment',
                    unlocked: false,
                    icon: '📈',
                    points: 50
                },
                {
                    id: this.generateId(),
                    name: 'Expense Tracker',
                    description: 'Tracked expenses for 7 days',
                    unlocked: false,
                    icon: '📊',
                    points: 30
                },
                {
                    id: this.generateId(),
                    name: 'Budget Master',
                    description: 'Stayed within budget for a month',
                    unlocked: false,
                    icon: '🏆',
                    points: 100
                }
            ]
        };
        
        this.data = { ...this.data, ...sampleData };
        this.saveData();
        this.generateAIInsights();
    }

    setupEventListeners() {
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        document.getElementById('studentRole')?.addEventListener('click', () => this.switchRole('student'));
        document.getElementById('professionalRole')?.addEventListener('click', () => this.switchRole('professional'));
        
        document.querySelectorAll('.nav__item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
                
                document.querySelectorAll('.nav__item').forEach(nav => nav.setAttribute('aria-pressed', 'false'));
                e.currentTarget.setAttribute('aria-pressed', 'true');
            });
        });

        this.setupModalHandlers();
        
        this.setupFormHandlers();
        
        this.setupAIChatHandlers();
        
        this.setupDataHandlers();
        
        this.setupKeyboardShortcuts();
        
        this.setupPWAEvents();
        
        this.setupNetworkHandlers();
        
        setInterval(() => this.saveData(), 30000);
    }

    setupModalHandlers() {
        document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
            this.openModal('transactionModal', 'Add Transaction');
        });

        document.getElementById('addGoalBtn')?.addEventListener('click', () => {
            this.openModal('goalModal', 'Add Savings Goal');
        });

        document.getElementById('addInvestmentBtn')?.addEventListener('click', () => {
            this.openModal('investmentModal', 'Add Investment');
        });

        document.querySelectorAll('.modal__close, .modal__overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element) {
                    const modal = e.target.closest('.modal');
                    this.closeModal(modal.id);
                }
            });
        });

        document.getElementById('cancelTransaction')?.addEventListener('click', () => this.closeModal('transactionModal'));
        document.getElementById('cancelGoal')?.addEventListener('click', () => this.closeModal('goalModal'));
        document.getElementById('cancelInvestment')?.addEventListener('click', () => this.closeModal('investmentModal'));
    }

    setupFormHandlers() {
        document.getElementById('transactionForm')?.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        
        document.getElementById('goalForm')?.addEventListener('submit', (e) => this.handleGoalSubmit(e));
        
        document.getElementById('investmentForm')?.addEventListener('submit', (e) => this.handleInvestmentSubmit(e));

        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });

        document.getElementById('transactionType')?.addEventListener('change', (e) => {
            this.populateCategories(e.target.value);
        });
    }

    setupAIChatHandlers() {
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendChatMessage());
        
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                document.getElementById('chatInput').value = suggestion;
                this.sendChatMessage();
            });
        });

        document.getElementById('voiceInputBtn')?.addEventListener('click', () => this.toggleVoiceInput());

        document.getElementById('clearChat')?.addEventListener('click', () => this.clearChat());
    }

    setupDataHandlers() {
        document.getElementById('exportTransactions')?.addEventListener('click', () => this.exportData('transactions', 'csv'));
        
        document.getElementById('exportPDF')?.addEventListener('click', () => this.exportReport('pdf'));
        
        document.getElementById('exportExcel')?.addEventListener('click', () => this.exportReport('excel'));
        
        document.getElementById('importTransactions')?.addEventListener('click', () => this.importData('transactions'));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    this.closeModal(modal.id);
                });
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openModal('transactionModal', 'Add Transaction');
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportData('transactions', 'csv');
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.showTab('dashboard');
            }
        });
    }

    setupPWAEvents() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.pwaInstallPrompt = e;
            this.showPWAInstallPrompt();
        });

        document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
            if (this.pwaInstallPrompt) {
                this.pwaInstallPrompt.prompt();
                const { outcome } = await this.pwaInstallPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showNotification('FinanceHub installed successfully!', 'success');
                }
                
                this.pwaInstallPrompt = null;
                this.hidePWAInstallPrompt();
            }
        });

        document.getElementById('pwaCloseBtn')?.addEventListener('click', () => {
            this.hidePWAInstallPrompt();
        });
    }

    setupNetworkHandlers() {
        window.addEventListener('online', () => {
            document.getElementById('offlineIndicator')?.classList.add('hidden');
            this.showNotification('Connection restored', 'success');
            this.syncDataWhenOnline();
        });

        window.addEventListener('offline', () => {
            document.getElementById('offlineIndicator')?.classList.remove('hidden');
            this.showNotification('You are offline. Data will sync when connection is restored.', 'info');
        });
    }

    setupPeriodicTasks() {
        setInterval(() => this.checkDueBills(), 3600000);
        
        setInterval(() => this.generateDailyInsights(), 86400000);
        
        setInterval(() => this.syncInvestmentPrices(), 300000);
        
        setInterval(() => this.checkAchievements(), 600000);
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('financehub-theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        this.currentUser.theme = savedTheme;
        this.applyTheme(savedTheme);
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('financehub-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.currentUser.theme = newTheme;
                this.applyTheme(newTheme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        const themeIcon = document.querySelector('#themeToggle i');
        const themeButton = document.getElementById('themeToggle');
        
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        if (themeButton) {
            themeButton.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1F2121' : '#1FB8CD');
        }
    }

    toggleTheme() {
        const newTheme = this.currentUser.theme === 'light' ? 'dark' : 'light';
        this.currentUser.theme = newTheme;
        this.applyTheme(newTheme);
        localStorage.setItem('financehub-theme', newTheme);
        this.showNotification(`Switched to ${newTheme} mode`, 'success');
    }

    setupAccessibility() {
        this.announcePageChange = (pageName) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Navigated to ${pageName}`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
        };

        this.trapFocus = (element) => {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            });

            firstFocusable?.focus();
        };

        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.classList.add('high-contrast');
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduced-motion');
        }
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('SW registered: ', registration);
                } catch (registrationError) {
                    console.log('SW registration failed: ', registrationError);
                }
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id.replace(/([A-Z])/g, ' $1').toLowerCase();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${fieldName} is required`;
        }

        switch (field.type) {
            case 'number':
                if (value && isNaN(value)) {
                    isValid = false;
                    errorMessage = `${fieldName} must be a valid number`;
                } else if (value && parseFloat(value) < 0) {
                    isValid = false;
                    errorMessage = `${fieldName} must be positive`;
                }
                break;
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            
            case 'date':
                if (value) {
                    const date = new Date(value);
                    const today = new Date();
                    if (field.id === 'transactionDate' && date > today) {
                        isValid = false;
                        errorMessage = 'Transaction date cannot be in the future';
                    }
                }
                break;
        }

        if (field.hasAttribute('maxlength')) {
            const maxLength = parseInt(field.getAttribute('maxlength'));
            if (value.length > maxLength) {
                isValid = false;
                errorMessage = `${fieldName} must be ${maxLength} characters or less`;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(field.id.replace(/([A-Z])/g, '$1').toLowerCase() + 'Error') || 
                           field.parentNode.querySelector('.form-error');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('aria-live', 'polite');
        }
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorElement = document.getElementById(field.id.replace(/([A-Z])/g, '$1').toLowerCase() + 'Error') || 
                           field.parentNode.querySelector('.form-error');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.removeAttribute('aria-live');
        }
    }

    async handleTransactionSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        try {
            const fields = form.querySelectorAll('.form-control[required]');
            let isFormValid = true;
            
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                throw new Error('Please fix the errors above');
            }

            const transaction = {
                id: this.generateId(),
                amount: parseFloat(document.getElementById('transactionAmount').value),
                type: document.getElementById('transactionType').value,
                category: document.getElementById('transactionCategory').value,
                description: document.getElementById('transactionDescription').value,
                date: document.getElementById('transactionDate').value,
                paymentMethod: document.getElementById('transactionPaymentMethod').value,
                tags: document.getElementById('transactionTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.data.transactions.push(transaction);
            
            if (transaction.type === 'expense') {
                this.updateBudgetSpending(transaction.category, transaction.amount);
            }

            await this.saveData();
            
            this.closeModal('transactionModal');
            this.resetForm('transactionForm');
            
            this.showNotification('Transaction added successfully!', 'success');
            
            this.refreshActiveTab();
            
            this.checkAchievements();
            
            this.generateAIInsights();

        } catch (error) {
            console.error('Error adding transaction:', error);
            this.showNotification(error.message || 'Failed to add transaction', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';

        const typingMessage = this.addTypingIndicator();

        try {
            const response = await this.services.ai.generateResponse(message, {
                userData: this.getUserDataSummary(),
                context: this.getChatContext()
            });

            typingMessage.remove();

            this.addChatMessage(response, 'ai');

        } catch (error) {
            typingMessage.remove();
            this.addChatMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'ai');
        }
    }

    addChatMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message fade-in`;
        
        messageDiv.innerHTML = `
            <div class="message__avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message__content">
                <div class="message__text">${this.formatMessageText(text)}</div>
                <div class="message__time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageDiv;
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-message';
        
        typingDiv.innerHTML = `
            <div class="message__avatar">🤖</div>
            <div class="message__content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingDiv;
    }

    formatMessageText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/``````/gs, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    async generateAIInsights() {
        try {
            const insights = await this.services.ai.generateInsights({
                transactions: this.data.transactions.slice(-30),
                budgets: this.data.budgets,
                goals: this.data.goals,
                userProfile: this.currentUser
            });

            this.data.insights = insights;
            this.renderInsights();
            
        } catch (error) {
            console.error('Error generating insights:', error);
        }
    }

    renderInsights() {
        const container = document.getElementById('aiInsights');
        if (!container) return;

        container.innerHTML = '';
        
        this.data.insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'insight-item fade-in-stagger';
            insightElement.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                    ${insight.action ? `<button class="btn btn--sm btn--primary" onclick="app.executeInsightAction('${insight.actionType}', '${insight.actionData}')">${insight.action}</button>` : ''}
                </div>
                <div class="insight-priority priority-${insight.priority}">${insight.priority}</div>
            `;
            container.appendChild(insightElement);
        });
    }

    executeInsightAction(actionType, actionData) {
        switch (actionType) {
            case 'create-budget':
                this.openModal('budgetModal', 'Create Budget');
                break;
            case 'set-goal':
                this.openModal('goalModal', 'Set Savings Goal');
                break;
            case 'review-subscriptions':
                this.showTab('subscriptions');
                break;
            case 'investment-advice':
                this.showTab('investments');
                break;
            default:
                console.log('Unknown action type:', actionType);
        }
    }

    checkAchievements() {
        let newAchievements = [];

        this.data.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                let shouldUnlock = false;

                switch (achievement.name) {
                    case 'First Transaction':
                        shouldUnlock = this.data.transactions.length > 0;
                        break;
                    case 'Budget Creator':
                        shouldUnlock = this.data.budgets.length > 0;
                        break;
                    case 'Savings Starter':
                        shouldUnlock = this.data.goals.length > 0;
                        break;
                    case 'Investment Beginner':
                        shouldUnlock = this.data.investments.length > 0;
                        break;
                    case 'Expense Tracker':
                        const recentTransactions = this.data.transactions.filter(t => {
                            const daysDiff = (new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24);
                            return daysDiff <= 7;
                        });
                        shouldUnlock = recentTransactions.length >= 5;
                        break;
                    case 'Budget Master':
                        const thisMonth = new Date().getMonth();
                        const thisYear = new Date().getFullYear();
                        shouldUnlock = this.data.budgets.some(budget => {
                            const spent = this.calculateMonthlySpending(budget.name, thisMonth, thisYear);
                            return spent <= budget.limit;
                        });
                        break;
                }

                if (shouldUnlock) {
                    achievement.unlocked = true;
                    achievement.unlockedDate = new Date().toISOString();
                    newAchievements.push(achievement);
                }
            }
        });

        if (newAchievements.length > 0) {
            this.showAchievementNotifications(newAchievements);
            this.renderAchievements();
            this.saveData();
        }
    }

    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showNotification(
                    `🎉 Achievement Unlocked: ${achievement.name}! +${achievement.points} points`,
                    'success',
                    5000
                );
            }, index * 1000);
        });
    }

    async exportData(dataType, format) {
        try {
            let data, filename;
            
            switch (dataType) {
                case 'transactions':
                    data = this.data.transactions;
                    filename = `transactions_${this.formatDate(new Date())}.${format}`;
                    break;
                case 'all':
                    data = this.data;
                    filename = `financehub_backup_${this.formatDate(new Date())}.json`;
                    format = 'json';
                    break;
                default:
                    throw new Error('Invalid data type');
            }

            const exportedData = await this.services.export.export(data, format);
            this.downloadFile(exportedData, filename, format);
            
            this.showNotification(`${dataType} exported successfully!`, 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    async importData(dataType) {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv,.json,.xlsx';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const importedData = await this.services.export.import(file);
                
                switch (dataType) {
                    case 'transactions':
                        this.data.transactions.push(...importedData);
                        break;
                    case 'all':
                        this.data = { ...this.data, ...importedData };
                        break;
                }

                await this.saveData();
                this.refreshActiveTab();
                this.showNotification(`${dataType} imported successfully!`, 'success');
            };

            fileInput.click();
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Failed to import data', 'error');
        }
    }

    async exportReport(format) {
        try {
            const reportData = {
                summary: this.calculateFinancialSummary(),
                transactions: this.data.transactions,
                budgets: this.data.budgets,
                goals: this.data.goals,
                investments: this.data.investments,
                period: document.getElementById('reportPeriod')?.value || 'monthly',
                generatedAt: new Date().toISOString()
            };

            if (format === 'pdf') {
                await this.services.export.generatePDFReport(reportData);
            } else {
                await this.services.export.generateExcelReport(reportData);
            }

            this.showNotification('Report exported successfully!', 'success');
            
        } catch (error) {
            console.error('Report export error:', error);
            this.showNotification('Failed to export report', 'error');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateUserId() {
        const stored = localStorage.getItem('financehub-user-id');
        if (stored) return stored;
        
        const userId = this.generateId();
        localStorage.setItem('financehub-user-id', userId);
        return userId;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen')?.classList.remove('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.opacity = '1';
            }, 300);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}" aria-hidden="true"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        const container = document.getElementById('notifications');
        container.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.classList.add('active');
            
            document.querySelectorAll('.nav__item').forEach(nav => {
                nav.classList.remove('active');
                nav.setAttribute('aria-pressed', 'false');
            });
            
            const activeNav = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeNav) {
                activeNav.classList.add('active');
                activeNav.setAttribute('aria-pressed', 'true');
            }

            this.renderTabContent(tabName);
            
            this.announcePageChange(tabName);
        }
    }

    renderTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'budget':
                this.renderBudgets();
                break;
            case 'loans':
                this.renderLoans();
                break;
            case 'investments':
                this.renderInvestments();
                break;
            case 'subscriptions':
                this.renderSubscriptions();
                break;
            case 'bills':
                this.renderBills();
                break;
            case 'split-expenses':
                this.renderSplitExpenses();
                break;
            case 'reports':
                this.renderReports();
                break;
        }
    }

    refreshActiveTab() {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            this.renderTabContent(activeTab.id);
        }
    }

    openModal(modalId, title) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            if (title) {
                const titleElement = modal.querySelector('.modal__header h3');
                if (titleElement) titleElement.textContent = title;
            }
            
            if (modalId === 'transactionModal') {
                document.getElementById('transactionDate').valueAsDate = new Date();
                this.populateCategories('expense');
            }
            
            this.trapFocus(modal);
            
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            const form = modal.querySelector('form');
            if (form) {
                this.resetForm(form.id);
            }
        }
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            form.querySelectorAll('.form-control').forEach(field => {
                this.clearFieldError(field);
            });
        }
    }

    populateCategories(type) {
        const categorySelect = document.getElementById('transactionCategory');
        if (!categorySelect) return;

        const categories = type === 'income' ? this.data.categories.income : this.data.categories.expense;
        
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

class StorageService {
    async save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            
            if ('indexedDB' in window) {
                await this.saveToIndexedDB(key, data);
            }
        } catch (error) {
            console.error('Storage save error:', error);
            throw error;
        }
    }

    async load(key) {
        try {
            const localData = localStorage.getItem(key);
            if (localData) {
                return JSON.parse(localData);
            }
            
            if ('indexedDB' in window) {
                return await this.loadFromIndexedDB(key);
            }
            
            return null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    async saveToIndexedDB(key, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FinanceHubDB', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                
                store.put({ key, data, timestamp: Date.now() });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'key' });
                }
            };
        });
    }

    async loadFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FinanceHubDB', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readonly');
                const store = transaction.objectStore('data');
                const getRequest = store.get(key);
                
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? result.data : null);
                };
                
                getRequest.onerror = () => reject(getRequest.error);
            };
        });
    }
}

class APIService {
    constructor() {
        this.baseUrl = 'https://api.financehub.com';
        this.timeout = 10000;
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async getStockPrice(symbol) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    symbol,
                    price: Math.random() * 1000 + 100,
                    change: (Math.random() - 0.5) * 20,
                    timestamp: Date.now()
                });
            }, 1000);
        });
    }

    async getCryptoPrice(symbol) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    symbol,
                    price: Math.random() * 100000 + 10000,
                    change: (Math.random() - 0.5) * 5000,
                    timestamp: Date.now()
                });
            }, 1000);
        });
    }
}

class AIService {
    constructor() {
        this.apiKey = 'your-ai-api-key';
        this.model = 'gpt-3.5-turbo';
    }

    async generateResponse(message, context = {}) {
        const responses = [
            "Based on your spending patterns, I recommend reducing dining out expenses by 20% to improve your savings rate.",
            "Your investment portfolio is well-diversified. Consider adding some bonds for stability.",
            "You're doing great with your budget! Try to automate your savings to build the habit.",
            "I notice you have high transportation costs. Have you considered carpooling or public transport?",
            "Your emergency fund is growing nicely. Once it reaches 6 months of expenses, consider investing the excess.",
            "Consider using cashback credit cards for categories you spend the most in, like groceries and gas."
        ];

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(responses[Math.floor(Math.random() * responses.length)]);
            }, 2000);
        });
    }

    async generateInsights(data) {
        const insights = [
            {
                id: 'spending-pattern',
                title: 'Spending Pattern Alert',
                description: 'Your food expenses have increased by 25% this month compared to last month.',
                icon: '🍽️',
                priority: 'medium',
                actionType: 'review-budget',
                action: 'Review Budget'
            },
            {
                id: 'savings-opportunity',
                title: 'Savings Opportunity',
                description: 'You could save ₹2,500 monthly by canceling unused subscriptions.',
                icon: '💰',
                priority: 'high',
                actionType: 'review-subscriptions',
                action: 'Review Subscriptions'
            },
            {
                id: 'investment-suggestion',
                title: 'Investment Suggestion',
                description: 'Consider investing your excess cash in index funds for better returns.',
                icon: '📈',
                priority: 'low',
                actionType: 'investment-advice',
                action: 'Learn More'
            }
        ];

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(insights);
            }, 1500);
        });
    }
}

class ExportService {
    async export(data, format) {
        switch (format) {
            case 'csv':
                return this.exportToCSV(data);
            case 'json':
                return this.exportToJSON(data);
            case 'xlsx':
                return this.exportToExcel(data);
            default:
                throw new Error('Unsupported format');
        }
    }

    exportToCSV(data) {
        if (!Array.isArray(data)) {
            throw new Error('CSV export requires array data');
        }

        if (data.length === 0) {
            return 'No data to export';
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    async exportToExcel(data) {
        return this.exportToCSV(data);
    }

    async import(file) {
        const text = await file.text();
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'csv':
                return this.parseCSV(text);
            case 'json':
                return JSON.parse(text);
            default:
                throw new Error('Unsupported file format');
        }
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            
            return obj;
        });
    }

    async generatePDFReport(data) {
        console.log('Generating PDF report...', data);
        return 'PDF report generated';
    }

    async generateExcelReport(data) {
        console.log('Generating Excel report...', data);
        return 'Excel report generated';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceHubApp();
});

