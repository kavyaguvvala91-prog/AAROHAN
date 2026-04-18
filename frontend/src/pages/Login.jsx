import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import { loginUser, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await loginUser(formData);
      login({
        token: response.token,
        user: response.user,
      });

      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to login. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.22),_transparent_24%),linear-gradient(135deg,#eff6ff,#f8fafc,#f5f3ff)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-blue-200/30 backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(37,99,235,0.82),rgba(124,58,237,0.7)),url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-10 text-white xl:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
            <Sparkles size={14} />
            Welcome back
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Sign in to continue your college search.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-blue-100">
            Access your saved favorites, compare shortlisted colleges, and continue with a polished, insight-rich decision flow.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center xl:text-left">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-200/50 xl:mx-0">
              <LogIn size={24} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Access your interactive college dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="app-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="app-input"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="app-button-primary w-full">
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 xl:text-left">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:text-violet-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
