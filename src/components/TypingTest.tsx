import React, { useState, useEffect, useRef } from 'react';
import TestResults from './TestResults';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Define test modes
type TestMode = 'time' | 'words' | 'quote';

// Text collections for different modes
const simpleWords = [
  "the quick brown fox jumps over the lazy dog this sentence contains all the letters in the english alphabet",
  "programming is the process of creating a set of instructions that tell a computer how to perform a task",
  "typing practice helps improve your speed and accuracy when using a keyboard regular practice leads to better results",
  "the best way to predict the future is to invent it computers are incredibly fast accurate and stupid humans are slow but brilliant",
  "practice typing to improve your speed and accuracy focus on consistency rather than raw speed for best results",
];

// Random words - no coherent meaning, just common words
const timeModeSamples = [
  "look good time day get way people year back think right come work want long well make thing great need should because could here first after much find help use even place where life consider however different become something actually learn system study provide part leave feel time fact point",
  "say make go world know see take come good person want year give day could most use find tell look need help start ask seem feel try leave call work ask most number new year study way provide different fact point love think fact problem most",
  "work see make need use find get think time day tell year right way start find person call study provide leave want most first point fact possible problem now come day make good year need find tell know system take want get study provide look",
  "know let great use keep think problem house part service state help point ask first need come fact say get use make work take different leave school most important tell right call good come plan problem think hand thing year system provide different",
  "way see day good work use point most important come state learn study provide fact possible problem tell new great right time call make different find use leave ask important number keep hand thing fact state system most different"
];

// Quotes with punctuation
const quoteModeSamples = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. - Steve Jobs",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
];

// Words with numbers, symbols and punctuation
const hardModeSamples = [
  "In 2023, approximately 67% of developers reported using JavaScript as their primary language; Python (48.2%) and Java (33.1%) followed closely behind.",
  "The password must contain at least 8 characters, including: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*).",
  "According to the research paper, the experiment yielded a success rate of 78.3% with a margin of error of ±2.5% (p<0.05).",
  "The function calculate_total(items, tax_rate=0.08) returns the sum of all items plus the applied tax rate.",
  "Please submit your response by 11:59 PM on 12/31/2023 to email: support@example.com with the subject line \"Application #12345\"."
];

interface TypingTestProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  testDuration?: number; // in seconds
  wordCount?: number; // for word mode
  testMode?: TestMode; // test mode
  onNextTest?: () => void; // Callback for parent component to trigger next test
  onTypingStateChange?: (isTyping: boolean) => void; // Callback to notify parent about typing state
}

type TestStatus = 'waiting' | 'typing' | 'finished';

// Track what the user actually typed for each word
interface WordAttempt {
  expected: string;
  typed: string;
  isCorrect: boolean;
}

