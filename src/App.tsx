import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from './components/ui/sonner';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Make supabase available globally for dashboard components
(window as any).supabase = supabase;

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'user' | 'worker' | 'admin'>('landing');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.access_token);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        
        // Set the current page based on user role
        if (data.profile.role === 'admin') {
          setCurrentPage('admin');
        } else if (data.profile.role === 'worker') {
          setCurrentPage('worker');
        } else {
          setCurrentPage('user');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogin = async (accessToken: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(accessToken);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {currentPage === 'landing' && (
          <LandingPage onLogin={handleLogin} />
        )}
        {currentPage === 'user' && user && profile && (
          <UserDashboard 
            user={user} 
            profile={profile} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'worker' && user && profile && (
          <WorkerDashboard 
            user={user} 
            profile={profile} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'admin' && user && profile && (
          <AdminDashboard 
            user={user} 
            profile={profile} 
            onLogout={handleLogout}
          />
        )}
      </div>
      <Toaster />
    </>
  );
}
