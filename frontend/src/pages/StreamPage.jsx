import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { CATEGORY_OPTIONS, DEFAULT_CATEGORY, isValidCategory } from '../constants/categories';
import { getStreamBySlug } from '../constants/streams';
import { fetchColleges, getApiErrorMessage } from '../services/api';

const createDefaultFilters = () => ({
  rank: '',
  budget: '',
  category: DEFAULT_CATEGORY,
  location: '',
  course: '',
});

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
  const [formFilters, setFormFilters] = useState(() => createDefaultFilters());
  const [activeFilters, setActiveFilters] = useState(() => createDefaultFilters());
  const hasActiveFilters = useMemo(
    () =>
      Object.entries(activeFilters).some(([key, value]) =>
        key === 'category' ? value !== DEFAULT_CATEGORY : Boolean(value)
      ),
    [activeFilters]
  );

  useEffect(() => {
    const loadStreamCatalog = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchColleges({ type: stream.name, category: DEFAULT_CATEGORY });
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
          ...(activeFilters.category && { category: activeFilters.category }),
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

    loadStreamColleges();
  }, [catalogColleges, hasActiveFilters, stream, activeFilters]);

  const locationOptions = useMemo(
    () => [...new Set(catalogColleges.map((college) => college.location))].sort(),
    [catalogColleges]
  );
  const courseOptions = useMemo(
    () => [...new Set(catalogColleges.flatMap((college) => college.courses || []))].sort(),
    [catalogColleges]
  );

  const visibleColleges = useMemo(
    () =>
      colleges.filter((college) =>
        searchTerm ? college.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
      ),
    [colleges, searchTerm]
  );

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

    if (formFilters.rank && (!Number.isFinite(Number(formFilters.rank)) || Number(formFilters.rank) < 1)) {
      setError('Please enter a valid rank greater than 0.');
      return;
    }

    if (
      formFilters.budget &&
      (!Number.isFinite(Number(formFilters.budget)) || Number(formFilters.budget) < 0)
    ) {
      setError('Please enter a valid budget.');
      return;
    }

    if (!isValidCategory(formFilters.category)) {
      setError('Please select a valid category.');
      return;
    }

    setError('');
    setActiveFilters(formFilters);
  };

  const clearFilters = () => {
    setFormFilters(createDefaultFilters());
    setActiveFilters(createDefaultFilters());
    setError('');
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
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-6 sm:p-8"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              {stream?.name || 'Stream'} Explorer
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {stream?.name || 'Stream'} Colleges
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Filter colleges by your rank, budget, category, location, and preferred course.
            </p>
          </div>
          <div className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            Dynamic shortlist
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <input
            type="number"
            name="rank"
            min="1"
            value={formFilters.rank}
            onChange={handleFilterChange}
            placeholder="Your Rank"
            className="app-input"
          />

          <input
            type="number"
            name="budget"
            min="0"
            value={formFilters.budget}
            onChange={handleFilterChange}
            placeholder="Max Budget"
            className="app-input"
          />

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Select Your Category
            </label>
            <select
              name="category"
              value={formFilters.category}
              onChange={handleFilterChange}
              className="app-select"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <select
            name="location"
            value={formFilters.location}
            onChange={handleFilterChange}
            className="app-select"
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
            className="app-select"
          >
            <option value="">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <div className="flex gap-3 md:col-span-2 xl:col-span-1">
            <button type="submit" className="app-button-primary flex-1">
              <Search size={16} />
              Find Colleges
            </button>

            <button type="button" onClick={clearFilters} className="app-button-secondary px-4">
              <SlidersHorizontal size={16} />
              Reset
            </button>
          </div>
        </form>
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
              Pick at least two colleges from {stream?.name || 'this stream'} to continue.
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

      {loading && <Loader label={`Loading ${stream?.name || 'stream'} colleges...`} />}

      {error && (
        <div className="app-card flex items-center gap-2 border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          <div className="app-card flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">Results</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Showing {visibleColleges.length} college(s)
            </p>
          </div>

          {!visibleColleges.length ? (
            <div className="app-card border-dashed px-8 py-12 text-center text-sm text-slate-500">
              No colleges found for the selected filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
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
                    category={activeFilters.category || DEFAULT_CATEGORY}
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
