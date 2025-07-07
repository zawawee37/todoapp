import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { CheckCircle } from 'lucide-react'

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TodoFlow</h1>
          <p className="text-gray-600">
            Organize your life, one task at a time
          </p>
        </div>

        <LoginForm
          isLogin={isLogin}
          onToggleMode={() => setIsLogin(!isLogin)}
        />
      </div>
    </div>
  )
}