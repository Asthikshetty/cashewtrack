import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, MetricsGrid, useToast } from '../components/UI.jsx'

const BATCHES   = ['DB-2024-001 (420 kg)', 'DB-2024-002 (300 kg)', 'DB-2024-003 (560 kg)']
const OPERATORS = ['Ramu K.', 'Selvi M.', 'Anbu R.', 'Kavitha S.', 'Murugan P.']
const MACHINES  = ['Peel-Manual', 'Peel-Auto-01', 'Peel-Auto-02']
const INPUT_MAP = { 'DB-2024-001 (420 kg)': 420, 'DB-2024-002 (300 kg)': 300, 'DB-2024-003 (560 kg)': 560 }

export default function PeelingPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    batch: '', operator: '', machine: '',
    wholeKernels: '', brokenKernels: '',
  })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  const inputW   = form.batch ? INPUT_MAP[form.batch] ?? 0 : 0
  const whole    = parseFloat(form.wholeKernels)  || 0
  const broken   = parseFloat(form.brokenKernels) || 0
  const totalOut = whole + broken
  const peelingP = inputW > 0 ? ((totalOut / inputW) * 100).toFixed(1) : null
  const breakageP = totalOut > 0 ? ((broken / totalOut) * 100).toFixed(1) : null
  const loss     = inputW > 0 ? (inputW - totalOut).toFixed(2) : null
  const lossP    = inputW > 0 ? (((inputW - totalOut) / inputW) * 100).toFixed(1) : null

  function handleSave() {
    if (!form.batch || !form.operator || !form.wholeKernels) { show('Fill required fields'); return }
    show('✅ Peeling data saved!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Peeling Entry"
      role="Operator"
      onBack={() => navigate('/home')}
      actionLabel="Save Peeling Data"
      onAction={handleSave}
    >
      <ToastEl />

      {inputW > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Input weight</p>
          <p className="text-2xl font-semibold text-gray-900">{inputW} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
      )}

      <SectionCard title="Batch & Operator">
        <SelectDropdown label="Batch ID"      required options={BATCHES}   value={form.batch}    onChange={set('batch')} />
        <SelectDropdown label="Operator Name" required options={OPERATORS} value={form.operator} onChange={set('operator')} />
        <SelectDropdown label="Machine Type"           options={MACHINES}  value={form.machine}  onChange={set('machine')} />
      </SectionCard>

      <SectionCard title="Output Weights">
        <InputField label="Input Weight (kg)" value={inputW || ''} readOnly placeholder="Select batch" />
        <RowTwo>
          <InputField label="Whole Kernels (kg)"  required type="number" value={form.wholeKernels}  onChange={set('wholeKernels')}  placeholder="0.00" />
          <InputField label="Broken Kernels (kg)"          type="number" value={form.brokenKernels} onChange={set('brokenKernels')} placeholder="0.00" />
        </RowTwo>
      </SectionCard>

      {totalOut > 0 && (
        <>
          <MetricsGrid metrics={[
            { label: 'Peeling yield',  value: peelingP,  unit: '%',  color: parseFloat(peelingP) >= 80 ? 'green' : 'amber' },
            { label: 'Breakage %',     value: breakageP, unit: '%',  color: parseFloat(breakageP) > 15 ? 'red' : 'amber' },
            { label: 'Total output',   value: totalOut.toFixed(2), unit: 'kg' },
            { label: 'Loss',           value: loss,      unit: 'kg', color: 'amber' },
          ]} />
          {/* Whole vs Broken bar */}
          {totalOut > 0 && (
            <div className="section-card">
              <p className="section-title">Kernel breakdown</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 rounded-full bg-brand-500 transition-all" style={{ width: `${(whole/totalOut)*100}%`, minWidth: 4 }} />
                <div className="h-3 rounded-full bg-amber-300 transition-all" style={{ width: `${(broken/totalOut)*100}%`, minWidth: broken > 0 ? 4 : 0 }} />
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span><span className="inline-block w-2 h-2 bg-brand-500 rounded-full mr-1" />Whole {((whole/totalOut)*100).toFixed(0)}%</span>
                <span><span className="inline-block w-2 h-2 bg-amber-300 rounded-full mr-1" />Broken {((broken/totalOut)*100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  )
}
