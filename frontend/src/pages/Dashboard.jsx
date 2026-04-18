import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Server, Sparkles, Wand2 } from 'lucide-react';
import StreamTypeCard from '../components/StreamTypeCard';
import { STREAMS } from '../constants/streams';
import { getApiStatus, subscribeToApiStatus } from '../services/api';

const Dashboard = () => {
  const [apiStatus, setApiStatus] = useState(() => getApiStatus());

  useEffect(() => {
    const unsubscribe = subscribeToApiStatus((nextStatus) => {
      setApiStatus(nextStatus);
    });

    return unsubscribe;
  }, []);

  const isFallbackActive = apiStatus.source === 'fallback';

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-hero p-8 sm:p-10"
        style={{
          '--hero-image':
            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
              <Sparkles size={14} />
              College Discovery
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Interactive college discovery and decision platform.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Explore engineering, polytechnic, medical, and law colleges with one modern,
              insight-rich flow built for smarter shortlisting.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
                Personalized filters
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
                Compare before you choose
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
                Maps and nearby insights
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 p-3 text-slate-950">
                  <Wand2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Smart decision flow</p>
                  <p className="mt-1 text-sm text-blue-100">Filters, predictions, favorites, and charts in one place.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">What you can do</p>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Start with a stream, refine by rank, budget, and category, then compare shortlisted colleges side by side.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Explore streams
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-300 p-3 text-slate-950">
                  <Server size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    API status: {isFallbackActive ? 'Fallback active' : 'Primary active'}
                  </p>
                  <p className="mt-1 text-sm text-blue-100">
                    {apiStatus.isFallbackConfigured
                      ? isFallbackActive
                        ? `Last request switched to backup for ${apiStatus.path || 'the latest endpoint'}.`
                        : 'Backup API is configured and ready if the main server fails.'
                      : 'Fallback API is not configured yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="app-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="app-section-heading">Choose Your Stream</h2>
            <p className="app-section-copy mt-2">
              Each stream follows the same polished flow: discover, filter, compare, and make a confident choice.
            </p>
          </div>
          <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {STREAMS.length} active streams
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {apiStatus.isFallbackConfigured ? (
            isFallbackActive ? (
              <p>
                Backup service is currently helping keep results available.
              </p>
            ) : (
              <p>
                Main service is active, with backup support ready if needed.
              </p>
            )
          ) : (
            <p>Main service is active.</p>
          )}
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
