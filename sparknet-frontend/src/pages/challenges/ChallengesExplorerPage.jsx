import { useState } from 'react';
import { ChallengeCard } from '../../components/challenges/ChallengeSystem';

const dummyChallenges = [
  {
    id: 1,
    title: 'Daily Coding Streak',
    description: 'Solve one algorithmic puzzle every day for 7 days.',
    points: 500,
    icon: '💻',
    category: 'coding'
  },
  {
    id: 2,
    title: 'Digital Detox Weekend',
    description: 'Keep your screen time under 2 hours this Saturday and Sunday.',
    points: 1000,
    icon: '🧘',
    category: 'wellness'
  },
  {
    id: 3,
    title: 'Community Helper',
    description: 'Answer 5 questions from beginners in the Help forum.',
    points: 300,
    icon: '🤝',
    category: 'community'
  }
];

export const ChallengesExplorerPage = () => {
  const [filter, setFilter] = useState('all');

  const filteredChallenges = filter === 'all' 
    ? dummyChallenges 
    : dummyChallenges.filter(c => c.category === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-800 text-3xl text-white">Challenges Explorer</h1>
          <p className="text-gray-500 mt-1">Discover new skills, earn points, and climb the leaderboard.</p>
        </div>
        
        <div className="flex bg-dark-700 rounded-lg p-1 overflow-x-auto">
          {['all', 'coding', 'wellness', 'community'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md font-display font-600 text-sm capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-spark-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map(challenge => (
          <ChallengeCard key={challenge._id || challenge.id} challenge={challenge} isJoined={false} />
        ))}
      </div>
    </div>
  );
};
