// ===== Expense Tracker Logic =====

// Load transactions from localStorage, or start with an empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Grab DOM elements
const form = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const list = document.getElementById('transaction-list');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const balanceEl = document.getElementById('balance');
const clearAllBtn = document.getElementById('clear-all');

// Save current transactions array to localStorage
function saveToStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Render the full list + summary based on the transactions array
function render() {
  list.innerHTML = '';

  transactions.forEach((t) => {
    const li = document.createElement('li');
    li.classList.add(t.amount < 0 ? 'expense' : 'income');

    const sign = t.amount < 0 ? '-' : '+';
    li.innerHTML = `
      <span>${t.text}</span>
      <span>
        ${sign}₹${Math.abs(t.amount)}
        <button class="delete-btn" data-id="${t.id}">✕</button>
      </span>
    `;
    list.appendChild(li);
  });


  updateSummary();
  generateInsights();
}

// Calculate and display income, expense, balance
function updateSummary() {
  const amounts = transactions.map((t) => t.amount);

  const total = amounts.reduce((acc, val) => acc + val, 0);
  const income = amounts
    .filter((val) => val > 0)
    .reduce((acc, val) => acc + val, 0);
  const expense = amounts
    .filter((val) => val < 0)
    .reduce((acc, val) => acc + val, 0);

  balanceEl.textContent = `₹${total.toFixed(2)}`;
  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${Math.abs(expense).toFixed(2)}`;
}
function generateInsights() {
  const box = document.getElementById('insights-box');

  if (transactions.length === 0) {
    box.innerHTML = '<p>Add a transaction to see insights here.</p>';
    return;
  }

  const expenses = transactions.filter((t) => t.amount < 0);
  const incomes = transactions.filter((t) => t.amount > 0);
  const totalExpense = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  let lines = [];

  if (expenses.length > 0) {
    const biggest = expenses.reduce((max, t) => (t.amount < max.amount ? t : max));
    lines.push(`Your biggest expense so far is "${biggest.text}" at ₹${Math.abs(biggest.amount)}.`);
  }

  if (totalIncome > 0) {
    const savingsRate = (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(0);
    if (savingsRate >= 0) {
      lines.push(`You've saved about ${savingsRate}% of your income so far.`);
    } else {
      lines.push(`You're spending more than you earn by ₹${(totalExpense - totalIncome).toFixed(2)}.`);
    }
  }

  lines.push(`You've logged ${transactions.length} transaction${transactions.length > 1 ? 's' : ''} in total.`);

  box.innerHTML = lines.map((l) => `<p>${l}</p>`).join('');
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (text === '' || isNaN(amount)) {
    alert('Please enter a valid description and amount.');
    return;
  }

  const transaction = {
    id: Date.now(),
    text,
    amount,
  };

  transactions.push(transaction);
  saveToStorage();
  render();

  textInput.value = '';
  amountInput.value = '';
  textInput.focus();
}

// Delete a transaction by id
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveToStorage();
  render();
}

// Clear all transactions
function clearAll() {
  if (confirm('Delete all transactions? This cannot be undone.')) {
    transactions = [];
    saveToStorage();
    render();
  }
}

// Event listeners
form.addEventListener('submit', addTransaction);
clearAllBtn.addEventListener('click', clearAll);

// Event delegation for delete buttons (since they're created dynamically)
list.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.getAttribute('data-id'));
    deleteTransaction(id);
  }
});

// Initial render on page load
render();
