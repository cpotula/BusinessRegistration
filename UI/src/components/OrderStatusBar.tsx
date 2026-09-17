export const ORDER_STATUS_FLOW = ['Pending', 'Confirmed', 'Packed', 'InTransit', 'OutForDelivery', 'Delivered'] as const

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Packed: 'Packed',
  InTransit: 'In transit',
  OutForDelivery: 'Out for delivery',
  Delivered: 'Delivered',
}

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-indigo-100 text-indigo-800',
  InTransit: 'bg-cyan-100 text-cyan-800',
  OutForDelivery: 'bg-orange-100 text-orange-800',
  Delivered: 'bg-green-100 text-green-800',
}

export function statusIndex(status: string): number {
  return ORDER_STATUS_FLOW.indexOf(status as OrderStatus)
}

export function nextStatus(status: string): OrderStatus | null {
  const idx = statusIndex(status)
  return idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null
}

interface Props {
  status: string
  onAdvance?: (next: OrderStatus) => void
  advancing?: boolean
}

// Five-stage fulfilment tracker (Confirmed -> Delivered) shown to both the
// seller (with an advance button) and the buying customer.
export default function OrderStatusBar({ status, onAdvance, advancing }: Props) {
  const idx = statusIndex(status)
  const steps = ORDER_STATUS_FLOW.slice(1)
  const next = nextStatus(status)
  const active = Math.max(idx, 0)

  return (
    <div>
      <div className="flex items-center gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const done = i < active
          const current = i === active
          return (
            <div key={s} className="flex-1 min-w-0 text-center">
              <div className="flex items-center">
                {i > 0 && <div className={`h-0.5 flex-1 ${i <= active ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                <div
                  className={`w-5 h-5 rounded-full flex-shrink-0 mx-auto flex items-center justify-center text-[10px] font-bold border-2 ${
                    done
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : current
                        ? 'bg-white border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < active ? 'bg-primary-500' : 'bg-gray-200'}`} />}
              </div>
              <p className={`mt-1.5 text-[10px] sm:text-xs leading-tight truncate ${current ? 'font-semibold text-primary-700' : i < active ? 'text-gray-500' : 'text-gray-400'}`}>
                {ORDER_STATUS_LABELS[s]}
              </p>
            </div>
          )
        })}
      </div>
      {onAdvance && next && (
        <button
          onClick={() => onAdvance(next)}
          disabled={advancing}
          className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {advancing ? 'Updating…' : `Mark as ${ORDER_STATUS_LABELS[next].toLowerCase()}`}
        </button>
      )}
    </div>
  )
}