const TypingTest: React.FC<TypingTestProps> = ({ 
  difficulty = 'medium', 
  testDuration = 60,
  wordCount = 25,
  testMode = 'time',
  onNextTest,
  onTypingStateChange
}) => {
  const [wordList, setWordList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [wordsLeft, setWordsLeft] = useState(wordCount);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [status, setStatus] = useState<TestStatus>('waiting');
  const inputRef = useRef<HTMLInputElement>(null);
  const wordElementsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  // For tracking tab key state for shortcuts
  const [tabPressed, setTabPressed] = useState(false);
  
  // Track if user is actively typing (to hide controls)
  const [isTyping, setIsTyping] = useState(false);
  
  // Timer for user inactivity
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track errors for accuracy calculation
  const [errorCount, setErrorCount] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);

  // Track word attempts including what the user actually typed
  const [wordAttempts, setWordAttempts] = useState<WordAttempt[]>([]);

  // Focus handling
  useEffect(() => {
    // Check if the input is already focused when the component mounts
    if (document.activeElement === inputRef.current) {
      setIsFocused(true);
    }

    // Handle window focus/blur events
    const handleWindowFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsFocused(true);
      }
    };

    const handleWindowBlur = () => {
      setIsFocused(false);
    };

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Get text sample based on mode and difficulty
  const getTextSample = () => {
    let samples;
    
    switch (testMode) {
      case 'time':
        samples = timeModeSamples;
        break;
      case 'quote':
        samples = difficulty === 'hard' ? hardModeSamples : quoteModeSamples;
        break;
      case 'words':
      default:
        samples = difficulty === 'hard' ? hardModeSamples : simpleWords;
        break;
    }
    
    // If word mode, we might need to limit the number of words
    if (testMode === 'words') {
      const randomIndex = Math.floor(Math.random() * samples.length);
      let selectedText = samples[randomIndex];
      
      // Limit to the specified word count
      const words = selectedText.split(' ');
      if (words.length > wordCount) {
        selectedText = words.slice(0, wordCount).join(' ');
      }
      
      return selectedText;
    }
    
    // For other modes, return a full sample
    return samples[Math.floor(Math.random() * samples.length)];
  };

  // Initialize with text based on selected mode
  useEffect(() => {
    const selectedText = getTextSample();
    setWordList(selectedText.split(' '));
    setWordsLeft(selectedText.split(' ').length);
    wordElementsRef.current = wordElementsRef.current.slice(0, selectedText.split(' ').length);
  }, [testMode, difficulty, wordCount]);
  
  // Notify parent component when typing state changes
  useEffect(() => {
    if (onTypingStateChange) {
      onTypingStateChange(isTyping);
    }
  }, [isTyping, onTypingStateChange]);

  // Timer countdown for time mode
  useEffect(() => {
    if (status !== 'typing' || testMode !== 'time') return;
    
    if (timeLeft <= 0) {
      setStatus('finished');
      setEndTime(Date.now());
      setIsTyping(false); // No longer typing when test is finished
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, status, testMode]);

  // Word counter for word mode
  useEffect(() => {
    if (testMode !== 'words' || status !== 'typing') return;
    
    setWordsLeft(wordList.length - currentWordIndex);
    
    if (currentWordIndex >= wordList.length) {
      setStatus('finished');
      setEndTime(Date.now());
      setIsTyping(false);
    }
  }, [currentWordIndex, wordList.length, testMode, status]);
  
  // Handle global keyboard shortcuts
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
        // Prevent default tab behavior to avoid focusing on other elements
        e.preventDefault();
      }
      
      // If tab is pressed and Enter is hit, restart test
      if (tabPressed && e.key === 'Enter') {
        e.preventDefault();
        
        if (status === 'finished') {
          // If we're finished and parent provided a next test callback, use it
          if (onNextTest) {
            onNextTest();
          } else {
            resetTest();
          }
        } else {
          // Otherwise just reset the current test
          resetTest();
        }
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
  }, [tabPressed, status, onNextTest]);

  // Cleanup inactivity timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Go back to previous word when backspace is pressed at the beginning of input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && input === '' && currentWordIndex > 0) {
      // Go back to previous word
      setCurrentWordIndex(prev => prev - 1);
      
      // Restore the previous word attempt as current input
      const prevAttempt = wordAttempts[currentWordIndex - 1];
      if (prevAttempt) {
        setInput(prevAttempt.typed);
        
        // Remove the last word attempt since we're going back
        setWordAttempts(prev => prev.slice(0, prev.length - 1));
      }
    }
    
    // User is typing, set the typing state to true
    setIsTyping(true);
    
    // Reset the inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set a new inactivity timer (2 seconds of no typing will reset the typing state)
    inactivityTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'waiting') {
      setStatus('typing');
      setStartTime(Date.now());
    }
    
    if (status === 'finished') return;
    
    const value = e.target.value;
    const prevLength = input.length;
    const currentWord = wordList[currentWordIndex];
    
    // User is typing, set the typing state to true
    setIsTyping(true);
    
    // Reset the inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set a new inactivity timer (2 seconds of no typing will reset the typing state)
    inactivityTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    // Track stats only if adding characters (not deleting)
    if (value.length > prevLength) {
      setTotalTypedChars(prev => prev + 1);
      
      // Check if the last typed character is correct
      const lastCharIndex = value.length - 1;
      if (lastCharIndex >= 0 && lastCharIndex < currentWord.length) {
        if (value[lastCharIndex] !== currentWord[lastCharIndex]) {
          setErrorCount(prev => prev + 1);
        }
      } else if (lastCharIndex >= currentWord.length) {
        // Extra character typed (beyond the expected word length)
        setErrorCount(prev => prev + 1);
      }
    }
    
    setInput(value);
    
    // Check if this is the last word and the user has typed it completely and correctly
    if (currentWordIndex === wordList.length - 1 && value === currentWord) {
      // Last word completed correctly - end test automatically
      // Add the final word to attempts
      setWordAttempts(prev => [...prev, {
        expected: currentWord,
        typed: value,
        isCorrect: true
      }]);
      
      setStatus('finished');
      setEndTime(Date.now());
      setIsTyping(false);
      return;
    }
    
    // Check if user completed a word (space pressed)
    if (value.endsWith(' ') && value.trim() !== '') {
      const typedWord = value.trim();
      const isWordCorrect = typedWord === currentWord;
      
      // Store the attempt with what was actually typed
      setWordAttempts(prev => [...prev, {
        expected: currentWord,
        typed: typedWord,
        isCorrect: isWordCorrect
      }]);
      
      // Move to next word
      setCurrentWordIndex(prev => prev + 1);
      setInput('');
      
      // Check if test is complete
      if (currentWordIndex === wordList.length - 1) {
        setStatus('finished');
        setEndTime(Date.now());
        setIsTyping(false); // No longer typing when test is finished
      }
    }
  };

  // Calculate WPM and accuracy when finished
  useEffect(() => {
    if (status !== 'finished') return;
    
    // Calculate WPM
    const durationInMinutes = ((endTime || 0) - (startTime || 0)) / 1000 / 60;
    const wordsTyped = currentWordIndex;
    const calculatedWpm = Math.round(wordsTyped / durationInMinutes);
    setWpm(calculatedWpm);
    
    // Calculate accuracy
    const calculatedAccuracy = totalTypedChars > 0 
      ? Math.round(((totalTypedChars - errorCount) / totalTypedChars) * 100) 
      : 100;
    setAccuracy(calculatedAccuracy);
  }, [status, endTime, startTime, currentWordIndex, totalTypedChars, errorCount]);

  const resetTest = () => {
    const selectedText = getTextSample();
    setWordList(selectedText.split(' '));
    setInput('');
    setCurrentWordIndex(0);
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(testDuration);
    setWordsLeft(selectedText.split(' ').length);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setTotalTypedChars(0);
    setWordAttempts([]);
    setStatus('waiting');
    setIsTyping(false); // Reset typing state
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render progress indicator based on test mode
  const renderProgressIndicator = () => {
    if (status === 'waiting') {
      return (
        <div className="text-2xl font-bold">
          <span className="text-white">Ready</span>
        </div>
      );
    }

    if (testMode === 'time') {
      return (
        <div className="text-2xl font-bold">
          <span className="text-white">{timeLeft}s</span>
        </div>
      );
    } else if (testMode === 'words') {
      return (
        <div className="text-2xl font-bold">
          <span className="text-white">{wordsLeft} words</span>
        </div>
      );
    } else {
      // Quote mode - show progress as percentage
      const progressPercent = Math.round((currentWordIndex / wordList.length) * 100);
      return (
        <div className="text-2xl font-bold">
          <span className="text-white">{progressPercent}%</span>
        </div>
      );
    }
  };

  // Render words with highlighting for current position and character-level feedback
  const renderWords = () => {
    return wordList.map((word, index) => {
      if (index < currentWordIndex) {
        // Words already typed - show what the user actually typed
        const attempt = wordAttempts[index];
        if (!attempt) return null;
        
        // Display the user's typed word with error highlighting
        return (
          <span 
            key={index} 
            ref={(el) => { wordElementsRef.current[index] = el; }} 
            className="inline-block mr-3"
          >
            {attempt.typed.split('').map((char, i) => {
              // For each character, determine if it matches the expected word
              const isCorrect = i < attempt.expected.length && char === attempt.expected[i];
              const isExtra = i >= attempt.expected.length;
              
              if (!isCorrect && !isExtra) {
                // Show incorrect character with expected character above it
                return (
                  <span key={i} className="relative inline-block">
                    <span className="text-red-500 bg-red-900/30">{char}</span>
                    <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-gray-300 text-xs bg-black/50 px-1 rounded">
                      {attempt.expected[i]}
                    </span>
                  </span>
                );
              }
              
              return (
                <span 
                  key={i} 
                  className={
                    isCorrect 
                      ? 'text-green-500' 
                      : isExtra 
                        ? 'text-red-500 bg-red-900/30' 
                        : 'text-red-500'
                  }
                >
                  {char}
                </span>
              );
            })}
            
            {/* If user typed fewer characters than expected, show missing chars */}
            {attempt.typed.length < attempt.expected.length && (
              <span className="text-red-500 opacity-50">
                {attempt.expected.slice(attempt.typed.length)}
              </span>
            )}
          </span>
        );
      } else if (index === currentWordIndex) {
        // Current word - show character-level feedback
        return (
          <span key={index} ref={(el) => { wordElementsRef.current[index] = el; }} className="inline-block mr-3">
            {word.split('').map((char, charIndex) => {
              let charClass = 'text-white tracking-wide'; // Make untyped characters more visible with letter spacing
              
              if (charIndex < input.length) {
                // Character has been typed - show feedback
                const isCorrect = input[charIndex] === char;
                
                if (!isCorrect) {
                  // Show incorrect character with expected character above it
                  return (
                    <span key={charIndex} className="relative inline-block">
                      <span className="text-red-400 bg-red-900/30 font-medium tracking-wide">{input[charIndex]}</span>
                      <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-gray-300 text-xs bg-black/50 px-1 rounded">
                        {char}
                      </span>
                    </span>
                  );
                }
                
                charClass = isCorrect 
                  ? 'text-green-400 font-medium tracking-wide' // Brighter green for correct chars
                  : 'text-red-400 bg-red-900/30 font-medium tracking-wide'; // More visible red for errors
              } else if (charIndex === input.length) {
                // Current character position - highlight with cursor
                charClass = 'text-white border-b-2 border-primary animate-pulse tracking-wide font-medium';
              }
              
              return (
                <span key={charIndex} className={charClass}>
                  {char}
                </span>
              );
            })}
            
            {/* If input is longer than word, show extra chars as errors */}
            {input.length > word.length && (
              <span className="text-red-400 bg-red-900/30 font-medium tracking-wide">
                {input.slice(word.length)}
              </span>
            )}
          </span>
        );
      } else {
        // Upcoming words - show in brighter text for better visibility
        return (
          <span key={index} ref={(el) => { wordElementsRef.current[index] = el; }} className="inline-block mr-3 text-gray-400">
            {word}
          </span>
        );
      }
    });
  };

  // Get test mode display name
  const getTestModeDisplay = () => {
    switch (testMode) {
      case 'time': return 'Time';
      case 'words': return 'Words';
      case 'quote': return 'Quote';
      default: return 'Time';
    }
  };

  // Handle focus and blur events for the input
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="w-full mx-auto">
      {status === 'finished' ? (
        <TestResults 
          wpm={wpm}
          accuracy={accuracy}
          duration={testDuration}
          errorCount={errorCount}
          totalTypedChars={totalTypedChars}
          onRestart={resetTest}
          testMode={testMode}
        />
      ) : (
        <>
        {/* Stats display */}
        <div className="flex justify-between items-center">
            {renderProgressIndicator()}
            
            <div className="text-sm px-3 py-1 bg-[#111111] rounded-full text-gray-400">
              {getTestModeDisplay()} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>

          {/* Text display area */}
          <div 
            className="relative mb-8"
            onClick={() => inputRef.current?.focus()}
          >
            {/* The actual typing area that gets blurred */}
            <div className={`h-72 overflow-auto text-2xl rounded-lg shadow-inner font-mono text-center flex items-center justify-center transition-all duration-300 ease-in-out ${!isFocused ? 'blur-sm' : 'blur-0'} select-none`}>
              <div className="w-full leading-relaxed cursor-default">
                <div className="leading-loose tracking-wide text-justify">
                  {renderWords()}
                </div>
              </div>
            </div>

            {/* Overlay that appears when not focused (outside the blurred area) */}
            <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-300 ease-in-out ${!isFocused ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`text-white text-xl font-medium px-6 py-3 bg-[#0A0A0A]/90 rounded-lg border border-primary/30 pointer-events-auto shadow-lg transform transition-all duration-300 ease-in-out ${!isFocused ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95 opacity-0'}`}>
                Click here to continue
              </span>
            </div>
          </div>
          
          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="sr-only"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-gramm="false"
          />
          
          {/* Controls */}
          <div className="flex justify-center mt-4">
            <button 
              onClick={resetTest}
              className="bg-[#111111] hover:bg-[#181818] text-white rounded-full p-3 transition-all hover:scale-110 hover:shadow-md"
              title="Reset Test (Tab+Enter)"
            >
              <ArrowPathIcon className="h-6 w-6 text-primary" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TypingTest;