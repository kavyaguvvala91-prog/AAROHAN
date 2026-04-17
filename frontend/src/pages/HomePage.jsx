import { useEffect, useMemo, useState } from 'react';
import RecommendationResults from '../components/RecommendationResults';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllColleges, getRecommendations } from '../services/api';
import { defaultCourses, defaultLocations } from '../constants/options';

const HomePage = () => {
  const [formData, setFormData] = useState({
    rank: '',
    budget: '',
    location: '',
    course: '',
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [error, setError] = useState('');
  const [allColleges, setAllColleges] = useState([]);

  useEffect(() => {
    const loadCollegeOptions = async () => {
      try {
        const response = await getAllColleges();
        setAllColleges(response.data || []);
      } catch (err) {
        setError('Could not load college options. Please check backend server.');
      } finally {
        setBootstrapLoading(false);
      }
    };

    loadCollegeOptions();
  }, []);

  const locationOptions = useMemo(() => {
    const fromAPI = allColleges.map((college) => college.location);
    return [...new Set([...defaultLocations, ...fromAPI])].sort();
  }, [allColleges]);

  const courseOptions = useMemo(() => {
    const fromAPI = allColleges.flatMap((college) => college.courses || []);
    return [...new Set([...defaultCourses, ...fromAPI])].sort();
  }, [allColleges]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await getRecommendations({
        rank: Number(formData.rank),
        budget: Number(formData.budget),
        location: formData.location,
        course: formData.course,
      });

      setRecommendations(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch recommendations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI-Powered College Recommendation</h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base">
          Enter your rank, budget, preferred location, and course to discover best-fit colleges.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Rank</span>
            <input
              type="number"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. 4500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Budget (INR)</span>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. 250000"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Location</span>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Course</span>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select course</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={loading || bootstrapLoading}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              {loading ? 'Finding Colleges...' : 'Get Recommendations'}
            </button>
          </div>
        </form>

        {bootstrapLoading && <div className="mt-4"><LoadingSpinner label="Loading dropdown options..." /></div>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </section>

      {loading ? <LoadingSpinner label="Scoring colleges for you..." /> : <RecommendationResults colleges={recommendations} />}
    </main>
  );
};

export default HomePage;