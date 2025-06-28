import React, { useState, useEffect } from 'react';
import { Filter, Search, BookOpen, Loader2, AlertTriangle } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { Lesson, SafetyCategory } from '../types';
import { lessonService } from '../services/lessonService';
import LessonCard from '../components/LessonCard';

interface LessonsProps {
  user: AuthUser;
  onStartLesson: (lessonId: string) => void;
}

const Lessons: React.FC<LessonsProps> = ({ user, onStartLesson }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SafetyCategory | 'all'>('all');
  const [showAllAges, setShowAllAges] = useState(false);
  const [lessonStats, setLessonStats] = useState<{ [key: string]: number }>({});
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '📚' },
    { value: 'online', label: 'Online Safety', icon: '🌐' },
    { value: 'physical', label: 'Physical Safety', icon: '🛡️' },
    { value: 'social', label: 'Social Safety', icon: '👥' },
    { value: 'emotional', label: 'Emotional Wellbeing', icon: '💝' },
    { value: 'emergency', label: 'Emergency Preparedness', icon: '🚨' }
  ];

  // Load lessons on component mount
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📚 [LESSONS PAGE] Loading lessons for user:', {
          ageGroup: user.ageGroup,
          showAllAges,
          environment: import.meta.env.MODE
        });
        
        let lessonsData: Lesson[];
        if (showAllAges) {
          console.log('📚 [LESSONS PAGE] Fetching all lessons...');
          lessonsData = await lessonService.getAllLessons();
        } else {
          console.log(`📚 [LESSONS PAGE] Fetching lessons for age group: ${user.ageGroup}`);
          lessonsData = await lessonService.getLessonsByAgeGroup(user.ageGroup);
        }
        
        console.log('📚 [LESSONS PAGE] Lessons loaded:', {
          count: lessonsData.length,
          titles: lessonsData.map(l => l.title)
        });
        
        setLessons(lessonsData);
        
        // Load lesson statistics
        try {
          const stats = await lessonService.getLessonStatsByAgeGroup();
          setLessonStats(stats);
          console.log('📊 [LESSONS PAGE] Stats loaded:', stats);
        } catch (statsError) {
          console.warn('⚠️ [LESSONS PAGE] Failed to load stats:', statsError);
        }
        
        // Set debug info
        setDebugInfo({
          totalLessons: lessonsData.length,
          userAgeGroup: user.ageGroup,
          showAllAges,
          environment: import.meta.env.MODE,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
        
        console.log(`✅ [LESSONS PAGE] Successfully loaded ${lessonsData.length} lessons`);
      } catch (err) {
        console.error('❌ [LESSONS PAGE] Error loading lessons:', err);
        setError(`Failed to load lessons: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // Set debug info for error case
        setDebugInfo({
          error: err instanceof Error ? err.message : 'Unknown error',
          userAgeGroup: user.ageGroup,
          showAllAges,
          environment: import.meta.env.MODE,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [user.ageGroup, showAllAges]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchesAge = showAllAges || lesson.ageGroups.includes(user.ageGroup);
    
    return matchesSearch && matchesCategory && matchesAge;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Lessons...</h2>
            <p className="text-gray-600">Fetching your personalized safety lessons</p>
            {debugInfo && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
                <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Lessons</h3>
          <p className="text-red-500 max-w-md mx-auto mb-4">{error}</p>
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-red-800 mb-2">Debug Information:</h3>
              <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Safety Lessons
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Learn essential safety skills through interactive lessons designed for different age groups
        </p>
      </div>

      {/* Debug Panel (only show if there are issues) */}
      {debugInfo && (lessons.length === 0 || error) && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Environment:</strong> {debugInfo.environment}<br/>
              <strong>User Age Group:</strong> {debugInfo.userAgeGroup}<br/>
              <strong>Show All Ages:</strong> {debugInfo.showAllAges ? 'Yes' : 'No'}<br/>
              <strong>Total Lessons:</strong> {debugInfo.totalLessons || 0}
            </div>
            <div>
              <strong>Supabase URL:</strong> {debugInfo.supabaseUrl ? '✅ Set' : '❌ Missing'}<br/>
              <strong>Supabase Key:</strong> {debugInfo.hasSupabaseKey ? '✅ Set' : '❌ Missing'}<br/>
              {debugInfo.error && (
                <>
                  <strong>Error:</strong> <span className="text-red-600">{debugInfo.error}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SafetyCategory | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Age Filter Toggle */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllAges}
                onChange={(e) => setShowAllAges(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">Show all ages</span>
            </label>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Your Age: {user.ageGroup}
          </span>
          {!showAllAges && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Filtered for your age
            </span>
          )}
          {showAllAges && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Showing all age groups
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Category: {categories.find(c => c.value === selectedCategory)?.label}
            </span>
          )}
          {searchTerm && (
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
              Search: "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Age Group Statistics */}
      {showAllAges && Object.keys(lessonStats).length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lessons by Age Group</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-pink-600">{lessonStats['5-10'] || 0}</div>
              <div className="text-sm text-gray-600">Ages 5-10</div>
              <div className="text-xs text-gray-500">Young Learners</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{lessonStats['11-15'] || 0}</div>
              <div className="text-sm text-gray-600">Ages 11-15</div>
              <div className="text-xs text-gray-500">Teen Guardians</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{lessonStats['16-19'] || 0}</div>
              <div className="text-sm text-gray-600">Ages 16-19</div>
              <div className="text-xs text-gray-500">Young Adults</div>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Grid */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onStartLesson={onStartLesson}
              isCompleted={user.progress.completedTopics.includes(lesson.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {lessons.length === 0 ? 'No lessons available' : 'No lessons found'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {lessons.length === 0 
              ? 'There are no lessons in the database. Please check your database configuration.'
              : 'Try adjusting your search terms, category filter, or toggle "Show all ages" to find more lessons.'
            }
          </p>
          
          {lessons.length === 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-700 mb-2">Troubleshooting:</h4>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Check that your Supabase database is properly configured</li>
                <li>• Verify that the lessons table has data</li>
                <li>• Ensure your environment variables are set correctly</li>
                <li>• Check the browser console for detailed error messages</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Progress Summary */}
      <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Learning Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user.progress.totalLessonsCompleted}</div>
            <div className="text-sm text-gray-600">Lessons Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{user.progress.currentLevel}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{user.progress.streakDays}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{user.progress.totalPoints}</div>
            <div className="text-sm text-gray-600">Safety Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lessons;