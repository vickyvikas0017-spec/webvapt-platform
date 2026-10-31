import React from 'react'
import clsx from 'clsx'
import { SEVERITY_COLORS, STATUS_COLORS } from '../utils/types'

// ── Badge ─────────────────────────────────────────────────────────────────────
export const SeverityBadge: React.FC<{ severity?: string }> = ({ severity }) => {
  if (!severity) return null
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
      SEVERITY_COLORS[severity] || 'text-slate-700 bg-slate-100 border-slate-200'
    )}>
      {severity}
    </span>
  )
}

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
      STATUS_COLORS[status] || 'text-slate-600 bg-slate-100 border-slate-200'
    )}>
      {status}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={clsx('bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900', className)}>
    {children}
  </div>
)

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  label: string; value: string | number; color?: string; icon?: React.ReactNode
}> = ({ label, value, color = 'text-slate-900', icon }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      {icon && <span className="text-slate-400">{icon}</span>}
    </div>
    <div className={clsx('text-2xl font-bold', color)}>{value}</div>
  </div>
)

// ── Form Field ────────────────────────────────────────────────────────────────
export const Field: React.FC<{
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}> = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
)

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { className?: string }> = ({
  className, ...props
}) => (
  <input
    className={clsx(
      'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900',
      'placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10',
      'transition-all shadow-2xs',
      className
    )}
    {...props}
  />
)

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }> = ({
  className, ...props
}) => (
  <textarea
    className={clsx(
      'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900',
      'placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10',
      'transition-all resize-y shadow-2xs',
      className
    )}
    {...props}
  />
)

// ── Code Editor ───────────────────────────────────────────────────────────────
export const CodeEditor: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }> = ({
  className, ...props
}) => (
  <textarea
    className={clsx(
      'w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-emerald-400',
      'placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y shadow-inner',
      'transition-colors',
      className
    )}
    style={{ minHeight: 120 }}
    {...props}
  />
)

// ── Select ────────────────────────────────────────────────────────────────────
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }> = ({
  className, children, ...props
}) => (
  <select
    className={clsx(
      'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900',
      'focus:outline-none focus:border-blue-600 transition-colors shadow-2xs',
      className
    )}
    {...props}
  >
    {children}
  </select>
)

// ── Button ────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; as?: any
}> = ({ variant = 'primary', size = 'md', loading, className, children, disabled, as, ...props }) => {
  const Component = as || 'button'
  const variants: Record<BtnVariant, string> = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs',
    danger:    'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
    ghost:     'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-base' }
  return (
    <Component
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-all cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </Component>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; color?: string }> = ({
  value, color = 'bg-blue-600'
}) => (
  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
    <div
      className={clsx('h-2 rounded-full transition-all', color)}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{
  title: string; subtitle?: string; actions?: React.ReactNode
}> = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
    {icon && <div className="text-slate-400 mb-3 text-4xl">{icon}</div>}
    <h3 className="text-slate-800 font-semibold mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-sm mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
)

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert: React.FC<{
  type?: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode
}> = ({ type = 'info', children }) => {
  const colors = {
    info:    'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error:   'bg-red-50 border-red-200 text-red-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }
  return (
    <div className={clsx('border rounded-lg p-4 text-sm font-medium', colors[type])}>
      {children}
    </div>
  )
}
