'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Residential'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  
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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }
      
      const newCustomer = await response.json();
      router.push(`/customers/${newCustomer.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Customer</h1>
      
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
            onClick={() => router.push('/customers')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </main>
  );
}