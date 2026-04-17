import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import RecommendationForm from '../components/RecommendationForm';
import { fetchColleges, fetchRecommendations, getApiErrorMessage } from '../services/api';

const Home = () => {
  const { searchTerm } = useOutletContext();
  const [colleges, setColleges] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ rank: '', budget: '', location: '', course: '', category: '' });

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
    setLoading(true);
    setError('');

    try {
      const response = await fetchRecommendations({
        rank: Number(formData.rank),
        budget: Number(formData.budget),
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
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
      >
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles size={18} />
          <h1 className="text-2xl font-bold">AI Recommendation Engine</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Find colleges by rank, budget, preferred location, course, and caste category.
        </p>

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
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && !filteredResults.length && !!results.length === false && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Submit your preferences to view recommendations.
        </div>
      )}

      {loading ? (
        <Loader label="Calculating best matches..." />
      ) : (
        !!results.length && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recommended Colleges</h2>
              <p className="text-xs text-slate-500">Showing {filteredResults.length} result(s)</p>
            </div>

            {!filteredResults.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                No results found for search term "{searchTerm}".
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredResults.map((college) => (
                  <CollegeCard key={college._id} college={college} showScore />
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
