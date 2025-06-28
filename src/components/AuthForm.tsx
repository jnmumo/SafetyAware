import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Calendar, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { AgeGroup } from '../types'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSubmit: (data: AuthFormData) => void
  loading: boolean
  error: string | null
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
  age?: number
  ageGroup?: AgeGroup
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    age: 12,
    ageGroup: '11-15'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const ageGroups = [
    { value: '5-10' as AgeGroup, label: 'Ages 5-10 (Young Learners)', description: 'Basic safety concepts and stranger danger' },
    { value: '11-15' as AgeGroup, label: 'Ages 11-15 (Teen Guardians)', description: 'Bullying, online safety, and peer pressure' },
    { value: '16-19' as AgeGroup, label: 'Ages 16-19 (Young Adults)', description: 'Relationships, consent, and digital safety' }
  ]

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    // Sign up specific validations
    if (mode === 'signup') {
      if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long'
      }

      if (!formData.age || formData.age < 5 || formData.age > 19) {
        errors.age = 'Age must be between 5 and 19'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || loading) {
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Clean and prepare data
    const cleanData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      ...(mode === 'signup' && {
        name: formData.name?.trim(),
        age: formData.age,
        ageGroup: formData.ageGroup
      })
    }

    try {
      await onSubmit(cleanData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail.trim()) {
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      alert('Please enter a valid email address')
      return
    }

    try {
      // Import supabase client
      const { supabase } = await import('../lib/supabase')
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`
      })

      if (error) {
        console.error('Password reset error:', error)
        alert('Failed to send password reset email. Please try again.')
      } else {
        setResetEmailSent(true)
        console.log('Password reset email sent successfully')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleAgeChange = (age: number) => {
    let ageGroup: AgeGroup = '11-15'
    if (age >= 5 && age <= 10) ageGroup = '5-10'
    else if (age >= 11 && age <= 15) ageGroup = '11-15'
    else if (age >= 16 && age <= 19) ageGroup = '16-19'

    setFormData(prev => ({ ...prev, age, ageGroup }))
    
    // Clear age validation error when user changes age
    if (validationErrors.age) {
      setValidationErrors(prev => ({ ...prev, age: '' }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const isFormDisabled = loading || isSubmitting

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Your Password</h3>
          <p className="text-gray-600 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {resetEmailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Email Sent!</h3>
                <p className="text-green-700 text-sm mt-1">
                  We've sent a password reset link to <strong>{resetEmail}</strong>. 
                  Check your email and click the link to reset your password.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="resetEmail"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center">
          <button
            onClick={() => {
              setShowForgotPassword(false)
              setResetEmailSent(false)
              setResetEmail('')
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'signup' && (
        <>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your name"
                disabled={isFormDisabled}
                autoComplete="given-name"
              />
            </div>
            {validationErrors.name && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Age Field */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                id="age"
                required
                min="5"
                max="19"
                value={formData.age}
                onChange={(e) => handleAgeChange(parseInt(e.target.value) || 12)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your age"
                disabled={isFormDisabled}
              />
            </div>
            {validationErrors.age && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.age}</p>
            )}
          </div>

          {/* Age Group Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Group
            </label>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  {ageGroups.find(group => group.value === formData.ageGroup)?.label}
                </p>
              </div>
              <p className="text-blue-600 text-sm">
                {ageGroups.find(group => group.value === formData.ageGroup)?.description}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isFormDisabled}
            autoComplete="email"
          />
        </div>
        {validationErrors.email && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
            disabled={isFormDisabled}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isFormDisabled}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
        )}
        {mode === 'signup' && (
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        )}
      </div>

      {/* Forgot Password Link */}
      {mode === 'signin' && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isFormDisabled ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
          </>
        ) : (
          <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
        )}
      </button>

      {/* Email Confirmation Notice for Sign Up */}
      {mode === 'signup' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Quick Setup</h3>
              <p className="text-blue-700 text-sm mt-1">
                Your account will be created instantly. You can start learning safety skills right away!
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default AuthForm