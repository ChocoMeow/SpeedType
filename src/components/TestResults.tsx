import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  BarElement
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowPathIcon, CheckIcon, XMarkIcon, ClockIcon, FireIcon } from '@heroicons/react/24/solid';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set global defaults for all charts
ChartJS.defaults.font.family = "'Inter', 'SF Pro Display', 'Helvetica', sans-serif";
ChartJS.defaults.color = 'rgba(226, 232, 240, 0.7)';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

// Define test modes
type TestMode = 'time' | 'words' | 'quote';

interface TestResultsProps {
  wpm: number;
  accuracy: number;
  duration: number;
  errorCount: number;
  totalTypedChars: number;
  testMode?: TestMode;
  onRestart: () => void;
  wordAttempts?: Array<{expected: string, typed: string, isCorrect: boolean, timeToType?: number}>;
}

const TestResults: React.FC<TestResultsProps> = ({ 
  wpm, 
  accuracy, 
  duration, 
  errorCount,
  totalTypedChars,
  testMode = 'time',
  onRestart,
  wordAttempts = []
}) => {
  const correctChars = totalTypedChars - errorCount;
  
  // Create gradient for line chart
  const getWpmGradient = (context: any) => {
    if (!context) return null;
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(220, 20, 60, 0.05)');
    gradient.addColorStop(1, 'rgba(220, 20, 60, 0.3)');
    return gradient;
  };
  
  // Create gradient for accuracy
  const getAccGradient = (context: any) => {
    if (!context) return null;
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.05)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');
    return gradient;
  };
  
  // Generate test segments based on test mode
  const getSegmentCount = () => testMode === 'time' ? 8 : 5;
  
  const segmentCount = getSegmentCount();
  
  // Generate segments for visualization using real data
  const generateSegmentData = () => {
    const segments = [];
    
    // Calculate real segments based on word attempts
    if (wordAttempts.length > 0) {
      // We'll split the word attempts into segments
      const segmentSize = Math.max(1, Math.ceil(wordAttempts.length / segmentCount));
      
      for (let i = 0; i < segmentCount; i++) {
        const start = i * segmentSize;
        const end = Math.min(wordAttempts.length, (i + 1) * segmentSize);
        
        if (start >= wordAttempts.length) break;
        
        const segmentAttempts = wordAttempts.slice(start, end);
        
        if (segmentAttempts.length === 0) continue;
        
        // Count character-level errors
        let segmentCharErrors = 0;
        let segmentCharsTotal = 0;
        
        segmentAttempts.forEach(attempt => {
          const expectedLength = attempt.expected.length;
          const typedLength = attempt.typed.length;
          
          segmentCharsTotal += expectedLength;
          
          // Count character errors
          for (let i = 0; i < Math.min(expectedLength, typedLength); i++) {
            if (attempt.typed[i] !== attempt.expected[i]) {
              segmentCharErrors++;
            }
          }
          
          // Extra/missing characters count as errors
          const diff = Math.abs(typedLength - expectedLength);
          segmentCharErrors += diff;
          
          if (typedLength > expectedLength) {
            segmentCharsTotal += (typedLength - expectedLength);
          }
        });
        
        // Calculate segment accuracy based on characters, not words
        const segmentAccuracy = segmentCharsTotal > 0 
          ? Math.round(((segmentCharsTotal - segmentCharErrors) / segmentCharsTotal) * 100)
          : 100;
        
        // Calculate segment WPM based on average time to type words
        let segmentWpm = 0;
        const validTimings = segmentAttempts.filter(a => a.timeToType !== undefined);
        
        if (validTimings.length > 0) {
          // Average time per word in milliseconds
          const avgTimePerWord = validTimings.reduce((sum, attempt) => 
            sum + (attempt.timeToType || 0), 0) / validTimings.length;
          
          // Convert to WPM (60000ms in a minute)
          segmentWpm = Math.round(60000 / (avgTimePerWord || 1));
        } else {
          // Fallback if timing data is missing
          segmentWpm = Math.round(wpm * ((i + 1) / segmentCount));
        }
        
        // Create segment data
        segments.push({
          index: i,
          label: testMode === 'time' ? `${Math.round(duration * i / segmentCount)}s` : `${Math.round(i * 100 / segmentCount)}%`,
          wpm: segmentWpm,
          accuracy: segmentAccuracy,
          errorCount: segmentCharErrors
        });
      }
    } else {
      // If no attempt data, distribute the total error count across segments
      const errorsPerSegment = errorCount > 0 ? Math.max(1, Math.floor(errorCount / segmentCount)) : 0;
      
      for (let i = 0; i < segmentCount; i++) {
        segments.push({
          index: i,
          label: testMode === 'time' ? `${Math.round(duration * i / segmentCount)}s` : `${Math.round(i * 100 / segmentCount)}%`,
          wpm: Math.round(wpm * ((i + 1) / segmentCount)),
          accuracy: Math.round(accuracy * ((90 + i * 2) / 100)),
          // Distribute errors among segments, with more toward the beginning
          errorCount: Math.round(errorsPerSegment * (1 + 0.5 * (segmentCount - i) / segmentCount))
        });
      }
    }
    
    // Add the final point
    segments.push({
      index: segmentCount,
      label: testMode === 'time' ? `${duration}s` : '100%',
      wpm: wpm,
      accuracy: accuracy,
      errorCount: Math.max(0, Math.floor(errorCount / 10)) // Show some errors in final point if there were many
    });
    
    return segments;
  };

  const segments = generateSegmentData();
  
  // Create a properly typed chart data object
  const combinedChartData: ChartData<'line'> = {
    labels: segments.map(s => s.label),
    datasets: [
      {
        label: 'WPM',
        data: segments.map(s => s.wpm),
        borderColor: '#DC143C',
        borderWidth: 2,
        backgroundColor: function(context: any) {
          return getWpmGradient(context);
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#e2e8f0',
        pointBorderColor: '#DC143C',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Accuracy',
        data: segments.map(s => s.accuracy),
        borderColor: '#22c55e',
        borderWidth: 2,
        backgroundColor: function(context: any) {
          return getAccGradient(context);
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#e2e8f0',
        pointBorderColor: '#22c55e',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
      {
        label: 'Errors',
        data: segments.map(s => s.errorCount),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 3,
        borderDash: [],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        fill: true,
        yAxisID: 'y2',
      }
    ],
  };
  
  // Chart options for combined chart
  const combinedOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 8,
        borderColor: 'rgba(100, 100, 100, 0.5)',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            return `Position: ${context[0].label}`;
          },
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.raw;
            
            if (datasetLabel === 'WPM') {
              return `Speed: ${value} WPM`;
            } else if (datasetLabel === 'Accuracy') {
              return `Accuracy: ${value}%`;
            } else {
              return `Errors: ${value} characters`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'WPM',
          color: '#DC143C',
          font: {
            size: 10,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        ticks: { 
          color: '#DC143C',
          font: {
            size: 10
          },
          padding: 5
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
        },
        border: {
          display: false
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Accuracy %',
          color: '#22c55e',
          font: {
            size: 10,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        max: 100,
        ticks: { 
          color: '#22c55e',
          font: {
            size: 10
          },
          padding: 5
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Errors',
          color: '#EF4444',
          font: {
            size: 10,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        ticks: { 
          color: '#EF4444',
          font: {
            size: 10
          },
          padding: 5,
          // Only show a limited number of ticks to avoid cluttering
          callback: function(tickValue: number | string) {
            const value = Number(tickValue);
            if (value === 0 || value % 2 === 0) return tickValue;
            return '';
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: { 
          color: 'rgba(226, 232, 240, 0.7)',
          font: {
            size: 10
          },
          padding: 5
        },
        grid: { 
          display: false,
        },
        border: {
          display: false
        }
      },
    },
  };

  // Calculate character ratio text
  const charRatio = `${correctChars} / ${totalTypedChars}`;

  // Get test mode display name
  const getTestModeDisplay = () => {
    switch (testMode) {
      case 'time': return 'Time Mode';
      case 'words': return 'Word Mode';
      case 'quote': return 'Quote Mode';
      default: return 'Time Mode';
    }
  };
  
  // Calculate keystrokes per second
  const keystrokesPerSecond = totalTypedChars / (duration / 60);
  
  // Calculate consistency score (lower variance = higher consistency)
  const speedVariance = segments.reduce((acc, segment, idx) => {
    if (idx === 0) return 0;
    const diff = Math.abs(segment.wpm - segments[idx-1].wpm);
    return acc + diff;
  }, 0) / segments.length;
  
  const consistencyScore = Math.max(0, 100 - (speedVariance / wpm * 100));

  return (
    <div className="bg-[#0A0A0A] rounded-lg shadow-lg animate-fade-in overflow-hidden max-h-screen grid grid-cols-7 gap-2 p-3">
      {/* Left column - Key stats */}
      <div className="col-span-2 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Results</h2>
            <div className="text-sm text-gray-400">{getTestModeDisplay()}</div>
          </div>
          <button
            onClick={onRestart}
            className="bg-primary text-white rounded-full p-2 transition-all hover:scale-110"
            title="Test Again (Tab+Enter)"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Main stats */}
        <div className="bg-[#111111] rounded-lg p-4 flex-grow flex flex-col justify-center space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] mr-3">
              <FireIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Speed</div>
              <div className="text-3xl font-bold text-primary">{wpm} <span className="text-sm font-normal text-gray-400">WPM</span></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] mr-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Accuracy</div>
              <div className="text-3xl font-bold text-green-500">{accuracy}%</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] mr-3">
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Errors</div>
              <div className="text-3xl font-bold text-red-500">{errorCount} <span className="text-sm font-normal text-gray-400">chars</span></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] mr-3">
              <ClockIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Time</div>
              <div className="text-3xl font-bold text-blue-400">{duration} <span className="text-sm font-normal text-gray-400">seconds</span></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column - Chart */}
      <div className="col-span-5 flex flex-col">
        <div className="bg-[#111111] rounded-lg p-3 mb-2 flex-grow">
          <div className="h-full">
            <Line data={combinedChartData} options={combinedOptions} />
          </div>
        </div>
        
        {/* Bottom stats row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#111111] p-2 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Characters</div>
            <div className="text-lg font-medium text-white">{charRatio}</div>
          </div>
          
          <div className="bg-[#111111] p-2 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Keystrokes/Sec</div>
            <div className="text-lg font-medium text-white">{Math.round(keystrokesPerSecond * 10) / 10}</div>
          </div>
          
          <div className="bg-[#111111] p-2 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Consistency</div>
            <div className="text-lg font-medium text-white">{Math.round(consistencyScore)}%</div>
          </div>
          
          <div className="bg-[#111111] p-2 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Avg. Word Length</div>
            <div className="text-lg font-medium text-white">{Math.round(totalTypedChars / (wpm / 60) / 5 * 10) / 10}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 