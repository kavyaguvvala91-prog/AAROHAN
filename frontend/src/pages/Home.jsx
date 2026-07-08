import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, Wand2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import RecommendationForm from '../components/RecommendationForm';
import { DEFAULT_CATEGORY, isValidCategory } from '../constants/categories';
import { fetchColleges, fetchRecommendations, getApiErrorMessage } from '../services/api';

const Home = () => {
  const { searchTerm } = useOutletContext();
  const [colleges, setColleges] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rank: '',
    budget: '',
    location: '',
    course: '',
    category: DEFAULT_CATEGORY,
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetchColleges();
        setColleges(response.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load location/course options.'));
      } finally {
        setBootLoading(false);
      }
    };

    loadOptions();
  }, []);

  const locations = useMemo(
    () => [...new Set(colleges.map((item) => item.location))].sort(),
    [colleges]
  );

  const courses = useMemo(
    () => [...new Set(colleges.flatMap((item) => item.courses || []))].sort(),
    [colleges]
  );

  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    return results.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [results, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsedRank = Number(formData.rank);
    const parsedBudget = Number(formData.budget);

    if (!Number.isFinite(parsedRank) || parsedRank < 1) {
      setError('Please enter a valid rank greater than 0.');
      setResults([]);
      return;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      setError('Please enter a valid budget.');
      setResults([]);
      return;
    }

    if (!isValidCategory(formData.category)) {
      setError('Please select a valid category.');
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchRecommendations({
        rank: parsedRank,
        budget: parsedBudget,
        location: formData.location,
        course: formData.course,
        category: formData.category,
      });

      setResults(response.data || []);
    } catch (err) {
      setResults([]);
      setError(getApiErrorMessage(err, 'Failed to fetch recommendations.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-8 sm:p-10"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              <Sparkles size={14} />
              Recommendation Engine
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Find the right college for you
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Compare and shortlist colleges across rank, budget, location, course, and category.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                <Wand2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Smarter recommendations</p>
                <p className="mt-1 text-sm text-slate-600">
                  Submit your preferences once and get category-aware college matches instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="app-section-heading">Plan your shortlist</h2>
            <p className="app-section-copy mt-2">
              Choose your filters and let the system prioritize colleges that best align with your academic and financial goals.
            </p>
          </div>
        </div>

        <RecommendationForm
          formData={formData}
          locations={locations}
          courses={courses}
          loading={loading}
          bootLoading={bootLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </motion.section>

      {bootLoading && <Loader label="Loading college data..." />}

      {error && (
        <div className="app-card flex items-center gap-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !filteredResults.length && !results.length && (
        <div className="app-card border-dashed px-8 py-12 text-center text-sm text-slate-500">
          Submit your preferences to view personalized recommendations.
        </div>
      )}

      {loading ? (
        <Loader label="Calculating best matches..." />
      ) : (
        !!results.length && (
          <section className="space-y-4">
            <div className="app-card flex flex-col gap-2 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="app-section-heading text-xl">Recommended Colleges</h2>
                <p className="app-section-copy mt-1">
                  A curated set of matches ranked for your current preferences.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Showing {filteredResults.length} result(s)
              </p>
            </div>

            {!filteredResults.length ? (
              <div className="app-card border-dashed px-8 py-12 text-center text-sm text-slate-500">
                No results found for search term "{searchTerm}".
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredResults.map((college) => (
                  <CollegeCard
                    key={college._id}
                    college={college}
                    showScore
                    category={formData.category || DEFAULT_CATEGORY}
                  />
                ))}
              </div>
            )}
          </section>
        )
      )}
    </div>
  );
};

export default Home;
