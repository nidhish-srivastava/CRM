'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDetailPage({ params }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCustomerDetails() {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer details');
        }
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerDetails();
  }, [params.id]);

  // Calculate total project budget and value
  const totalBudget = customer?.projects.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;
  const totalProjectValue = customer?.projects.reduce((sum, project) => sum + (project.cost || 0), 0) || 0;

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status) {
      case 'Planned':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'In Progress':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'Completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }

    return (
      <span className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/customers')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Customer not found
        </div>
        <button
          onClick={() => router.push('/customers')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // Statuses for breakdown and legend
  const statusList = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <main className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/customers')}
          className="mr-3 text-blue-500 hover:text-blue-700"
        >
          &larr; Back to Customers
        </button>
        <h1 className="text-3xl font-bold">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Customer Information</h2>
            <Link
              href={`/customers/${customer.id}/edit`}
              className="text-blue-500 hover:text-blue-700"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">Name</h3>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Type</h3>
              <p>{customer.type}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Email</h3>
              <p>{customer.email}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Phone</h3>
              <p>{customer.phone}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Address</h3>
              <p>{customer.address || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Customer Since</h3>
              <p>{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Customer Summary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm text-blue-500 mb-1">Total Projects</h3>
              <p className="text-2xl font-bold">{customer.projects.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm text-green-500 mb-1">Total Budget</h3>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm text-purple-500 mb-1">Total Value</h3>
              <p className="text-2xl font-bold">${totalProjectValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Project Status Breakdown</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              {customer.projects.length > 0 ? (
                <div className="flex rounded-full h-4 overflow-hidden">
                  {statusList.map(status => {
                    const count = customer.projects.filter(p => p.status === status).length;
                    const percentage = (count / customer.projects.length) * 100;
                    if (percentage === 0) return null;

                    let bgColor = 'bg-gray-500';
                    switch (status) {
                      case 'Planned': bgColor = 'bg-blue-500'; break;
                      case 'In Progress': bgColor = 'bg-yellow-500'; break;
                      case 'Completed': bgColor = 'bg-green-500'; break;
                      case 'Cancelled': bgColor = 'bg-red-500'; break;
                    }

                    return (
                      <div
                        key={status}
                        className={`${bgColor}`}
                        style={{ width: `${percentage}%` }}
                        title={`${status}: ${count} projects (${percentage.toFixed(1)}%)`}
                      ></div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 mt-1">No projects</div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {statusList.map(status => {
                const count = customer.projects.filter(p => p.status === status).length;
                if (count === 0) return null;

                let bgColor = 'bg-gray-500';
                switch (status) {
                  case 'Planned': bgColor = 'bg-blue-500'; break;
                  case 'In Progress': bgColor = 'bg-yellow-500'; break;
                  case 'Completed': bgColor = 'bg-green-500'; break;
                  case 'Cancelled': bgColor = 'bg-red-500'; break;
                }

                return (
                  <div key={status} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${bgColor} mr-1`}></div>
                    <span className="text-xs">{status} ({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Projects</h2>
          </div>

          {customer.projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Budget</th>
                    <th className="text-left p-2">Cost</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-left p-2">Start Date</th>
                    <th className="text-left p-2">Deadline</th>
                    <th className="text-left p-2">Completion Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.projects.map(project => (
                    <tr key={project.id} className="border-b">
                      <td className="p-2">{project.name}</td>
                      <td className="p-2">{project.budget != null ? `$${project.budget.toLocaleString()}` : '-'}</td>
                      <td className="p-2">{project.cost != null ? `$${project.cost.toLocaleString()}` : '-'}</td>
                      <td className="p-2">{renderStatusBadge(project.status)}</td>
                      <td className="p-2">{project.priority || '-'}</td>
                      <td className="p-2">{formatDate(project.startDate)}</td>
                      <td className="p-2">{formatDate(project.deadline)}</td>
                      <td className="p-2">{formatDate(project.completionDate)}</td>
                      <td className="p-2">
                        <Link href={`/projects/${project.id}`} className="text-blue-500 hover:text-blue-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded p-4 text-center">
              <p className="text-gray-500">No projects found for this customer.</p>
              <Link
                href={`/projects/new`}
                className="mt-2 text-blue-500 hover:text-blue-700 inline-block"
              >
                Create first project
              </Link>
            </div>
          )}
        </div>

        {/* Leads List */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Related Leads</h2>
          </div>

          {customer.leads && customer.leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.leads.map(lead => (
                    <tr key={lead.id} className="border-b">
                      <td className="p-2">{lead.email}</td>
                      <td className="p-2">{lead.phone}</td>
                      <td className="p-2">{lead.source || 'N/A'}</td>
                      <td className="p-2">{renderStatusBadge(lead.status)}</td>
                      <td className="p-2">
                        <Link href={`/leads/${lead.id}`} className="text-blue-500 hover:text-blue-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded p-4 text-center">
              <p className="text-gray-500">No leads associated with this customer.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}