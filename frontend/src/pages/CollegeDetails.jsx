import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ExternalLink,
  IndianRupee,
  MapPin,
  Star,
  TrainFront,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import {
  fetchCollegeDetails,
  getApiErrorMessage,
} from '../services/api';

const DetailCard = ({ label, value, icon: Icon, accentClass = 'text-blue-700 bg-blue-50' }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className={`inline-flex rounded-xl p-2 ${accentClass}`}>
      <Icon size={18} />
    </div>
    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value || 'N/A'}</p>
  </div>
);

const NearbyCategory = ({ title, description, items, emptyMessage }) => (
  <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>

    {!items?.length ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {emptyMessage}
      </div>
    ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                <p className="mt-1 text-sm text-slate-500">{item.address || 'Address unavailable'}</p>
              </div>
              {item.rating !== null && item.rating !== undefined && (
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Star size={12} />
                  {item.rating}
                </div>
              )}
            </div>

            <p className="mt-4 text-sm font-medium text-blue-700">{item.distance}</p>
          </motion.article>
        ))}
      </div>
    )}
  </section>
);

const ReviewSection = ({ reviews = [] }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Student Reviews</h2>
      <p className="mt-1 text-sm text-slate-500">Quick review-style insights to support shortlist comparison.</p>
    </div>

    {!reviews.length ? (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No reviews available for this college right now.
      </div>
    ) : (
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <motion.article
            key={review.id || index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{review.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{review.author}</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Star size={12} />
                {review.rating}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
          </motion.article>
        ))}
      </div>
    )}
  </section>
);

const CollegeDetails = () => {
  const { name } = useParams();
  const decodedName = useMemo(() => decodeURIComponent(name || ''), [name]);

  const [details, setDetails] = useState(null);
  const [nearby, setNearby] = useState({ hostels: [], restaurants: [], transport: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCollegeDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const detailsResponse = await fetchCollegeDetails(decodedName);

        setDetails(detailsResponse);
        setNearby(detailsResponse.nearby || {
          hostels: [],
          restaurants: [],
          transport: [],
        });
      } catch (err) {
        setDetails(null);
        setNearby({ hostels: [], restaurants: [], transport: [] });
        setError(getApiErrorMessage(err, 'Unable to load college details.'));
      } finally {
        setLoading(false);
      }
    };

    if (decodedName) {
      loadCollegeDetails();
    }
  }, [decodedName]);

  const college = details?.college;
  const reviews = details?.reviews || [];
  const streamSlug = useMemo(() => {
    const type = college?.type || '';
    return type ? type.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'engineering';
  }, [college?.type]);

  if (loading) {
    return <Loader label={`Loading details for ${decodedName || 'college'}...`} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
        <Link
          to={`/stream/${streamSlug}`}
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to colleges
        </Link>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No data available for this college.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.9),_transparent_36%),linear-gradient(135deg,#0f172a,#1d4ed8_58%,#0ea5e9)] p-8 text-white shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">College Details</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{college.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-blue-100 sm:text-base">
              <MapPin size={16} />
              {college.address || college.location}
            </p>
          </div>

          {college.mapsUri && (
            <a
              href={college.mapsUri}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Open in Maps
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard
          label="Location"
          value={college.location}
          icon={MapPin}
        />
        <DetailCard
          label="Fees"
          value={college.fees ? `INR ${college.fees.toLocaleString()}` : 'N/A'}
          icon={IndianRupee}
          accentClass="text-emerald-700 bg-emerald-50"
        />
        <DetailCard
          label="Avg Package"
          value={college.avg_package ? `INR ${college.avg_package.toLocaleString()}` : 'N/A'}
          icon={IndianRupee}
          accentClass="text-violet-700 bg-violet-50"
        />
        <DetailCard
          label="Rating"
          value={college.rating ? `${college.rating} / 5` : 'Not available'}
          icon={Star}
          accentClass="text-amber-700 bg-amber-50"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Map Location</h2>
              <p className="mt-1 text-sm text-slate-500">Explore the campus location and surrounding area.</p>
            </div>
          </div>

          {!college.mapsEmbedUrl ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No map data available.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title={`${college.name} location`}
                src={college.mapsEmbedUrl}
                className="h-[360px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-semibold text-slate-900">About This College</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Use this page to evaluate campus basics, map access, available place photos, and nearby
            facilities for demo-ready college exploration.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Courses</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(college.courses || []).length ? (
                college.courses.map((course) => (
                  <span
                    key={course}
                    className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm"
                  >
                    {course}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No data available.</p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cutoff Rank</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {college.cutoff_rank?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </motion.div>
      </section>

      <div className="grid gap-6">
        <NearbyCategory
          title="Hostels / PGs"
          description="Stay options near the college."
          items={nearby.hostels}
          emptyMessage="No hostel or PG listings were found from the free map source for this area."
        />
        <NearbyCategory
          title="Restaurants"
          description="Popular dining options around the campus."
          items={nearby.restaurants}
          emptyMessage="No restaurant listings were found from the free map source for this area."
        />
        <NearbyCategory
          title="Transport"
          description="Nearby bus, metro, or railway access points."
          items={nearby.transport}
          emptyMessage="No transport listings were found from the free map source for this area."
        />
      </div>

      <ReviewSection reviews={reviews} />

      {details?.fallback && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live OpenStreetMap lookup is unavailable right now, so this page is showing fallback
          college information from your dataset.
        </div>
      )}

      <Link
        to={`/stream/${streamSlug}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <TrainFront size={16} />
        Back to {college.type?.toLowerCase() || 'stream'} colleges
      </Link>
    </div>
  );
};

export default CollegeDetails;
