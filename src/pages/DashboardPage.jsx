import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/UI.jsx'

const KPI = [
  { label: 'Raw stock',        value: '42.6t',  sub: '+3.2t this week',  color: 'text-gray-900' },
  { label: 'Kernel produced',  value: '18.1t',  sub: 'W180–W320',        color: 'text-gray-900' },
  { label: 'Overall recovery', value: '42.5%',  sub: 'Target: 44%',      color: 'text-amber-600' },
  { label: 'Moisture OK',      value: '91%',    sub: '9 of 10 batches',  color: 'text-brand-600' },
]

const INVENTORY = [
  { grade: 'W-180', qty: '1,240 kg', bags: 49,  status: 'good' },
  { grade: 'W-210', qty: '3,850 kg', bags: 154, status: 'good' },
  { grade: 'W-240', qty: '5,120 kg', bags: 205, status: 'good' },
  { grade: 'W-320', qty: '7,440 kg', bags: 298, status: 'low'  },
  { grade: 'Broken', qty: '450 kg',  bags: 18,  status: 'good' },
]

const SUPPLIERS = [
  { name: 'Sunfield Agro',     kor: 44.2, moisture: 10.1, lots: 4  },
  { name: 'Kerala Cashew Co.', kor: 41.8, moisture: 11.4, lots: 3  },
  { name: 'Malabar Nuts Ltd',  kor: 43.5, moisture: 9.8,  lots: 2  },
  { name: 'Coastal Exports',   kor: 39.9, moisture: 12.3, lots: 1  },
]

const OPERATORS = [
  { name: 'Selvi M.',   efficiency: 94, batches: 12, breakage: 4.2  },
  { name: 'Ramu K.',    efficiency: 88, batches: 10, breakage: 6.1  },
  { name: 'Kavitha S.', efficiency: 91, batches: 9,  breakage: 5.0  },
  { name: 'Anbu R.',    efficiency: 79, batches: 8,  breakage: 8.4  },
]

const LOSS = [
  { stage: 'Steaming', loss: 2.1,  target: 2.5 },
  { stage: 'Shelling', loss: 8.4,  target: 8.0 },
  { stage: 'Drying',   loss: 5.2,  target: 5.0 },
  { stage: 'Peeling',  loss: 3.8,  target: 4.0 },
]

