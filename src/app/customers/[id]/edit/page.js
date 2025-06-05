'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditCustomerPage() {
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Residential'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  
  useEffect(() => {
    // Fetch customer data
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        
        const customer = await response.json();
        setFormData({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || '',
          type: customer.type
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [customerId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }
      
      router.push(`/customers/${customerId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  if (loading && !formData.name) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading customer data...</div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Customer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Customer Name
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="type">
              Customer Type
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            onClick={() => router.push(`/customers/${customerId}`)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}