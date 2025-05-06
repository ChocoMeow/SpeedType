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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
}

const TestResults: React.FC<TestResultsProps> = ({ 
  wpm, 
  accuracy, 
  duration, 
  errorCount,
  totalTypedChars,
  testMode = 'time',
  onRestart 
}) => {
  const correctChars = totalTypedChars - errorCount;
  
  // Create gradient for line chart
  const getGradient = (context: any) => {
    if (!context) return null;
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(220, 20, 60, 0.05)');
    gradient.addColorStop(1, 'rgba(220, 20, 60, 0.3)');
    return gradient;
  };
  
  // Generate chart labels based on test mode
  const getChartLabels = () => {
    if (testMode === 'time') {
      return ['0s', `${Math.floor(duration / 5)}s`, `${Math.floor(2 * duration / 5)}s`, `${Math.floor(3 * duration / 5)}s`, `${Math.floor(4 * duration / 5)}s`, `${duration}s`];
    } else if (testMode === 'words' || testMode === 'quote') {
      return ['Start', '20%', '40%', '60%', '80%', 'End'];
    }
    return ['0s', '20%', '40%', '60%', '80%', '100%'];
  };
  
  // Generate more realistic speed progression data
  const speedData = {
    labels: getChartLabels(),
    datasets: [
      {
        label: 'WPM',
        data: [
          Math.floor(wpm * 0.4), 
          Math.floor(wpm * 0.7), 
          Math.floor(wpm * 0.85), 
          Math.floor(wpm * 0.95),
          wpm,
          Math.floor(wpm * 0.98)
        ],
        borderColor: '#DC143C',
        borderWidth: 2,
        backgroundColor: function(context: any) {
          return getGradient(context);
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#e2e8f0',
        pointBorderColor: '#DC143C',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderWidth: 2,
      },
    ],
  };
  
  // Chart options with modern styling
  const speedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Speed Progression',
        color: '#e2e8f0',
        font: {
          size: 16,
          weight: "bold" as const
        },
        padding: {
          top: 8,
          bottom: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        borderColor: 'rgba(220, 20, 60, 0.5)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return `Position: ${context[0].label}`;
          },
          label: function(context: any) {
            return `${context.formattedValue} WPM`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: 'rgba(226, 232, 240, 0.7)',
          font: {
            size: 11
          },
          padding: 8
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: { 
          color: 'rgba(226, 232, 240, 0.7)',
          font: {
            size: 11
          },
          padding: 8
        },
        grid: { 
          display: false,
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      }
    }
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

  return (
    <div className="p-4 bg-[#0A0A0A] rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-white text-center mb-4">Your Results</h2>
      
      <div className="text-center text-sm text-gray-400 -mt-2 mb-4">
        {getTestModeDisplay()}
      </div>
      
      {/* Key stats row - larger, more prominent */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[#111111] p-4 rounded-lg flex flex-col items-center justify-center shadow-inner">
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Speed</div>
          <div className="text-4xl font-bold text-primary">{wpm}</div>
          <div className="text-xs text-gray-400 mt-1">words per minute</div>
        </div>
        
        <div className="bg-[#111111] p-4 rounded-lg flex flex-col items-center justify-center shadow-inner">
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Accuracy</div>
          <div className="text-4xl font-bold" style={{ 
            color: accuracy > 95 ? '#22c55e' : accuracy > 85 ? '#eab308' : '#ef4444' 
          }}>
            {accuracy}%
          </div>
          <div className="text-xs text-gray-400 mt-1">{charRatio} characters</div>
        </div>
      </div>
      
      {/* Main Speed chart */}
      <div className="mb-4">
        <div className="bg-[#111111] p-3 rounded-lg shadow-inner">
          <div className="h-48">
            <Line data={speedData} options={speedOptions} />
          </div>
        </div>
      </div>
      
      {/* Action button with icon */}
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-lg mb-3"
          title="Test Again (Tab+Enter)"
        >
          <ArrowPathIcon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default TestResults; 