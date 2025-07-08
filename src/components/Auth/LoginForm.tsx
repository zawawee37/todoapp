import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { ForgotPassword } from './ForgotPassword'
import { ResetPassword } from './ResetPassword'
import { PasswordRequirements } from './PasswordRequirements'

interface LoginFormProps {
  onToggleMode: () => void
  isLogin: boolean
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPasswordReqs, setShowPasswordReqs] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        setError(error.message)
      } else if (!isLogin) {
        setError('Check your email for a confirmation link!')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />
  }

  if (showResetPassword) {
    return (
      <ResetPassword 
        onSuccess={() => {
          setShowResetPassword(false)
          setSuccessMessage('Password reset successfully! Please sign in with your new password.')
        }} 
      />
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => !isLogin && setShowPasswordReqs(true)}
                onBlur={() => setShowPasswordReqs(false)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <PasswordRequirements 
              password={password} 
              show={!isLogin && (showPasswordReqs || password.length > 0)} 
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
            )}
          </button>

          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={onToggleMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
          <div className="border-t pt-3">
            <button
              onClick={() => setShowResetPassword(true)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Have a reset token? Click here
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}