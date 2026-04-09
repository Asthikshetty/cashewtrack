import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, InfoBox, MetricsGrid, useToast } from '../components/UI.jsx'

const LOTS    = ['RL-2024-001 (Sunfield)', 'RL-2024-002 (Kerala CC)', 'RL-2024-003 (Malabar)']
const SHIFTS  = ['Morning (6am–2pm)', 'Afternoon (2pm–10pm)', 'Night (10pm–6am)']
const MACHINES = ['Steam-01', 'Steam-02', 'Steam-03']
const STOCK   = { 'RL-2024-001 (Sunfield)': 4200, 'RL-2024-002 (Kerala CC)': 3100, 'RL-2024-003 (Malabar)': 5500 }

export default function SteamingPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    lot: '', feedQty: '', steamTemp: '', steamPressure: '',
    duration: '', date: new Date().toISOString().split('T')[0],
    shift: '', machine: '',
  })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  const available = form.lot ? STOCK[form.lot] ?? 0 : null
  const feedQty   = parseFloat(form.feedQty) || 0
  const exceeded  = available !== null && feedQty > available

  const lotInfo = form.lot
    ? { supplier: form.lot.split('(')[1]?.replace(')', ''), country: 'India' }
    : null

  function handleSave() {
    if (!form.lot || !form.feedQty || !form.machine) { show('Fill required fields'); return }
    if (exceeded) { show('❌ Quantity exceeds available stock!'); return }
    show('✅ Steamed batch created!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Steaming Entry"
      role="Operator"
      onBack={() => navigate('/home')}
      actionLabel="Create Steamed Batch"
      onAction={handleSave}
    >
      <ToastEl />

      {available !== null && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Available stock</p>
            <p className="text-2xl font-semibold text-gray-900">{available.toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></p>
          </div>
          {lotInfo && (
            <div className="text-right">
              <p className="text-xs text-gray-400">{lotInfo.supplier}</p>
              <p className="text-xs text-gray-400">{lotInfo.country}</p>
            </div>
          )}
        </div>
      )}

      <SectionCard title="Lot Selection">
        <SelectDropdown label="Lot Number" required options={LOTS} value={form.lot} onChange={set('lot')} />
      </SectionCard>

      <SectionCard title="Feed & Machine">
        <InputField
          label="Feed Quantity (kg)" required type="number"
          value={form.feedQty} onChange={set('feedQty')}
          placeholder="0.00"
          hint={available !== null ? `Max: ${available.toLocaleString()} kg available` : ''}
        />
        {exceeded && <InfoBox type="danger">⚠️ Feed quantity exceeds available stock by {(feedQty - available).toFixed(2)} kg</InfoBox>}
        <RowTwo>
          <SelectDropdown label="Machine ID" required options={MACHINES} value={form.machine} onChange={set('machine')} />
          <SelectDropdown label="Shift"       required options={SHIFTS}   value={form.shift}   onChange={set('shift')} />
        </RowTwo>
      </SectionCard>

      <SectionCard title="Steam Parameters">
        <RowTwo>
          <InputField label="Temperature (°C)" type="number" value={form.steamTemp}      onChange={set('steamTemp')}      placeholder="120" />
          <InputField label="Pressure (bar)"   type="number" value={form.steamPressure}  onChange={set('steamPressure')}  placeholder="2.5" />
        </RowTwo>
        <InputField label="Duration (minutes)" type="number" value={form.duration} onChange={set('duration')} placeholder="30" />
        <InputField label="Date" type="date" value={form.date} onChange={set('date')} />
      </SectionCard>

      {form.feedQty && !exceeded && (
        <MetricsGrid metrics={[
          { label: 'Feed quantity', value: feedQty.toFixed(2), unit: 'kg' },
          { label: 'Remaining after feed', value: available !== null ? (available - feedQty).toFixed(2) : '—', unit: 'kg', color: 'green' },
        ]} />
      )}
    </PageLayout>
  )
}
