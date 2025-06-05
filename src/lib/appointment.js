
export function getDaysInMonth(year, month ){
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function generateCalendarDays(
  year,
  month,
  appointments
){
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const daysInPrevMonth = month === 0 
    ? getDaysInMonth(year - 1, 11) 
    : getDaysInMonth(year, month - 1);
  
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const days = [];
  
  // Add days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    days.push({
      date: day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: false,
      appointments: filterAppointmentsForDay(appointments, day, prevMonth, prevYear),
    });
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: day,
      month,
      year,
      isCurrentMonth: true,
      isToday: day === currentDate && month === currentMonth && year === currentYear,
      appointments: filterAppointmentsForDay(appointments, day, month, year),
    });
  }
  
  // Add days from next month
  const totalDaysNeeded = 42; // 6 rows of 7 days
  const remainingDays = totalDaysNeeded - days.length;
  
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    days.push({
      date: day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: false,
      appointments: filterAppointmentsForDay(appointments, day, nextMonth, nextYear),
    });
  }
  
  return days;
}

function filterAppointmentsForDay(
  appointments,
  day,
  month,
  year
) {
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === day &&
      appointmentDate.getMonth() === month &&
      appointmentDate.getFullYear() === year
    );
  });
}

export function formatAppointmentTime(date){
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateString(date){
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export const appointmentTypes = [
  { value: "Site Assessment", color: "blue" },
  { value: "Proposal Meeting", color: "purple" },
  { value: "Installation", color: "green" },
  { value: "Inspection", color: "yellow" },
  { value: "Maintenance", color: "orange" },
  { value: "Follow-up", color: "indigo" }
];

export function getAppointmentTypeColor(type){
  const appointmentType = appointmentTypes.find(t => t.value === type);
  return appointmentType?.color || "gray";
}