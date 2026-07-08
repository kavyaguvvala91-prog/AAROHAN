import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const destination = isAuthenticated ? '/dashboard' : '/login';
  const label = isAuthenticated ? 'Back to dashboard' : 'Go to login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          to={destination}
          className="mt-8 inline-flex items-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {label}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
