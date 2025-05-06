import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/solid';

// Extended leaderboard data with dates and consistency scores
const leaderboardData = [
  { id: 1, username: 'speedDemon', wpm: 120, accuracy: 98.5, tests: 145, date: '2023-10-12', consistency: 96 },
  { id: 2, username: 'typeMaster', wpm: 115, accuracy: 99.2, tests: 87, date: '2023-10-15', consistency: 94 },
  { id: 3, username: 'keyboardNinja', wpm: 110, accuracy: 97.8, tests: 93, date: '2023-10-11', consistency: 91 },
  { id: 4, username: 'swiftFingers', wpm: 105, accuracy: 96.5, tests: 112, date: '2023-10-18', consistency: 88 },
  { id: 5, username: 'wordSmith', wpm: 100, accuracy: 98.0, tests: 76, date: '2023-10-09', consistency: 92 },
  { id: 6, username: 'typeHero', wpm: 98, accuracy: 95.7, tests: 65, date: '2023-10-17', consistency: 85 },
  { id: 7, username: 'keyMaster', wpm: 95, accuracy: 97.3, tests: 88, date: '2023-10-08', consistency: 89 },
  { id: 8, username: 'typeWizard', wpm: 92, accuracy: 96.8, tests: 54, date: '2023-10-14', consistency: 87 },
  { id: 9, username: 'fastKeys', wpm: 90, accuracy: 94.9, tests: 43, date: '2023-10-16', consistency: 83 },
  { id: 10, username: 'typeStar', wpm: 88, accuracy: 95.2, tests: 39, date: '2023-10-13', consistency: 86 },
  { id: 11, username: 'quickTyper', wpm: 103, accuracy: 97.1, tests: 67, date: '2023-10-20', consistency: 90 },
  { id: 12, username: 'keyboardKing', wpm: 112, accuracy: 96.9, tests: 102, date: '2023-10-19', consistency: 93 },
  { id: 13, username: 'typeQueen', wpm: 109, accuracy: 98.3, tests: 78, date: '2023-10-21', consistency: 95 },
  { id: 14, username: 'speedy', wpm: 97, accuracy: 95.0, tests: 56, date: '2023-10-10', consistency: 84 },
  { id: 15, username: 'rapidFingers', wpm: 101, accuracy: 96.2, tests: 63, date: '2023-10-22', consistency: 87 },
  { id: 16, username: 'keystrokeKing', wpm: 106, accuracy: 97.5, tests: 81, date: '2023-10-07', consistency: 91 },
  { id: 17, username: 'typeTitan', wpm: 118, accuracy: 98.7, tests: 95, date: '2023-10-23', consistency: 97 },
  { id: 18, username: 'keyCrusher', wpm: 107, accuracy: 96.3, tests: 72, date: '2023-10-24', consistency: 88 },
  { id: 19, username: 'keyCommander', wpm: 104, accuracy: 97.0, tests: 59, date: '2023-10-25', consistency: 89 },
  { id: 20, username: 'speedyKeys', wpm: 99, accuracy: 95.8, tests: 48, date: '2023-10-26', consistency: 86 },
];

// Challenge types
type Difficulty = 'easy' | 'medium' | 'hard';
type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  progress: number;
  maxAttempts: number;
  attempts: number;
  reward: string;
};

// Define challenge data
const challengeData: Challenge[] = [
  { 
    id: 1, 
    title: 'Speed Demon', 
    description: 'Reach 100 WPM with 95% accuracy', 
    difficulty: 'hard' as Difficulty,
    progress: 0,
    maxAttempts: 3,
    attempts: 0,
    reward: '150 XP'
  },
  { 
    id: 2, 
    title: 'Perfect Run', 
    description: 'Complete a test with 100% accuracy', 
    difficulty: 'medium' as Difficulty,
    progress: 0,
    maxAttempts: 3,
    attempts: 0,
    reward: '100 XP'
  },
  { 
    id: 3, 
    title: 'Consistency King', 
    description: 'Achieve 98% consistency on a test', 
    difficulty: 'medium' as Difficulty,
    progress: 0,
    maxAttempts: 5,
    attempts: 0,
    reward: '120 XP'
  },
  { 
    id: 4, 
    title: 'Marathon Typer', 
    description: 'Complete 10 typing tests in a single day', 
    difficulty: 'easy' as Difficulty,
    progress: 0,
    maxAttempts: 1,
    attempts: 0,
    reward: '80 XP'
  },
  { 
    id: 5, 
    title: 'Night Owl', 
    description: 'Complete a test between 12 AM and 4 AM', 
    difficulty: 'easy' as Difficulty,
    progress: 0,
    maxAttempts: 1,
    attempts: 0,
    reward: '50 XP'
  },
  { 
    id: 6, 
    title: 'Lightning Fingers', 
    description: 'Type at 120 WPM for at least 30 seconds', 
    difficulty: 'hard' as Difficulty,
    progress: 0,
    maxAttempts: 5,
    attempts: 0,
    reward: '200 XP'
  },
  { 
    id: 7, 
    title: 'Blind Typing', 
    description: 'Complete a test in blind mode with 90% accuracy', 
    difficulty: 'hard' as Difficulty,
    progress: 0,
    maxAttempts: 3,
    attempts: 0,
    reward: '180 XP'
  },
  { 
    id: 8, 
    title: 'Quote Master', 
    description: 'Complete 5 quote mode tests', 
    difficulty: 'medium' as Difficulty,
    progress: 0,
    maxAttempts: 1,
    attempts: 0,
    reward: '100 XP'
  }
];

