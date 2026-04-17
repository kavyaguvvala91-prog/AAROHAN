import { motion } from 'framer-motion';
import StreamTypeCard from '../components/StreamTypeCard';
import { STREAMS } from '../constants/streams';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.55),_transparent_32%),linear-gradient(135deg,#0f172a,#1d4ed8_52%,#0891b2)] p-8 text-white shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Streams Dashboard</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
          Explore engineering, polytechnic, medical, and law colleges with one dynamic flow.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Open any stream to view colleges with rank, budget, location, and course filters powered
          by your backend datasets.
        </p>
      </motion.section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
