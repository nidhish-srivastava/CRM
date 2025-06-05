import { Inter } from 'next/font/google';
import './globals.css';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import AuthProvider from '@/components/AuthSessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CRM',
  description: 'Customer Relationship Management for Secure Blink',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar Navigation */}
          <SideBar/>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Top Navigation */}
            <Header/>
            {/* Page Content */}
            {children}
          </div>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}