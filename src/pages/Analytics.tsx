import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, UserX, Building } from 'lucide-react';

const applicationData = [
  { month: 'Jan', applications: 65 },
  { month: 'Feb', applications: 85 },
  { month: 'Mar', applications: 120 },
  { month: 'Apr', applications: 90 },
  { month: 'May', applications: 110 },
  { month: 'Jun', applications: 95 },
];

const hiringStatusData = [
  { name: 'Selected', value: 35, color: '#4F46E5' },
  { name: 'In Process', value: 45, color: '#F59E0B' },
  { name: 'Rejected', value: 20, color: '#EF4444' },
];

const StatCard = ({ icon: Icon, label, value, change }: { icon: any, label: string, value: string, change: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    </div>
    <p className="text-sm text-green-600 dark:text-green-400 mt-2">{change}</p>
  </div>
);

function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Applications"
          value="1,234"
          change="+12.5% from last month"
        />
        <StatCard
          icon={UserCheck}
          label="Selected Candidates"
          value="456"
          change="+8.2% from last month"
        />
        <StatCard
          icon={UserX}
          label="Rejected Candidates"
          value="234"
          change="+5.1% from last month"
        />
        <StatCard
          icon={Building}
          label="Total Employees"
          value="789"
          change="+3.7% from last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Applications Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Hiring Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hiringStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {hiringStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;