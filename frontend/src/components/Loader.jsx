import { motion } from 'framer-motion';

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="app-card inline-flex w-fit items-center gap-3 px-5 py-3">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent"
      />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};

export default Loader;
