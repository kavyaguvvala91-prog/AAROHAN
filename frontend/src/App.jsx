import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

const App = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-slate-800">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        user={user}
        onLogout={logout}
      />

      <div className="lg:pl-72">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
          user={user}
          onLogout={logout}
        />

        <main className="px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

export default App;
