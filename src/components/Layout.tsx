import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-gray-200">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 