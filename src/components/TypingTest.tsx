import React, { useState, useEffect, useRef } from 'react';
import TestResults from './TestResults';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { generate } from "random-words";

// Define test modes
type TestMode = 'time' | 'words' | 'quote';

// Define test status
type TestStatus = 'waiting' | 'typing' | 'finished';

// Track what the user actually typed for each word
interface WordAttempt {
  expected: string;
  typed: string;
  isCorrect: boolean;
  timeToType?: number; // Time in ms to type this word
  keystrokeTimings?: number[]; // Array of time deltas between keystrokes
}

// Function to generate words with specific difficulty
function generateWords(wordCount: number, minLength: number, maxLength: number): string[] {
  const result = generate({ exactly: wordCount, minLength, maxLength });
  return Array.isArray(result) ? result : [result];
}

// Generate paragraphs based on difficulty
function generateSamplesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string[] {
  const samples: string[] = [];
  
  // Generate 5 samples for each difficulty
  for (let i = 0; i < 5; i++) {
    let words: string[] = [];
    
    switch (difficulty) {
      case 'easy':
        // Easy: shorter words (1-4 characters)
        words = generateWords(400, 1, 4);
        break;
      case 'medium':
        // Medium: mix of short and medium words (3-8 characters)
        words = generateWords(400, 1, 8);
        break;
      case 'hard':
        // Hard: longer words (5-14 characters) with some special characters
        words =generateWords(400, 1, 14);
        break;
    }
    
    // Shuffle the words
    const shuffled = words.sort(() => 0.5 - Math.random());
    
    // Take a subset to create a reasonable paragraph
    const sampleWords = shuffled.slice(0, 400);
    samples.push(sampleWords.join(' '));
  }
  
  return samples;
}

// Static samples (as fallback)
const simpleWords = [
  "the quick brown fox jumps over the lazy dog this sentence contains all the letters in the english alphabet",
  "programming is the process of creating a set of instructions that tell a computer how to perform a task",
  "typing practice helps improve your speed and accuracy when using a keyboard regular practice leads to better results",
  "the best way to predict the future is to invent it computers are incredibly fast accurate and stupid humans are slow but brilliant",
  "practice typing to improve your speed and accuracy focus on consistency rather than raw speed for best results",
];

