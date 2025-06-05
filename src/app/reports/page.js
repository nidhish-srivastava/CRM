"use client"

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';

// Component for the reports dashboard
export default function ReportsPage() {
  // State for all our report data
  const [leadStats, setLeadStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch all report data on component mount
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch lead statistics
        const leadsResponse = await fetch('/api/reports/lead-stats');
        const leadsData = await leadsResponse.json();
        
        // Fetch project statistics
        const projectsResponse = await fetch('/api/reports/project-stats');
        const projectsData = await projectsResponse.json();
        
        // Fetch customer statistics
        const customersResponse = await fetch('/api/reports/customer-stats');
        const customersData = await customersResponse.json();
        
        // Update state with fetched data
        console.log(leadsData,projectsData,customersData);
        
        setLeadStats(leadsData);
        setProjectStats(projectsData);
        setCustomerStats(customersData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load report data');
        setLoading(false);
        console.error('Error fetching report data:', err);
      }
    };
    
    fetchReportData();
  }, []);

  // Format date for charts
  const formatMonth = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM yyyy');
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading reports data...</p>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reports Dashboard</h1>
      
      {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {projectStats && projectStats.projectMetrics && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Projects</h3>
              <p className="text-3xl font-bold">{projectStats?.projectMetrics.totalProjects}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
              <p className="text-3xl font-bold">
                ${projectStats.projectMetrics.totalBudget?.toLocaleString() ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">
                ${projectStats.projectMetrics.totalRevenue?.toLocaleString() ?? 0}
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Lead Reports Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Lead Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Status Distribution */}
          {leadStats && leadStats.leadsByStatus.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadStats.leadsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadStats.leadsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Lead Source Distribution */}
          {leadStats && leadStats.leadsBySource.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Source Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadStats.leadsBySource}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Leads" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Lead Growth Over Time */}
          {leadStats && leadStats.leadsOverTime.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Lead Growth Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={leadStats.leadsOverTime.map(item => ({
                      ...item,
                      month: formatMonth(item.month)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Leads" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Projects Reports Section */}
   <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Project Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status Distribution */}
          {projectStats && projectStats?.projectsByStatus?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStats.projectsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectStats.projectsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Projects Over Time */}
          {projectStats && projectStats.projectsOverTime.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Projects Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectStats.projectsOverTime.map(item => ({
                      ...item,
                      month: formatMonth(item.month)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Projects" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
            {/* Revenue & Budget Over Time */}
          {projectStats && projectStats.projectsOverTime.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Revenue & Budget Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectStats.projectsOverTime.map(item => ({
                      ...item,
                      month: formatMonth(item.month)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="totalRevenue" 
                      name="Revenue ($)" 
                      stroke="#82ca9d" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="totalBudget" 
                      name="Budget ($)" 
                      stroke="#ffc658" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Customer Reports Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Customer Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Type Distribution */}
          {customerStats && customerStats.customersByType.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Type Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerStats.customersByType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerStats.customersByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Customers Over Time */}
          {customerStats && customerStats.customersOverTime.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Growth Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={customerStats.customersOverTime.map(item => ({
                      ...item,
                      month: formatMonth(item.month)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Customers" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Top Customers */}
          {customerStats && customerStats.topCustomers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Top Customers by Project Value</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={customerStats.topCustomers}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80}
                      tick={{ fontSize: 14 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="totalValue" 
                      name="Total Project Value ($)" 
                      fill="#8884d8" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Date Range Filter - For future implementation */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select className="border rounded p-2 w-full">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>Custom range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Customer Type</label>
            <select className="border rounded p-2 w-full">
              <option>All</option>
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">
              Apply Filters
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Note: Filter functionality will be implemented in the next release.
        </p>
      </div>
    </div>
  );
}