import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { ShoppingBagIcon, CurrencyDollarIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  ordersReceived: number;
  completedOrders: number;
  totalSales: number;
  salesThisMonth: number;
  revenue: number;
  revenueThisMonth: number;
  totalProfit: number;
  profitThisMonth: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersReceived: 486,
    completedOrders: 351,
    totalSales: 1641,
    salesThisMonth: 213,
    revenue: 42562,
    revenueThisMonth: 5032,
    totalProfit: 9562,
    profitThisMonth: 542
  });

  const [customerStats, setCustomerStats] = useState({
    total: 826,
    new: 674,
    returning: 182,
    growthRate: 8.2
  });

  const statsCards = [
    {
      title: 'Pedidos Recibidos',
      icon: ShoppingBagIcon,
      value: stats.ordersReceived,
      subValue: stats.completedOrders,
      subLabel: 'Pedidos Completados',
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Ventas Totales',
      icon: CurrencyDollarIcon,
      value: stats.totalSales,
      subValue: stats.salesThisMonth,
      subLabel: 'Este Mes',
      bgColor: 'bg-emerald-500',
    },
    {
      title: 'Ingresos',
      icon: UserGroupIcon,
      value: `$${stats.revenue.toLocaleString()}`,
      subValue: `$${stats.revenueThisMonth.toLocaleString()}`,
      subLabel: 'Este Mes',
      bgColor: 'bg-orange-400',
    },
    {
      title: 'Ganancias',
      icon: TrophyIcon,
      value: `$${stats.totalProfit.toLocaleString()}`,
      subValue: `$${stats.profitThisMonth.toLocaleString()}`,
      subLabel: 'Este Mes',
      bgColor: 'bg-pink-500',
    },
  ];

  const visitorData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Arte',
        data: [20, 50, 30, 50, 30, 50],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
      {
        label: 'Comercio',
        data: [60, 30, 65, 45, 65, 35],
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.4,
      },
    ],
  };

  const customerData = {
    labels: ['Nuevos', 'Recurrentes'],
    datasets: [
      {
        data: [customerStats.new, customerStats.returning],
        backgroundColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Panel de Control</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${card.bgColor}`}>
                    <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {card.subLabel}: {card.subValue}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Visitors Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Visitantes Únicos</h3>
              <div className="mt-4 h-72">
                <Line
                  data={visitorData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Customers Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
                <span className="text-sm text-green-500">+{customerStats.growthRate}%</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-5">
                <div className="h-72">
                  <Doughnut
                    data={customerData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <h4 className="text-4xl font-bold text-gray-900">{customerStats.total}</h4>
                    <p className="text-sm text-gray-500">Clientes Totales</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Nuevos</span>
                      <span className="text-sm font-medium text-gray-900">{customerStats.new}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Recurrentes</span>
                      <span className="text-sm font-medium text-gray-900">{customerStats.returning}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}