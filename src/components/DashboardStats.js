'use client';

import { useState, useEffect } from 'react';

export default function DashboardStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{stat.label}</h3>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}