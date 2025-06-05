'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    cost: '',
    status: 'Planned',
    startDate: '',
    deadline: '',
    completionDate: '',
    priority: '',
    customerId: ''
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  useEffect(() => {
    // Fetch project data
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        const project = await response.json();

        // Format dates for input fields
        setFormData({
          name: project.name || '',
          description: project.description || '',
          budget: project.budget != null ? project.budget.toString() : '',
          cost: project.cost != null ? project.cost.toString() : '',
          status: project.status || 'Planned',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
          completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : '',
          priority: project.priority || '',
          customerId: project.customerId ? project.customerId.toString() : ''
        });
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch customers for the dropdown
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data.customers);
      } catch (err) {
        setError(err.message);
      }
    };

    Promise.all([fetchProjectData(), fetchCustomers()])
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare payload for API
    const payload = {
      name: formData.name,
      description: formData.description || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      status: formData.status || 'Planned',
      startDate: formData.startDate ? formData.startDate : null,
      deadline: formData.deadline ? formData.deadline : null,
      completionDate: formData.completionDate ? formData.completionDate : null,
      priority: formData.priority || null,
      customerId: parseInt(formData.customerId)
    };

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading project data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Project Name
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="customerId">
              Customer
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="budget">
              Budget
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="number"
              step="0.01"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="cost">
              Cost
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="number"
              step="0.01"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="status">
              Status
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="priority">
              Priority
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="">Select priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="startDate">
              Start Date
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="deadline">
              Deadline
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="completionDate">
              Completion Date
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              id="completionDate"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 p-2 rounded"
              id="description"
              name="description"
              rows="4"
              value={formData.description || ""}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            onClick={() => router.push(`/projects/${projectId}`)}
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