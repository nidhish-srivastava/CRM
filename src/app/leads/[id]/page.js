// app/leads/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadDetailPage({ params }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/leads/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Lead not found');
          }
          throw new Error('Failed to fetch lead');
        }
        
        const data = await response.json();
        setLead(data);
      } catch (error) {
        setError(error.message);
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLead();
  }, [params.id]);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      
      // Redirect to leads page after successful deletion
      router.push('/leads');
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-6 text-center">Loading lead details...</div>;
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/leads')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Leads
        </button>
      </div>
    );
  }
  
  if (!lead) return null;
  
  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Qualified': 'bg-green-100 text-green-800',
    'Proposal': 'bg-purple-100 text-purple-800',
    'Closed Won': 'bg-green-100 text-green-800',
    'Closed Lost': 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lead Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/leads')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Leads
          </button>
          <button
            onClick={() => router.push(`/leads/${params.id}/edit`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit Lead
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{lead.name}</h2>
            <p className="text-gray-500">{lead.email} | {lead.phone}</p>
          </div>
          <div>
            <span className={`px-3 py-1 rounded text-sm ${statusColors[lead.status] || 'bg-gray-100'}`}>
              {lead.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p className="mb-1"><span className="font-medium">Email:</span> {lead.email}</p>
            <p className="mb-1"><span className="font-medium">Phone:</span> {lead.phone}</p>
            {lead.address && (
              <p className="mb-1"><span className="font-medium">Address:</span> {lead.address}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Lead Information</h3>
            <p className="mb-1"><span className="font-medium">Status:</span> {lead.status}</p>
            {lead.source && (
              <p className="mb-1"><span className="font-medium">Source:</span> {lead.source}</p>
            )}
            {lead.leadScore !== null && (
              <p className="mb-1"><span className="font-medium">Lead Score:</span> {lead.leadScore}</p>
            )}
            <p className="mb-1">
              <span className="font-medium">Created:</span> {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {lead.customer && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Associated Customer</h3>
            <div className="p-4 bg-gray-50 rounded">
              <p className="mb-1"><span className="font-medium">Name:</span> {lead.customer.name}</p>
              <p className="mb-1"><span className="font-medium">Type:</span> {lead.customer.type}</p>
              <button 
                onClick={() => router.push(`/customers/${lead.customer.id}`)}
                className="text-blue-500 hover:text-blue-700 text-sm mt-2"
              >
                View Customer Profile
              </button>
            </div>
          </div>
        )}
        
        {lead.notes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <div className="p-4 bg-gray-50 rounded whitespace-pre-line">
              {lead.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}