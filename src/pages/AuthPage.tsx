import React, { useState, useEffect } from 'react'
import { Shield, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthForm, { AuthFormData } from '../components/AuthForm'
import { authService } from '../services/authService'

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check for email confirmation or other URL parameters
  useEffect(() => {
    const checkUrlParams = async () => {
      if (searchParams.get('type') === 'signup' && searchParams.get('token_hash')) {
        setSuccess('Email confirmed successfully! You can now sign in.')
        setMode('signin')
      }

      if (searchParams.get('mode') === 'reset-password' && searchParams.get('token_hash')) {
        setSuccess('Password reset link verified! Please enter your new password.')
        setMode('signin')
      }

      const errorParam = searchParams.get('error')
      if (errorParam) {
        setError(decodeURIComponent(errorParam))
      }
    }

    checkUrlParams()
  }, [searchParams])

  const handleSubmit = async (data: AuthFormData) => {
    if (loading) return // Prevent double submission
    
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log(`🚀 Starting ultra-fast ${mode} process...`)
      const startTime = Date.now()
      
      let result
      if (mode === 'signin') {
        result = await authService.signIn(data.email, data.password)
      } else {
        if (!data.name || !data.age || !data.ageGroup) {
          setError('Please fill in all required fields')
          setLoading(false)
          return
        }
        result = await authService.signUp(data.email, data.password, {
          name: data.name,
          age: data.age,
          ageGroup: data.ageGroup
        })
      }

      const elapsedTime = Date.now() - startTime
      console.log(`⏱️ ${mode} completed in ${elapsedTime}ms`)

      if (result.error) {
        if (result.error.includes('check your email') || result.error.includes('Account created successfully')) {
          setSuccess(result.error)
          setMode('signin')
        } else {
          setError(result.error)
        }
      } else if (result.user) {
        // Show ultra-brief success message
        const welcomeMessage = mode === 'signin' 
          ? `Welcome back, ${result.user.name}!` 
          : `Welcome to Safety Aware Circle, ${result.user.name}!`
        
        setSuccess(`${welcomeMessage} Redirecting...`)
        
        // Ultra-fast redirection
        const redirectPath = result.redirectTo || `/app`
        
        console.log(`🎯 Ultra-fast redirect to: ${redirectPath}`)
        
        // Immediate redirect for best UX
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 50) // Reduced to 50ms for near-instant feel
      } else {
        setError('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('❌ Auth error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = () => {
    if (loading) return // Prevent mode switch during loading
    
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Safety Aware Circle</span>
            </div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full">
          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {mode === 'signin' ? 'Welcome Back!' : 'Join Safety Aware Circle'}
              </h1>
              <p className="text-gray-600">
                {mode === 'signin' 
                  ? 'Sign in to access your personalized safety dashboard'
                  : 'Create your account to start learning essential safety skills'
                }
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Success!</h3>
                    <p className="text-green-700 text-sm mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      {mode === 'signin' ? 'Signing you in...' : 'Creating your account...'}
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      This should only take a moment...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <AuthForm
              mode={mode}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  onClick={handleModeSwitch}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  disabled={loading}
                >
                  {mode === 'signin' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Your Safety & Privacy</h3>
                <p className="text-sm text-blue-700">
                  Use The following login credentials. Ages 5-10 username: younglearners@example.com. Password: youngleaners.
                  Ages 11-15 username teenguardian@example.com, password:teengurardian. 
                  Ages 16-19 username:youngadult@safeawarecircle.com, password:youngadult.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage