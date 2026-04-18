import { motion } from 'framer-motion';
import { CATEGORY_OPTIONS, DEFAULT_CATEGORY } from '../constants/categories';

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
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
          className="app-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
          className="app-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Select Your Category
        </label>
        <select
          name="category"
          value={formData.category || DEFAULT_CATEGORY}
          onChange={onChange}
          className="app-select"
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Location
        </label>
        <select
          name="location"
          required
          value={formData.location}
          onChange={onChange}
          className="app-select"
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
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Course
        </label>
        <select
          name="course"
          required
          value={formData.course}
          onChange={onChange}
          className="app-select"
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="submit"
        disabled={loading || bootLoading}
        className="app-button-primary md:col-span-2 xl:col-span-5"
      >
        {loading ? 'Analyzing Preferences...' : 'Get AI Recommendations'}
      </motion.button>
    </form>
  );
};

export default RecommendationForm;
