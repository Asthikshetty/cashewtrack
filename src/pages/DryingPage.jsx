import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, MetricsGrid, InfoBox, useToast } from '../components/UI.jsx'

const BATCHES  = ['SHB-2024-001 (480 kg)', 'SHB-2024-002 (360 kg)', 'SHB-2024-003 (640 kg)']
const OVENS    = ['Oven-01', 'Oven-02', 'Oven-03']
const INPUT_MAP = { 'SHB-2024-001 (480 kg)': 480, 'SHB-2024-002 (360 kg)': 360, 'SHB-2024-003 (640 kg)': 640 }

export default function DryingPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    batch: '', oven: '', temperature: '', duration: '',
    outputWeight: '', moistureAfter: '',
  })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  const inputW     = form.batch ? INPUT_MAP[form.batch] ?? 0 : 0
  const outputW    = parseFloat(form.outputWeight) || 0
  const wtReduction = inputW > 0 && outputW > 0 ? (((inputW - outputW) / inputW) * 100).toFixed(1) : null
  const loss       = inputW > 0 && outputW > 0 ? (inputW - outputW).toFixed(2) : null

  const moistAfter = parseFloat(form.moistureAfter) || 0
  const moistTarget = 8
  const moistOk     = moistAfter > 0 && moistAfter <= moistTarget

  function handleSave() {
    if (!form.batch || !form.oven || !form.outputWeight) { show('Fill required fields'); return }
    show('✅ Dry batch created!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Drying Entry"
      role="Operator"
      onBack={() => navigate('/home')}
      actionLabel="Create Dry Batch"
      onAction={handleSave}
    >
      <ToastEl />

      {inputW > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Input weight</p>
          <p className="text-2xl font-semibold text-gray-900">{inputW} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
      )}

      <SectionCard title="Batch & Equipment">
        <SelectDropdown label="Batch ID" required options={BATCHES} value={form.batch} onChange={set('batch')} />
        <SelectDropdown label="Oven ID"  required options={OVENS}   value={form.oven}  onChange={set('oven')} />
      </SectionCard>

      <SectionCard title="Drying Parameters">
        <RowTwo>
          <InputField label="Temperature (°C)" type="number" value={form.temperature} onChange={set('temperature')} placeholder="70" />
          <InputField label="Duration (hours)"  type="number" value={form.duration}    onChange={set('duration')}    placeholder="4" />
        </RowTwo>
      </SectionCard>

      <SectionCard title="Output">
        <InputField label="Input Weight (kg)" value={inputW || ''} readOnly placeholder="Select batch" />
        <InputField label="Output Weight (kg)" required type="number" value={form.outputWeight} onChange={set('outputWeight')} placeholder="0.00" />
        <InputField label="Moisture After Drying (%)" type="number" value={form.moistureAfter} onChange={set('moistureAfter')} placeholder="0.0"
          hint={`Target: ≤ ${moistTarget}%`} />
      </SectionCard>

      {moistAfter > 0 && (
        <InfoBox type={moistOk ? 'info' : 'warning'}>
          {moistOk
            ? `✅ Moisture ${moistAfter}% — within target (≤ ${moistTarget}%)`
            : `⚠️ Moisture ${moistAfter}% exceeds target ${moistTarget}% — consider extended drying`}
        </InfoBox>
      )}

      {wtReduction && (
        <MetricsGrid metrics={[
          { label: 'Weight reduction', value: wtReduction, unit: '%',  color: 'green' },
          { label: 'Weight loss',       value: loss,        unit: 'kg', color: 'amber' },
          { label: 'Output weight',     value: outputW.toFixed(2), unit: 'kg' },
          { label: 'Moisture after',    value: moistAfter || '—', unit: '%', color: moistOk ? 'green' : 'red' },
        ]} />
      )}
    </PageLayout>
  )
}
