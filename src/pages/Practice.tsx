import { useState, useEffect } from 'react';
import TypingTest from '../components/TypingTest';

// Define test modes
type TestMode = 'time' | 'words' | 'quote';

const difficultyOptions = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' }
];

const durationOptions = [
  { id: 15, label: '15s' },
  { id: 30, label: '30s' },
  { id: 60, label: '60s' },
  { id: 120, label: '2min' }
];

const wordCountOptions = [
  { id: 10, label: '10' },
  { id: 25, label: '25' },
  { id: 50, label: '50' },
  { id: 100, label: '100' }
];

const modeOptions = [
  { id: 'time', label: 'Time' },
  { id: 'words', label: 'Words' },
  { id: 'quote', label: 'Quote' }
];

const Practice = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [duration, setDuration] = useState(30);
  const [wordCount, setWordCount] = useState(25);
  const [testMode, setTestMode] = useState<TestMode>('time');
  const [key, setKey] = useState(0); // For forcing TypingTest component to reset
  const [tabPressed, setTabPressed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Helper function to restart test with new settings
  const restartTest = () => {
    setKey(prev => prev + 1);
  };
  
  // Global keyboard shortcuts for Practice page
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset tab state when tab is released
      if (e.key === 'Tab') {
        setTabPressed(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Set tab as pressed
      if (e.key === 'Tab') {
        setTabPressed(true);
      }
      
      // When tab+enter is pressed in Practice page, start a new test
      if (tabPressed && e.key === 'Enter') {
        restartTest();
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tabPressed]);
  
  // Handle typing state change from TypingTest component
  const handleTypingStateChange = (typing: boolean) => {
    setIsTyping(typing);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(95vh-180px)]">
      <div className="w-[80%] mx-auto px-4">
        {/* Options container with fade transition */}
        <div 
          className={`flex flex-wrap justify-center gap-6 md:gap-8 mb-10 transition-opacity duration-300 ${
            isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Test Mode */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Test Mode</h3>
            <div className="flex bg-[#111111] rounded-md p-1 shadow-xl">
              {modeOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    setTestMode(option.id as TestMode);
                    restartTest();
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    testMode === option.id 
                      ? 'bg-primary text-white shadow-inner' 
                      : 'text-gray-400 hover:text-white hover:bg-[#181818]'
                  } transition-colors`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Test Duration - only show for time mode */}
          {testMode === 'time' && (
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Test Duration</h3>
              <div className="flex bg-[#111111] rounded-md p-1 shadow-xl">
                {durationOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setDuration(option.id);
                      restartTest();
                    }}
                    className={`px-4 py-2 rounded-md text-sm ${
                      duration === option.id 
                        ? 'bg-primary text-white shadow-inner' 
                        : 'text-gray-400 hover:text-white hover:bg-[#181818]'
                    } transition-colors`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Word Count - only show for words mode */}
          {testMode === 'words' && (
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Word Count</h3>
              <div className="flex bg-[#111111] rounded-md p-1 shadow-xl">
                {wordCountOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setWordCount(option.id);
                      restartTest();
                    }}
                    className={`px-4 py-2 rounded-md text-sm ${
                      wordCount === option.id 
                        ? 'bg-primary text-white shadow-inner' 
                        : 'text-gray-400 hover:text-white hover:bg-[#181818]'
                    } transition-colors`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Difficulty */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Difficulty</h3>
            <div className="flex bg-[#111111] rounded-md p-1 shadow-xl">
              {difficultyOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    setDifficulty(option.id as 'easy' | 'medium' | 'hard');
                    restartTest();
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    difficulty === option.id 
                      ? 'bg-primary text-white shadow-inner' 
                      : 'text-gray-400 hover:text-white hover:bg-[#181818]'
                  } transition-colors`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-10">
          <TypingTest 
            key={key} 
            difficulty={difficulty} 
            testDuration={duration}
            wordCount={wordCount}
            testMode={testMode}
            onNextTest={restartTest}
            onTypingStateChange={handleTypingStateChange}
          />
        </div>
        
        <div className={`text-center text-gray-500 text-sm mt-4 transition-opacity duration-300 ${
          isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <p>Press <kbd className="px-2 py-1 bg-[#111111] rounded text-gray-300">Tab</kbd> + <kbd className="px-2 py-1 bg-[#111111] rounded text-gray-300">Enter</kbd> to start a new test</p>
        </div>
      </div>
    </div>
  );
};

export default Practice; 