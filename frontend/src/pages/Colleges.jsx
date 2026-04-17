import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FilterX } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { fetchColleges, fetchFilteredColleges, getApiErrorMessage } from '../services/api';

const Colleges = () => {
  const { searchTerm } = useOutletContext();
  const [colleges, setColleges] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ location: '', maxFees: '', course: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchColleges();
        const data = response.data || [];
        setColleges(data);
        setAllColleges(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to fetch colleges from server.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const locationOptions = useMemo(() => [...new Set(allColleges.map((item) => item.location))].sort(), [allColleges]);
  const courseOptions = useMemo(() => [...new Set(allColleges.flatMap((item) => item.courses || []))].sort(), [allColleges]);

  const visibleColleges = useMemo(() => {
    if (!searchTerm) return colleges;
    return colleges.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [colleges, searchTerm]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        ...(filters.location && { location: filters.location }),
        ...(filters.maxFees && { maxFees: Number(filters.maxFees) }),
        ...(filters.course && { course: filters.course }),
      };

      const response = Object.keys(params).length > 0 ? await fetchFilteredColleges(params) : await fetchColleges();
      setColleges(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to apply filters.'));
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilters({ location: '', maxFees: '', course: '' });
    setLoading(true);
    setError('');

    try {
      const response = await fetchColleges();
      setColleges(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reload colleges.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-900">Colleges</h1>
        <p className="text-sm text-slate-600">Browse and filter colleges with live search from top bar.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select name="location" value={filters.location} onChange={handleFilterChange} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30">
            <option value="">All Locations</option>
            {locationOptions.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>

          <input name="maxFees" type="number" value={filters.maxFees} onChange={handleFilterChange} placeholder="Max Fees" className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30" />

          <select name="course" value={filters.course} onChange={handleFilterChange} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30">
            <option value="">All Courses</option>
            {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>

          <div className="flex gap-2">
            <button onClick={applyFilters} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg">Apply</button>
            <button onClick={resetFilters} className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50">
              <FilterX size={14} />
              Reset
            </button>
          </div>
        </div>
      </motion.section>

      {loading && <Loader label="Loading colleges..." />}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <section>
          <p className="mb-4 text-xs text-slate-500">Showing {visibleColleges.length} college(s)</p>

          {!visibleColleges.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No colleges found. Try adjusting search or filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleColleges.map((college, index) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <CollegeCard college={college} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Colleges;
