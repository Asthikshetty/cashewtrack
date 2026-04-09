import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, MetricsGrid, useToast } from '../components/UI.jsx'

const GRADES    = ['W-180', 'W-210', 'W-240', 'W-320', 'Broken']
const SHIFTS    = ['Morning (6am–2pm)', 'Afternoon (2pm–10pm)', 'Night (10pm–6am)']
const LOCATIONS = ['Rack-A1', 'Rack-A2', 'Rack-B1', 'Rack-B2', 'Cold-Store-01']
const BATCHES   = ['GB-2024-001 (W-180: 45 kg)', 'GB-2024-002 (W-320: 180 kg)', 'GB-2024-003 (W-240: 90 kg)']
const INVENTORY_MAP = {
  'GB-2024-001 (W-180: 45 kg)':   45,
  'GB-2024-002 (W-320: 180 kg)': 180,
  'GB-2024-003 (W-240: 90 kg)':   90,
}

export default function PackagingPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    batch: '', packDate: new Date().toISOString().split('T')[0],
    shift: '', grade: '', packMaterial: '',
    netWeightPerUnit: '25', location: '',
  })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  const available    = form.batch ? INVENTORY_MAP[form.batch] ?? 0 : 0
  const unitWeight   = parseFloat(form.netWeightPerUnit) || 25
  const units        = available > 0 && unitWeight > 0 ? Math.floor(available / unitWeight) : 0
  const remainder    = available > 0 ? (available % unitWeight).toFixed(2) : 0
  const fgLotNumber  = form.batch ? `FG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}` : ''

  function handleSave() {
    if (!form.batch || !form.grade || !form.location) { show('Fill required fields'); return }
    show('✅ Packaging complete — inventory updated!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Packaging"
      role="Supervisor"
      onBack={() => navigate('/home')}
      actionLabel="Complete Packaging"
      onAction={handleSave}
    >
      <ToastEl />

      <SectionCard title="Batch & Grade">
        <SelectDropdown label="Graded Batch ID" required options={BATCHES} value={form.batch}  onChange={set('batch')} />
        <SelectDropdown label="Grade Packed"    required options={GRADES}  value={form.grade}  onChange={set('grade')} />
        {fgLotNumber && (
          <InputField label="Finished Good Lot No." value={fgLotNumber} readOnly />
        )}
      </SectionCard>

      {available > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
          <p className="text-xs text-brand-600 font-medium mb-1">Available for packaging</p>
          <p className="text-2xl font-semibold text-brand-700">{available} <span className="text-sm font-normal">kg</span></p>
        </div>
      )}

      <SectionCard title="Packing Details">
        <RowTwo>
          <InputField label="Packing Date" type="date" value={form.packDate}   onChange={set('packDate')} />
          <SelectDropdown label="Shift"   options={SHIFTS} value={form.shift}  onChange={set('shift')} />
        </RowTwo>
        <InputField label="Packing Material Batch" value={form.packMaterial} onChange={set('packMaterial')} placeholder="PM-2024-001" />
        <RowTwo>
          <InputField label="Net Weight / Unit (kg)" type="number" value={form.netWeightPerUnit} onChange={set('netWeightPerUnit')} placeholder="25" />
          <SelectDropdown label="Storage Location" required options={LOCATIONS} value={form.location} onChange={set('location')} />
        </RowTwo>
      </SectionCard>

      {units > 0 && (
        <MetricsGrid metrics={[
          { label: 'Total units',      value: units,    unit: 'bags',  color: 'green' },
          { label: 'Total packed',     value: (units * unitWeight).toFixed(2), unit: 'kg' },
          { label: 'Remainder',        value: remainder, unit: 'kg',   color: parseFloat(remainder) > 0 ? 'amber' : 'green' },
          { label: 'Unit weight',      value: unitWeight, unit: 'kg/bag' },
        ]} />
      )}
    </PageLayout>
  )
}
