// app/page.js
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardStats from '@/components/DashboardStats';
import RecentLeads from '@/components/RecentLeads';
import UpcomingAppointments from '@/components/UpcomingAppointments';

export default async function Home() {
  // Get the session using Next-Auth
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session) {
    redirect('/login');
  }
  
  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {session.user.name || session.user.email}
        </div>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <RecentLeads />
        <UpcomingAppointments />
      </div>
    </main>
  );
}