import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  CommandLineIcon,
  TrophyIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Practice';
    if (path === '/leaderboard') return 'Leaderboard';
    if (path === '/settings') return 'Settings';
    if (path === '/auth') return 'Login/Register';
    return 'SpeedType';
  };

  return (
    <nav className="bg-[#0A0A0A] p-4 text-gray-200 border-b border-[#1A1A1A]">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          {/* Logo SVG */}
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H14M4 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 15L17 19L21 17L19 15Z" fill="currentColor"/>
          </svg>
          <span className="text-primary font-bold text-xl">SpeedType</span>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-gray-200"
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-8">
          <li>
            <Link to="/" className={`flex items-center space-x-1 ${location.pathname === '/' ? 'text-primary' : 'text-gray-300 hover:text-primary'} transition-colors`}>
              <CommandLineIcon className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <Link to="/leaderboard" className={`flex items-center space-x-1 ${location.pathname === '/leaderboard' ? 'text-primary' : 'text-gray-300 hover:text-primary'} transition-colors`}>
              <TrophyIcon className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`flex items-center space-x-1 ${location.pathname === '/settings' ? 'text-primary' : 'text-gray-300 hover:text-primary'} transition-colors`}>
              <Cog6ToothIcon className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <Link to="/auth" className={`flex items-center space-x-1 ${location.pathname === '/auth' ? 'text-primary' : 'text-gray-300 hover:text-primary'} transition-colors`}>
              <UserIcon className="h-5 w-5" />
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 right-0 left-0 bg-[#111111] shadow-md z-10 animate-fade-in">
          <ul className="py-2">
            <li>
              <Link to="/" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#181818]">
                <CommandLineIcon className="h-5 w-5" />
                <span>Practice</span>
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#181818]">
                <TrophyIcon className="h-5 w-5" />
                <span>Leaderboard</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#181818]">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <Link to="/auth" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#181818]">
                <UserIcon className="h-5 w-5" />
                <span>Login/Register</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 