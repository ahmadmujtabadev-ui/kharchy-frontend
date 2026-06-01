import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORY_EMOJI = {
  'Home': '🏠', 'Rent': '🏢', 'Fuel': '⛽', 'Internet': '📶',
  'Gym': '💪', 'Personal': '👤', 'Food': '🍔', 'Logon ko dena': '🤝', 'Other': '📦'
};

export default function History() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/expenses?month=${month}&year=${year}`);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [month, year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte hain?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Delete ho gaya');
      fetchExpenses();
    } catch {
      toast.error('Delete nahi ho saka');
    }
  };

  const grouped = expenses.reduce((acc, exp) => {
    const day = format(new Date(exp.date), 'dd MMM yyyy');
    if (!acc[day]) acc[day] = [];
    acc[day].push(exp);
    return acc;
  }, {});

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">History</h2>

      <div className="flex gap-2 mb-4">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-sm text-gray-400">Is mahine kul kharcha</p>
        <p className="text-2xl font-bold text-red-500">PKR {total.toLocaleString()}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">💸</p>
          <p>Is mahine koi kharcha nahi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{day}</p>
                <p className="text-xs font-semibold text-gray-500">
                  PKR {items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {items.map((exp, idx) => (
                  <div
                    key={exp._id}
                    className={`flex items-center justify-between px-4 py-3 ${idx !== items.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{CATEGORY_EMOJI[exp.category] || '📦'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{exp.category}</p>
                        {exp.note && <p className="text-xs text-gray-400">{exp.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-gray-800">PKR {exp.amount.toLocaleString()}</p>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="text-red-400 text-lg leading-none active:scale-90 transition-transform"
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
