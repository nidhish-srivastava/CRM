// File: app/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  generateCalendarDays,
  formatAppointmentTime,
  formatDateString,
  getAppointmentTypeColor,
  appointmentTypes,
} from "@/lib/appointment.js";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);

  // Appointment form state
  const [newAppointment, setNewAppointment] = useState({
    type: appointmentTypes[0].value,
    date: "",
    time: "09:00",
    notes: "",
    projectId: 0,
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = new Date();

  const calendarDays = generateCalendarDays(currentYear, currentMonth, appointments);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch appointments
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const response = await fetch("/api/appointments");
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Fetch projects for the form dropdown
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        if (data.length > 0) {
          setNewAppointment(prev => ({ ...prev, projectId: data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    }

    fetchAppointments();
    fetchProjects();
  }, []);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle appointment form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Combine date and time
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: newAppointment.type,
          date: dateTime.toISOString(),
          notes: newAppointment.notes,
          projectId: parseInt(newAppointment.projectId.toString()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      // Refresh appointments
      const updatedAppointmentsRes = await fetch("/api/appointments");
      const updatedAppointments = await updatedAppointmentsRes.json();
      setAppointments(updatedAppointments);

      // Close modal and reset form
      setShowModal(false);
      setNewAppointment({
        type: appointmentTypes[0].value,
        date: "",
        time: "09:00",
        notes: "",
        projectId: 0,
      });
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to create appointment: " + err.message);
    }
  };

  // Get today's appointments
  const todaysAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  });

  // Format today's date
  const formattedToday = formatDateString(today);

  // Loading state
  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointment Calendar</h1>
        <button
          onClick={() => router.push("/appointments/new")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Schedule Appointment
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-xl font-bold mx-4">{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded">Month</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">Week</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">Day</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">List</button>
        </div>

        <div>
          <button onClick={goToToday} className="bg-blue-500 text-white px-3 py-1 rounded">Today</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b">
          <div className="p-2 text-center font-medium">Sunday</div>
          <div className="p-2 text-center font-medium">Monday</div>
          <div className="p-2 text-center font-medium">Tuesday</div>
          <div className="p-2 text-center font-medium">Wednesday</div>
          <div className="p-2 text-center font-medium">Thursday</div>
          <div className="p-2 text-center font-medium">Friday</div>
          <div className="p-2 text-center font-medium">Saturday</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 grid-rows-6 border-b">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 p-1 border-r border-b ${!day.isCurrentMonth ? 'text-gray-400' : ''} ${day.isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-right ${day.isToday ? 'font-bold' : ''}`}>{day.date}</div>

              {day.appointments.map((appointment) => {
                const color = getAppointmentTypeColor(appointment.type);
                return (
                  <div
                    key={appointment.id}
                    className={`bg-${color}-100 text-${color}-800 p-1 text-xs rounded mt-1 cursor-pointer hover:bg-${color}-200`}
                    title={`${appointment.project.customer.name} - ${appointment.notes || 'No notes'}`}
                  >
                    {formatAppointmentTime(new Date(appointment.date))} - {appointment.type} ({appointment.project.customer.name.split(' ')[0]})
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="font-bold mb-4">Today's Appointments ({formattedToday})</h2>

        {todaysAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled for today.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Project</th>
                <th className="text-left p-2">Notes</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments.map((appointment) => {
                const color = getAppointmentTypeColor(appointment.type);
                return (
                  <tr key={appointment.id} className="border-b">
                    <td className="p-2">{formatAppointmentTime(new Date(appointment.date))}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs bg-${color}-100 text-${color}-800`}>
                        {appointment.type}
                      </span>
                    </td>
                    <td className="p-2">{appointment.project.customer.name}</td>
                    <td className="p-2">{appointment.project.name}</td>
                    <td className="p-2">{appointment.notes || '-'}</td>
                    <td className="p-2">
                      <button className="text-blue-500 hover:text-blue-700 mr-2" onClick={()=>router.push(`appointments/${appointment.id}/edit`)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Schedule New Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Appointment Type</label>
                <select
                  name="type"
                  value={newAppointment.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.value}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Project</label>
                <select
                  name="projectId"
                  value={newAppointment.projectId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.customer.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={newAppointment.time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={newAppointment.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}