import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, InfoBox, useToast } from '../components/UI.jsx'

const BATCHES = ['PB-2024-001 (350 kg)', 'PB-2024-002 (260 kg)', 'PB-2024-003 (480 kg)']
const INPUT_MAP = { 'PB-2024-001 (350 kg)': 350, 'PB-2024-002 (260 kg)': 260, 'PB-2024-003 (480 kg)': 480 }

const GRADES = [
  { key: 'w180', label: 'W-180', desc: 'Jumbo (≤180 kernels/lb)' },
  { key: 'w210', label: 'W-210', desc: 'Super Extra Large' },
  { key: 'w240', label: 'W-240', desc: 'Extra Large' },
  { key: 'w320', label: 'W-320', desc: 'Large (most common)' },
  { key: 'broken', label: 'Broken', desc: 'Pieces & splits' },
]

export default function GradingPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [batch, setBatch] = useState('')
  const [grades, setGrades] = useState({ w180: '', w210: '', w240: '', w320: '', broken: '' })

  const inputW  = batch ? INPUT_MAP[batch] ?? 0 : 0
  const total   = Object.values(grades).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const diff    = inputW - total
  const exceeded = diff < -0.01

  function setGrade(key) { return e => setGrades(p => ({ ...p, [key]: e.target.value })) }

  function handleApprove() {
    if (!batch) { show('Select a batch'); return }
    if (exceeded) { show('❌ Total exceeds input weight!'); return }
    if (total === 0) { show('Enter at least one grade quantity'); return }
    show('✅ Grading approved — inventory updated!')
    setTimeout(() => navigate('/home'), 1500)
  }

  const pct = (v) => inputW > 0 && parseFloat(v) > 0 ? ((parseFloat(v) / inputW) * 100).toFixed(1) + '%' : ''

  return (
    <PageLayout
      title="Grading & QC"
      role="Supervisor"
      onBack={() => navigate('/home')}
      actionLabel="Approve & Update Inventory"
      onAction={handleApprove}
    >
      <ToastEl />

      <SectionCard title="Batch">
        <SelectDropdown label="Batch ID" required options={BATCHES} value={batch} onChange={e => setBatch(e.target.value)} />
      </SectionCard>

      {inputW > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-400">Total input</p>
              <p className="text-xl font-semibold">{inputW} kg</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Allocated so far</p>
              <p className={`text-xl font-semibold ${exceeded ? 'text-red-500' : 'text-brand-600'}`}>{total.toFixed(2)} kg</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${exceeded ? 'bg-red-400' : 'bg-brand-500'}`}
              style={{ width: `${Math.min((total / inputW) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 kg</span>
            <span className={diff >= 0 ? 'text-brand-500' : 'text-red-500'}>
              {diff >= 0 ? `${diff.toFixed(2)} kg remaining` : `${Math.abs(diff).toFixed(2)} kg over!`}
            </span>
            <span>{inputW} kg</span>
          </div>
        </div>
      )}

      {exceeded && <InfoBox type="danger">⚠️ Grade total exceeds input. Reduce quantities.</InfoBox>}

      <SectionCard title="Grade Allocation (kg)">
        {GRADES.map(g => (
          <div key={g.key} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label-base">{g.label} <span className="font-normal text-gray-300">{g.desc}</span></label>
              <input
                type="number"
                step="any"
                className="input-number"
                placeholder="0.00"
                value={grades[g.key]}
                onChange={setGrade(g.key)}
              />
            </div>
            {pct(grades[g.key]) && (
              <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-medium mt-5 flex-shrink-0">
                {pct(grades[g.key])}
              </span>
            )}
          </div>
        ))}
      </SectionCard>

      {total > 0 && !exceeded && (
        <div className="section-card">
          <p className="section-title">Grade distribution</p>
          {GRADES.filter(g => parseFloat(grades[g.key]) > 0).map((g, i) => {
            const colors = ['bg-brand-500', 'bg-brand-300', 'bg-amber-400', 'bg-blue-400', 'bg-gray-300']
            const w = (parseFloat(grades[g.key]) / total * 100).toFixed(0)
            return (
              <div key={g.key} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-500 w-14">{g.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${w}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{w}%</span>
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
