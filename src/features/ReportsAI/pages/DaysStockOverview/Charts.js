import React from 'react'

/* Biểu đồ SVG theo bao-cao-tong-quan.html (màu lấy từ biến CSS trong .so-view). */

const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0))

/* Trục đẹp: max và bước chia tròn (1, 2, 2.5, 5 × 10^n); integer = chỉ bước nguyên */
export const niceScale = (maxValue, ticks = 4, integer = false) => {
  const max = Math.max(0, Number(maxValue) || 0)
  if (!max) return { max: integer ? ticks : 1, step: integer ? 1 : 0.25 }
  const raw = max / ticks
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const step =
    [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => s >= raw) || 10 * pow
  const s = integer ? Math.max(1, Math.ceil(step)) : step
  return { max: Math.ceil(max / s) * s, step: s }
}

const moneyTick = v =>
  !v
    ? '0'
    : v >= 1e6
    ? `${+(v / 1e6).toFixed(2)} tr`
    : `${+(v / 1e3).toFixed(1)}k`

/* ===== Bán hàng theo khung giờ ===== */
export function HourChart({ slots, mode }) {
  const W = 720
  const H = 220
  const l = 52
  const r = 8
  const t = 22
  const b = 30
  const iw = W - l - r
  const ih = H - t - b
  const isRev = mode === 'rev'
  const data = slots.map(s => (isRev ? s.revenue : s.orders))
  // doanh thu chia 5 vạch (vd. 0 → 25 tr, bước 5 tr); số đơn chia vạch nguyên
  const { max, step } = niceScale(Math.max(...data, 0), isRev ? 5 : 4, !isRev)
  const sw = iw / slots.length
  const bw = Math.min(36, sw * 0.56)
  const ticks = []
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Biểu đồ ${isRev ? 'doanh thu' : 'số đơn'} theo khung giờ`}
    >
      {ticks.map(v => {
        const y = t + ih - (v / max) * ih
        return (
          <g key={v}>
            <line
              className={v ? 'gl' : 'base'}
              x1={l}
              x2={W - r}
              y1={y}
              y2={y}
            />
            <text className="ax" x={l - 8} y={y + 4} textAnchor="end">
              {isRev ? moneyTick(v) : v}
            </text>
          </g>
        )
      })}
      {slots.map((s, i) => {
        const v = data[i]
        const x = l + i * sw + (sw - bw) / 2
        const h = (v / max) * ih
        const y = t + ih - h
        const r5 = Math.min(5, h)
        return (
          <g key={s.label}>
            {v > 0 ? (
              <>
                <path
                  d={`M${x},${t + ih}V${y + r5}Q${x},${y} ${x + r5},${y}H${
                    x + bw - r5
                  }Q${x + bw},${y} ${x + bw},${y + r5}V${t + ih}Z`}
                  fill="var(--s1)"
                >
                  <title>
                    {`${s.label}h: ${s.orders} đơn, ${fmt(s.revenue)}`}
                  </title>
                </path>
                <text
                  className="vl"
                  x={x + bw / 2}
                  y={y - 6}
                  textAnchor="middle"
                >
                  {isRev ? fmt(v) : v}
                </text>
              </>
            ) : (
              <rect
                x={x}
                y={t + ih - 2}
                width={bw}
                height="2"
                rx="1"
                fill="var(--line)"
              />
            )}
            <text
              className={v > 0 ? 'axb' : 'ax'}
              x={l + i * sw + sw / 2}
              y={H - 9}
              textAnchor="middle"
            >
              {s.label}h
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ===== Biểu đồ tròn (vành khăn) — cơ cấu doanh thu, giữa ghi tổng ===== */
export function Donut({ items, total, label = 'Tổng doanh thu' }) {
  const size = 200
  const c = size / 2
  const r = 76
  const sw = 28
  const C = 2 * Math.PI * r
  const gap = items.filter(x => x.value > 0).length > 1 ? 2 : 0
  let offset = 0
  const pctText = v =>
    `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(
      (v / total) * 100
    )}%`

  return (
    <div className="so-donut">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label} ${fmt(total)}: ${items
          .map(x => `${x.label} ${total ? pctText(x.value) : '0%'}`)
          .join(', ')}`}
      >
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--line-2)"
          strokeWidth={sw}
        />
        {total > 0 &&
          items.map(x => {
            if (!x.value) return null
            const len = (x.value / total) * C
            const seg = (
              <circle
                key={x.label}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={x.color}
                strokeWidth={sw}
                strokeDasharray={`${Math.max(len - gap, 0.5)} ${C}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${c} ${c})`}
              >
                <title>{`${x.label}: ${fmt(x.value)} (${pctText(
                  x.value
                )})`}</title>
              </circle>
            )
            offset += len
            return seg
          })}
        <text className="so-donut__cap" x={c} y={c - 6} textAnchor="middle">
          {label}
        </text>
        <text className="so-donut__val" x={c} y={c + 16} textAnchor="middle">
          {fmt(total)}
        </text>
      </svg>
    </div>
  )
}

/* ===== Biểu đồ khách hàng 7 ngày thu gọn (thanh mỏng) — đặt trong khối Khách hàng =====
   Mỗi ngày 2 thanh mỏng xếp chồng: tạo mới (s1/s2) | tải app (s3/s4). Rê chuột xem số. */
