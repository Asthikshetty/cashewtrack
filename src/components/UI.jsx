import React from 'react'

/* ─── InputField ─────────────────────────────────────────────────── */
export function InputField({ label, required, type = 'text', placeholder, value, onChange, readOnly, hint }) {
  const cls = readOnly ? 'input-readonly' : type === 'number' ? 'input-number' : 'input-base'
  return (
    <div>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cls}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        step={type === 'number' ? 'any' : undefined}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

/* ─── SelectDropdown ─────────────────────────────────────────────── */
export function SelectDropdown({ label, required, options = [], value, onChange }) {
  return (
    <div>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        className="input-base appearance-none"
        value={value}
        onChange={onChange}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

/* ─── SectionCard ────────────────────────────────────────────────── */
export function SectionCard({ title, children }) {
  return (
    <div className="section-card">
      {title && <p className="section-title">{title}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

/* ─── MetricCard ─────────────────────────────────────────────────── */
export function MetricCard({ label, value, unit, color = 'default' }) {
  const colorMap = {
    default: 'text-gray-900',
    green:   'text-brand-600',
    amber:   'text-amber-600',
    red:     'text-red-500',
  }
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className={`text-xl font-semibold ${colorMap[color]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

/* ─── MetricsGrid ────────────────────────────────────────────────── */
export function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
    </div>
  )
}

/* ─── InfoBox ────────────────────────────────────────────────────── */
export function InfoBox({ children, type = 'info' }) {
  const styles = {
    info:    'bg-brand-50  border-brand-200  text-brand-700',
    warning: 'bg-amber-50  border-amber-200  text-amber-700',
    danger:  'bg-red-50    border-red-200    text-red-600',
  }
  return (
    <div className={`text-sm px-4 py-3 rounded-xl border ${styles[type]}`}>
      {children}
    </div>
  )
}

/* ─── PageLayout ─────────────────────────────────────────────────── */
export function PageLayout({ title, role, onBack, actionLabel, onAction, children, stepBar }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ←
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900">{title}</h1>
        {role && (
          <span className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full font-medium">
            {role}
          </span>
        )}
      </header>

      {/* Step bar slot */}
      {stepBar && (
        <div className="px-4 pt-3 pb-0 bg-white border-b border-gray-50">
          {stepBar}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 flex flex-col gap-4">
        {children}
      </main>

      {/* Sticky footer */}
      {actionLabel && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-3 bg-white border-t border-gray-100 z-10">
          <button className="btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        </footer>
      )}
    </div>
  )
}

/* ─── StepBar ────────────────────────────────────────────────────── */
export function StepBar({ steps, current }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
      {steps.map((s, i) => {
        const state = i === current ? 'active' : i < current ? 'done' : 'idle'
        return (
          <span
            key={s}
            className={`step-pill ${state === 'active' ? 'step-pill-active' : state === 'done' ? 'step-pill-done' : ''}`}
          >
            {state === 'done' && <span className="mr-1">✓</span>}
            {s}
          </span>
        )
      })}
    </div>
  )
}

/* ─── Toast ──────────────────────────────────────────────────────── */
export function useToast() {
  const [msg, setMsg] = React.useState('')
  const [visible, setVisible] = React.useState(false)

  function show(message) {
    setMsg(message)
    setVisible(true)
    setTimeout(() => setVisible(false), 2500)
  }

  const ToastEl = () => visible ? (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg z-50 animate-bounce-once">
      {msg}
    </div>
  ) : null

  return { show, ToastEl }
}

/* ─── RowTwo ─────────────────────────────────────────────────────── */
export function RowTwo({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}
