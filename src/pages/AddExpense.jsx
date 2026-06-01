import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const CATEGORIES = [
  { name: 'Home', emoji: '🏠' },
  { name: 'Rent', emoji: '🏢' },
  { name: 'Fuel', emoji: '⛽' },
  { name: 'Internet', emoji: '📶' },
  { name: 'Gym', emoji: '💪' },
  { name: 'Personal', emoji: '👤' },
  { name: 'Food', emoji: '🍔' },
  { name: 'Logon ko dena', emoji: '🤝' },
  { name: 'Other', emoji: '📦' },
];

export default function AddExpense() {
  const [form, setForm] = useState({
    amount: '', category: '', note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) {
      toast.error('Amount aur category zaruri hai!');
      return;
    }
    setLoading(true);
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      toast.success('Kharcha add ho gaya! ✅');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aa gaya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Kharcha add karo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="text-sm font-medium text-gray-600 block mb-2">Kitna kharcha? (PKR)</label>
          <input
            type="number" required
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full text-3xl font-bold text-gray-800 border-0 outline-none bg-transparent"
            placeholder="0"
            inputMode="numeric"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="text-sm font-medium text-gray-600 block mb-3">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ name, emoji }) => (
              <button
                key={name} type="button"
                onClick={() => setForm({ ...form, category: name })}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                  form.category === name
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Note (optional)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Kuch likhna ho toh..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Tarikh</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-green-500 text-white rounded-2xl py-4 font-bold text-base disabled:opacity-60 active:scale-95 transition-transform shadow-lg shadow-green-200"
        >
          {loading ? 'Save ho raha hai...' : 'Save karo ✅'}
        </button>
      </form>
    </div>
  );
}
