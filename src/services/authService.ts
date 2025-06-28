import { supabase } from '../lib/supabase'
import { User, AgeGroup } from '../types'

export interface AuthUser {
  id: string
  email: string
  name: string
  age: number
  ageGroup: AgeGroup
  avatar: string
  progress: {
    currentLevel: number
    totalLessonsCompleted: number
    streakDays: number
    totalPoints: number
    completedTopics: string[]
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: Date
    category: 'progress' | 'streak' | 'completion' | 'mastery'
  }>
  createdAt: Date
}

class AuthService {
  private sessionCache: any = null
  private userCache: AuthUser | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Helper method to get age-appropriate dashboard route
  getAgeAppropriateDashboardRoute(ageGroup: AgeGroup): string {
    switch (ageGroup) {
      case '5-10':
        return '/app/young-learners'
      case '11-15':
        return '/app/teen-guardians'
      case '16-19':
        return '/app/young-adults'
      default:
        return '/app'
    }
  }

  private isCacheValid(): boolean {
    return this.cacheExpiry > Date.now()
  }

  private clearCache() {
    this.sessionCache = null
    this.userCache = null
    this.cacheExpiry = 0
  }

  async signUp(email: string, password: string, userData: {
    name: string
    age: number
    ageGroup: AgeGroup
  }): Promise<{ user: AuthUser | null; error: string | null; redirectTo?: string }> {
    try {
      console.log('🚀 Starting ultra-fast signup process...')
      const startTime = Date.now()
      
      // Ensure age matches age group
      let correctedAgeGroup = userData.ageGroup
      if (userData.age >= 5 && userData.age <= 10) {
        correctedAgeGroup = '5-10'
      } else if (userData.age >= 11 && userData.age <= 15) {
        correctedAgeGroup = '11-15'
      } else if (userData.age >= 16 && userData.age <= 19) {
        correctedAgeGroup = '16-19'
      }

      // Ultra-fast signup with minimal metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: userData.name.trim(),
            age: userData.age,
            age_group: correctedAgeGroup
          },
          emailRedirectTo: undefined // Disable email confirmation for speed
        }
      })

      if (error) {
        console.error('❌ Signup error:', error.message)
        let userFriendlyError = error.message
        if (error.message.includes('User already registered')) {
          userFriendlyError = 'An account with this email already exists. Please try signing in instead.'
        } else if (error.message.includes('Invalid email')) {
          userFriendlyError = 'Please enter a valid email address.'
        } else if (error.message.includes('Password should be at least')) {
          userFriendlyError = 'Password must be at least 6 characters long.'
        }
        return { user: null, error: userFriendlyError }
      }

      if (data.user && data.session) {
        const elapsedTime = Date.now() - startTime
        console.log(`✅ Signup completed in ${elapsedTime}ms`)
        
        // Cache the session immediately
        this.sessionCache = data.session
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
        
        // Create instant user object for immediate redirection
        const instantUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: userData.name,
          age: userData.age,
          ageGroup: correctedAgeGroup,
          avatar: '',
          progress: {
            currentLevel: 1,
            totalLessonsCompleted: 0,
            streakDays: 1,
            totalPoints: 0,
            completedTopics: []
          },
          achievements: [],
          createdAt: new Date()
        }
        
        // Cache the user
        this.userCache = instantUser
        
        console.log('🎯 Instant redirect to dashboard')
        return { 
          user: instantUser, 
          error: null, 
          redirectTo: this.getAgeAppropriateDashboardRoute(correctedAgeGroup)
        }
      }

      // Handle case where user is created but no session (email confirmation required)
      if (data.user && !data.session) {
        return { 
          user: null, 
          error: 'Account created successfully! You can now sign in.' 
        }
      }

      return { user: null, error: 'Account creation failed. Please try again.' }
    } catch (error) {
      console.error('❌ Unexpected signup error:', error)
      return { user: null, error: 'An unexpected error occurred. Please try again.' }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null; redirectTo?: string }> {
    try {
      console.log('🚀 Starting ultra-fast signin process...')
      const startTime = Date.now()
      
      // Ultra-fast signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        console.error('❌ Signin error:', error.message)
        let userFriendlyError = error.message
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyError = 'Please check your email and click the confirmation link before signing in.'
        }
        return { user: null, error: userFriendlyError }
      }

      if (data.user && data.session) {
        const elapsedTime = Date.now() - startTime
        console.log(`✅ Signin completed in ${elapsedTime}ms`)
        
        // Cache the session immediately
        this.sessionCache = data.session
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
        
        // Create instant user object from auth data for immediate redirection
        const ageGroup = (data.user.user_metadata?.age_group || '11-15') as AgeGroup
        const instantUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          age: data.user.user_metadata?.age || 12,
          ageGroup: ageGroup,
          avatar: data.user.user_metadata?.avatar || '',
          progress: {
            currentLevel: 1,
            totalLessonsCompleted: 0,
            streakDays: 1,
            totalPoints: 0,
            completedTopics: []
          },
          achievements: [],
          createdAt: new Date()
        }
        
        // Cache the user
        this.userCache = instantUser
        
        console.log('🎯 Instant redirect to dashboard')
        return { 
          user: instantUser, 
          error: null, 
          redirectTo: this.getAgeAppropriateDashboardRoute(ageGroup)
        }
      }

      return { user: null, error: 'Sign in failed. Please try again.' }
    } catch (error) {
      console.error('❌ Unexpected signin error:', error)
      return { user: null, error: 'An unexpected error occurred. Please try again.' }
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('🔐 Signing out...')
      
      // Clear cache first
      this.clearCache()
      
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error.message)
      } else {
        console.log('✅ Signed out successfully')
      }
      
      return { error: error?.message || null }
    } catch (error) {
      console.error('❌ Unexpected signout error:', error)
      return { error: 'An unexpected error occurred during sign out' }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Return cached user if valid
      if (this.userCache && this.isCacheValid()) {
        console.log('📦 Returning cached user')
        return this.userCache
      }

      // Get session (cached or fresh)
      let session = this.sessionCache
      if (!session || !this.isCacheValid()) {
        console.log('🔄 Fetching fresh session...')
        const { data } = await supabase.auth.getSession()
        session = data.session
        this.sessionCache = session
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
      }
      
      if (!session?.user) {
        this.clearCache()
        return null
      }
      
      const authUser = session.user

      // Create user from session data first (instant path)
      console.log('👤 Creating instant user object from session...')
      
      const sessionUser: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        age: authUser.user_metadata?.age || 12,
        ageGroup: (authUser.user_metadata?.age_group || '11-15') as AgeGroup,
        avatar: authUser.user_metadata?.avatar || '',
        progress: {
          currentLevel: 1,
          totalLessonsCompleted: 0,
          streakDays: 1,
          totalPoints: 0,
          completedTopics: []
        },
        achievements: [],
        createdAt: new Date()
      }

      // Cache the session user
      this.userCache = sessionUser

      // Load full profile in background (non-blocking)
      this.loadFullProfile(authUser.id).then(fullUser => {
        if (fullUser) {
          this.userCache = fullUser
        }
      }).catch(error => {
        console.warn('⚠️ Background profile load failed:', error)
      })

      return sessionUser
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error)
      this.clearCache()
      return null
    }
  }

  private async loadFullProfile(userId: string): Promise<AuthUser | null> {
    try {
      console.log('🔍 Loading full user profile for:', userId);
      console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔧 Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.warn('⚠️ Profile not found in database:', profileError.message)
        return null
      }

      // Fetch user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Fetch user achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          unlocked_at,
          achievements (
            id,
            title,
            description,
            icon,
            category
          )
        `)
        .eq('user_id', userId)

      const userAchievements = (achievements || []).map(ua => ({
        id: ua.achievements.id,
        title: ua.achievements.title,
        description: ua.achievements.description,
        icon: ua.achievements.icon || 'Award',
        unlockedAt: new Date(ua.unlocked_at || ''),
        category: ua.achievements.category as 'progress' | 'streak' | 'completion' | 'mastery'
      }))

      return {
        id: profile.id,
        email: profile.id, // Will be updated from session
        name: profile.name,
        age: profile.age,
        ageGroup: profile.age_group as AgeGroup,
        avatar: profile.avatar || '',
        progress: {
          currentLevel: progress?.current_level || 1,
          totalLessonsCompleted: progress?.total_lessons_completed || 0,
          streakDays: progress?.streak_days || 1,
          totalPoints: progress?.total_points || 0,
          completedTopics: progress?.completed_lesson_ids || []
        },
        achievements: userAchievements,
        createdAt: new Date(profile.created_at || '')
      }
    } catch (error) {
      console.error('❌ Error loading full profile:', error)
      return null
    }
  }

  async updateProfile(updates: Partial<{
    name: string
    age: number
    ageGroup: AgeGroup
    avatar: string
  }>): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { error: 'Not authenticated' }
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          age: updates.age,
          age_group: updates.ageGroup,
          avatar: updates.avatar
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Error updating profile:', error.message)
      } else {
        // Clear cache to force refresh
        this.clearCache()
      }

      return { error: error?.message || null }
    } catch (error) {
      console.error('❌ Unexpected error in updateProfile:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  async completeLesson(lessonId: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { error: 'Not authenticated' }
      }

      // Get current progress
      const { data: progress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError || !progress) {
        return { error: 'Failed to fetch progress' }
      }

      const completedLessons = progress.completed_lesson_ids || []
      
      // Don't add if already completed
      if (completedLessons.includes(lessonId)) {
        return { error: null }
      }

      const newCompletedLessons = [...completedLessons, lessonId]
      const newTotalCompleted = newCompletedLessons.length
      const newLevel = Math.floor(newTotalCompleted / 3) + 1
      const newPoints = (progress.total_points || 0) + 100

      // Update progress
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          completed_lesson_ids: newCompletedLessons,
          total_lessons_completed: newTotalCompleted,
          current_level: newLevel,
          total_points: newPoints,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('❌ Error updating lesson progress:', updateError.message)
        return { error: updateError.message }
      }

      // Clear cache to force refresh
      this.clearCache()

      return { error: null }
    } catch (error) {
      console.error('❌ Unexpected error in completeLesson:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      // Clear cache on auth state change
      this.clearCache()
      
      if (event === 'SIGNED_OUT') {
        callback(null)
        return
      }
      
      if (session?.user) {
        // Cache the session
        this.sessionCache = session
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
        
        // Create instant user object from session
        const ageGroup = (session.user.user_metadata?.age_group || '11-15') as AgeGroup
        const instantUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          age: session.user.user_metadata?.age || 12,
          ageGroup: ageGroup,
          avatar: session.user.user_metadata?.avatar || '',
          progress: {
            currentLevel: 1,
            totalLessonsCompleted: 0,
            streakDays: 1,
            totalPoints: 0,
            completedTopics: []
          },
          achievements: [],
          createdAt: new Date()
        }
        
        this.userCache = instantUser
        callback(instantUser)
      } else {
        callback(null)
      }
    })
  }

  // Helper method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      if (this.sessionCache && this.isCacheValid()) {
        return true
      }
      const { data: { session } } = await supabase.auth.getSession()
      this.sessionCache = session
      this.cacheExpiry = Date.now() + this.CACHE_DURATION
      return !!session
    } catch {
      return false
    }
  }

  // Helper method to get current session
  async getSession() {
    try {
      if (this.sessionCache && this.isCacheValid()) {
        return this.sessionCache
      }
      const { data: { session } } = await supabase.auth.getSession()
      this.sessionCache = session
      this.cacheExpiry = Date.now() + this.CACHE_DURATION
      return session
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()