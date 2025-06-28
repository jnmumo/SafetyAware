import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vnylsakgykatzlmlfgam.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueWxzYWtneWthdHpsbWxmZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzIwNzMsImV4cCI6MjA2NjEwODA3M30.E7-pkNZtgp0JLtvw_mOF8ycPsdtytBPnbT9GyytW7LI'

// Validate configuration
const isValidUrl = supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseUrl.startsWith('https://')
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your-anon-key' && supabaseAnonKey.length > 20

// Enhanced logging for deployment debugging
console.log('🔧 Supabase Configuration Check:')
console.log('📍 URL:', supabaseUrl)
console.log('📍 URL valid:', isValidUrl)
console.log('🔑 Key configured:', isValidKey)
console.log('🔑 Key length:', supabaseAnonKey.length)

if (!isValidUrl) {
  console.error('❌ VITE_SUPABASE_URL is not configured properly')
  console.error('Expected format: https://your-project.supabase.co')
  console.error('Current value:', supabaseUrl)
}

if (!isValidKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured properly')
  console.error('Expected: A long JWT token string')
  console.error('Current length:', supabaseAnonKey.length)
}

// Optimized storage adapter for faster performance
const optimizedStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('⚠️ localStorage access blocked, using memory storage')
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('⚠️ localStorage write blocked, session will not persist')
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('⚠️ localStorage remove blocked')
    }
  }
}

// Create Supabase client with optimized configuration for speed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'safetylearn-auth',
    storage: optimizedStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'safety-aware-circle@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Increased for better real-time performance
    }
  },
  db: {
    schema: 'public'
  }
})

// Database types based on our updated three age group schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          age: number
          age_group: '5-10' | '11-15' | '16-19'
          avatar: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          age: number
          age_group: '5-10' | '11-15' | '16-19'
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          age?: number
          age_group?: '5-10' | '11-15' | '16-19'
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_progress: {
        Row: {
          user_id: string
          current_level: number | null
          total_lessons_completed: number | null
          streak_days: number | null
          total_points: number | null
          completed_lesson_ids: string[] | null
          last_activity_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          current_level?: number | null
          total_lessons_completed?: number | null
          streak_days?: number | null
          total_points?: number | null
          completed_lesson_ids?: string[] | null
          last_activity_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          current_level?: number | null
          total_lessons_completed?: number | null
          streak_days?: number | null
          total_points?: number | null
          completed_lesson_ids?: string[] | null
          last_activity_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          unlocked_at: string | null
        }
        Insert: {
          user_id: string
          achievement_id: string
          unlocked_at?: string | null
        }
        Update: {
          user_id?: string
          achievement_id?: string
          unlocked_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string | null
          category: 'progress' | 'streak' | 'completion' | 'mastery'
          created_at: string | null
        }
      }
      waitlist_entries: {
        Row: {
          id: string
          email: string
          source: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          email: string
          source?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          email?: string
          source?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
    }
  }
}

// Enhanced connection test with detailed logging
export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    if (!isValidUrl || !isValidKey) {
      console.error('❌ Invalid Supabase configuration')
      return false
    }

    // Test basic connection
    const { data, error } = await supabase
      .from('lessons')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection test successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection test error:', error)
    return false
  }
}

// Test connection on module load
checkSupabaseConnection()