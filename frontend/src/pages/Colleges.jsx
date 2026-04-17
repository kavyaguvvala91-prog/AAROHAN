import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { fetchColleges, getApiErrorMessage } from '../services/api';

const Colleges = () => {
  const { searchTerm } = useOutletContext();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchColleges();
        const data = response.data || [];
        setColleges(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to fetch colleges from server.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visibleColleges = useMemo(() => {
    if (!searchTerm) return colleges;
    return colleges.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [colleges, searchTerm]);
  const selectedIds = useMemo(
    () => new Set(selectedColleges.map((college) => college._id)),
    [selectedColleges]
  );

  const toggleCollegeSelection = (college) => {
    setSelectedColleges((prev) =>
      prev.some((item) => item._id === college._id)
        ? prev.filter((item) => item._id !== college._id)
        : [...prev, college]
    );
  };

  const proceedToCompare = () => {
    if (selectedColleges.length < 2) {
      return;
    }

    navigate('/compare', {
      state: {
        selectedColleges,
      },
    });
  };

  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-900">Colleges</h1>
        <p className="text-sm text-slate-600">
          Search colleges from the top bar and select at least two cards to compare them.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Selected: {selectedColleges.length} college{selectedColleges.length === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-slate-500">
              Choose at least two colleges from this page to compare them.
            </p>
          </div>

          <button
            type="button"
            onClick={proceedToCompare}
            disabled={selectedColleges.length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to Compare
            <ArrowRight size={16} />
          </button>
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
                  <CollegeCard
                    college={college}
                    selectable
                    selected={selectedIds.has(college._id)}
                    onSelect={toggleCollegeSelection}
                    selectionLabel="Add to comparison"
                  />
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
