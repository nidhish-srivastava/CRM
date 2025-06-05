'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [sortOption, setSortOption] = useState('recent');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Function to fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Convert sort option to API parameters
      let sortBy, sortOrder;
      switch (sortOption) {
        case 'name':
          sortBy = 'name';
          sortOrder = 'asc';
          break;
        case 'value':
          sortBy = 'value';
          sortOrder = 'desc';
          break;
        default:
          sortBy = 'updatedAt';
          sortOrder = 'desc';
      }
      
      const queryParams = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        pageSize: '10',
        sortBy,
        sortOrder
      });
      
      if (selectedType !== 'All Types') {
        queryParams.append('type', selectedType);
      }
      
      const response = await fetch(`/api/customers?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setTotalCustomers(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, selectedType, sortOption]);
  
  // Function to handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  // Function to add new customer
  const handleAddCustomer = () => {
    router.push('/customers/new');
  };
  
  // Function to edit customer
  const handleEditCustomer = (id) => {
    router.push(`/customers/${id}/edit`);
  };
  
  // Function to view customer details
  const handleViewCustomer = (id) => {
    router.push(`/customers/${id}`);
  };
  
  // Render status badge based on status value
  const renderStatusBadge = (status) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    switch (status) {
      case 'Pre-Installation':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'In Progress':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'Active':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Complete':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'Cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button 
          onClick={handleAddCustomer}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Customer
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
            placeholder="Search customers..." 
            className="border p-2 rounded w-full md:w-1/3"
            value={searchTerm}
            onChange={handleSearch}
          /> */}
          <select 
            className="border p-2 rounded"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All Types</option>
            <option>Residential</option>
            <option>Commercial</option>
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
            <option value="value">Sort by: Project Value</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading customers...</p>
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
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">System Size</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {customers.length > 0 ? (
        customers.map(customer => (
          <tr key={customer.id} className="hover:bg-gray-50">
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
              <div className="text-sm text-gray-900">{customer.email}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-sm text-gray-900">{customer.phone}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-sm text-gray-900">{customer.type}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-sm text-gray-900">{customer.systemSize}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {renderStatusBadge(customer.status)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => handleEditCustomer(customer.id)}
                >
                  Edit
                </button>
                <button 
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => handleViewCustomer(customer.id)}
                >
                  View
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
            No customers found. Try adjusting your search filters.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Showing {customers.length > 0 ? (currentPage - 1) * 10 + 1 : 0}-
                {Math.min(currentPage * 10, totalCustomers)} of {totalCustomers} customers
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