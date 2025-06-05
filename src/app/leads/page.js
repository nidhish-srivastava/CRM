'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortOption, setSortOption] = useState('recent');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const leadsPerPage = 10;

  // Function to fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Convert sort option to API parameters
      let sortBy, sortOrder;
      switch (sortOption) {
        case 'name':
          sortBy = 'name';
          sortOrder = 'asc';
          break;
        case 'leadScore':
          sortBy = 'leadScore';
          sortOrder = 'desc';
          break;
        default:
          sortBy = 'createdAt';
          sortOrder = 'desc';
      }
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: leadsPerPage.toString(),
        sortBy,
        sortOrder
      });
      
      if (statusFilter !== 'All Statuses') {
        queryParams.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/leads?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads);
      setTotalPages(Math.ceil(data.total / leadsPerPage));
      setTotalLeads(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchLeads();
  }, [currentPage, statusFilter, sortOption]);

  // Function to handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Filter locally since we're not sending the search to the API
  };

  // Filter leads based on search term (client-side filtering)
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  // Function to add new lead
  const handleAddLead = () => {
    router.push('/leads/new');
  };
  
  // Function to edit lead
  const handleEditLead = (id) => {
    router.push(`/leads/${id}/edit`);
  };
  
  // Function to view lead details
  const handleViewLead = (id) => {
    router.push(`/leads/${id}`);
  };

  // Status badge color mapping
  const renderStatusBadge = (status) => {
    const statusColors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Proposal': 'bg-purple-100 text-purple-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Management</h1>
        <button 
          onClick={handleAddLead}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Lead
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* <input 
            type="text" 
            placeholder="Search leads..." 
            className="border p-2 rounded w-full md:w-1/3"
            value={searchTerm}
            onChange={handleSearch}
          /> */}
          <select 
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Proposal</option>
            <option>Closed Won</option>
            <option>Closed Lost</option>
          </select>
          <select 
            className="border p-2 rounded"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="recent">Sort by: Recent</option>
            <option value="name">Sort by: Name (A-Z)</option>
            <option value="leadScore">Sort by: Lead Score</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading leads...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">{lead.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{lead.phone}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {renderStatusBadge(lead.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{new Date(lead.createdAt).toISOString().split('T')[0]}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditLead(lead.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleViewLead(lead.id)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No leads found. Try adjusting your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Showing {filteredLeads.length > 0 ? (currentPage - 1) * leadsPerPage + 1 : 0}-
                {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads} leads
              </p>
              <div className="flex gap-2">
                <button 
                  className={`border px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  // Create array of page numbers centered around current page
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`border px-3 py-1 rounded ${
                        currentPage === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className={`border px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}