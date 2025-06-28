import React, { useState } from 'react';
import { BookOpen, MessageCircle, Award, TrendingUp, Users, Shield, Sparkles, Calendar, Clock, Target, Star, ChevronRight, Play, Video, Brain, Zap, Siren as Fire, Trophy, CheckCircle, ArrowRight, Bell, Settings, LogOut, Heart, Smile, Sun, Moon } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { authService } from '../services/authService';
import UserProfile from '../components/UserProfile';
import DailySafetyStory from '../components/DailySafetyStory';
import LingoExample from '../components/LingoExample';
import { useLingo } from '@lingo.dev/react';

interface DashboardProps {
  user: AuthUser;
  onUpdateProfile: (userData: Partial<AuthUser>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activity'>('overview');
  const [signingOut, setSigningOut] = useState(false);
  const lingo = useLingo();

  const handleSignOut = async () => {
    // Show confirmation dialog
    const confirmSignOut = window.confirm('Are you sure you want to sign out?');
    if (!confirmSignOut) {
      return;
    }

    console.log('🔐 User confirmed sign out, starting process...');
    setSigningOut(true);

    try {
      // Call the auth service sign out method
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        alert('There was an issue signing out. Please try again.');
        setSigningOut(false);
        return;
      }

      console.log('✅ Sign out successful, redirecting...');
      
      // Force a complete page reload to ensure clean state
      // This ensures all React state is cleared and user is fully logged out
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      alert('An unexpected error occurred. Please try again.');
      setSigningOut(false);
      
      // Emergency fallback - force reload anyway
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  // Young Kids Dashboard (Ages 5-10)
  if (user.ageGroup === '5-10') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header with Learning Buddy */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Smile className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{lingo.t('dashboard_greeting', 'Hi')} {user.name}! 👋</h1>
                <p className="text-lg text-gray-600">{lingo.t('dashboard_ready_message', 'Ready to learn about staying safe?')}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
                signingOut 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
              }`}
              title={signingOut ? 'Signing out...' : 'Sign Out'}
            >
              {signingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">{lingo.t('sign_out_progress', 'Bye bye...')}</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{lingo.t('sign_out_button', 'All Done')}</span>
                </>
              )}
            </button>
          </div>

          {/* Fun Progress Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{user.progress.currentLevel}</div>
              <div className="text-sm text-gray-600 font-medium">{lingo.t('level', 'Level')}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{user.progress.totalLessonsCompleted}</div>
              <div className="text-sm text-gray-600 font-medium">{lingo.t('lessons', 'Lessons')}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200 text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Fire className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{user.progress.streakDays}</div>
              <div className="text-sm text-gray-600 font-medium">{lingo.t('day_streak', 'Day Streak')}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{user.progress.totalPoints}</div>
              <div className="text-sm text-gray-600 font-medium">{lingo.t('points', 'Points')}</div>
            </div>
          </div>

          {/* Lingo Example Component */}
          <LingoExample />

          {/* Big Action Buttons for Young Kids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <a
              href="/app/lessons"
              className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{lingo.t('fun_lessons', 'Fun Lessons!')}</h3>
                  <p className="text-blue-100">{lingo.t('learn_about_safety', 'Learn about staying safe')}</p>
                </div>
              </div>
              <div className="flex items-center text-white/90">
                <span className="text-lg font-medium">{lingo.t('start_learning', 'Start Learning')}</span>
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </a>

            <a
              href="/app/chat"
              className="group bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{lingo.t('safety_helper', 'Safety Helper!')}</h3>
                  <p className="text-green-100">{lingo.t('ask_questions', 'Ask questions anytime')}</p>
                </div>
              </div>
              <div className="flex items-center text-white/90">
                <span className="text-lg font-medium">{lingo.t('ask_questions_button', 'Ask Questions')}</span>
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </a>
          </div>

          {/* Achievements Preview */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{lingo.t('your_badges', 'Your Badges!')} 🏆</h2>
                <p className="text-gray-600">{lingo.t('look_what_earned', 'Look what you\'ve earned')}</p>
              </div>
            </div>
            
            {user.achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {user.achievements.slice(0, 4).map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-xl p-4 shadow-sm border border-purple-200 text-center">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{achievement.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-4">{lingo.t('complete_first_lesson', 'Complete your first lesson to earn your first badge!')}</p>
                <a
                  href="/app/lessons"
                  className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <span>{lingo.t('start_learning', 'Start Learning')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
            
            <div className="text-center">
              <a
                href="/app/achievements"
                className="inline-flex items-center space-x-2 text-purple-700 hover:text-purple-800 font-bold"
              >
                <span>{lingo.t('see_all_badges', 'See All Badges')} ({user.achievements.length})</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{lingo.t('doing_great', 'You\'re Doing Great!')} 🌟</h3>
            <p className="text-lg text-white/90">
              {lingo.t('keep_learning', 'Keep learning about safety and you\'ll become a safety superstar!')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular Dashboard for older kids (11-15 and 16-19)
  const quickActions = [
    {
      title: lingo.t('ai_video_chat', 'AI Video Chat'),
      description: lingo.t('talk_with_ai', 'Talk with AI safety expert'),
      icon: Video,
      color: 'from-purple-500 to-pink-600',
      href: '/app/videos',
      badge: 'NEW',
      highlight: true
    },
    {
      title: lingo.t('ai_lessons', 'AI Lessons'),
      description: lingo.t('generate_custom_lessons', 'Generate custom lessons'),
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-600',
      href: '/app/ai-lessons',
      badge: 'AI'
    },
    {
      title: lingo.t('interactive_lessons', 'Interactive Lessons'),
      description: lingo.t('structured_learning', 'Structured learning paths'),
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      href: '/app/lessons'
    },
    {
      title: lingo.t('safety_chat', 'Safety Chat'),
      description: lingo.t('ai_assistant', '24/7 AI assistant'),
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-600',
      href: '/app/chat'
    },
    {
      title: lingo.t('achievements', 'Achievements'),
      description: lingo.t('track_progress', 'Track your progress'),
      icon: Award,
      color: 'from-orange-500 to-red-600',
      href: '/app/achievements'
    }
  ];

  const recentActivity = [
    {
      title: lingo.t('generated_ai_lesson', 'Generated AI lesson on "Online Privacy"'),
      time: lingo.t('time_30_min', '30 minutes ago'),
      icon: Brain,
      type: 'ai-lesson',
      color: 'text-purple-600'
    },
    {
      title: lingo.t('watched_video', 'Watched personalized safety video'),
      time: lingo.t('time_1_hour', '1 hour ago'),
      icon: Video,
      type: 'video',
      color: 'text-pink-600'
    },
    {
      title: lingo.t('completed_lesson', 'Completed "Stranger Safety Basics"'),
      time: lingo.t('time_2_hours', '2 hours ago'),
      icon: CheckCircle,
      type: 'lesson',
      color: 'text-blue-600'
    },
    {
      title: lingo.t('earned_badge', 'Earned "Safety Explorer" badge'),
      time: lingo.t('time_1_day', '1 day ago'),
      icon: Trophy,
      type: 'achievement',
      color: 'text-orange-600'
    },
    {
      title: lingo.t('asked_about', 'Asked about cyberbullying'),
      time: lingo.t('time_2_days', '2 days ago'),
      icon: MessageCircle,
      type: 'chat',
      color: 'text-green-600'
    }
  ];

  const weeklyStats = [
    { 
      label: lingo.t('lessons_completed', 'Lessons Completed'), 
      value: user.progress.totalLessonsCompleted, 
      icon: BookOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: lingo.t('plus_2_week', '+2 this week')
    },
    { 
      label: lingo.t('ai_lessons_generated', 'AI Lessons Generated'), 
      value: '5', 
      icon: Sparkles, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: lingo.t('plus_3_week', '+3 this week')
    },
    { 
      label: lingo.t('questions_asked', 'Questions Asked'), 
      value: '24', 
      icon: MessageCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: lingo.t('plus_8_week', '+8 this week')
    },
    { 
      label: lingo.t('learning_streak', 'Learning Streak'), 
      value: user.progress.streakDays, 
      icon: Fire, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: lingo.t('keep_it_up', 'Keep it up!')
    }
  ];

  const learningGoals = [
    {
      title: lingo.t('complete_10_lessons', 'Complete 10 Lessons'),
      progress: (user.progress.totalLessonsCompleted / 10) * 100,
      current: user.progress.totalLessonsCompleted,
      target: 10,
      color: 'bg-blue-500'
    },
    {
      title: lingo.t('maintain_7day_streak', 'Maintain 7-Day Streak'),
      progress: (user.progress.streakDays / 7) * 100,
      current: user.progress.streakDays,
      target: 7,
      color: 'bg-orange-500'
    },
    {
      title: lingo.t('earn_1000_points', 'Earn 1000 Points'),
      progress: (user.progress.totalPoints / 1000) * 100,
      current: user.progress.totalPoints,
      target: 1000,
      color: 'bg-purple-500'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lingo.t('good_morning', 'Good morning');
    if (hour < 17) return lingo.t('good_afternoon', 'Good afternoon');
    return lingo.t('good_evening', 'Good evening');
  };

  const getMotivationalMessage = () => {
    const messages = [
      lingo.t('motivational_1', "You're building important life skills! 🌟"),
      lingo.t('motivational_2', "Every lesson makes you safer and smarter! 🧠"),
      lingo.t('motivational_3', "Your safety journey is inspiring! 💪"),
      lingo.t('motivational_4', "Keep up the amazing progress! 🚀"),
      lingo.t('motivational_5', "You're becoming a safety expert! 🛡️")
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Get achievement icon based on achievement data
  const getAchievementIcon = (achievement: any) => {
    switch (achievement.icon) {
      case 'Award':
        return Award;
      case 'Calendar':
        return Calendar;
      case 'Trophy':
        return Trophy;
      case 'Heart':
        return Star;
      case 'Target':
        return Target;
      default:
        return Trophy;
    }
  };

  // Get achievement color based on category
  const getAchievementColor = (category: string) => {
    switch (category) {
      case 'progress':
        return 'from-blue-400 to-blue-600';
      case 'streak':
        return 'from-orange-400 to-orange-600';
      case 'mastery':
        return 'from-purple-400 to-purple-600';
      case 'completion':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Dashboard Header with Sign Out */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{lingo.t('dashboard', 'Dashboard')}</h1>
          <p className="text-gray-600">{lingo.t('welcome_back', 'Welcome back')}, {user.name}!</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
            signingOut 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
          }`}
          title={signingOut ? 'Signing out...' : 'Sign Out'}
        >
          {signingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">{lingo.t('signing_out', 'Signing out...')}</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">{lingo.t('sign_out', 'Sign Out')}</span>
            </>
          )}
        </button>
      </div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {user.name}! 👋
              </h1>
              <p className="text-xl text-blue-100 mb-2">
                {getMotivationalMessage()}
              </p>
              <div className="flex items-center space-x-4 text-sm text-blue-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Fire className="w-4 h-4" />
                  <span>{user.progress.streakDays} {lingo.t('day_streak', 'day streak')}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{user.progress.currentLevel}</div>
                <div className="text-sm text-blue-100">{lingo.t('level', 'Level')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{user.progress.totalPoints}</div>
                <div className="text-sm text-blue-100">{lingo.t('points', 'Points')}</div>
              </div>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/app/videos"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Video className="w-4 h-4" />
              <span>{lingo.t('start_ai_video', 'Start AI Video Chat')}</span>
              <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">{lingo.t('new', 'NEW')}</span>
            </a>
            <a
              href="/app/ai-lessons"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lingo.t('generate_ai_lesson', 'Generate AI Lesson')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lingo Example Component */}
      <LingoExample />

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: lingo.t('overview', 'Overview'), icon: TrendingUp },
          { id: 'progress', label: lingo.t('progress', 'Progress'), icon: Target },
          { id: 'activity', label: lingo.t('activity', 'Activity'), icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* User Profile */}
          <UserProfile user={user} onUpdateProfile={onUpdateProfile} />

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              {lingo.t('quick_actions', 'Quick Actions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map(({ title, description, icon: Icon, color, href, badge, highlight }) => (
                <a
                  key={title}
                  href={href}
                  className={`group relative overflow-hidden rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 ${
                    highlight ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                  }`}
                >
                  {badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        badge === 'NEW' ? 'bg-yellow-400 text-yellow-900' : 'bg-purple-400 text-purple-900'
                      }`}>
                        {badge}
                      </span>
                    </div>
                  )}
                  
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-white'}`} />
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${highlight ? 'text-gray-800' : 'text-gray-800'} group-hover:text-blue-600 transition-colors`}>
                    {title}
                  </h3>
                  <p className={`leading-relaxed ${highlight ? 'text-gray-600' : 'text-gray-600'}`}>
                    {description}
                  </p>

                  {highlight && (
                    <div className="mt-6">
                      <div className="inline-flex items-center space-x-2 text-blue-600 text-sm font-medium">
                        <span>{lingo.t('try_now', 'Try Now')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                    <span>{lingo.t('get_started', 'Get started')}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Achievement Preview */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              {lingo.t('your_achievements', 'Your Achievements')}
            </h2>
            {user.achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.achievements.slice(0, 4).map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement);
                  const colorClass = getAchievementColor(achievement.category);
                  
                  return (
                    <div key={achievement.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lingo.t('unlocked', 'Unlocked')} {achievement.unlockedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{lingo.t('complete_first_lesson', 'Complete your first lesson to earn achievements!')}</p>
                <a
                  href="/app/lessons"
                  className="inline-flex items-center space-x-2 text-yellow-700 hover:text-yellow-800 font-medium"
                >
                  <span>{lingo.t('start_learning', 'Start learning')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
            {user.achievements.length > 0 && (
              <div className="mt-4 text-center">
                <a
                  href="/app/achievements"
                  className="inline-flex items-center space-x-2 text-yellow-700 hover:text-yellow-800 font-medium"
                >
                  <span>{lingo.t('view_all_achievements', 'View all achievements')} ({user.achievements.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-8">
          {/* Weekly Stats */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{lingo.t('this_weeks_progress', 'This Week\'s Progress')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {weeklyStats.map(({ label, value, icon: Icon, color, bgColor, change }) => (
                <div key={label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{value}</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{label}</h3>
                  <p className="text-sm text-green-600 font-medium">{change}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{lingo.t('learning_goals', 'Learning Goals')}</h2>
            <div className="space-y-4">
              {learningGoals.map(({ title, progress, current, target, color }) => (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <span className="text-sm text-gray-600">{current} / {target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`${color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{Math.round(progress)}% {lingo.t('complete', 'complete')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Achievements */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              {lingo.t('all_achievements', 'All Achievements')} ({user.achievements.length})
            </h2>
            {user.achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.achievements.map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement);
                  const colorClass = getAchievementColor(achievement.category);
                  
                  return (
                    <div key={achievement.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              achievement.category === 'progress' ? 'bg-blue-100 text-blue-800' :
                              achievement.category === 'streak' ? 'bg-orange-100 text-orange-800' :
                              achievement.category === 'mastery' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {achievement.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {achievement.unlockedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{lingo.t('complete_first_lesson', 'Complete your first lesson to earn achievements!')}</p>
                <a
                  href="/app/lessons"
                  className="inline-flex items-center space-x-2 text-yellow-700 hover:text-yellow-800 font-medium"
                >
                  <span>{lingo.t('start_learning', 'Start learning')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-8">
          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              {lingo.t('recent_activity', 'Recent Activity')}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'ai-lesson' ? 'bg-purple-100 text-purple-800' :
                        activity.type === 'video' ? 'bg-pink-100 text-pink-800' :
                        activity.type === 'lesson' ? 'bg-blue-100 text-blue-800' :
                        activity.type === 'achievement' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activity.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Tip of the Day */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          {lingo.t('safety_tip_day', 'Safety Tip of the Day')}
        </h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-700 mb-2">
            <strong>{lingo.t('remember', 'Remember')}:</strong> {lingo.t('trust_instincts', 'Trust your instincts! If something feels wrong or makes you uncomfortable, it\'s always okay to say "no" and seek help from a trusted adult.')}
          </p>
          <p className="text-sm text-gray-500">
            {lingo.t('safety_important', 'Your safety is the most important thing, and there are always people ready to help you.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;