// Leaderboard tabs
type LeaderboardTab = 'global' | 'friends' | 'weekly';

// Sort options
type SortField = 'wpm' | 'accuracy' | 'tests' | 'date' | 'consistency';
type SortDirection = 'asc' | 'desc';

// Challenge difficulty badge component
const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  let bgColor = '';
  
  switch (difficulty) {
    case 'easy':
      bgColor = 'bg-green-500';
      break;
    case 'medium':
      bgColor = 'bg-yellow-500';
      break;
    case 'hard':
      bgColor = 'bg-red-500';
      break;
  }
  
  return (
    <span className={`text-xs ${bgColor} text-[#111111] px-2 py-1 rounded-full font-medium`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};

// Challenges Modal Component
const ChallengesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Use local state for the filter within the modal component
  const [activeFilter, setActiveFilter] = useState<'all' | Difficulty>('all');
  
  // Filter challenges based on selected filter
  const filteredChallenges = activeFilter === 'all' 
    ? challengeData 
    : challengeData.filter(challenge => challenge.difficulty === activeFilter);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#111111] rounded-lg border border-[#1A1A1A] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">All Challenges</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Filter Options */}
        <div className="p-4 border-b border-[#1A1A1A] flex space-x-2">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md ${
              activeFilter === 'all' 
                ? 'bg-primary text-white'
                : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] transition-colors'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('easy')}
            className={`px-3 py-1 rounded-md ${
              activeFilter === 'easy' 
                ? 'bg-green-500 text-[#111111]'
                : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] transition-colors'
            }`}
          >
            Easy
          </button>
          <button 
            onClick={() => setActiveFilter('medium')}
            className={`px-3 py-1 rounded-md ${
              activeFilter === 'medium' 
                ? 'bg-yellow-500 text-[#111111]'
                : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] transition-colors'
            }`}
          >
            Medium
          </button>
          <button 
            onClick={() => setActiveFilter('hard')}
            className={`px-3 py-1 rounded-md ${
              activeFilter === 'hard' 
                ? 'bg-red-500 text-[#111111]'
                : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] transition-colors'
            }`}
          >
            Hard
          </button>
        </div>
        
        {/* Challenges List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map(challenge => (
              <div key={challenge.id} className="bg-[#0A0A0A] p-4 rounded-lg border border-[#1A1A1A] hover:border-[#252525] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-200">{challenge.title}</h3>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{challenge.attempts}/{challenge.maxAttempts} attempts</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(challenge.progress / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-primary font-medium">Reward: {challenge.reward}</span>
                  <button className="text-xs bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 px-3 py-1 rounded-md transition-colors">
                    Start Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredChallenges.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No challenges found for the selected filter.
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1A1A1A] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  
  // State for challenges modal
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 7;
  
  // State for sorting
  const [sortField, setSortField] = useState<SortField>('wpm');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Handle sort click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort and paginate data
  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortField === 'date') {
      // Date sorting
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    } else {
      // Number sorting
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
  });
  
  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  
  // Generate page buttons
  const pageButtons = [];
  const pagesToShow = 3; // Number of page buttons to show
  
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button
        key={i}
        onClick={() => setCurrentPage(i)}
        className={`px-3 py-1 mx-1 rounded-md ${
          currentPage === i
            ? 'bg-primary text-white'
            : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] transition-colors'
        }`}
      >
        {i}
      </button>
    );
  }
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 inline ml-1" />
      : <ArrowDownIcon className="h-4 w-4 inline ml-1" />;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">SpeedType Leaderboard</h1>
        <p className="text-gray-400 text-lg">See how you stack up against the fastest typists</p>
      </div>
      
      <div className="bg-[#111111] rounded-lg shadow-lg overflow-hidden border border-[#1A1A1A]">
        {/* Leaderboard tabs */}
        <div className="flex border-b border-[#1A1A1A]">
          <button 
            className={`flex-1 text-center py-4 px-6 transition-colors ${
              activeTab === 'global' ? 'bg-primary text-white font-semibold' : 'text-gray-300 hover:bg-[#181818]'
            }`}
            onClick={() => setActiveTab('global')}
          >
            Global Rankings
          </button>
          <button 
            className={`flex-1 text-center py-4 px-6 transition-colors ${
              activeTab === 'friends' ? 'bg-primary text-white font-semibold' : 'text-gray-300 hover:bg-[#181818]'
            }`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          <button 
            className={`flex-1 text-center py-4 px-6 transition-colors ${
              activeTab === 'weekly' ? 'bg-primary text-white font-semibold' : 'text-gray-300 hover:bg-[#181818]'
            }`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly Challenge
          </button>
        </div>
        
        {/* Leaderboard table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0A0A0A] text-gray-400 text-sm uppercase">
                <th className="py-4 px-6 font-semibold w-16 text-center">Rank</th>
                <th className="py-4 px-6 font-semibold">User</th>
                <th 
                  className="py-4 px-6 font-semibold text-center cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => handleSort('wpm')}
                >
                  WPM <SortIndicator field="wpm" />
                </th>
                <th 
                  className="py-4 px-6 font-semibold text-center cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => handleSort('accuracy')}
                >
                  Accuracy <SortIndicator field="accuracy" />
                </th>
                <th 
                  className="py-4 px-6 font-semibold text-center cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => handleSort('consistency')}
                >
                  Consistency <SortIndicator field="consistency" />
                </th>
                <th 
                  className="py-4 px-6 font-semibold text-center cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => handleSort('tests')}
                >
                  Tests <SortIndicator field="tests" />
                </th>
                <th 
                  className="py-4 px-6 font-semibold text-center cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  Last Test <SortIndicator field="date" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {currentEntries.map((user, index) => {
                // Calculate the actual rank based on page and position
                const actualRank = indexOfFirstEntry + index + 1;
                
                return (
                <tr key={user.id} className={`hover:bg-[#181818] transition-colors ${actualRank <= 3 ? 'font-semibold' : ''}`}>
                  <td className="py-4 px-6 text-center">
                    <div className={`
                      ${actualRank === 1 ? 'bg-yellow-500 text-[#111111]' : ''}
                      ${actualRank === 2 ? 'bg-gray-300 text-[#111111]' : ''}
                      ${actualRank === 3 ? 'bg-amber-600 text-[#111111]' : ''}
                      ${actualRank > 3 ? 'bg-[#1A1A1A] text-gray-300' : ''}
                      rounded-full w-8 h-8 flex items-center justify-center mx-auto
                    `}>
                      {actualRank}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-primary font-bold">{user.wpm}</td>
                  <td className="py-4 px-6 text-center text-green-400">{user.accuracy}%</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-[100px] bg-[#1A1A1A] h-2 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            user.consistency >= 95 ? 'bg-green-500' :
                            user.consistency >= 90 ? 'bg-green-400' :
                            user.consistency >= 85 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${user.consistency}%` }}
                        />
                      </div>
                      <span className="ml-2 text-gray-300">{user.consistency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-300">{user.tests}</td>
                  <td className="py-4 px-6 text-center text-gray-400">{formatDate(user.date)}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="flex justify-between items-center p-4 border-t border-[#1A1A1A]">
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, sortedData.length)} of {sortedData.length} entries
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md bg-[#1A1A1A] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed mr-2 hover:bg-[#252525] transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {pageButtons}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md bg-[#1A1A1A] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ml-2 hover:bg-[#252525] transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-10 flex flex-col md:flex-row gap-4">
        <div className="bg-[#111111] p-6 rounded-lg shadow-md flex-1 border border-[#1A1A1A]">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Your Stats</h3>
          <div className="flex flex-wrap justify-between text-center mt-4 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-gray-400">WPM</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">0%</p>
              <p className="text-sm text-gray-400">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">0%</p>
              <p className="text-sm text-gray-400">Consistency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-gray-400">Tests</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm uppercase font-semibold text-gray-400 mb-2">Progress</h4>
            <div className="h-[120px] flex items-end">
              {/* Empty state for progress chart */}
              <div className="w-full flex items-end justify-around h-full">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="flex flex-col items-center">
                    <div className="w-8 bg-[#1A1A1A] mx-1 rounded-t" style={{ height: '0px' }}></div>
                    <p className="text-xs text-gray-500 mt-1">{day}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors">
              Sign in to record your scores
            </button>
          </div>
        </div>
        
        <div className="bg-[#111111] p-6 rounded-lg shadow-md flex-1 border border-[#1A1A1A]">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Weekly Challenge</h3>
          <div className="space-y-4">
            <div className="bg-[#0A0A0A] p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-300">Speed Demon</h4>
                <span className="text-xs bg-yellow-500 text-[#111111] px-2 py-1 rounded-full font-medium">Hard</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Reach 100 WPM with 95% accuracy</p>
              <div className="w-full bg-[#1A1A1A] h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full w-0"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">0/3 attempts</p>
            </div>
            
            <div className="bg-[#0A0A0A] p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-300">Perfect Run</h4>
                <span className="text-xs bg-green-500 text-[#111111] px-2 py-1 rounded-full font-medium">Medium</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Complete a test with 100% accuracy</p>
              <div className="w-full bg-[#1A1A1A] h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full w-0"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">0/3 attempts</p>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                className="w-full py-2 bg-[#1A1A1A] text-gray-300 rounded-md hover:bg-[#252525] transition-colors"
                onClick={() => setShowChallengesModal(true)}
              >
                View All Challenges
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update the challenges modal usage */}
      <ChallengesModal 
        isOpen={showChallengesModal} 
        onClose={() => setShowChallengesModal(false)} 
      />
      
      {/* Animation style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default Leaderboard; 