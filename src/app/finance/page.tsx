'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import { TrendingUp, TrendingDown, Plus, DollarSign, Wallet, Trash2, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

const CATEGORY_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500',
  'bg-pink-500', 'bg-sky-500',
];

const DONUT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#f97316', '#14b8a6', '#ec4899', '#0ea5e9'];

// Simple donut chart
function DonutChart({ data, total }: { data: { category: string; amount: number }[]; total: number }) {
  if (data.length === 0 || total === 0) return null;
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentOffset = 0;

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg width={size} height={size} className="progress-ring">
          {data.map((item, i) => {
            const percentage = (item.amount / total) * 100;
            const dashLength = (percentage / 100) * circumference;
            const segment = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
            currentOffset += dashLength;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">৳{total.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="" />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          <div className="skeleton h-10 w-60 mb-3"></div>
          <div className="skeleton h-5 w-40 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="skeleton h-80 rounded-2xl lg:col-span-2"></div>
            <div className="skeleton h-80 rounded-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FinancePage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [transactionData, setTransactionData] = useState({
    type: 'expense',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [txRes, statsRes, catRes] = await Promise.all([
        apiRequest<any>({ method: 'GET', link: '/api/finance/transactions?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/finance/stats' }),
        apiRequest<any>({ method: 'GET', link: '/api/finance/categories' }),
      ]);
      if (txRes.success) setTransactions(txRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch {
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransactionData({ ...transactionData, [name]: value });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiRequest<any>({
      method: 'POST',
      link: '/api/finance/transactions',
      obj: {
        categoryId: transactionData.categoryId || null,
        amount: parseFloat(transactionData.amount),
        type: transactionData.type,
        description: transactionData.description,
        transaction_date: transactionData.date,
      },
    });
    if (result.success) {
      setShowAddTransaction(false);
      setTransactionData({ type: 'expense', categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const result = await apiRequest<any>({ method: 'DELETE', link: `/api/finance/transactions?id=${id}` });
    if (result.success) fetchData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryMessage(null);
    if (!newCategory.name.trim()) {
      setCategoryMessage('Category name is required');
      return;
    }
    try {
      const result = await apiRequest<any>({
        method: 'POST',
        link: '/api/finance/categories',
        obj: { name: newCategory.name.trim(), type: newCategory.type },
      });
      if (result.success) {
        setNewCategory({ name: '', type: 'expense' });
        setCategoryMessage('✓ Category created!');
        fetchData();
        setTimeout(() => setCategoryMessage(null), 2000);
      }
    } catch {
      setCategoryMessage('Failed to create category');
    }
  };

  if (loading) return <FinanceSkeleton />;

  const categoryBreakdown = stats?.category_breakdown || [];
  const totalExpense = stats?.monthly_expense || 0;
  const monthlyIncome = stats?.monthly_income || 0;
  const netSavings = monthlyIncome - totalExpense;
  const budgetLimit = 50000; // Example budget in BDT
  const budgetUsed = Math.min((totalExpense / budgetLimit) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="User" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-slideUp">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Finance Hub</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage your income and expenses</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setShowManageCategories(true); setCategoryMessage(null); }}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <Tag className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Balance"
              value={`৳${(stats?.total_balance || 0).toLocaleString()}`}
              icon={<Wallet className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="This Month Income"
              value={`৳${monthlyIncome.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="This Month Spending"
              value={`৳${totalExpense.toLocaleString()}`}
              icon={<TrendingDown className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Savings Rate"
              value={`${stats?.savings_rate || 0}%`}
              icon={<DollarSign className="w-6 h-6" />}
              color="primary"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Transactions */}
            <Card title="Recent Transactions" className="lg:col-span-2">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No transactions yet. Click &quot;Add Transaction&quot; to get started!</p>
                ) : (
                  transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{tx.description || 'Transaction'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                            {tx.type === 'income' ? '+' : '-'}৳{parseFloat(tx.amount).toLocaleString()}
                          </p>
                          <span className="badge badge-primary text-xs">{tx.category_name || 'General'}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Monthly Summary */}
            <Card title="Monthly Summary">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/15 border border-green-200/60 dark:border-green-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</p>
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">৳{monthlyIncome.toLocaleString()}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/15 dark:to-pink-900/15 border border-red-200/60 dark:border-red-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expense</p>
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">৳{totalExpense.toLocaleString()}</p>
                </div>

                <div className={`p-4 rounded-xl border ${netSavings >= 0 ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/15 dark:to-purple-900/15 border-indigo-200/60 dark:border-indigo-800/40' : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/15 dark:to-orange-900/15 border-red-200/60 dark:border-red-800/40'}`}>
                  <p className={`text-sm font-medium mb-1 ${netSavings >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-red-700 dark:text-red-300'}`}>Net Savings</p>
                  <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-red-700 dark:text-red-300'}`}>
                    {netSavings >= 0 ? '' : '-'}৳{Math.abs(netSavings).toLocaleString()}
                  </p>
                </div>

                {/* Budget Meter */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Monthly Budget</span>
                    <span className="text-slate-500">৳{totalExpense.toLocaleString()} / ৳{budgetLimit.toLocaleString()}</span>
                  </div>
                  <ProgressBar percentage={budgetUsed} color={budgetUsed > 80 ? 'error' : budgetUsed > 50 ? 'warning' : 'success'} showPercentage={false} />
                  <p className="text-xs text-slate-500 mt-1">{budgetUsed.toFixed(0)}% of budget used</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Spending by Category with Donut Chart */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card title="Spending Breakdown" className="lg:col-span-2">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No expense data this month.</p>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((item: any, idx: number) => {
                    const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.count} txns</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">৳{item.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 text-right">{percentage.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Spending</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">৳{totalExpense.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Donut Chart */}
            <Card title="Category Overview">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-4">
                  <DonutChart data={categoryBreakdown} total={totalExpense} />
                  <div className="space-y-2">
                    {categoryBreakdown.slice(0, 5).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                        <span className="text-slate-600 dark:text-slate-400 flex-1 truncate">{item.category}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{((item.amount / totalExpense) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddTransaction} title="Add Transaction" onClose={() => setShowAddTransaction(false)}>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="label-form">Type</label>
            <select name="type" value={transactionData.type} onChange={handleTransactionChange} className="input-field">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="label-form">Category</label>
            <select name="categoryId" value={transactionData.categoryId} onChange={handleTransactionChange} className="input-field">
              <option value="">General</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-form">Amount (৳)</label>
            <input type="number" name="amount" value={transactionData.amount} onChange={handleTransactionChange} placeholder="0.00" step="0.01" className="input-field" required />
          </div>
          <div>
            <label className="label-form">Description</label>
            <input type="text" name="description" value={transactionData.description} onChange={handleTransactionChange} placeholder="Transaction details" className="input-field" />
          </div>
          <div>
            <label className="label-form">Date</label>
            <input type="date" name="date" value={transactionData.date} onChange={handleTransactionChange} className="input-field" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Add Transaction</button>
            <button type="button" onClick={() => setShowAddTransaction(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal isOpen={showManageCategories} title="Manage Categories" onClose={() => setShowManageCategories(false)}>
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create New Category</p>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Category name" className="input-field col-span-2" />
              <select value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })} className="input-field">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            {categoryMessage && (
              <p className={`text-sm text-center ${categoryMessage.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {categoryMessage}
              </p>
            )}
          </form>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Existing Categories</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">No categories yet.</p>
              ) : (
                categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>
                    </div>
                    <span className={`badge text-xs ${cat.type === 'income' ? 'badge-success' : 'badge-warning'}`}>
                      {cat.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button type="button" onClick={() => setShowManageCategories(false)} className="btn-secondary w-full">Done</button>
        </div>
      </Modal>
    </div>
  );
}
