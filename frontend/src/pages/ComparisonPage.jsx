import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { compareColleges, getAllColleges } from '../services/api';

const ComparisonPage = () => {
  const [allColleges, setAllColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await getAllColleges();
        setAllColleges(response.data || []);
      } catch (err) {
        setError('Could not load colleges for comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const toggleSelection = (name) => {
    setSelectedColleges((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }
      return [...prev, name];
    });
  };

  const handleCompare = async () => {
    if (selectedColleges.length < 2) {
      setError('Please select at least two colleges to compare.');
      return;
    }

    setCompareLoading(true);
    setError('');

    try {
      const response = await compareColleges(selectedColleges);
      setComparisonData(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Comparison failed. Try again.');
      setComparisonData([]);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">College Comparison</h1>
        <p className="text-slate-600 text-sm mt-1">Select multiple colleges and view details side by side.</p>

        {loading ? (
          <div className="mt-4">
            <LoadingSpinner label="Loading college list..." />
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-auto pr-1">
            {allColleges.map((college) => (
              <label key={college._id} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={selectedColleges.includes(college.name)}
                  onChange={() => toggleSelection(college.name)}
                  className="mt-1"
                />
                <span className="text-sm text-slate-700">{college.name}</span>
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={compareLoading || loading}
          className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          {compareLoading ? 'Comparing...' : 'Compare Selected Colleges'}
        </button>

        {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
      </section>

      {compareLoading && <LoadingSpinner label="Fetching comparison data..." />}

      {!!comparisonData.length && !compareLoading && (
        <section className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-700">Field</th>
                {comparisonData.map((college) => (
                  <th key={college._id} className="text-left p-3 font-semibold text-slate-700">
                    {college.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Location</td>
                {comparisonData.map((college) => (
                  <td key={`${college._id}-location`} className="p-3">{college.location}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Fees</td>
                {comparisonData.map((college) => (
                  <td key={`${college._id}-fees`} className="p-3">INR {college.fees.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Avg Package</td>
                {comparisonData.map((college) => (
                  <td key={`${college._id}-package`} className="p-3">INR {college.avg_package.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Courses</td>
                {comparisonData.map((college) => (
                  <td key={`${college._id}-courses`} className="p-3">{(college.courses || []).join(', ')}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Cutoff Rank</td>
                {comparisonData.map((college) => (
                  <td key={`${college._id}-cutoff`} className="p-3">{college.cutoff_rank}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
};

export default ComparisonPage;