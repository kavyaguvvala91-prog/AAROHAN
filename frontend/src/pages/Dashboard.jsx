import { motion } from 'framer-motion';
import StreamTypeCard from '../components/StreamTypeCard';
import { STREAMS } from '../constants/streams';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-8 sm:p-10"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              College Discovery
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Simple college discovery and decision platform.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Explore engineering, polytechnic, medical, and law colleges with a clean flow for
              shortlisting and comparison.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Start simple</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a stream below to browse colleges, compare options, and save favorites.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="app-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="app-section-heading">Choose Your Stream</h2>
            <p className="app-section-copy mt-2">
              Each stream follows the same simple flow: discover, filter, compare, and decide.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STREAMS.map((stream, index) => (
          <motion.div
            key={stream.slug}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StreamTypeCard
              title={stream.name}
              description={stream.description}
              icon={stream.icon}
              slug={stream.slug}
            />
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
