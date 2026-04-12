import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

export const AppLayout = () => (
  <div className="bg-background text-on-background min-h-screen overflow-hidden">
    <Navbar />
    <div className="flex pt-16 h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64 flex overflow-y-auto flex-col">
        <Outlet />
      </main>
    </div>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { 
          background: '#171f33', 
          color: '#dae2fd', 
          border: '1px solid rgba(140, 144, 159, 0.3)', 
          fontFamily: 'Inter, sans-serif' 
        },
        success: { iconTheme: { primary: '#adc6ff', secondary: '#171f33' } },
        error:   { iconTheme: { primary: '#ffb4ab', secondary: '#171f33' } }
      }}
    />
  </div>
);

