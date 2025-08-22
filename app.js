const appData = {
  student_dashboard: {
    total_balance: 15000,
    monthly_income: 8000,
    monthly_expenses: 6500,
    savings_goal_progress: 65,
    loan_balance: 50000,
    recent_transactions: [
      {"date": "2025-08-09", "category": "Food", "amount": -250, "description": "Restaurant dinner"},
      {"date": "2025-08-08", "category": "Income", "amount": 2000, "description": "Part-time job"},
      {"date": "2025-08-07", "category": "Transport", "amount": -100, "description": "Bus pass"},
      {"date": "2025-08-06", "category": "Books", "amount": -800, "description": "Textbooks"},
      {"date": "2025-08-05", "category": "Entertainment", "amount": -300, "description": "Movie tickets"}
    ]
  },
  professional_dashboard: {
    total_balance: 85000,
    monthly_income: 75000,
    monthly_expenses: 45000,
    savings_goal_progress: 82,
    investment_value: 150000,
    recent_transactions: [
      {"date": "2025-08-09", "category": "Salary", "amount": 75000, "description": "Monthly salary"},
      {"date": "2025-08-08", "category": "Investment", "amount": -10000, "description": "SIP mutual fund"},
      {"date": "2025-08-07", "category": "Utilities", "amount": -3500, "description": "Electricity bill"},
      {"date": "2025-08-06", "category": "Food", "amount": -1200, "description": "Groceries"},
      {"date": "2025-08-05", "category": "Transport", "amount": -800, "description": "Fuel"}
    ]
  },
  expense_categories: {
    student: {"Food": 2500, "Transport": 800, "Books": 1200, "Entertainment": 600, "Utilities": 400, "Others": 500},
    professional: {"Food": 8000, "Transport": 6000, "Utilities": 5000, "Entertainment": 4000, "Investment": 10000, "Insurance": 3000, "Others": 9000}
  },
  monthly_budget_data: [
    {"month": "Jan", "budget": 20000, "spent": 18500, "saved": 1500},
    {"month": "Feb", "budget": 20000, "spent": 19200, "saved": 800},
    {"month": "Mar", "budget": 20000, "spent": 17800, "saved": 2200},
    {"month": "Apr", "budget": 20000, "spent": 20500, "saved": -500},
    {"month": "May", "budget": 20000, "spent": 19000, "saved": 1000},
    {"month": "Jun", "budget": 20000, "spent": 18200, "saved": 1800},
    {"month": "Jul", "budget": 20000, "spent": 19800, "saved": 200},
    {"month": "Aug", "budget": 20000, "spent": 16500, "saved": 3500}
  ],
  gamification: {
    current_streak: 15,
    total_points: 2580,
    level: "Budget Master",
    achievements: ["First Savings Goal", "30-Day Streak", "Investment Explorer", "Bill Pay Pro"],
    badges: ["💰 Saver", "📊 Tracker", "🎯 Goal Setter", "💳 Smart Spender"]
  },
  ai_insights: [
    "You're spending 23% more on food this month. Consider meal planning to save ₹800.",
    "Your electricity bill is higher than usual. Check for energy-efficient appliances.",
    "Great job! You're on track to meet your savings goal 2 months early.",
    "Consider investing ₹5000 in SIP for better long-term returns."
  ]
};

let currentMode = 'student';
let currentSection = 'dashboard';

const modeToggle = document.getElementById('modeToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

const addTransactionModal = document.getElementById('addTransactionModal');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const closeTransactionModal = document.getElementById('closeTransactionModal');
const cancelTransaction = document.getElementById('cancelTransaction');
const saveTransaction = document.getElementById('saveTransaction');
const transactionForm = document.getElementById('transactionForm');

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    renderTransactions();
    renderInsights();
    renderBadges();
    renderBudgetCategories();
    renderGoals();
});

function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
    updateDashboard();
}

