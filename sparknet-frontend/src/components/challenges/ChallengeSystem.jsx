import { Link } from 'react-router-dom';

export const ProgressBar = ({ progress, label }) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
    )}
    <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden border border-dark-600">
      <div 
        className="h-full bg-gradient-to-r from-spark-600 to-purple-500 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export const ChallengeCard = ({ challenge, isJoined }) => (
  <div className="relative spark-card p-6 flex flex-col group overflow-hidden animate-fade-in hover:border-spark-500/30 transition-all duration-300 transform hover:-translate-y-1">
    <div className="absolute top-0 right-0 p-4">
      <span className="px-3 py-1 rounded-full bg-dark-700/80 border border-dark-500 text-xs font-mono text-spark-400 backdrop-blur-sm">
        {challenge.points} pts
      </span>
    </div>
    
    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{challenge.icon || '🏆'}</div>
    
    <h3 className="font-display font-700 text-lg text-white mb-2">{challenge.title}</h3>
    <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">{challenge.description}</p>
    
    {isJoined ? (
      <div className="space-y-4">
        <ProgressBar progress={challenge.progress || 0} label="My Progress" />
        <Link 
          to={`/challenges/${challenge._id || challenge.id}`}
          className="block text-center w-full py-2 rounded-xl bg-dark-700 border border-dark-500 text-sm font-display font-600 text-white hover:border-spark-500 hover:text-spark-400 transition-colors"
        >
          View Details
        </Link>
      </div>
    ) : (
      <Link 
        to={`/challenges/${challenge._id || challenge.id}`}
        className="block text-center w-full py-2 rounded-xl bg-spark-600 hover:bg-spark-500 hover:shadow-lg hover:shadow-spark-500/20 text-sm font-display font-600 text-white transition-all"
      >
        Join Challenge
      </Link>
    )}
  </div>
);

export const LeaderboardTable = ({ entries }) => (
  <div className="overflow-hidden rounded-xl border border-dark-600 bg-dark-800/50">
    <table className="w-full text-left text-sm text-gray-400">
      <thead className="bg-dark-700/50 font-mono text-xs uppercase text-gray-500">
        <tr>
          <th className="px-6 py-4">Rank</th>
          <th className="px-6 py-4">Participant</th>
          <th className="px-6 py-4 text-right">Points / Score</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, idx) => (
          <tr 
            key={entry._id || entry.id} 
            className="border-b border-dark-600/50 hover:bg-dark-700/30 transition-colors"
          >
            <td className="px-6 py-4">
              <span className={`font-display font-700 ${idx < 3 ? 'text-spark-400 text-lg' : 'text-gray-500'}`}>
                {idx === 0 ? '👑 1' : idx + 1}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-600 to-dark-700 border border-dark-500 flex items-center justify-center text-xs text-white">
                  {entry.username[0]?.toUpperCase()}
                </div>
                <span className="font-display font-600 text-gray-300">{entry.username}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-right">
              <span className="font-mono text-purple-400 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                {entry.score}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
