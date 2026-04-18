import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Building2 } from 'lucide-react';
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
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 p-3 text-white shadow-lg shadow-blue-200/50">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="app-section-heading">College Catalog</h1>
              <p className="app-section-copy mt-2">
                Browse the full college collection, save favorites, and build a comparison shortlist.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Rich card view
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Selected: {selectedColleges.length} college{selectedColleges.length === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Choose at least two colleges from this page to compare them.
            </p>
          </div>

          <button
            type="button"
            onClick={proceedToCompare}
            disabled={selectedColleges.length < 2}
            className="app-button-primary"
          >
            Proceed to Compare
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.section>

      {loading && <Loader label="Loading colleges..." />}

      {error && (
        <div className="app-card flex items-center gap-2 border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          <div className="app-card flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">All colleges</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Showing {visibleColleges.length} college(s)
            </p>
          </div>

          {!visibleColleges.length ? (
            <div className="app-card border-dashed px-8 py-12 text-center text-sm text-slate-500">
              No colleges found. Try adjusting search or filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
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
