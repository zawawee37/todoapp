import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import Card from '../Layout/Card';

interface Analytics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!analytics) return <div className="p-6">Failed to load analytics</div>;

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold">{analytics.total}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{analytics.completed}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold">{analytics.pending}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Clock className="h-8 w-8" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold">{analytics.overdue}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Card */}
      <Card 
        title="Completion Rate" 
        subtitle={`${analytics.completionRate}% of tasks completed`}
        icon={<div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>}
      >
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${analytics.completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium">{analytics.completionRate}%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Tasks by Priority" 
          subtitle="Distribution of tasks by priority level"
          icon={<div className="p-2 bg-orange-100 rounded-lg"><Target className="h-5 w-5 text-orange-600" /></div>}
        >
          <div className="space-y-3">
            {Object.entries(analytics.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}></div>
                  <span className="capitalize font-medium">
                    {priority === 'urgent' ? '🔴' : 
                     priority === 'high' ? '🟠' :
                     priority === 'medium' ? '🟡' : '🟢'} {priority}
                  </span>
                </div>
                <span className="font-bold text-lg">{count}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card 
          title="Tasks by Category" 
          subtitle="Breakdown of tasks by category"
          icon={<div className="p-2 bg-purple-100 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600" /></div>}
        >
          <div className="space-y-3">
            {Object.entries(analytics.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">{category}</span>
                <span className="font-bold text-lg">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;