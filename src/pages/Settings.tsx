import { useState, useEffect, useRef } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  CogIcon,
  BellIcon, 
  LightBulbIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

// Define theme types with color values
type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
};

type ThemeOption = {
  id: string;
  name: string;
  colors: ThemeColors;
  preview: string;
};

// Available themes
const themes: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#CC2D2D',
      background: '#0A0A0A',
      card: '#111111',
      text: '#FFFFFF',
      border: '#1A1A1A'
    },
    preview: 'bg-[#0A0A0A] border-[#1A1A1A]'
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#CC2D2D',
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#111111',
      border: '#E5E5E5'
    },
    preview: 'bg-[#F5F5F5] border-[#E5E5E5]'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#3B82F6',
      background: '#0F172A',
      card: '#1E293B',
      text: '#F8FAFC',
      border: '#334155'
    },
    preview: 'bg-[#0F172A] border-[#334155]'
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#22C55E',
      background: '#14241C',
      card: '#1C3026',
      text: '#E5F5EB',
      border: '#2E5741'
    },
    preview: 'bg-[#14241C] border-[#2E5741]'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F97316',
      background: '#1F1511',
      card: '#2C1E17',
      text: '#FEF3EE',
      border: '#4A3324'
    },
    preview: 'bg-[#1F1511] border-[#4A3324]'
  }
];

// Define available keyboard layouts
const keyboardLayouts = [
  { id: 'qwerty', name: 'QWERTY' },
  { id: 'dvorak', name: 'Dvorak' },
  { id: 'colemak', name: 'Colemak' },
  { id: 'azerty', name: 'AZERTY' },
  { id: 'workman', name: 'Workman' }
];

// Define available languages
const languages = [
  { id: 'english', name: 'English' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'french', name: 'French' },
  { id: 'german', name: 'German' },
  { id: 'portuguese', name: 'Portuguese' },
  { id: 'italian', name: 'Italian' },
  { id: 'dutch', name: 'Dutch' },
  { id: 'russian', name: 'Russian' },
  { id: 'japanese', name: 'Japanese' }
];

// Define font options
const fontOptions = [
  { id: 'system', name: 'System Default' },
  { id: 'monospace', name: 'Monospace' },
  { id: 'sans-serif', name: 'Sans Serif' }, 
  { id: 'serif', name: 'Serif' }
];

// Define font size options
const fontSizeOptions = [
  { id: 'small', name: 'Small', value: '0.875rem' },
  { id: 'medium', name: 'Medium', value: '1rem' },
  { id: 'large', name: 'Large', value: '1.25rem' },
  { id: 'x-large', name: 'Extra Large', value: '1.5rem' }
];

// Define caret style options
const caretStyleOptions = [
  { id: 'line', name: 'Line' },
  { id: 'block', name: 'Block' },
  { id: 'underscore', name: 'Underscore' },
  { id: 'outline', name: 'Outline' }
];

