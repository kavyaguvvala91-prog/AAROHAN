import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { fetchColleges, getApiErrorMessage } from '../services/api';
import { getStreamBySlug } from '../constants/streams';

const StreamPage = () => {
  const { type } = useParams();
  const { searchTerm } = useOutletContext();
  const navigate = useNavigate();
  const stream = useMemo(() => getStreamBySlug(decodeURIComponent(type || '')), [type]);

  const [catalogColleges, setCatalogColleges] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formFilters, setFormFilters] = useState({
    rank: '',
    budget: '',
    location: '',
    course: '',
  });
  const [activeFilters, setActiveFilters] = useState({
    rank: '',
    budget: '',
    location: '',
    course: '',
  });
  const hasActiveFilters = useMemo(
    () => Object.values(activeFilters).some(Boolean),
    [activeFilters]
  );

  useEffect(() => {
    const loadStreamCatalog = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchColleges({ type: stream.name });
        const data = response.data || [];
        setCatalogColleges(data);
        setColleges(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load stream colleges.'));
        setCatalogColleges([]);
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    if (stream?.name) {
      loadStreamCatalog();
    } else {
      setLoading(false);
      setCatalogColleges([]);
      setColleges([]);
      setError('This stream is not available on the dashboard.');
    }
  }, [stream]);

  useEffect(() => {
    if (!stream?.name || !hasActiveFilters) {
      if (stream?.name) {
        setColleges(catalogColleges);
      }
      return;
    }

    const loadStreamColleges = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchColleges({
          type: stream.name,
          ...(activeFilters.rank && { rank: Number(activeFilters.rank) }),
          ...(activeFilters.budget && { budget: Number(activeFilters.budget) }),
          ...(activeFilters.location && { location: activeFilters.location }),
          ...(activeFilters.course && { course: activeFilters.course }),
        });
        setColleges(response.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load stream colleges.'));
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    if (stream?.name) {
      loadStreamColleges();
    }
  }, [catalogColleges, hasActiveFilters, stream, activeFilters]);

  const locationOptions = useMemo(
    () => [...new Set(catalogColleges.map((college) => college.location))].sort(),
    [catalogColleges]
  );
  const courseOptions = useMemo(
    () => [...new Set(catalogColleges.flatMap((college) => college.courses || []))].sort(),
    [catalogColleges]
  );

  const visibleColleges = useMemo(() => {
    return colleges.filter((college) => {
      const matchesSearch = searchTerm
        ? college.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesSearch;
    });
  }, [colleges, searchTerm]);

  const selectedIds = useMemo(
    () => new Set(selectedColleges.map((college) => college._id)),
    [selectedColleges]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFormFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveFilters(formFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      rank: '',
      budget: '',
      location: '',
      course: '',
    };
    setFormFilters(emptyFilters);
    setActiveFilters(emptyFilters);
  };

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
        stream: stream?.name || '',
        selectedColleges,
      },
    });
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-slate-900">{stream?.name || 'Stream'} Colleges</h1>
        <p className="mt-1 text-sm text-slate-600">
          Select a stream-specific shortlist first, then compare only those colleges.
        </p>

        <form onSubmit={handleSearch} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="number"
            name="rank"
            value={formFilters.rank}
            onChange={handleFilterChange}
            placeholder="Your Rank"
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />

          <input
            type="number"
            name="budget"
            value={formFilters.budget}
            onChange={handleFilterChange}
            placeholder="Max Budget"
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />

          <select
            name="location"
            value={formFilters.location}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            <option value="">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            name="course"
            value={formFilters.course}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            <option value="">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <div className="flex gap-3 md:col-span-2 xl:col-span-1">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              <Search size={16} />
              Find Colleges
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <SlidersHorizontal size={16} />
              Reset
            </button>
          </div>
        </form>
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
              Pick at least two colleges from {stream?.name || 'this stream'} to continue.
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

      {loading && <Loader label={`Loading ${stream?.name || 'stream'} colleges...`} />}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <section>
          <p className="mb-4 text-xs text-slate-500">
            Showing {visibleColleges.length} college(s)
          </p>

          {!visibleColleges.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No colleges found for the selected filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleColleges.map((college, index) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0, y: 14 }}
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

export default StreamPage;
