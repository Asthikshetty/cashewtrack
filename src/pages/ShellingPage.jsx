import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, MetricsGrid, useToast } from '../components/UI.jsx'

const BATCHES   = ['SB-2024-001 (600 kg)', 'SB-2024-002 (450 kg)', 'SB-2024-003 (800 kg)']
const OPERATORS = ['Ramu K.', 'Selvi M.', 'Anbu R.', 'Kavitha S.']
const MACHINES  = ['Shell-01', 'Shell-02', 'Shell-03']
const INPUT_MAP = { 'SB-2024-001 (600 kg)': 600, 'SB-2024-002 (450 kg)': 450, 'SB-2024-003 (800 kg)': 800 }

export default function ShellingPage() {
  const navigate  = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    batch: '', operator: '', machine: '',
    startTime: '', endTime: '',
    uncutOutput: '', unscoopOutput: '',
  })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  const inputW     = form.batch ? INPUT_MAP[form.batch] ?? 0 : 0
  const uncut      = parseFloat(form.uncutOutput)    || 0
  const unscoop    = parseFloat(form.unscoopOutput)  || 0
  const totalOut   = uncut + unscoop
  const recovery   = inputW > 0 ? ((totalOut / inputW) * 100).toFixed(1) : null
  const loss       = inputW > 0 ? (inputW - totalOut).toFixed(2) : null
  const lossP      = inputW > 0 ? (((inputW - totalOut) / inputW) * 100).toFixed(1) : null

  const startMins  = form.startTime  ? form.startTime.split(':').reduce((a,b,i)=>a+(i===0?+b*60:+b),0)  : 0
  const endMins    = form.endTime    ? form.endTime.split(':').reduce((a,b,i)=>a+(i===0?+b*60:+b),0)    : 0
  const durationH  = endMins > startMins ? (endMins - startMins) / 60 : 0
  const efficiency = durationH > 0 ? (totalOut / durationH).toFixed(1) : null

  function handleSave() {
    if (!form.batch || !form.operator || !form.uncutOutput) { show('Fill required fields'); return }
    show('✅ Shelling batch saved!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Shelling Entry"
      role="Operator"
      onBack={() => navigate('/home')}
      actionLabel="Save Shelling Batch"
      onAction={handleSave}
    >
      <ToastEl />

      {inputW > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Input weight from selected batch</p>
          <p className="text-2xl font-semibold text-gray-900">{inputW} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
      )}

      <SectionCard title="Batch & Operator">
        <SelectDropdown label="Batch ID"      required options={BATCHES}   value={form.batch}    onChange={set('batch')} />
        <SelectDropdown label="Operator Name" required options={OPERATORS} value={form.operator} onChange={set('operator')} />
        <SelectDropdown label="Machine ID"            options={MACHINES}  value={form.machine}  onChange={set('machine')} />
      </SectionCard>

      <SectionCard title="Time">
        <RowTwo>
          <InputField label="Start Time" type="time" value={form.startTime} onChange={set('startTime')} />
          <InputField label="End Time"   type="time" value={form.endTime}   onChange={set('endTime')} />
        </RowTwo>
      </SectionCard>

      <SectionCard title="Output Weights">
        <InputField label="Input Weight (kg)" value={inputW || ''} readOnly placeholder="Select batch" />
        <RowTwo>
          <InputField label="Uncut Output (kg)"   required type="number" value={form.uncutOutput}   onChange={set('uncutOutput')}   placeholder="0.00" />
          <InputField label="Unscoup Output (kg)"          type="number" value={form.unscoopOutput} onChange={set('unscoopOutput')} placeholder="0.00" />
        </RowTwo>
      </SectionCard>

      {totalOut > 0 && (
        <MetricsGrid metrics={[
          { label: 'Total output',  value: totalOut.toFixed(2), unit: 'kg' },
          { label: 'Recovery',      value: recovery,            unit: '%',   color: parseFloat(recovery) >= 75 ? 'green' : 'amber' },
          { label: 'Loss',          value: loss,                unit: 'kg',  color: 'amber' },
          { label: 'Loss %',        value: lossP,               unit: '%',   color: parseFloat(lossP) > 10 ? 'red' : 'amber' },
          ...(efficiency ? [{ label: 'Efficiency', value: efficiency, unit: 'kg/hr', color: 'green' }] : []),
        ]} />
      )}
    </PageLayout>
  )
}
