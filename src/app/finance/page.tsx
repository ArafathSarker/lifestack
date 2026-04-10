'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import { TrendingUp, TrendingDown, Plus, DollarSign, Wallet, Trash2 } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

export default function FinancePage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="User" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Finance Hub</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage your income and expenses</p>
            </div>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Balance"
              value={`$${(stats?.total_balance || 0).toLocaleString()}`}
              icon={<Wallet className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="This Month Income"
              value={`$${(stats?.monthly_income || 0).toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="This Month Spending"
              value={`$${(stats?.monthly_expense || 0).toLocaleString()}`}
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
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Transactions */}
            <Card title="Recent Transactions" className="lg:col-span-2">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No transactions yet. Click &quot;Add Transaction&quot; to get started!</p>
                ) : (
                  transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {tx.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{tx.description || 'Transaction'}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                            {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toLocaleString()}
                          </p>
                          <span className="badge badge-primary text-xs">{tx.category_name || 'General'}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
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
              <div className="space-y-6">
                {/* Income */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</p>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">${(stats?.monthly_income || 0).toLocaleString()}</p>
                </div>

                {/* Expense */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expense</p>
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">${(stats?.monthly_expense || 0).toLocaleString()}</p>
                </div>

                {/* Net Savings */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Net Savings</p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                    ${((stats?.monthly_income || 0) - (stats?.monthly_expense || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddTransaction} title="Add Transaction" onClose={() => setShowAddTransaction(false)}>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          {/* Type */}
          <div>
            <label className="label-form">Type</label>
            <select
              name="type"
              value={transactionData.type}
              onChange={handleTransactionChange}
              className="input-field"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="label-form">Category</label>
            <select
              name="categoryId"
              value={transactionData.categoryId}
              onChange={handleTransactionChange}
              className="input-field"
            >
              <option value="">General</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label-form">Amount</label>
            <input
              type="number"
              name="amount"
              value={transactionData.amount}
              onChange={handleTransactionChange}
              placeholder="0.00"
              step="0.01"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-form">Description</label>
            <input
              type="text"
              name="description"
              value={transactionData.description}
              onChange={handleTransactionChange}
              placeholder="Transaction details"
              className="input-field"
            />
          </div>

          {/* Date */}
          <div>
            <label className="label-form">Date</label>
            <input
              type="date"
              name="date"
              value={transactionData.date}
              onChange={handleTransactionChange}
              className="input-field"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => setShowAddTransaction(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
