import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const destination = isAuthenticated ? '/dashboard' : '/login';
  const label = isAuthenticated ? 'Back to dashboard' : 'Go to login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          to={destination}
          className="mt-8 inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          {label}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
