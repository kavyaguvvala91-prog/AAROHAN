import { motion } from 'framer-motion';

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-md">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent"
      />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};

export default Loader;
