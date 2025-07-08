import React from 'react'
import { Check, X } from 'lucide-react'

interface PasswordRequirementsProps {
  password: string
  show: boolean
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, show }) => {
  if (!show) return null

  const requirements = [
    {
      text: 'อย่างน้อย 8 ตัวอักษร',
      met: password.length >= 8
    },
    {
      text: 'มีตัวพิมพ์ใหญ่ (A-Z)',
      met: /[A-Z]/.test(password)
    },
    {
      text: 'มีตัวพิมพ์เล็ก (a-z)',
      met: /[a-z]/.test(password)
    },
    {
      text: 'มีตัวเลข (0-9)',
      met: /\d/.test(password)
    },
    {
      text: 'มีอักขระพิเศษ (@$!%*?&)',
      met: /[@$!%*?&]/.test(password)
    }
  ]

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <p className="text-sm font-medium text-gray-700 mb-2">รหัสผ่านต้องมี:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center text-sm">
            {req.met ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-red-400 mr-2" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}