import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService, AuthUser } from './services/authService';

// Components
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import GeminiLessons from './pages/GeminiLessons';
import Chat from './pages/Chat';
import Achievements from './pages/Achievements';
import LessonViewer from './pages/LessonViewer';
import PersonalizedVideos from './pages/PersonalizedVideos';

// Debug component to help diagnose routing issues
const DebugRoute = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Route Not Found</h1>
        <p className="text-gray-700 mb-4">The route <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code> does not exist.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Debug Information:</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify({
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              state: location.state,
              env: import.meta.env.MODE,
              supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing',
              supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
            }, null, 2)}
          </pre>
        </div>
        
        <div className="flex flex-col space-y-4">
          <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
            Go to Home Page
          </a>
          <a href="/auth" className="bg-green-600 text-white px-4 py-2 rounded-lg text-center hover:bg-green-700 transition-colors">
            Go to Login Page
          </a>
          <a href="/app" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-center hover:bg-purple-700 transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        console.log('🔧 Environment:', import.meta.env.MODE);
        console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('🔧 Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        // Fast session check
        const session = await authService.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ Session found, getting user...');
            
            // Get user data (this will use cache if available)
            const currentUser = await authService.getCurrentUser();
            
            if (currentUser && mounted) {
              setUser(currentUser);
              console.log('✅ User loaded successfully');
            }
          } else {
            console.log('ℹ️ No session found');
          }
          
          setAuthInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setAuthInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange((newUser) => {
      if (mounted) {
        console.log('🔄 Auth state changed:', newUser ? 'User logged in' : 'User logged out');
        setUser(newUser);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!user) return;

    const { error } = await authService.updateProfile({
      name: userData.name,
      age: userData.age,
      ageGroup: userData.ageGroup,
      avatar: userData.avatar
    });

    if (!error) {
      // Refresh user data
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;

    const { error } = await authService.completeLesson(lessonId);

    if (!error) {
      // Refresh user data to get updated progress and achievements
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  const startLesson = (lessonId: string) => {
    window.location.href = `/app/lesson/${lessonId}`;
  };

  // Helper function to get age-appropriate dashboard route
  const getAgeAppropriateDashboard = (ageGroup: string) => {
    switch (ageGroup) {
      case '5-10':
        return '/app/young-learners';
      case '11-15':
        return '/app/teen-guardians';
      case '16-19':
        return '/app/young-adults';
      default:
        return '/app';
    }
  };

  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Safety Aware Circle</h2>
          <p className="text-gray-600">Loading your safety learning platform...</p>
          <div className="mt-4 text-xs text-gray-500">
            Environment: {import.meta.env.MODE} | 
            Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'} | 
            Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Route - redirect to age-appropriate dashboard if already signed in */}
        <Route path="/auth" element={
          user ? (
            <Navigate to={getAgeAppropriateDashboard(user.ageGroup)} replace />
          ) : (
            <AuthPage />
          )
        } />
        
        {/* App Routes - redirect to auth if not signed in */}
        <Route path="/app/*" element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : (
            <div className="min-h-screen bg-gray-50">
              <div className="flex flex-col md:flex-row">
                <Navigation />
                <main className="flex-1 md:ml-0 pb-20 md:pb-0">
                  <Routes>
                    {/* Default dashboard route - redirect to age-appropriate dashboard */}
                    <Route 
                      path="/" 
                      element={<Navigate to={getAgeAppropriateDashboard(user.ageGroup).replace('/app', '')} replace />} 
                    />
                    
                    {/* Age-specific dashboard routes */}
                    <Route 
                      path="/young-learners" 
                      element={<Dashboard user={user} onUpdateProfile={updateProfile} />} 
                    />
                    <Route 
                      path="/teen-guardians" 
                      element={<Dashboard user={user} onUpdateProfile={updateProfile} />} 
                    />
                    <Route 
                      path="/young-adults" 
                      element={<Dashboard user={user} onUpdateProfile={updateProfile} />} 
                    />
                    
                    {/* Other app routes */}
                    <Route 
                      path="/lessons" 
                      element={<Lessons user={user} onStartLesson={startLesson} />} 
                    />
                    <Route 
                      path="/ai-lessons" 
                      element={<GeminiLessons user={user} />} 
                    />
                    <Route 
                      path="/lesson/:lessonId" 
                      element={<LessonViewer user={user} onCompleteLesson={completeLesson} />} 
                    />
                    <Route 
                      path="/videos" 
                      element={<PersonalizedVideos user={user} />} 
                    />
                    <Route 
                      path="/chat" 
                      element={<Chat user={user} />} 
                    />
                    <Route 
                      path="/achievements" 
                      element={<Achievements user={user} />} 
                    />
                    
                    {/* Catch all route - redirect to age-appropriate dashboard */}
                    <Route path="*" element={<Navigate to={getAgeAppropriateDashboard(user.ageGroup).replace('/app', '')} replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        } />
        
        {/* Debug route to help diagnose routing issues */}
        <Route path="/debug" element={<DebugRoute />} />
        
        {/* Catch all route - show debug info instead of just redirecting */}
        <Route path="*" element={<DebugRoute />} />
      </Routes>
    </Router>
  );
}

export default App;