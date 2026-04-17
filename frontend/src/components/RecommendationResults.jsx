import CollegeCard from './CollegeCard';

const RecommendationResults = ({ colleges }) => {
  if (!colleges.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600 text-sm">
        No recommendations yet. Submit your preferences to see matched colleges.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Recommended Colleges</h2>
        <p className="text-sm text-slate-500">Sorted by score</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {colleges.map((college) => (
          <CollegeCard key={college._id} college={college} showScore showTag />
        ))}
      </div>
    </section>
  );
};

export default RecommendationResults;
