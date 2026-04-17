import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BadgeIndianRupee, CheckCircle2, Trophy } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Loader from '../components/Loader';
import { fetchComparedColleges, getApiErrorMessage } from '../services/api';

const CHART_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed'];

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const formatCompactCurrency = (value) =>
  `INR ${Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0))}`;
const formatRank = (value) => Number(value || 0).toLocaleString('en-IN');

const shortCollegeName = (name = '') => {
  const words = name.split(' ').filter(Boolean);
  return words.length <= 3 ? name : `${words.slice(0, 3).join(' ')}...`;
};

const extractCollegeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getMaxMetricValue = (items, key) => Math.max(...items.map((item) => Number(item[key]) || 0), 1);

const ChartCard = ({ title, subtitle, children }) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
  >
    <div className="mb-3">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="h-[280px] w-full">{children}</div>
  </motion.article>
);

const SummaryCard = ({ label, value, helper, accentClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border bg-white p-4 shadow-md ${accentClass}`}
  >
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{helper}</p>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label, formatter = (value) => value }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const title = point?.fullName || label;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-sm text-slate-600">
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name}:
          </span>{' '}
          {formatter(entry.value)}
        </p>
      ))}
    </div>
  );
};

const Compare = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const selectedColleges = useMemo(
    () => (Array.isArray(routeState.selectedColleges) ? routeState.selectedColleges : []),
    [routeState.selectedColleges]
  );
  const streamName = routeState.stream || selectedColleges[0]?.type || '';

  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComparison = async () => {
      if (selectedColleges.length < 2) {
        setResult([]);
        setLoading(false);
        return;
      }

      try {
        const names = selectedColleges.map((college) => college.name);
        const response = await fetchComparedColleges(names);
        const colleges = extractCollegeList(response);
        setResult(colleges.length ? colleges : selectedColleges);
      } catch (err) {
        setResult(selectedColleges);
        setError(getApiErrorMessage(err, 'Unable to refresh comparison data. Showing selected colleges instead.'));
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [selectedColleges]);

  const bestFeesCollege = useMemo(() => {
    if (!result.length) return null;
    return result.reduce((best, college) => ((college.fees || 0) < (best.fees || 0) ? college : best), result[0]);
  }, [result]);

  const bestPackageCollege = useMemo(() => {
    if (!result.length) return null;
    return result.reduce((best, college) => ((college.avg_package || 0) > (best.avg_package || 0) ? college : best), result[0]);
  }, [result]);

  const hasFacilitiesScore = useMemo(
    () => result.some((item) => typeof item.facilities_score === 'number' && !Number.isNaN(item.facilities_score)),
    [result]
  );

  const bestOverallCollege = useMemo(() => {
    if (!result.length) return null;

    const maxFees = getMaxMetricValue(result, 'fees');
    const maxPackage = getMaxMetricValue(result, 'avg_package');
    const maxCutoff = getMaxMetricValue(result, 'cutoff_rank');
    const maxFacilities = hasFacilitiesScore ? getMaxMetricValue(result, 'facilities_score') : 1;

    return result
      .map((college) => {
        const affordabilityScore = 100 - Math.round(((Number(college.fees) || 0) / maxFees) * 100);
        const packageScore = Math.round(((Number(college.avg_package) || 0) / maxPackage) * 100);
        const cutoffScore = Math.round(((Number(college.cutoff_rank) || 0) / maxCutoff) * 100);
        const facilitiesScore = hasFacilitiesScore
          ? Math.round(((Number(college.facilities_score) || 0) / maxFacilities) * 100)
          : 0;
        const totalScore = affordabilityScore * 0.35 + packageScore * 0.4 + cutoffScore * 0.25 + facilitiesScore * (hasFacilitiesScore ? 0.15 : 0);

        return {
          ...college,
          totalScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)[0];
  }, [hasFacilitiesScore, result]);

  const chartLegendProps = useMemo(
    () => ({
      iconType: 'circle',
      wrapperStyle: {
        paddingTop: 12,
        fontSize: '12px',
      },
    }),
    []
  );

  const feeChartData = useMemo(
    () =>
      result.map((college, index) => ({
        name: shortCollegeName(college.name),
        fullName: college.name,
        fees: Number(college.fees) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [result]
  );

  const packageChartData = useMemo(
    () =>
      result.map((college, index) => ({
        name: shortCollegeName(college.name),
        fullName: college.name,
        avg_package: Number(college.avg_package) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [result]
  );

  const feeDistributionData = useMemo(
    () =>
      result.map((college, index) => ({
        name: shortCollegeName(college.name),
        fullName: college.name,
        value: Number(college.fees) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [result]
  );

  const radarChartData = useMemo(() => {
    if (!result.length) return [];

    const maxFees = getMaxMetricValue(result, 'fees');
    const maxPackage = getMaxMetricValue(result, 'avg_package');
    const maxCutoff = getMaxMetricValue(result, 'cutoff_rank');
    const maxFacilities = hasFacilitiesScore ? getMaxMetricValue(result, 'facilities_score') : 1;

    const metrics = [
      {
        metric: 'Fees',
        values: result.reduce((acc, college) => {
          acc[college.name] = Math.round(((Number(college.fees) || 0) / maxFees) * 100);
          return acc;
        }, {}),
      },
      {
        metric: 'Package',
        values: result.reduce((acc, college) => {
          acc[college.name] = Math.round(((Number(college.avg_package) || 0) / maxPackage) * 100);
          return acc;
        }, {}),
      },
      {
        metric: 'Cutoff Rank',
        values: result.reduce((acc, college) => {
          acc[college.name] = Math.round(((Number(college.cutoff_rank) || 0) / maxCutoff) * 100);
          return acc;
        }, {}),
      },
    ];

    if (hasFacilitiesScore) {
      metrics.push({
        metric: 'Facilities',
        values: result.reduce((acc, college) => {
          acc[college.name] = Math.round(((Number(college.facilities_score) || 0) / maxFacilities) * 100);
          return acc;
        }, {}),
      });
    }

    return metrics.map(({ metric, values }) => ({
      metric,
      ...values,
    }));
  }, [hasFacilitiesScore, result]);

  if (loading) {
    return <Loader label="Preparing your comparison..." />;
  }

  if (selectedColleges.length < 2) {
    return (
      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
        >
          <h1 className="text-2xl font-bold text-slate-900">Compare Colleges</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose at least two colleges from a single stream before opening the compare page.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Streams
          </button>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {streamName || 'Selected Stream'}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Compare Colleges</h1>
            <p className="mt-2 text-sm text-slate-600">
              Reviewing {result.length} colleges from the same stream with a compact table, focused charts, and a quick final analysis.
            </p>
          </div>

          <Link
            to={streamName ? `/stream/${encodeURIComponent(streamName.toLowerCase())}` : '/'}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Change Selection
          </Link>
        </div>
      </motion.section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Comparison Table</h2>
          <p className="text-sm text-slate-500">A quick side-by-side view before reading the charts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-semibold">Metric</th>
                {result.map((college) => (
                  <th key={college._id} className="px-4 py-3 font-semibold">
                    {college.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-700">Location</td>
                {result.map((college) => (
                  <td key={`${college._id}-location`} className="px-4 py-3 text-slate-600">{college.location}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-700">Fees</td>
                {result.map((college) => (
                  <td key={`${college._id}-fees`} className="px-4 py-3 text-slate-600">{formatCurrency(college.fees)}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-700">Average Package</td>
                {result.map((college) => (
                  <td key={`${college._id}-package`} className="px-4 py-3 text-slate-600">{formatCurrency(college.avg_package)}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-700">Cutoff Rank</td>
                {result.map((college) => (
                  <td key={`${college._id}-cutoff`} className="px-4 py-3 text-slate-600">{college.cutoff_rank?.toLocaleString?.() || college.cutoff_rank}</td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-700">Courses</td>
                {result.map((college) => (
                  <td key={`${college._id}-courses`} className="px-4 py-3 text-slate-600">{(college.courses || []).join(', ')}</td>
                ))}
              </tr>
              {hasFacilitiesScore && (
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-700">Facilities Score</td>
                  {result.map((college) => (
                    <td key={`${college._id}-facilities`} className="px-4 py-3 text-slate-600">
                      {college.facilities_score ?? 'N/A'}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Charts Section</h2>
          <p className="text-sm text-slate-500">Smaller charts arranged for readability with two cards per row on larger screens.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Fee Comparison" subtitle="Annual fees across the selected colleges.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeChartData} margin={{ top: 8, right: 8, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={56}>
                  <Label value="Colleges" offset={-8} position="insideBottom" style={{ fill: '#64748b', fontSize: 12 }} />
                </XAxis>
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 11 }}>
                  <Label value="Annual Fees" angle={-90} position="insideLeft" style={{ fill: '#64748b', fontSize: 12, textAnchor: 'middle' }} />
                </YAxis>
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Legend {...chartLegendProps} />
                <Bar dataKey="fees" name="Fees" radius={[8, 8, 0, 0]} barSize={26} animationDuration={800}>
                  {feeChartData.map((entry) => (
                    <Cell key={entry.fullName} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Package Comparison" subtitle="Average placement package across colleges.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageChartData} margin={{ top: 8, right: 8, left: 0, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={56}>
                  <Label value="Colleges" offset={-8} position="insideBottom" style={{ fill: '#64748b', fontSize: 12 }} />
                </XAxis>
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 11 }}>
                  <Label value="Average Package" angle={-90} position="insideLeft" style={{ fill: '#64748b', fontSize: 12, textAnchor: 'middle' }} />
                </YAxis>
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Legend {...chartLegendProps} />
                <Bar dataKey="avg_package" name="Average Package" radius={[8, 8, 0, 0]} barSize={26} animationDuration={900}>
                  {packageChartData.map((entry) => (
                    <Cell key={entry.fullName} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cost Distribution" subtitle="How total fee share is distributed across the selected colleges.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  innerRadius={36}
                  paddingAngle={3}
                  animationDuration={850}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {feeDistributionData.map((entry) => (
                    <Cell key={entry.fullName} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Legend {...chartLegendProps} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Overall Comparison"
            subtitle={hasFacilitiesScore ? 'Combined normalized view of fees, package, cutoff rank, and facilities.' : 'Combined normalized view of fees, package, and cutoff rank.'}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} outerRadius="64%">
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip formatter={(value) => `${value}%`} />} />
                <Legend {...chartLegendProps} />
                {result.map((college, index) => (
                  <Radar
                    key={college._id}
                    name={college.name}
                    dataKey={college.name}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    fillOpacity={0.14}
                    strokeWidth={2}
                    animationDuration={950}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Final Analysis</h2>
          <p className="text-sm text-slate-500">A quick read on which college stands out in each category.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Best Overall"
            value={bestOverallCollege?.name || 'N/A'}
            helper={bestOverallCollege ? 'Strong balance across affordability, package, cutoff rank, and available facilities data.' : 'Overall score unavailable.'}
            accentClass="border-blue-200"
          />
          <SummaryCard
            label="Most Affordable"
            value={bestFeesCollege?.name || 'N/A'}
            helper={bestFeesCollege ? `Lowest fees: ${formatCurrency(bestFeesCollege.fees)}` : 'Fee data unavailable.'}
            accentClass="border-green-200"
          />
          <SummaryCard
            label="Highest Package"
            value={bestPackageCollege?.name || 'N/A'}
            helper={bestPackageCollege ? `Highest average package: ${formatCurrency(bestPackageCollege.avg_package)}` : 'Package data unavailable.'}
            accentClass="border-orange-200"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.map((college) => (
          <div key={college._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{college.name}</h3>
                <p className="text-sm text-slate-500">{college.location}</p>
              </div>
              <CheckCircle2 className="text-blue-600" size={18} />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <span className="flex items-center gap-1"><BadgeIndianRupee size={14} /> Fees</span>
                <span className="font-semibold">{formatCurrency(college.fees)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <span className="flex items-center gap-1"><Trophy size={14} /> Avg Package</span>
                <span className="font-semibold">{formatCurrency(college.avg_package)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <p className="text-xs text-slate-500">Cutoff Rank</p>
                <p className="font-semibold">{formatRank(college.cutoff_rank)}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Compare;