function Bar({ value, max = 100, color = 'bg-brand-500' }) {
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex-1">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = ['overview', 'inventory', 'suppliers', 'operators', 'loss']

  return (
    <PageLayout title="Dashboard" role="Owner" onBack={() => navigate('/home')}>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all capitalize
              ${activeTab === t
                ? 'bg-brand-500 text-white border-brand-500 font-medium'
                : 'border-gray-200 text-gray-500 bg-white hover:border-brand-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {KPI.map(k => (
              <div key={k.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{k.label}</p>
                <p className={`text-xl font-semibold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Recovery trend (static bars) */}
          <div className="section-card">
            <p className="section-title">Weekly recovery %</p>
            {[['Mon', 41.2], ['Tue', 43.8], ['Wed', 42.1], ['Thu', 44.5], ['Fri', 43.0], ['Sat', 42.5]].map(([d, v]) => (
              <div key={d} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-400 w-6">{d}</span>
                <Bar value={v} max={50} color={v >= 44 ? 'bg-brand-500' : 'bg-amber-400'} />
                <span className="text-xs font-medium text-gray-700 w-10 text-right">{v}%</span>
              </div>
            ))}
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <span><span className="inline-block w-2 h-2 bg-brand-500 rounded-full mr-1" />At target (≥44%)</span>
              <span><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1" />Below target</span>
            </div>
          </div>

          {/* Production loss summary quick */}
          <div className="section-card">
            <p className="section-title">Stage loss summary</p>
            {LOSS.map(l => (
              <div key={l.stage} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-500 w-16">{l.stage}</span>
                <Bar value={l.loss} max={15} color={l.loss > l.target ? 'bg-red-400' : 'bg-brand-500'} />
                <span className={`text-xs font-medium w-10 text-right ${l.loss > l.target ? 'text-red-500' : 'text-brand-600'}`}>{l.loss}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Inventory ── */}
      {activeTab === 'inventory' && (
        <>
          <div className="section-card">
            <p className="section-title">Inventory by grade</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">Grade</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-2">Qty</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-2">Bags</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map(r => (
                    <tr key={r.grade} className="border-b border-gray-50">
                      <td className="py-2.5 font-medium text-gray-900 text-sm">{r.grade}</td>
                      <td className="py-2.5 text-right text-gray-700 text-sm">{r.qty}</td>
                      <td className="py-2.5 text-right text-gray-500 text-xs">{r.bags}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${r.status === 'good' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'}`}>
                          {r.status === 'good' ? 'OK' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-card">
            <p className="section-title">Stock distribution</p>
            {INVENTORY.map((r, i) => {
              const totalKg = INVENTORY.reduce((s, x) => s + parseInt(x.qty.replace(/[^0-9]/g, '')), 0)
              const kg = parseInt(r.qty.replace(/[^0-9]/g, ''))
              const pct = ((kg / totalKg) * 100).toFixed(0)
              const colors = ['bg-brand-500', 'bg-brand-300', 'bg-blue-400', 'bg-amber-400', 'bg-gray-300']
              return (
                <div key={r.grade} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 w-14">{r.grade}</span>
                  <Bar value={pct} max={100} color={colors[i]} />
                  <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Suppliers ── */}
      {activeTab === 'suppliers' && (
        <div className="section-card">
          <p className="section-title">Supplier performance</p>
          {SUPPLIERS.map(s => (
            <div key={s.name} className="border border-gray-100 rounded-xl p-3 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.lots} lots received</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold
                  ${s.kor >= 43 ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'}`}>
                  KOR {s.kor}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">KOR %</p>
                  <div className="flex items-center gap-2">
                    <Bar value={s.kor} max={50} color={s.kor >= 43 ? 'bg-brand-500' : 'bg-amber-400'} />
                    <span className="text-xs font-medium text-gray-700 flex-shrink-0">{s.kor}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Moisture %</p>
                  <div className="flex items-center gap-2">
                    <Bar value={s.moisture} max={15} color={s.moisture <= 11 ? 'bg-brand-500' : 'bg-red-400'} />
                    <span className="text-xs font-medium text-gray-700 flex-shrink-0">{s.moisture}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Operators ── */}
      {activeTab === 'operators' && (
        <div className="section-card">
          <p className="section-title">Operator efficiency</p>
          {OPERATORS.sort((a, b) => b.efficiency - a.efficiency).map((op, i) => (
            <div key={op.name} className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                ${i === 0 ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{op.name}</p>
                  <p className={`text-sm font-semibold ${op.efficiency >= 90 ? 'text-brand-600' : op.efficiency >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
                    {op.efficiency}%
                  </p>
                </div>
                <Bar
                  value={op.efficiency}
                  max={100}
                  color={op.efficiency >= 90 ? 'bg-brand-500' : op.efficiency >= 80 ? 'bg-amber-400' : 'bg-red-400'}
                />
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{op.batches} batches</span>
                  <span>Breakage: {op.breakage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Loss ── */}
      {activeTab === 'loss' && (
        <>
          <div className="section-card">
            <p className="section-title">Production loss by stage</p>
            {LOSS.map(l => (
              <div key={l.stage} className="border border-gray-100 rounded-xl p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-900 text-sm">{l.stage}</p>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${l.loss > l.target ? 'text-red-500' : 'text-brand-600'}`}>
                      {l.loss}%
                    </span>
                    <span className="text-xs text-gray-400 ml-1">/ {l.target}% target</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bar value={l.loss} max={15} color={l.loss > l.target ? 'bg-red-400' : 'bg-brand-500'} />
                </div>
                <p className={`text-xs mt-1.5 ${l.loss > l.target ? 'text-red-400' : 'text-brand-500'}`}>
                  {l.loss > l.target
                    ? `⚠️ ${(l.loss - l.target).toFixed(1)}% above target`
                    : `✅ ${(l.target - l.loss).toFixed(1)}% below target`}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total estimated loss</p>
            <p className="text-2xl font-semibold text-gray-900">
              {LOSS.reduce((s, l) => s + l.loss, 0).toFixed(1)}
              <span className="text-sm font-normal text-gray-400 ml-1">% of input</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Across all 4 processing stages</p>
          </div>
        </>
      )}
    </PageLayout>
  )
}
