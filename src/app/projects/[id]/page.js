'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDetailPage({ params }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isClickedOnDelete,setIsClickedOnDelete] = useState(false)

  const router = useRouter();
  const projectId = params.id;
  let fetchProject
  useEffect(() => {
    if (!projectId) return;
    
    fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project details');
        }
        
        const data = await response.json();
        setProject(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId,isClickedOnDelete]);
  
  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      router.push('/projects');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }
      setIsClickedOnDelete((prev)=>!prev)
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment: " + err.message);
    } finally {
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading project details...</div>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }
  
  if (!project) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Project not found</div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/projects">
          <span className="text-blue-500 hover:text-blue-700">← Back to Projects</span>
        </Link>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center mt-2">
            <span className="text-lg">{project.customer.name}</span>
            <span className="mx-2">•</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {project.customer.type}
            </span>
            <span className="mx-2">•</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {project.status}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push(`/projects/${projectId}/edit`)}
          >
            Edit Project
          </button>
          <button 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete Project
          </button>
        </div>
      </div>
      
      {/* Project Overview */}
          {/* Project Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Budget</p>
            <p className="font-medium">{project.budget != null ? formatCurrency(project.budget) : 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Cost</p>
            <p className="font-medium">{project.cost != null ? formatCurrency(project.cost) : 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-600">Priority</p>
            <p className="font-medium">{project.priority || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium">{project.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Start Date</p>
            <p className="font-medium">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">Deadline</p>
            <p className="font-medium">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-gray-600">Completion Date</p>
            <p className="font-medium">{formatDate(project.completionDate)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600">Description</p>
            <p>{project.description || 'No description provided'}</p>
          </div>
        </div>
      </div>
      
      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{project.customer.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{project.customer.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{project.customer.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">{project.customer.address || 'No address provided'}</p>
          </div>
        </div>
      </div>
      
      {/* Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Appointments</h2>
          <button 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            onClick={() => router.push(`/appointments/new`)}
          >
            Add Appointment
          </button>
        </div>
        
        {project.appointments && project.appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
{project.appointments.map((appointment) => {
  return (
    <tr key={appointment.id} className="border-t">
      <td className="p-2">{appointment.type}</td>
      <td className="p-2">{formatDate(appointment.date)}</td>
      <td className="p-2">{appointment.notes || 'No notes'}</td>
      <td className="p-2 text-right">
        <button
          className="text-blue-500 hover:text-blue-700 mr-2"
          onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
        >
          Edit
        </button>
        <button 
          className="text-red-500 hover:text-red-700"
          onClick={()=>handleDeleteAppointment(appointment.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No appointments scheduled</div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button 
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}