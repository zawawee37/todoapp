import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Clock, Target, BarChart3, PieChart, Activity } from 'lucide-react';
import Card from '../Layout/Card';

interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  todayCreated: number;
  weekCreated: number;
  monthCreated: number;
  avgCompletionTime: number;
  recentActivity: Array<{ date: string; count: number }>;
  weeklyTrend: Array<{ week: string; created: number; completed: number }>;
  upcomingDeadlines: Array<{ title: string; due_date: string; priority: string; type: string }>;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!analytics) return <div className="p-6">Failed to load analytics</div>;

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const typeIcons = {
    task: '📋',
    meeting: '🤝',
    reminder: '⏰',
    project: '🚀',
    personal: '👤',
    work: '💼',
    shopping: '🛒',
    health: '🏥'
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold">{analytics.completionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold">{analytics.weekCreated || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg. Completion</p>
              <p className="text-3xl font-bold">{analytics.avgCompletionTime || 0}d</p>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold">{analytics.overdue}</p>
            </div>
            <Target className="h-8 w-8 text-red-200" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Tasks by Priority" 
          icon={<div className="p-2 bg-orange-100 rounded-lg"><BarChart3 className="h-5 w-5 text-orange-600" /></div>}
        >
          <div className="space-y-4">
            {analytics.byPriority && Object.entries(analytics.byPriority).map(([priority, count]) => {
              const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium flex items-center">
                      <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]} mr-2`}></div>
                      {priority}
                    </span>
                    <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card 
          title="Tasks by Type" 
          icon={<div className="p-2 bg-purple-100 rounded-lg"><PieChart className="h-5 w-5 text-purple-600" /></div>}
        >
          <div className="grid grid-cols-2 gap-3">
            {analytics.byType && Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{typeIcons[type as keyof typeof typeIcons]}</span>
                    <span className="capitalize text-sm font-medium">{type}</span>
                  </div>
                  <span className="font-bold text-lg">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card 
        title="Upcoming Deadlines" 
        icon={<div className="p-2 bg-red-100 rounded-lg"><Target className="h-5 w-5 text-red-600" /></div>}
      >
        <div className="space-y-3">
          {analytics.upcomingDeadlines?.length > 0 ? (
            analytics.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{typeIcons[deadline.type as keyof typeof typeIcons]}</span>
                      <h4 className="font-medium text-sm">{deadline.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(deadline.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deadline.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    deadline.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {deadline.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;