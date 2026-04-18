import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import { registerUser, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    setSuccessMessage('');

    try {
      const response = await registerUser(formData);
      setSuccessMessage(response.message || 'Registration successful. Please login.');
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to register. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.24),_transparent_24%),linear-gradient(135deg,#f0fdf4,#f8fafc,#eef2ff)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-violet-200/30 backdrop-blur xl:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 p-8 sm:p-10 xl:order-1">
          <div className="mb-8 text-center xl:text-left">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-200/50 xl:mx-0">
              <UserPlus size={24} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Register</h2>
            <p className="mt-2 text-sm text-slate-500">Create your account to start exploring smarter.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="app-input"
                placeholder="Enter your name"
              />
            </div>

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
                minLength={6}
                className="app-input"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <button type="submit" disabled={submitting} className="app-button-primary w-full">
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 xl:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:text-violet-700">
              Login
            </Link>
          </p>
        </div>

        <div className="order-1 hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(16,185,129,0.72),rgba(37,99,235,0.7)),url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-10 text-white xl:order-2 xl:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
            <Sparkles size={14} />
            Join Aarohan
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Build your personalized college journey.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-blue-50">
            Create an account to save favorites, compare options, and revisit recommendations in one clean, modern workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
