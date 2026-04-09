import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, SectionCard, InputField, SelectDropdown, RowTwo, InfoBox, useToast } from '../components/UI.jsx'

const SUPPLIERS = ['Sunfield Agro', 'Kerala Cashew Co.', 'Malabar Nuts Ltd', 'Coastal Exports']
const WAREHOUSES = ['WH-A (Main)', 'WH-B (Cold)', 'WH-C (Buffer)']

export default function RawLotPage() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()

  const [form, setForm] = useState({
    supplier: '', region: '', country: '', contact: '',
    poNumber: '', purchaseDate: '', receivedDate: '',
    warehouse: '',
    grossWeight: '', tareWeight: '', moisture: '', kor: '', foreignMaterial: '',
    samplingNotes: '',
  })

  function set(field) {
    return e => {
      const val = e.target.value
      setForm(prev => {
        const next = { ...prev, [field]: val }
        if (field === 'supplier') {
          const info = {
            'Sunfield Agro':    { region: 'South India', country: 'India', contact: '+91 98400 12345' },
            'Kerala Cashew Co.':{ region: 'Kerala',      country: 'India', contact: '+91 98400 67890' },
            'Malabar Nuts Ltd': { region: 'Karnataka',   country: 'India', contact: '+91 80123 45678' },
            'Coastal Exports':  { region: 'Tamil Nadu',  country: 'India', contact: '+91 94400 11223' },
          }
          if (info[val]) {
            next.region  = info[val].region
            next.country = info[val].country
            next.contact = info[val].contact
          }
        }
        return next
      })
    }
  }

  const grossW = parseFloat(form.grossWeight) || 0
  const tareW  = parseFloat(form.tareWeight)  || 0
  const netW   = grossW - tareW
  const kor    = parseFloat(form.kor)  || 0
  const expectedKernel = netW > 0 ? (netW * kor / 100).toFixed(2) : null

  function handleSave() {
    if (!form.supplier || !form.poNumber || !form.grossWeight) {
      show('Please fill all required fields')
      return
    }
    show('✅ Raw lot created successfully!')
    setTimeout(() => navigate('/home'), 1500)
  }

  return (
    <PageLayout
      title="Raw Lot Creation"
      role="Supervisor"
      onBack={() => navigate('/home')}
      actionLabel="Create Raw Lot"
      onAction={handleSave}
    >
      <ToastEl />

      <SectionCard title="Supplier Details">
        <SelectDropdown label="Supplier Name" required options={SUPPLIERS} value={form.supplier} onChange={set('supplier')} />
        <RowTwo>
          <InputField label="Region"  value={form.region}  readOnly placeholder="Auto-filled" />
          <InputField label="Country" value={form.country} readOnly placeholder="Auto-filled" />
        </RowTwo>
        <InputField label="Contact Details" value={form.contact} readOnly placeholder="Auto-filled" />
      </SectionCard>

      <SectionCard title="Purchase Info">
        <InputField label="Purchase Order No." required value={form.poNumber} onChange={set('poNumber')} placeholder="PO-2024-001" />
        <RowTwo>
          <InputField label="Purchase Date" required type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          <InputField label="Received Date"  required type="date" value={form.receivedDate}  onChange={set('receivedDate')} />
        </RowTwo>
        <SelectDropdown label="Warehouse Location" required options={WAREHOUSES} value={form.warehouse} onChange={set('warehouse')} />
      </SectionCard>

      <SectionCard title="Quality & Weight">
        <RowTwo>
          <InputField label="Gross Weight (kg)" required type="number" value={form.grossWeight} onChange={set('grossWeight')} placeholder="0.00" />
          <InputField label="Tare Weight (kg)"  required type="number" value={form.tareWeight}  onChange={set('tareWeight')}  placeholder="0.00" />
        </RowTwo>
        <InputField label="Net Weight (kg)" value={netW > 0 ? netW.toFixed(2) : ''} readOnly placeholder="Auto-calculated" />
        <RowTwo>
          <InputField label="Moisture (%)"  type="number" value={form.moisture} onChange={set('moisture')} placeholder="0.0" />
          <InputField label="KOR (%)"       type="number" value={form.kor}      onChange={set('kor')}      placeholder="0.0" />
        </RowTwo>
        <InputField label="Foreign Material (%)" type="number" value={form.foreignMaterial} onChange={set('foreignMaterial')} placeholder="0.0" />
        <div>
          <label className="label-base">Sampling Notes</label>
          <textarea
            className="input-base resize-none min-h-[72px] text-sm"
            placeholder="Describe sample quality, any observations..."
            value={form.samplingNotes}
            onChange={set('samplingNotes')}
          />
        </div>
      </SectionCard>

      {expectedKernel && (
        <div className="bg-brand-500 rounded-2xl p-4 text-white">
          <p className="text-brand-100 text-xs mb-1">Expected Kernel Output</p>
          <p className="text-3xl font-semibold">{expectedKernel} <span className="text-lg font-normal text-brand-100">kg</span></p>
          <p className="text-brand-100 text-xs mt-1">Based on {kor}% KOR × {netW.toFixed(2)} kg net weight</p>
        </div>
      )}

      {parseFloat(form.moisture) > 12 && (
        <InfoBox type="warning">
          ⚠️ Moisture at {form.moisture}% exceeds safe threshold (12%). Consider additional drying before processing.
        </InfoBox>
      )}
    </PageLayout>
  )
}
