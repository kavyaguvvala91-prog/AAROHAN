import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeIndianRupee, Trophy } from 'lucide-react';
import Loader from '../components/Loader';
import { fetchColleges, fetchComparedColleges, getApiErrorMessage } from '../services/api';

const Compare = () => {
  const [allColleges, setAllColleges] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchColleges();
        setAllColleges(response.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load college list for comparison.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const bestFees = useMemo(() => (result.length ? Math.min(...result.map((item) => item.fees)) : null), [result]);
  const bestPackage = useMemo(() => (result.length ? Math.max(...result.map((item) => item.avg_package)) : null), [result]);

  const toggleCollege = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const compareSelected = async () => {
    if (selected.length < 2) {
      setError('Please select at least two colleges.');
      return;
    }

    setComparing(true);
    setError('');

    try {
      const response = await fetchComparedColleges(selected);
      setResult(response.data || []);
    } catch (err) {
      setResult([]);
      setError(getApiErrorMessage(err, 'Comparison failed.'));
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">Compare Colleges</h1>
        <p className="text-sm text-slate-600">Select colleges and compare important metrics side-by-side.</p>

        {loading ? (
          <div className="mt-4"><Loader label="Loading colleges..." /></div>
        ) : (
          <div className="mt-4 grid max-h-72 gap-2 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {allColleges.map((college) => (
              <label key={college._id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition hover:scale-[1.01] hover:bg-blue-50">
                <input type="checkbox" checked={selected.includes(college.name)} onChange={() => toggleCollege(college.name)} className="mt-1" />
                {college.name}
              </label>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={compareSelected}
          disabled={comparing || loading}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
        >
          {comparing ? 'Comparing...' : 'Compare Selected'}
        </motion.button>
      </motion.section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {comparing && <Loader label="Preparing comparison..." />}

      {!comparing && !!result.length && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.map((college) => (
            <motion.article
              key={college._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-900">{college.name}</h3>
              <p className="text-sm text-slate-500">{college.location}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${college.fees === bestFees ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-700'}`}>
                  <span className="flex items-center gap-1"><BadgeIndianRupee size={14} /> Fees</span>
                  <span className="font-semibold">{college.fees.toLocaleString()}</span>
                </div>

                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${college.avg_package === bestPackage ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-700'}`}>
                  <span className="flex items-center gap-1"><Trophy size={14} /> Avg Package</span>
                  <span className="font-semibold">{college.avg_package.toLocaleString()}</span>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                  <p className="text-xs text-slate-500">Cutoff Rank</p>
                  <p className="font-semibold">{college.cutoff_rank}</p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                  <p className="text-xs text-slate-500">Courses</p>
                  <p className="font-medium">{(college.courses || []).join(', ')}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Compare;
