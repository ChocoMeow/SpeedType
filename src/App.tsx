import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

// Custom wrapper component to handle title updates
const PageWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => {
  useEffect(() => {
    // Update document title when component mounts
    document.title = `${title} | SpeedType`;
    
    // Reset to default when component unmounts
    return () => {
      document.title = 'SpeedType';
    };
  }, [title]);
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PageWrapper title="Practice">
            <Layout><Practice /></Layout>
          </PageWrapper>
        } />
        <Route path="/practice" element={<Navigate to="/" replace />} />
        <Route path="/leaderboard" element={
          <PageWrapper title="Leaderboard">
            <Layout><Leaderboard /></Layout>
          </PageWrapper>
        } />
        <Route path="/settings" element={
          <PageWrapper title="Settings">
            <Layout><Settings /></Layout>
          </PageWrapper>
        } />
        <Route path="/auth" element={
          <PageWrapper title="Login/Register">
            <Layout><Auth /></Layout>
          </PageWrapper>
        } />
      </Routes>
    </Router>
  );
}

export default App;