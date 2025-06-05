// app/leads/[id]/edit/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditLeadPage({ params }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'New',
    source: '',
    notes: '',
    leadScore: 0,
    customerId: null
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch lead data
  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/leads/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch lead');
        }
        
        const lead = await response.json();
        setFormData({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address || '',
          status: lead.status,
          source: lead.source || '',
          notes: lead.notes || '',
          leadScore: lead.leadScore || 0,
          customerId: lead.customerId
        });
      } catch (error) {
        setError('Failed to load lead details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch customers for dropdown
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data.customers);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    }
    
    fetchLead();
    fetchCustomers();
  }, [params.id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'leadScore' || name === 'customerId' 
        ? value === '' ? null : parseInt(value) 
        : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lead');
      }
      
      router.push(`/leads/${params.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-6 text-center">Loading lead data...</div>;
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Lead</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/leads/${params.id}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Lead
          </button>
          <button
            onClick={() => router.push('/leads')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            All Leads
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Website, Referral, etc."
            />
          </div>
          
          <div>
            <label className="block mb-2">Lead Score</label>
            <input
              type="number"
              name="leadScore"
              value={formData.leadScore || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
            />
          </div>
          
          <div>
            <label className="block mb-2">Associated Customer</label>
            <select
              name="customerId"
              value={formData.customerId || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">None</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.type})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          ></textarea>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            {loading ? 'Updating...' : 'Update Lead'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/leads/${params.id}`)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}