import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import CollegeDetails from './pages/CollegeDetails';
import Colleges from './pages/Colleges';
import Compare from './pages/Compare';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import StreamPage from './pages/StreamPage';
import './index.css';
import { FavoritesProvider } from './context/FavoritesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<App />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="stream/:type" element={<StreamPage />} />
                <Route path="college/:name" element={<CollegeDetails />} />
                <Route path="colleges" element={<Colleges />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="compare" element={<Compare />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>
);
