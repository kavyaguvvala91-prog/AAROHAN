import { useEffect, useMemo, useState } from 'react';
import CollegeCard from '../components/CollegeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllColleges, getFilteredColleges } from '../services/api';

const CollegesPage = () => {
  const [colleges, setColleges] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    maxFees: '',
    course: '',
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await getAllColleges();
        const list = response.data || [];
        setColleges(list);
        setAllColleges(list);
      } catch (err) {
        setError('Could not fetch colleges. Please ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const locationOptions = useMemo(() => {
    return [...new Set(allColleges.map((college) => college.location))].sort();
  }, [allColleges]);

  const courseOptions = useMemo(() => {
    return [...new Set(allColleges.flatMap((college) => college.courses || []))].sort();
  }, [allColleges]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...(filters.location && { location: filters.location }),
        ...(filters.maxFees && { maxFees: Number(filters.maxFees) }),
        ...(filters.course && { course: filters.course }),
      };

      const response = Object.keys(payload).length
        ? await getFilteredColleges(payload)
        : await getAllColleges();

      setColleges(response.data || []);
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({ location: '', maxFees: '', course: '' });
    setLoading(true);

    try {
      const response = await getAllColleges();
      setColleges(response.data || []);
    } catch (err) {
      setError('Could not reload colleges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h1 className="text-2xl font-bold text-slate-900">College Explorer</h1>
        <p className="text-slate-600 mt-1 text-sm">Browse colleges and refine results with filters.</p>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            name="location"
            value={filters.location}
            onChange={handleInputChange}
            className="rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="maxFees"
            value={filters.maxFees}
            onChange={handleInputChange}
            placeholder="Max Fees"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <select
            name="course"
            value={filters.course}
            onChange={handleInputChange}
            className="rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button onClick={applyFilters} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-2 text-sm font-medium">
              Apply
            </button>
            <button onClick={clearFilters} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium">
              Reset
            </button>
          </div>
        </div>
      </section>

      {loading && <LoadingSpinner label="Loading colleges..." />}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <section>
          <p className="text-sm text-slate-600 mb-4">Showing {colleges.length} colleges</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {colleges.map((college) => (
              <CollegeCard key={college._id} college={college} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CollegesPage;