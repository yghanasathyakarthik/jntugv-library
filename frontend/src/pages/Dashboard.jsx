import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Book, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/analytics');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Books', value: stats.totalBooks, icon: Book, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Available Books', value: stats.availableBooks, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Issued Books', value: stats.issuedBooks, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Missing/Lost Books', value: stats.missingBooks, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  const categoryData = {
    labels: stats.popularCategories.map(c => c.name),
    datasets: [
      {
        label: 'Books per Category',
        data: stats.popularCategories.map(c => c.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8' } },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8' } },
    },
    cutout: '70%',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-textMuted">Overview of library inventory and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="glass-panel p-6 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-textMuted text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Popular Categories</h2>
          <div className="h-[300px] flex justify-center">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Inventory Distribution</h2>
          <div className="h-[300px] flex justify-center">
             <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
