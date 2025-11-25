'use client';

import { useEffect, useMemo, useState } from 'react';

export default function HomePage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/transactions');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load transactions');
        }
        setTransactions(data.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalBalance = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
      return tx.type === 'income' ? sum + amount : sum - amount;
    }, 0);
  }, [transactions]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save transaction');
      }

      setTransactions((prev) => [data.data, ...prev]);
      setFormValues({
        amount: '',
        description: '',
        category: '',
        type: 'expense',
        date: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm uppercase text-slate-500">Total Balance</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">
            ${totalBalance.toFixed(2)}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Add Transaction</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  required
                  value={formValues.amount}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  value={formValues.description}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formValues.category}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formValues.type}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formValues.date}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Adding…' : 'Add Transaction'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
              {isLoading && <span className="text-sm text-slate-500">Loading…</span>}
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            {!isLoading && transactions.length === 0 && !error && (
              <p className="mt-4 text-sm text-slate-500">No transactions yet.</p>
            )}

            <ul className="mt-4 space-y-4">
              {transactions.map((tx) => (
                <li
                  key={tx._id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{tx.description}</p>
                    <p className="text-sm text-slate-500">
                      {tx.category || 'Uncategorized'} •{' '}
                      {tx.date ? new Date(tx.date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <span
                    className={`text-base font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}$
                    {Number(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}


