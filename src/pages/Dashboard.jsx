import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  'Home': '#22c55e', 'Rent': '#3b82f6', 'Fuel': '#f59e0b',
  'Internet': '#8b5cf6', 'Gym': '#ec4899', 'Personal': '#06b6d4',
  'Food': '#f97316', 'Logon ko dena': '#ef4444', 'Other': '#6b7280'
};

const CATEGORY_EMOJI = {
  'Home': '🏠', 'Rent': '🏢', 'Fuel': '⛽', 'Internet': '📶',
  'Gym': '💪', 'Personal': '👤', 'Food': '🍔', 'Logon ko dena': '🤝', 'Other': '📦'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [budget, setBudget] = useState(null);
  const [fixed, setFixed] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [expRes, budRes, fixRes] = await Promise.all([
          api.get(`/expenses?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
          api.get(`/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
          api.get('/fixed-payments')
        ]);
        setData(expRes.data);
        setBudget(budRes.data);
        setFixed(fixRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const spent = data?.total || 0;
  const totalBudget = budget?.totalBudget || 50000;
  const remaining = totalBudget - spent;
  const pct = Math.min((spent / totalBudget) * 100, 100);
  const fixedTotal = fixed.reduce((s, f) => s + f.amount, 0);

  const pieData = Object.entries(data?.byCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <p className="text-gray-500 text-sm">{format(now, 'MMMM yyyy')}</p>
        <h2 className="text-xl font-bold text-gray-800">Aapka hisaab</h2>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kharch kiya</p>
            <p className="text-3xl font-bold text-gray-800">PKR {spent.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bacha hai</p>
            <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
              PKR {remaining.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{pct.toFixed(0)}% of PKR {totalBudget.toLocaleString()}</p>
      </div>

      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Category breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map(({ name, value }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-base">{CATEGORY_EMOJI[name] || '📦'}</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{name}</p>
                  <p className="text-sm font-semibold text-gray-800">PKR {value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fixed.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Fixed payments</h3>
            <span className="text-xs text-gray-400">PKR {fixedTotal.toLocaleString()} / mahina</span>
          </div>
          <div className="space-y-2">
            {fixed.map(f => {
              const isDue = new Date().getDate() >= f.dueDay;
              return (
                <div key={f._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_EMOJI[f.category] || '📦'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{f.name}</p>
                      <p className="text-xs text-gray-400">{f.dueDay} tarikh ko</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700">PKR {f.amount.toLocaleString()}</p>
                    {isDue && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Due</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/add" className="bg-green-500 text-white rounded-2xl p-4 text-center shadow-sm active:scale-95 transition-transform">
          <p className="text-2xl mb-1">+</p>
          <p className="text-sm font-semibold">Kharcha add karo</p>
        </Link>
        <Link to="/history" className="bg-white text-gray-700 rounded-2xl p-4 text-center shadow-sm active:scale-95 transition-transform">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-semibold">History dekho</p>
        </Link>
      </div>

      {data?.expenses?.slice(0, 5).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Aakhri 5 kharche</h3>
            <Link to="/history" className="text-xs text-green-600 font-medium">Sab dekho</Link>
          </div>
          <div className="space-y-3">
            {data.expenses.slice(0, 5).map(exp => (
              <div key={exp._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_EMOJI[exp.category] || '📦'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exp.category}</p>
                    <p className="text-xs text-gray-400">{exp.note || format(new Date(exp.date), 'dd MMM')}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-red-500">- PKR {exp.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
