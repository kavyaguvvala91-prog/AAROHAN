import { motion } from 'framer-motion';

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30';
const casteCategories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

const RecommendationForm = ({
  formData,
  locations,
  courses,
  loading,
  bootLoading,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rank
        </label>
        <input
          name="rank"
          type="number"
          min="1"
          required
          value={formData.rank}
          onChange={onChange}
          placeholder="Enter rank"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Budget (INR)
        </label>
        <input
          name="budget"
          type="number"
          min="0"
          required
          value={formData.budget}
          onChange={onChange}
          placeholder="Enter budget"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Location
        </label>
        <select
          name="location"
          required
          value={formData.location}
          onChange={onChange}
          className={inputClassName}
        >
          <option value="">Select location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Course
        </label>
        <select
          name="course"
          required
          value={formData.course}
          onChange={onChange}
          className={inputClassName}
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Caste Category
        </label>
        <select
          name="category"
          required
          value={formData.category}
          onChange={onChange}
          className={inputClassName}
        >
          <option value="">Select category</option>
          {casteCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="submit"
        disabled={loading || bootLoading}
        className="md:col-span-2 xl:col-span-5 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Analyzing Preferences...' : 'Get AI Recommendations'}
      </motion.button>
    </form>
  );
};

export default RecommendationForm;
