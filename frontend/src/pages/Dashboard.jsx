import { motion } from 'framer-motion';
import { BarChart3, Building2, GitCompareArrows, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  {
    title: 'Recommendation Engine',
    value: 'AI Scoring Enabled',
    icon: Sparkles,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'College Database',
    value: '12+ Colleges Seeded',
    icon: Building2,
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Smart Compare',
    value: 'Side-by-Side Insights',
    icon: GitCompareArrows,
    color: 'text-violet-600 bg-violet-50',
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-xl"
      >
        <p className="text-sm uppercase tracking-wider text-blue-100">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome to CollegeAI</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Discover your ideal college using AI-powered ranking, budget, and preference matching.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50">
            Start Recommendation
          </Link>
          <Link to="/colleges" className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500">
            Explore Colleges
          </Link>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-xl"
            >
              <div className={`mb-3 inline-flex rounded-xl p-2 ${item.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{item.value}</p>
            </motion.div>
          );
        })}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
      >
        <div className="flex items-center gap-2 text-blue-700">
          <BarChart3 size={18} />
          <h2 className="text-lg font-semibold">Getting Started</h2>
        </div>
        <ol className="mt-4 space-y-2 text-sm text-slate-600">
          <li>1. Use Home page to get AI recommendations by rank, budget, location, and course.</li>
          <li>2. Explore all colleges and narrow them with search and filters.</li>
          <li>3. Compare shortlisted colleges to make a confident decision.</li>
        </ol>
      </motion.section>
    </div>
  );
};

export default Dashboard;
