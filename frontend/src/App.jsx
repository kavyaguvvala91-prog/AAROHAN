import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const App = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 text-slate-800">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default App;
