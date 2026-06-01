import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Home','Rent','Fuel','Internet','Gym','Personal','Food','Logon ko dena','Other'];
const CATEGORY_EMOJI = {
  'Home': '🏠', 'Rent': '🏢', 'Fuel': '⛽', 'Internet': '📶',
  'Gym': '💪', 'Personal': '👤', 'Food': '🍔', 'Logon ko dena': '🤝', 'Other': '📦'
};

const defaultForm = { name: '', amount: '', category: 'Rent', dueDay: 1 };

export default function FixedPayments() {
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await api.get('/fixed-payments');
      setPayments(res.data);
    } catch { toast.error('Load nahi ho saka'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fixed-payments', { ...form, amount: Number(form.amount) });
      toast.success('Fixed payment add ho gai!');
      setForm(defaultForm);
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte hain?')) return;
    try {
      await api.delete(`/fixed-payments/${id}`);
      toast.success('Delete ho gai');
      fetch();
    } catch { toast.error('Delete nahi ho saka'); }
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Fixed payments</h2>
          <p className="text-sm text-gray-400">Har mahine ka fixed kharcha</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-semibold active:scale-95 transition-transform"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Nai fixed payment</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text" required placeholder="Naam (e.g. House Rent)"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="number" required placeholder="Amount (PKR)"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              inputMode="numeric"
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mahine ki konsi tarikh ko due hai?</label>
              <input
                type="number" min="1" max="31" required
                value={form.dueDay}
                onChange={e => setForm({ ...form, dueDay: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 bg-green-500 text-white rounded-xl py-3 text-sm font-semibold">
                Save karo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-sm text-gray-400">Kul monthly fixed kharcha</p>
        <p className="text-2xl font-bold text-gray-800">PKR {total.toLocaleString()}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p>Koi fixed payment nahi hai</p>
          <p className="text-sm mt-1">Rent, gym, internet add karo</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {payments.map((p, idx) => {
            const isDue = new Date().getDate() >= p.dueDay;
            return (
              <div
                key={p._id}
                className={`flex items-center justify-between px-4 py-4 ${idx !== payments.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJI[p.category] || '📦'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      {isDue && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Due</span>}
                    </div>
                    <p className="text-xs text-gray-400">{p.dueDay} tarikh • {p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-gray-800">PKR {p.amount.toLocaleString()}</p>
                  <button onClick={() => handleDelete(p._id)} className="text-red-400 text-lg leading-none">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