// Generate dynamic time mode samples based on difficulty
const easyTimeModeSamples = generateSamplesByDifficulty('easy');
const mediumTimeModeSamples = generateSamplesByDifficulty('medium');
const hardTimeModeSamples = generateSamplesByDifficulty('hard');

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

  // Add a ref for the text display container
  const textDisplayRef = useRef<HTMLDivElement>(null);

  // Add additional state for detailed metrics
  const [keystrokeTimings, setKeystrokeTimings] = useState<number[]>([]); // Time between keystrokes
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null);
  const [lastWordTime, setLastWordTime] = useState<number | null>(null);

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
        samples = difficulty === 'hard' ? hardTimeModeSamples : difficulty === 'medium' ? mediumTimeModeSamples : easyTimeModeSamples;
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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentTime = Date.now();
    
    if (status === 'waiting') {
      setStatus('typing');
      setStartTime(currentTime);
      setLastKeystrokeTime(currentTime);
      setLastWordTime(currentTime);
    }
    
    if (status === 'finished') return;
    
    const value = e.target.value;
    const prevLength = input.length;
    const currentWord = wordList[currentWordIndex];
    
    // Track keystrokes and timing
    if (lastKeystrokeTime !== null) {
      const timeDelta = currentTime - lastKeystrokeTime;
      // Only record reasonable timings (< 5 seconds)
      if (timeDelta > 0 && timeDelta < 5000) {
        setKeystrokeTimings(prev => [...prev, timeDelta]);
      }
    }
    
    // Update last keystroke time
    setLastKeystrokeTime(currentTime);
    
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
      
      // Check if the character is correct at this position
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
      // Calculate word timing
      let wordTime: number | undefined;
      if (lastWordTime !== null) {
        wordTime = currentTime - lastWordTime;
      }
      
      // Last word completed correctly - end test automatically
      // Add the final word to attempts with timing data
      setWordAttempts(prev => [...prev, {
        expected: currentWord,
        typed: value,
        isCorrect: true,
        timeToType: wordTime,
        keystrokeTimings: keystrokeTimings
      }]);
      
      setStatus('finished');
      setEndTime(currentTime);
      setIsTyping(false);
      return;
    }
    
    // Check if user completed a word (space pressed)
    if (value.endsWith(' ') && value.trim() !== '') {
      const typedWord = value.trim();
      const isWordCorrect = typedWord === currentWord;
      
      // Calculate word timing
      let wordTime: number | undefined;
      if (lastWordTime !== null) {
        wordTime = currentTime - lastWordTime;
      }
      
      // Store the attempt with what was actually typed and timing data
      setWordAttempts(prev => [...prev, {
        expected: currentWord,
        typed: typedWord,
        isCorrect: isWordCorrect,
        timeToType: wordTime,
        keystrokeTimings: [...keystrokeTimings] // Copy current keystroke timings
      }]);
      
      // Reset keystroke timings for next word
      setKeystrokeTimings([]);
      
      // Update last word time
      setLastWordTime(currentTime);
      
      // Move to next word
      setCurrentWordIndex(prev => prev + 1);
      setInput('');
      
      // Check if test is complete
      if (currentWordIndex === wordList.length - 1) {
        setStatus('finished');
        setEndTime(currentTime);
        setIsTyping(false); // No longer typing when test is finished
      }
    }
    
    // Call the auto-scroll function after input changes
    requestAnimationFrame(scrollTextIntoView);
  };

  // Calculate WPM and accuracy when finished
  useEffect(() => {
    if (status !== 'finished') return;
    
    // Calculate WPM
    const durationInMinutes = ((endTime || 0) - (startTime || 0)) / 1000 / 60;
    const wordsTyped = currentWordIndex;
    const calculatedWpm = Math.round(wordsTyped / durationInMinutes);
    setWpm(calculatedWpm);
    
    // Calculate accuracy using word attempts for a more precise measurement
    // This focuses on the final state of each word, crediting users for corrections
    if (wordAttempts.length > 0) {
      let correctChars = 0;
      let totalChars = 0;
      let actualErrors = 0;
      
      // Go through each word attempt - only counting the final state
      wordAttempts.forEach(attempt => {
        const expectedLength = attempt.expected.length;
        const typedLength = attempt.typed.length;
        
        // Add expected characters to total
        totalChars += expectedLength;
        
        // Count character differences (errors)
        for (let i = 0; i < Math.min(expectedLength, typedLength); i++) {
          if (attempt.typed[i] === attempt.expected[i]) {
            correctChars++;
          } else {
            actualErrors++;
          }
        }
        
        // Count extra/missing characters as errors
        const diff = Math.abs(typedLength - expectedLength);
        actualErrors += diff;
        
        if (typedLength > expectedLength) {
          totalChars += (typedLength - expectedLength);
        }
      });
      
      // If current word is partially typed but not submitted, include it in the calculation
      if (input.length > 0 && currentWordIndex < wordList.length) {
        const currentWord = wordList[currentWordIndex];
        totalChars += currentWord.length;
        
        for (let i = 0; i < Math.min(input.length, currentWord.length); i++) {
          if (input[i] === currentWord[i]) {
            correctChars++;
          } else {
            actualErrors++;
          }
        }
        
        if (input.length > currentWord.length) {
          const diff = input.length - currentWord.length;
          totalChars += diff;
          actualErrors += diff;
        }
      }
      
      // Update error count based on the actual character errors found
      setErrorCount(actualErrors);
      
      // Calculate final accuracy percentage
      const calculatedAccuracy = totalChars > 0 
        ? Math.round((correctChars / totalChars) * 100)
        : 100;
      
      setAccuracy(calculatedAccuracy);
    } else {
      // Fallback to the original calculation if no word attempts are recorded
      const calculatedAccuracy = totalTypedChars > 0 
        ? Math.round(((totalTypedChars - errorCount) / totalTypedChars) * 100) 
        : 100;
      setAccuracy(calculatedAccuracy);
    }
  }, [status, endTime, startTime, currentWordIndex, totalTypedChars, errorCount, wordAttempts, input, wordList]);

  // Add scrollTextIntoView call after moving to next word
  useEffect(() => {
    scrollTextIntoView();
  }, [currentWordIndex]);

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
    setKeystrokeTimings([]);
    setLastKeystrokeTime(null);
    setLastWordTime(null);
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

  // Add function to auto-scroll text as user types
  const scrollTextIntoView = () => {
    if (!textDisplayRef.current) return;
    
    // Find the current word element
    const currentWordEl = wordElementsRef.current[currentWordIndex];
    if (!currentWordEl) return;
    
    // Get the positions
    const containerRect = textDisplayRef.current.getBoundingClientRect();
    const wordRect = currentWordEl.getBoundingClientRect();
    
    // Calculate the top position of the current word relative to the container
    const relativeTop = wordRect.top - containerRect.top;
    
    // If the word is near the bottom of the visible area, scroll it to the middle
    if (relativeTop > containerRect.height / 2) {
      textDisplayRef.current.scrollTop += relativeTop - containerRect.height / 3;
    }
  };

  // Handle special key events
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

  return (
    <div className="w-full mx-auto">
      {status === 'finished' ? (
        <TestResults 
          wpm={wpm}
          accuracy={accuracy}
          duration={Math.round(((endTime || 0) - (startTime || 0)) / 1000)}
          errorCount={errorCount}
          totalTypedChars={totalTypedChars}
          testMode={testMode}
          onRestart={resetTest}
          wordAttempts={wordAttempts}
        />
      ) : (
        <>
        {/* Stats display */}
        <div className="flex justify-between items-center mb-4">
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
            <div className={`py-2 h-40 overflow-hidden text-2xl rounded-lg shadow-inner font-mono text-center flex items-center justify-center transition-all duration-300 ease-in-out ${!isFocused ? 'blur-sm' : 'blur-0'} select-none relative`}>
              <div 
                ref={textDisplayRef}
                className="w-full max-h-full overflow-hidden leading-relaxed cursor-default"
              >
                <div className="leading-loose tracking-wide text-justify">
                  {renderWords()}
                </div>
              </div>
              
              {/* Gradient overlays to indicate more text above/below */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
            </div>

            {/* Overlay that appears when not focused (outside the blurred area) */}
            <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-300 ease-in-out ${!isFocused ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`text-white text-xl font-medium px-6 pointer-events-auto shadow-lg transform transition-all duration-300 ease-in-out ${!isFocused ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95 opacity-0'}`}>
                click here to continue
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