import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const CATEGORY_EMOJI = {
  'Home': '🏠', 'Rent': '🏢', 'Fuel': '⛽', 'Internet': '📶',
  'Gym': '💪', 'Personal': '👤', 'Food': '🍔', 'Logon ko dena': '🤝', 'Other': '📦'
};

export default function Budget() {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bRes, eRes] = await Promise.all([
          api.get(`/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
          api.get(`/expenses?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
        ]);
        setBudget(bRes.data);
        setExpenses(eRes.data.byCategory || {});
        const f = { totalBudget: bRes.data.totalBudget };
        bRes.data.categories.forEach(c => { f[c.name] = c.limit; });
        setForm(f);
      } catch { toast.error('Load nahi ho saka'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    try {
      const categories = budget.categories.map(c => ({ name: c.name, limit: Number(form[c.name]) || 0 }));
      const res = await api.put(`/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, {
        totalBudget: Number(form.totalBudget),
        categories
      });
      setBudget(res.data);
      setEditing(false);
      toast.success('Budget update ho gaya!');
    } catch { toast.error('Save nahi ho saka'); }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalSpent = Object.values(expenses).reduce((s, v) => s + v, 0);
  const remaining = (budget?.totalBudget || 0) - totalSpent;

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Budget</h2>
          <p className="text-sm text-gray-400">Is mahine ka plan</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold active:scale-95 transition-transform ${
            editing ? 'bg-green-500 text-white' : 'border border-gray-200 bg-white text-gray-700'
          }`}
        >
          {editing ? '✅ Save' : '✏️ Edit'}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-500">Total budget</p>
          {editing ? (
            <input
              type="number"
              value={form.totalBudget}
              onChange={e => setForm({ ...form, totalBudget: e.target.value })}
              className="border border-green-300 rounded-lg px-2 py-1 text-sm w-32 text-right focus:outline-none"
              inputMode="numeric"
            />
          ) : (
            <p className="text-lg font-bold text-gray-800">PKR {budget?.totalBudget?.toLocaleString()}</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-gray-500">Kharch kiya</p>
          <p className="text-sm font-semibold text-red-500">PKR {totalSpent.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Bacha hai</p>
          <p className={`text-sm font-semibold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
            PKR {remaining.toLocaleString()}
          </p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all ${
              (totalSpent / budget?.totalBudget) > 0.9 ? 'bg-red-500' :
              (totalSpent / budget?.totalBudget) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((totalSpent / budget?.totalBudget) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {budget?.categories?.map(cat => {
          const spent = expenses[cat.name] || 0;
          const limit = editing ? (Number(form[cat.name]) || cat.limit) : cat.limit;
          const pct = Math.min((spent / limit) * 100, 100);
          const over = spent > limit;
          return (
            <div key={cat.name} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_EMOJI[cat.name] || '📦'}</span>
                  <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                  {over && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">Over!</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">PKR {spent.toLocaleString()} /</span>
                  {editing ? (
                    <input
                      type="number"
                      value={form[cat.name] || ''}
                      onChange={e => setForm({ ...form, [cat.name]: e.target.value })}
                      className="border border-green-300 rounded-lg px-2 py-0.5 text-xs w-20 text-right focus:outline-none"
                      inputMode="numeric"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">{limit.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