// Main Settings component
const Settings = () => {
  // Default settings with expanded options
  const defaultSettings = {
    // Appearance
    theme: 'dark',
    fontFamily: 'monospace',
    fontSize: 'medium',
    caretStyle: 'line',
    caretColor: '#CC2D2D',
    smoothCaret: true,
    highlightMatchingBrackets: true,
    
    // Behavior
    soundEffects: true,
    soundVolume: 50,
    notifications: true,
    autoSaveProgress: true,
    showLiveWPM: true,
    showLiveAccuracy: true,
    
    // Typing Test
    keyboardLayout: 'qwerty',
    defaultDifficulty: 'medium',
    language: 'english',
    quickRestart: true,
    confidenceMode: false, // Hide WPM during test
    blindMode: false, // Hide text during test
    
    // Advanced
    countdownTime: 3,
    capsLockWarning: true,
    tabMovesFocus: false,
    showTimerProgress: true,
    blurredOpacity: 70,
    
    // Appearance customization
    customBackground: '',
    customCss: ''
  };
  
  // Main state for settings
  const [settings, setSettings] = useState(defaultSettings);
  
  // Form state - copy of settings that gets updated as user makes changes
  const [formValues, setFormValues] = useState({ ...settings });
  
  // Current tab in settings
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'typing' | 'advanced'>('appearance');
  
  // Status for saving settings
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Preview theme toggle
  const [previewingTheme, setPreviewingTheme] = useState(false);
  
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('speedTypeSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setFormValues(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'range') {
      setFormValues(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setFormValues((prev) => ({
      ...prev,
      theme: themeId
    }));
  };

  // Save settings
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set saving status
    setSaveStatus('saving');
    
    try {
      // Save to localStorage
      localStorage.setItem('speedTypeSettings', JSON.stringify(formValues));
      
      // Update settings state
      setSettings(formValues);
      
      // Show success message
      setSaveStatus('success');
      
      // Apply theme changes if needed
      applyThemeChanges(formValues.theme);
      
      // Reset status after delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };
  
  // Apply theme changes - in a real app this would update CSS variables
  const applyThemeChanges = (themeId: string) => {
    const selectedTheme = themes.find(theme => theme.id === themeId);
    if (!selectedTheme) return;
    
    // This would update CSS variables in a real implementation
    console.log('Applying theme:', selectedTheme.name);
  };
  
  // Reset to saved settings
  const handleReset = () => {
    setFormValues({ ...settings });
    setPreviewingTheme(false);
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setFormValues({ ...defaultSettings });
    }
  };
  
  // Export settings to JSON
  const handleExportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speedtype-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import settings from JSON file
  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Validate imported settings - simple check for now
        if (imported && typeof imported === 'object' && 'theme' in imported) {
          setFormValues(imported);
          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          throw new Error('Invalid settings file');
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  // Render tab button
  const TabButton = ({ 
    id, 
    current, 
    icon, 
    label 
  }: { 
    id: 'appearance' | 'behavior' | 'typing' | 'advanced', 
    current: string, 
    icon: React.ReactNode, 
    label: string 
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-3 border-b-2 ${
        activeTab === id 
          ? 'border-primary text-primary' 
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
      } transition-colors`}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </button>
  );
  
  // Render setting section
  const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4 pb-2 border-b border-[#1A1A1A]">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
  
  // Trigger checkbox change
  const handleToggle = (id: string) => {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      
      // Create and dispatch a synthetic change event
      const event = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(event);
    }
  };
  
  // Toggle switch component using standard approach
  const ToggleSwitch = ({ 
    id, 
    name, 
    label, 
    checked, 
    onChange, 
    description 
  }: { 
    id: string, 
    name: string, 
    label: string, 
    checked: boolean, 
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    description?: string
  }) => {
    return (
      <div className="flex justify-between items-start">
        <div>
          <label htmlFor={id} className="font-medium text-gray-300 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-[#333333]'}`}>
            <div className={`absolute w-4 h-4 bg-white rounded-full top-1 left-1 transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>
    );
  };
  
  // Select option component
  const SelectOption = ({ 
    id, 
    name, 
    label, 
    value, 
    onChange, 
    options,
    description
  }: { 
    id: string, 
    name: string, 
    label: string, 
    value: string, 
    onChange: React.ChangeEventHandler<HTMLSelectElement>,
    options: {id: string, name: string}[],
    description?: string
  }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="font-medium text-gray-300">
          {label}
        </label>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full py-2 px-3 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-gray-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
  
  // Slider component
  const Slider = ({ 
    id, 
    name, 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100,
    description
  }: { 
    id: string, 
    name: string, 
    label: string, 
    value: number, 
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    min?: number,
    max?: number,
    description?: string
  }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="font-medium text-gray-300">
          {label}
        </label>
        <span className="text-sm text-gray-400">{value}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <input
        type="range"
        id={id}
        name={name}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
  
  // Color picker component
  const ColorPicker = ({ 
    id, 
    name, 
    label, 
    value, 
    onChange 
  }: { 
    id: string, 
    name: string, 
    label: string, 
    value: string, 
    onChange: React.ChangeEventHandler<HTMLInputElement> 
  }) => (
    <div className="flex justify-between items-center">
      <label htmlFor={id} className="font-medium text-gray-300">
        {label}
      </label>
      <div className="flex items-center">
        <span className="w-6 h-6 rounded border border-[#333333] inline-block mr-2" style={{ backgroundColor: value }}></span>
        <input
          type="color"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-8 h-8 bg-transparent border-0 p-0 cursor-pointer"
        />
      </div>
    </div>
  );
  
  // Theme selector
  const ThemeSelector = () => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-300">Theme</h4>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`p-1 rounded-md border-2 transition-all ${
              formValues.theme === theme.id 
                ? 'border-primary scale-105' 
                : 'border-transparent hover:border-gray-600'
            }`}
            title={theme.name}
          >
            <div className={`h-16 rounded ${theme.preview} flex items-center justify-center`}>
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-300">{theme.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
  
  // Save button with status indicator
  const SaveButton = ({ status }: { status: 'idle' | 'saving' | 'success' | 'error' }) => (
    <button
      type="submit"
      disabled={status === 'saving'}
      className={`
        flex items-center px-6 py-2 rounded-lg font-semibold transition-colors
        ${status === 'idle' ? 'bg-primary hover:bg-primary-dark text-white' : ''}
        ${status === 'saving' ? 'bg-gray-600 text-gray-200 cursor-not-allowed' : ''}
        ${status === 'success' ? 'bg-green-600 text-white' : ''}
        ${status === 'error' ? 'bg-red-600 text-white' : ''}
      `}
    >
      {status === 'idle' && 'Save Settings'}
      {status === 'saving' && (
        <>
          <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      )}
      {status === 'success' && (
        <>
          <CheckIcon className="w-4 h-4 mr-2" />
          Saved!
        </>
      )}
      {status === 'error' && (
        <>
          <XMarkIcon className="w-4 h-4 mr-2" />
          Error
        </>
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Settings</h1>
        <p className="text-gray-400 text-lg">Customize your SpeedType experience</p>
      </div>
      
      <div className="bg-[#111111] rounded-lg shadow-lg border border-[#1A1A1A] overflow-hidden">
        {/* Settings Tabs */}
        <div className="flex overflow-x-auto bg-[#0A0A0A] border-b border-[#1A1A1A]">
          <TabButton 
            id="appearance" 
            current={activeTab} 
            icon={<LightBulbIcon className="h-5 w-5" />}
            label="Appearance" 
          />
          <TabButton 
            id="behavior" 
            current={activeTab} 
            icon={<BellIcon className="h-5 w-5" />} 
            label="Behavior" 
          />
          <TabButton 
            id="typing" 
            current={activeTab} 
            icon={<KeyIcon className="h-5 w-5" />} 
            label="Typing Test" 
          />
          <TabButton 
            id="advanced" 
            current={activeTab} 
            icon={<CogIcon className="h-5 w-5" />} 
            label="Advanced" 
          />
        </div>
        
        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div>
              <SettingSection title="Theme & Colors">
                <ThemeSelector />
                
                <ColorPicker 
                  id="caretColor" 
                  name="caretColor" 
                  label="Caret Color"
                  value={formValues.caretColor}
                  onChange={handleChange}
                />
                
                <SelectOption
                  id="caretStyle"
                  name="caretStyle"
                  label="Caret Style"
                  value={formValues.caretStyle}
                  onChange={handleChange}
                  options={caretStyleOptions}
                />
                
                <ToggleSwitch
                  id="smoothCaret"
                  name="smoothCaret"
                  label="Smooth Caret Animation"
                  checked={formValues.smoothCaret}
                  onChange={handleChange}
                  description="Enable smooth transitions for the typing caret"
                />
              </SettingSection>
              
              <SettingSection title="Text & Font">
                <SelectOption
                  id="fontFamily"
                  name="fontFamily"
                  label="Font Family"
                  value={formValues.fontFamily}
                  onChange={handleChange}
                  options={fontOptions}
                />
                
                <SelectOption
                  id="fontSize"
                  name="fontSize"
                  label="Font Size"
                  value={formValues.fontSize}
                  onChange={handleChange}
                  options={fontSizeOptions}
                />
                
                <ToggleSwitch
                  id="highlightMatchingBrackets"
                  name="highlightMatchingBrackets"
                  label="Highlight Matching Brackets"
                  checked={formValues.highlightMatchingBrackets}
                  onChange={handleChange}
                  description="Highlight matching brackets and parentheses while typing"
                />
              </SettingSection>
              
              <SettingSection title="Custom Styling">
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Custom Background URL
                  </label>
                  <input
                    type="text"
                    name="customBackground"
                    value={formValues.customBackground}
                    onChange={handleChange}
                    placeholder="https://example.com/background.jpg"
                    className="w-full py-2 px-3 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-gray-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for default background</p>
                </div>
                
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Custom CSS
                  </label>
                  <textarea
                    name="customCss"
                    value={formValues.customCss}
                    onChange={handleChange}
                    rows={4}
                    placeholder="/* Add your custom CSS here */"
                    className="w-full py-2 px-3 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-gray-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Advanced: Add custom CSS to modify the appearance</p>
                </div>
              </SettingSection>
            </div>
          )}
          
          {/* Behavior Settings */}
          {activeTab === 'behavior' && (
            <div>
              <SettingSection title="Sound & Notifications">
                <ToggleSwitch
                  id="soundEffects"
                  name="soundEffects"
                  label="Sound Effects"
                  checked={formValues.soundEffects}
                  onChange={handleChange}
                  description="Play sound effects during typing"
                />
                
                {formValues.soundEffects && (
                  <Slider
                    id="soundVolume"
                    name="soundVolume"
                    label="Sound Volume"
                    value={formValues.soundVolume}
                    onChange={handleChange}
                  />
                )}
                
                <ToggleSwitch
                  id="notifications"
                  name="notifications"
                  label="Notifications"
                  checked={formValues.notifications}
                  onChange={handleChange}
                  description="Show browser notifications for test results and achievements"
                />
              </SettingSection>
              
              <SettingSection title="Feedback & Progress">
                <ToggleSwitch
                  id="showLiveWPM"
                  name="showLiveWPM"
                  label="Show Live WPM"
                  checked={formValues.showLiveWPM}
                  onChange={handleChange}
                  description="Display real-time WPM during typing tests"
                />
                
                <ToggleSwitch
                  id="showLiveAccuracy"
                  name="showLiveAccuracy"
                  label="Show Live Accuracy"
                  checked={formValues.showLiveAccuracy}
                  onChange={handleChange}
                  description="Display real-time accuracy during typing tests"
                />
                
                <ToggleSwitch
                  id="autoSaveProgress"
                  name="autoSaveProgress"
                  label="Auto-Save Progress"
                  checked={formValues.autoSaveProgress}
                  onChange={handleChange}
                  description="Automatically save your typing progress and statistics"
                />
              </SettingSection>
            </div>
          )}
          
          {/* Typing Test Settings */}
          {activeTab === 'typing' && (
            <div>
              <SettingSection title="Test Configuration">
                <SelectOption
                  id="keyboardLayout"
                  name="keyboardLayout"
                  label="Keyboard Layout"
                  value={formValues.keyboardLayout}
                  onChange={handleChange}
                  options={keyboardLayouts}
                />
                
                <SelectOption
                  id="defaultDifficulty"
                  name="defaultDifficulty"
                  label="Default Difficulty"
                  value={formValues.defaultDifficulty}
                  onChange={handleChange}
                  options={[
                    { id: 'easy', name: 'Easy' },
                    { id: 'medium', name: 'Medium' },
                    { id: 'hard', name: 'Hard' },
                    { id: 'expert', name: 'Expert' }
                  ]}
                />
                
                <SelectOption
                  id="language"
                  name="language"
                  label="Language"
                  value={formValues.language}
                  onChange={handleChange}
                  options={languages}
                />
                
                <Slider
                  id="countdownTime"
                  name="countdownTime"
                  label="Countdown Time"
                  value={formValues.countdownTime}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  description="Seconds to count down before starting a test (0 to disable)"
                />
              </SettingSection>
              
              <SettingSection title="Test Experience">
                <ToggleSwitch
                  id="quickRestart"
                  name="quickRestart"
                  label="Quick Restart (Tab+Enter)"
                  checked={formValues.quickRestart}
                  onChange={handleChange}
                  description="Enable Tab+Enter keyboard shortcut to restart tests"
                />
                
                <ToggleSwitch
                  id="confidenceMode"
                  name="confidenceMode"
                  label="Confidence Mode"
                  checked={formValues.confidenceMode}
                  onChange={handleChange}
                  description="Hide WPM and accuracy stats during the test"
                />
                
                <ToggleSwitch
                  id="blindMode"
                  name="blindMode"
                  label="Blind Mode"
                  checked={formValues.blindMode}
                  onChange={handleChange}
                  description="Hide the text being typed for an extra challenge"
                />
                
                <ToggleSwitch
                  id="showTimerProgress"
                  name="showTimerProgress"
                  label="Show Timer Progress"
                  checked={formValues.showTimerProgress}
                  onChange={handleChange}
                  description="Display a progress bar for timed tests"
                />
              </SettingSection>
            </div>
          )}
          
          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div>
              <SettingSection title="Interface Options">
                <ToggleSwitch
                  id="capsLockWarning"
                  name="capsLockWarning"
                  label="Caps Lock Warning"
                  checked={formValues.capsLockWarning}
                  onChange={handleChange}
                  description="Show a warning when Caps Lock is enabled"
                />
                
                <ToggleSwitch
                  id="tabMovesFocus"
                  name="tabMovesFocus"
                  label="Tab Moves Focus"
                  checked={formValues.tabMovesFocus}
                  onChange={handleChange}
                  description="Allow Tab key to move focus between elements (disables Tab+Enter restart)"
                />
                
                <Slider
                  id="blurredOpacity"
                  name="blurredOpacity"
                  label="Blurred Opacity"
                  value={formValues.blurredOpacity}
                  onChange={handleChange}
                  description="Control the opacity level when the typing area is blurred"
                />
              </SettingSection>
              
              <SettingSection title="Data Management">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleExportSettings}
                    className="flex items-center justify-center py-2 px-4 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 rounded-lg transition-colors"
                  >
                    Export Settings
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center py-2 px-4 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 rounded-lg transition-colors"
                  >
                    Import Settings
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Reset All Settings to Default
                  </button>
                </div>
              </SettingSection>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-[#1A1A1A] mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center px-6 py-2 bg-[#181818] hover:bg-[#252525] text-gray-300 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reset Changes
            </button>
            
            <SaveButton status={saveStatus} />
          </div>
          
          {/* Extra Account Section */}
          <div className="mt-8 p-4 bg-[#0A0A0A] rounded-lg border border-[#1A1A1A]">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Account Settings</h3>
            <p className="text-gray-400 mb-4">
              Sign in to sync your settings across devices and unlock more features.
            </p>
            <div className="flex justify-end">
              <a 
                href="/auth" 
                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 