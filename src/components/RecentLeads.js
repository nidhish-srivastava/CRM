'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecentLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/recent-leads');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent leads');
        }
        
        const data = await response.json();
        setLeads(data);
      } catch (err) {
        console.error('Error loading recent leads:', err);
        setError('Failed to load recent leads');
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Function to determine status badge styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Qualified':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
        <div className="animate-pulse">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border-b py-2">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
      {leads.length === 0 ? (
        <p className="text-gray-500">No leads found.</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b">
                  <td className="py-2">{lead.name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyles(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/leads" className="mt-4 inline-block text-blue-500 hover:text-blue-700">
            View all leads →
          </Link>
        </>
      )}
    </div>
  );
}