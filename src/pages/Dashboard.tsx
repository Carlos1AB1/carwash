import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart2, Car, DollarSign, Users } from 'lucide-react';

interface DashboardStats {
  pendingServices: number;
  dailyRevenue: number;
  activeEmployees: number;
  totalVehicles: number;
}

function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/reports/dashboard-stats');
      return response.data;
    },
  });

  const statCards = [
    {
      title: 'Pending Services',
      value: stats?.pendingServices || 0,
      icon: Car,
      color: 'text-blue-600',
    },
    {
      title: "Today's Revenue",
      value: stats?.dailyRevenue ? `$${stats.dailyRevenue}` : '$0',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Employees',
      value: stats?.activeEmployees || 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles || 0,
      icon: BarChart2,
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;