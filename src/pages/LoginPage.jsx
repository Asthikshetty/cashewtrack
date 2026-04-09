import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'

const roles = [
  {
    id: 'supervisor',
    label: 'Supervisor',
    desc: 'Full access — lot creation, grading, packaging',
    icon: '🏭',
  },
  {
    id: 'operator',
    label: 'Operator',
    desc: 'Data entry — steaming, shelling, drying, peeling',
    icon: '⚙️',
  },
  {
    id: 'owner',
    label: 'Owner',
    desc: 'Dashboard only — read-only analytics view',
    icon: '📊',
  },
]

export default function LoginPage() {
  const { setRole } = useApp()
  const navigate = useNavigate()

  function handleRole(r) {
    setRole(r)
    navigate('/home')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top brand bar */}
      <div className="bg-brand-500 px-6 pt-14 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌿</span>
          <span className="text-white text-xl font-semibold tracking-tight">CashewTrack</span>
        </div>
        <p className="text-brand-100 text-sm leading-relaxed">
          End-to-end cashew processing management — from raw lot to packaged kernel.
        </p>
      </div>

      {/* Role selection */}
      <div className="flex-1 px-4 pt-6 pb-10 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Select your role to continue
        </p>

        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => handleRole(r.id)}
            className="flex items-start gap-4 text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-brand-200 hover:bg-brand-50 active:scale-[0.99] transition-all duration-150"
          >
            <span className="text-2xl mt-0.5">{r.icon}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{r.desc}</p>
            </div>
            <span className="ml-auto text-gray-300 text-lg self-center">›</span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 pb-6">CashewTrack v1.0 — Factory Edition</p>
    </div>
  )
}
