import { useEffect, useState } from 'react'
import { SoldByPeriod, SoldPeriodPoint } from '../api/types'

type PeriodKey = 'monthly' | 'quarterly' | 'yearly'

const PERIODS: PeriodKey[] = ['monthly', 'quarterly', 'yearly']

const periodNoun = (p: PeriodKey) => (p === 'yearly' ? 'year' : p === 'quarterly' ? 'quarter' : 'month')

export default function SalesByPeriodCard({ data }: { data: SoldByPeriod | null }) {
  const [period, setPeriod] = useState<PeriodKey>('monthly')
  const [selected, setSelected] = useState('')

  const points = data ? data[period] : []
  const allLabel = `All ${periodNoun(period)}s`
  const latestPoint = points.length > 0 ? points[points.length - 1].key : ''

  useEffect(() => { setSelected(latestPoint) }, [period, latestPoint])

  const isSpecific = selected.length > 0
  const visible = isSpecific ? points.filter((p) => p.key === selected) : points
  const chosen = isSpecific ? points.find((p) => p.key === selected) ?? null : null
  const units = chosen?.units ?? points.reduce((s, p) => s + p.units, 0)
  const revenue = chosen?.revenue ?? points.reduce((s, p) => s + p.revenue, 0)
  const best = !isSpecific && points.length > 0
    ? [...points].sort((a, b) => b.revenue - a.revenue)[0]
    : null

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200/50">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0L18 7.5M3 15l4.5-1.5M3 15l6 6M21 7.5l-4.5-2.25M21 7.5l-4.5 2.25M21 7.5V21M9 21h12m0 0v-3" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Sales by period</h3>
            <p className="text-xs text-gray-400">Units sold from confirmed orders — by month, quarter and year</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shadow-inner">
            {PERIODS.map((k) => (
              <button key={k} onClick={() => setPeriod(k)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${period === k ? 'bg-white shadow-md text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>{k}</button>
            ))}
          </div>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{allLabel}</option>
            {points.map((p) => (
              <option key={p.key} value={p.key}>{p.key}</option>
            ))}
          </select>
        </div>
      </div>

      <BarChart points={visible} />
      {points.length > 0 && (
        <div className={`mt-6 grid gap-4 ${best && best.revenue > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-100">
              {isSpecific ? `Revenue · ${chosen?.key}` : `Total ${period} revenue`}
            </p>
            <p className="text-2xl font-extrabold mt-1 tracking-tight">₹{revenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-primary-200 mt-1">{units} units sold</p>
          </div>
          {best && best.revenue > 0 && (
            <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-700">Best {periodNoun(period)} period</p>
              <p className="text-2xl font-extrabold mt-1 tracking-tight text-primary-700">{best.key}</p>
              <p className="text-xs text-primary-600 mt-1">{best.units} units · ₹{best.revenue.toLocaleString('en-IN')} revenue</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BarChart({ points }: { points: SoldPeriodPoint[] }) {
  const max = Math.max(...points.map((p) => p.units), 1)
  if (points.length === 0) return (
    <div className="py-12 text-center">
      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm text-gray-500">No confirmed sales yet.</p>
      <p className="text-xs text-gray-400 mt-1">Sales from confirmed orders will chart here</p>
    </div>
  )
  return (
    <div className="flex items-end gap-2 h-52 pt-2">
      {points.map((p, i) => {
        const isMax = p.units === max && max > 0
        return (
          <div key={i} className="group flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${p.key}: ${p.units} units · ₹${p.revenue.toLocaleString('en-IN')}`}>
            <span className={`text-[11px] font-bold mb-1.5 ${isMax ? 'text-primary-700' : 'text-gray-500'} transition-colors`}>{p.units}</span>
            <div
              className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${isMax ? 'bg-gradient-to-t from-primary-700 to-primary-500 shadow-sm' : 'bg-gradient-to-t from-primary-400/90 to-primary-300'}`}
              style={{ height: `${Math.max((p.units / max) * 100, p.units > 0 ? 4 : 1)}%` }}
            />
            <span className={`text-[10px] mt-2 w-full text-center truncate ${isMax ? 'text-primary-700 font-semibold' : 'text-gray-400'}`}>{p.key}</span>
          </div>
        )
      })}
    </div>
  )
}