export function MiniWeekChart({ days }) {
  const W = 360
  const H = 120
  const t = 14
  const b = 20
  const ih = H - t - b
  const top = Math.max(
    ...days.map(d => Math.max(d.a[0] + d.a[1], d.b[0] + d.b[1])),
    0
  )
  const { max } = niceScale(top, 2, true)
  const sw = W / 7
  const bw = 7
  const COLORS = [
    ['var(--s1)', 'var(--s2)'],
    ['var(--s3)', 'var(--s4)']
  ]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Khách hàng 7 ngày, từ ${days[0].dow} ${days[0].short} đến ${days[6].dow} ${days[6].short}`}
    >
      <line className="base" x1="0" x2={W} y1={t + ih} y2={t + ih} />
      {days.map((d, i) => {
        const cx = i * sw + sw / 2
        const total = d.a[0] + d.a[1] + d.b[0] + d.b[1]
        return (
          <g key={d.short}>
            {d.selected && (
              <rect
                x={i * sw + 3}
                y={2}
                width={sw - 6}
                height={H - 4}
                rx="6"
                fill="var(--accent-soft)"
              />
            )}
            <title>
              {`${d.dow} ${d.short}: tạo mới ${d.a[0] + d.a[1]}, tải app ${
                d.b[0] + d.b[1]
              }`}
            </title>
            {[d.a, d.b].map((vals, k) => {
              let y = t + ih
              const x = cx - bw - 1 + k * (bw + 2)
              return vals.map((v, j) => {
                if (!v) return null
                const h = (v / max) * ih
                y -= h
                return (
                  <rect
                    key={`${k}-${j}`}
                    x={x}
                    y={y}
                    width={bw}
                    height={Math.max(h - 0.5, 1)}
                    rx="2"
                    fill={COLORS[k][j]}
                  />
                )
              })
            })}
            {total > 0 && (
              <text
                className="vl"
                x={cx}
                y={
                  t +
                  ih -
                  (Math.max(d.a[0] + d.a[1], d.b[0] + d.b[1]) / max) * ih -
                  4
                }
                textAnchor="middle"
              >
                {total}
              </text>
            )}
            <text
              className={d.selected ? 'axb' : d.future ? 'ax ax-future' : 'ax'}
              x={cx}
              y={H - 6}
              textAnchor="middle"
            >
              {d.dow}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ===== Khách hàng 7 ngày: mỗi ngày 2 cột chồng (tạo mới | tải app) ===== */
const COLS = [
  ['var(--s1)', 'var(--s2)'],
  ['var(--s3)', 'var(--s4)']
]

export function WeekChart({ days }) {
  const W = 720
  const H = 280
  const l = 30
  const r = 8
  const t = 14
  const b = 44
  const iw = W - l - r
  const ih = H - t - b
  const top = Math.max(
    ...days.map(d => Math.max(d.a[0] + d.a[1], d.b[0] + d.b[1])),
    0
  )
  const { max, step } = niceScale(top, 4, true)
  const sw = iw / 7
  const gw = sw * 0.72
  const bw = gw / 2 - 1
  const ticks = []
  for (let v = 0; v <= max; v += step) ticks.push(v)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Khách hàng theo ngày, từ ${days[0].dow} ${days[0].short} đến ${days[6].dow} ${days[6].short}`}
    >
      {ticks.map(v => {
        const y = t + ih - (v / max) * ih
        return (
          <g key={v}>
            <line
              className={v ? 'gl' : 'base'}
              x1={l}
              x2={W - r}
              y1={y}
              y2={y}
            />
            <text className="ax" x={l - 8} y={y + 4} textAnchor="end">
              {v}
            </text>
          </g>
        )
      })}
      {days.map((d, i) => {
        const cx = l + i * sw + sw / 2
        const x0 = cx - gw / 2
        const cls = d.selected ? 'axb' : d.future ? 'ax ax-future' : 'ax'
        return (
          <g key={d.short}>
            {d.selected && (
              <rect
                x={l + i * sw + 4}
                y={t}
                width={sw - 8}
                height={ih}
                rx="8"
                fill="var(--accent-soft)"
              />
            )}
            {[d.a, d.b].map((vals, k) => {
              let y = t + ih
              const x = x0 + k * (bw + 2)
              return vals.map((v, j) => {
                if (!v) return null
                const h = (v / max) * ih
                y -= h
                const fill = COLS[k][j]
                return (
                  <g key={`${k}-${j}`}>
                    <rect
                      x={x}
                      y={y}
                      width={bw}
                      height={Math.max(h - 1, 1)}
                      rx="3"
                      fill={fill}
                    />
                    {h >= 17 && (
                      <text
                        className={fill === 'var(--s4)' ? 'vd' : 'vw'}
                        x={x + bw / 2}
                        y={y + (h - 1) / 2 + 4}
                        textAnchor="middle"
                      >
                        {v}
                      </text>
                    )}
                  </g>
                )
              })
            })}
            <text className={cls} x={cx} y={H - 24} textAnchor="middle">
              {d.dow}
            </text>
            <text className={cls} x={cx} y={H - 9} textAnchor="middle">
              {d.short}
              {d.isToday ? ' (hôm nay)' : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
