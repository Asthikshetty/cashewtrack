import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'

const allModules = [
  { path: '/raw-lot',   label: 'Raw Lot',    icon: '📦', desc: 'Create supplier lot',   roles: ['supervisor'] },
  { path: '/steaming',  label: 'Steaming',   icon: '♨️',  desc: 'Record steam batch',   roles: ['operator', 'supervisor'] },
  { path: '/shelling',  label: 'Shelling',   icon: '🔨', desc: 'Shell output entry',    roles: ['operator', 'supervisor'] },
  { path: '/drying',    label: 'Drying',     icon: '🌡️', desc: 'Drying oven entry',     roles: ['operator', 'supervisor'] },
  { path: '/peeling',   label: 'Peeling',    icon: '🧤', desc: 'Peeling batch data',    roles: ['operator', 'supervisor'] },
  { path: '/grading',   label: 'Grading',    icon: '✅', desc: 'QC & grade allocation', roles: ['supervisor'] },
  { path: '/packaging', label: 'Packaging',  icon: '🎁', desc: 'Pack finished goods',   roles: ['supervisor'] },
  { path: '/dashboard', label: 'Dashboard',  icon: '📊', desc: 'Analytics & overview',  roles: ['owner', 'supervisor'] },
]

const STEPS = ['Raw Lot', 'Steaming', 'Shelling', 'Drying', 'Peeling', 'Grading', 'Packaging']

export default function HomePage() {
  const { role, setRole } = useApp()
  const navigate = useNavigate()

  const visible = allModules.filter(m => m.roles.includes(role))

  function handleLogout() {
    setRole(null)
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="font-semibold text-gray-900">CashewTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full font-medium capitalize">
              {role}
            </span>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Logout
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* Process pipeline (supervisor/operator) */}
      {role !== 'owner' && (
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Processing pipeline
          </p>
          <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-none">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2
                    ${i < 2 ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                    {i < 2 ? '✓' : i + 1}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 whitespace-nowrap">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-5 h-0.5 mb-3 ${i < 1 ? 'bg-brand-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module grid */}
      <div className="flex-1 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-1">
          {role === 'owner' ? 'Your view' : 'Quick actions'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {visible.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className="flex flex-col items-start bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                         hover:border-brand-200 hover:bg-brand-50 active:scale-[0.98] transition-all duration-150 text-left"
            >
              <span className="text-2xl mb-2">{m.icon}</span>
              <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-snug">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today summary bar */}
      <div className="mx-4 mb-6 bg-brand-50 border border-brand-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-brand-700 mb-2">Today's summary</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold text-brand-600">3</p>
            <p className="text-[10px] text-brand-500">Batches</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-600">1.2t</p>
            <p className="text-[10px] text-brand-500">Processed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-600">43%</p>
            <p className="text-[10px] text-brand-500">Recovery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
