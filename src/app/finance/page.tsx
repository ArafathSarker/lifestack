"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import Modal from "@/components/Modal";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  Wallet,
  PieChart,
  Trash2,
  Filter,
  AlertCircle,
} from "lucide-react";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryType: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: Date;
}

interface TransactionApiResponse extends Omit<Transaction, "transaction_date"> {
  transaction_date: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryType: "income" | "expense";
  totalAmount: number;
  transactionCount: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FinancePage() {
  // State for modals and forms
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategorySpending[]
  >([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [transactionData, setTransactionData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/finance/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories);
      } else {
        throw new Error(data.error || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/finance/transactions?limit=50");
      const data = await response.json();

      if (data.success) {
        // Convert transaction_date strings to Date objects
        const transactionsWithDates = data.data.transactions.map(
          (tx: TransactionApiResponse): Transaction => ({
            ...tx,
            transaction_date: new Date(tx.transaction_date),
          }),
        );
        setTransactions(transactionsWithDates);
      } else {
        throw new Error(data.error || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/finance/summary?period=current_month");
      const data = await response.json();

      if (data.success) {
        setSummary(data.data.summary);
        setCategoryBreakdown(data.data.categoryBreakdown);
      } else {
        throw new Error(data.error || "Failed to fetch summary");
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to load financial summary");
    }
  };

  const addTransaction = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: transactionData.categoryId,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description || null,
          transaction_date: transactionData.transaction_date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data
        await Promise.all([fetchTransactions(), fetchSummary()]);

        // Reset form and close modal
        setTransactionData({
          categoryId: "",
          amount: "",
          description: "",
          transaction_date: new Date().toISOString().split("T")[0],
        });
        setShowAddTransaction(false);
      } else {
        throw new Error(data.error || "Failed to create transaction");
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(
        `/api/finance/transactions/${transactionId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        // Refresh data
        await Promise.all([fetchTransactions(), fetchSummary()]);
      } else {
        throw new Error(data.error || "Failed to delete transaction");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction");
    }
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleTransactionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTransactionData({ ...transactionData, [name]: value });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!transactionData.categoryId || !transactionData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    await addTransaction();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(transactionId);
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchCategories(),
          fetchTransactions(),
          fetchSummary(),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load finance data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter transactions when filter or transactions change
  useEffect(() => {
    if (filterCategory) {
      setFilteredTransactions(
        transactions.filter((tx) => tx.categoryId === filterCategory),
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, filterCategory]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Navbar isAuthenticated userName="John" />
        <main className="flex-1 py-8 md:py-12">
          <div className="container-responsive">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading finance data...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="John" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Error
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Finance Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your income and expenses
              </p>
            </div>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
              disabled={submitting}
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Balance"
              value={summary ? formatCurrency(summary.balance) : "$0.00"}
              icon={<Wallet className="w-6 h-6" />}
              trend={
                summary?.balance
                  ? {
                      value: summary.balance > 0 ? 8 : -5,
                      isPositive: summary.balance > 0,
                    }
                  : undefined
              }
              color={
                summary?.balance && summary.balance > 0 ? "success" : "warning"
              }
            />
            <StatCard
              title="This Month Income"
              value={summary ? formatCurrency(summary.totalIncome) : "$0.00"}
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="This Month Spending"
              value={summary ? formatCurrency(summary.totalExpenses) : "$0.00"}
              icon={<TrendingDown className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Savings Rate"
              value={
                summary && summary.totalIncome > 0
                  ? `${Math.round((summary.balance / summary.totalIncome) * 100)}%`
                  : "0%"
              }
              icon={<DollarSign className="w-6 h-6" />}
              color="primary"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Transactions */}
            <Card title="Recent Transactions" className="lg:col-span-2">
              {/* Filter */}
              <div className="mb-4 flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No transactions found
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      {filterCategory
                        ? "Try changing the filter"
                        : "Add your first transaction to get started"}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.categoryType === "income"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          {tx.categoryType === "income" ? (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {tx.description || "No description"}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {formatDate(tx.transaction_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.categoryType === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {tx.categoryType === "income" ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span className="badge badge-primary text-xs">
                            {tx.categoryName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card title="Spending by Category">
              <div className="space-y-4">
                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-6">
                    <PieChart className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No spending data
                    </p>
                  </div>
                ) : (
                  categoryBreakdown.map((item) => {
                    const maxAmount = Math.max(
                      ...categoryBreakdown.map((c) => c.totalAmount),
                    );
                    const percentage =
                      maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 0;

                    return (
                      <div key={item.categoryId}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.categoryName}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {formatCurrency(item.totalAmount)}
                          </span>
                        </div>
                        <ProgressBar
                          percentage={percentage}
                          showPercentage={false}
                          color={
                            item.categoryType === "income"
                              ? "success"
                              : "primary"
                          }
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {item.transactionCount} transaction
                          {item.transactionCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Monthly Summary */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Income vs Expense */}
            <Card title="Monthly Summary">
              <div className="space-y-6">
                {/* Income */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Total Income
                    </p>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {summary ? formatCurrency(summary.totalIncome) : "$0.00"}
                  </p>
                </div>

                {/* Expense */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Total Expense
                    </p>
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {summary ? formatCurrency(summary.totalExpenses) : "$0.00"}
                  </p>
                </div>

                {/* Net Savings */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                    Net Savings
                  </p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                    {summary ? formatCurrency(summary.balance) : "$0.00"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions & Stats */}
            <Card title="Quick Actions">
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="w-full btn-primary text-left flex items-center justify-between p-4"
                  disabled={submitting}
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5" />
                    <span>Add New Transaction</span>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Transactions
                    </p>
                    <p className="text-xl font-bold">{transactions.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Categories
                    </p>
                    <p className="text-xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddTransaction}
        title="Add Transaction"
        onClose={() => setShowAddTransaction(false)}
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          {/* Category */}
          <div>
            <label className="label-form">Category *</label>
            <select
              name="categoryId"
              value={transactionData.categoryId}
              onChange={handleTransactionChange}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {categories
                .sort(
                  (a, b) =>
                    a.type.localeCompare(b.type) ||
                    a.name.localeCompare(b.name),
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label-form">Amount *</label>
            <input
              type="number"
              name="amount"
              value={transactionData.amount}
              onChange={handleTransactionChange}
              placeholder="0.00"
              step="0.01"
              min="0"
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
              placeholder="What was this transaction for?"
              className="input-field"
              maxLength={500}
            />
          </div>

          {/* Date */}
          <div>
            <label className="label-form">Date *</label>
            <input
              type="date"
              name="transaction_date"
              value={transactionData.transaction_date}
              onChange={handleTransactionChange}
              className="input-field"
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={
                submitting ||
                !transactionData.categoryId ||
                !transactionData.amount
              }
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : (
                "Add Transaction"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowAddTransaction(false)}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
