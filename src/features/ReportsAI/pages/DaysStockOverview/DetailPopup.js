import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment'
import clsx from 'clsx'
import { Donut } from './Charts'
import {
  countNoun,
  fmtMoney,
  formatCell,
  groupOptions,
  groupRows,
  listKind,
  norm,
  SEARCH_KEYS,
  prepareTable,
  rowText,
  sortValue,
  splitItems,
  splitStaff,
  sumBy
} from './popupTable'

export { formatCell }

/* Popup chi tiết (/hang-ngay/danh-sach):
   - đầu: tiêu đề + bối cảnh (cơ sở, ngày chung), dải số tổng
   - thanh công cụ: tìm kiếm, gom theo (chi tiết / khách / ngày / ...), Gọn ↔ Đủ cột
   - bảng gọn: cột gộp, ô 0 mờ, Còn nợ đỏ, dòng Tổng dính đáy; bấm tiêu đề cột để sắp xếp
   - điện thoại: mỗi dòng 1 thẻ. Đóng bằng nút X, phím Esc. */

/* Cách hiển thị theo loại danh sách (listKind) */
const PROFILES = {
  // Đơn hàng mới
  orders: {
    placeholder: 'Tìm theo ID đơn, tên + SĐT khách, tên SP/DV',
    noWalkIn: true
  },
  // Chi tiết bán hàng: số tổng + ô tìm cùng 1 hàng, không có "Đủ cột"
  products: {
    placeholder: 'Tìm theo ID hoặc tên sản phẩm',
    inlineSearch: true,
    noFull: true
  },
  // danh sách khách: đủ cột (kể cả cột trống), Tên + ĐT gộp 1 cột,
  // Ngày tạo lên dưới tiêu đề (báo cáo xem 1 ngày)
  customers: {
    table: { keepCustId: true, keepEmpty: true, contextKeys: ['Ngày Tạo'] },
    noKpis: true,
    noSearch: true,
    noFull: true
  },
  // Thu nợ: số khách + tổng theo phương thức (summary) dưới tiêu đề, không dải số tổng
  debts: {
    table: { keepCustId: true },
    noKpis: true,
    noFull: true,
    noShare: true,
    custCount: true,
    placeholder: 'Tìm theo ID, tên + SĐT khách'
  },
  // Đặt lịch: ID khách + tên + SĐT 1 cột, cột gộp, bỏ Ghi chú; tab Khung giờ thay Ngày
  bookings: {
    table: {
      keepEmpty: true,
      custIdInCell: true,
      contextKeys: [],
      hideKeys: ['Ghi chú'],
      labels: { 'Nhân viên': 'Nhân viên thực hiện' }
    },
    searchMin: 1,
    noKpis: true,
    noFull: true,
    placeholder: 'Tìm theo tên, SĐT khách'
  },
  // Dịch vụ thực hiện: đủ cột trong bảng gọn (bỏ cột Loại), Dịch vụ gốc + Thẻ 1 cột
  services: {
    table: {
      keepEmpty: true,
      custIdInCell: true,
      contextKeys: [],
      hideKeys: ['Loại']
    },
    noWalkIn: true,
    noFull: true,
    placeholder: 'Tìm theo tên, SĐT khách, dịch vụ, nhân viên'
  },
  // Thu chi: bảng đầy đủ cột, không có nút Bảng gọn
  cash: {
    forceFull: true,
    noFull: true,
    placeholder: 'Tìm theo nội dung, loại phiếu'
  },
  other: { placeholder: 'Tìm trong danh sách…' }
}

/* Màu cho từng thành phần; quá nhiều thì gộp phần còn lại vào "Khác" */
const SHARE_COLORS = [
  '#2f8cf5',
  '#7a5af0',
  '#0c8a65',
  '#e9a53a',
  '#ec5d63',
  '#14b8a6',
  '#cbbff7',
  '#8cbcf9'
]
const OTHER_COLOR = '#c4cad6'

/* Gộp dòng theo tên (labelKey), cộng giá trị (valueKey), xếp giảm dần.
   Tối đa SHARE_COLORS.length phần, phần còn lại gộp thành "Khác". */
export const buildShare = (rows, { labelKey, valueKey }) => {
  const map = new Map()
  for (const r of rows || []) {
    const name = String(r[labelKey] ?? '').trim() || '(Không tên)'
    // không có valueKey: đếm số dòng (vd. số buổi dịch vụ)
    const v = valueKey ? Math.abs(Number(r[valueKey]) || 0) : 1
    map.set(name, (map.get(name) || 0) + v)
  }
  const all = [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter(x => x.value > 0)
    .sort((a, b) => b.value - a.value)
  const max = SHARE_COLORS.length
  const items =
    all.length > max
      ? [
          ...all.slice(0, max - 1),
          {
            label: `Khác (${all.length - max + 1})`,
            value: all.slice(max - 1).reduce((a, x) => a + x.value, 0),
            other: true
          }
        ]
      : all
  const total = items.reduce((a, x) => a + x.value, 0)
  return {
    total,
    items: items.map((x, i) => ({
      ...x,
      color: x.other ? OTHER_COLOR : SHARE_COLORS[i % SHARE_COLORS.length]
    }))
  }
}

const pctText = (v, total) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(
    total ? (v / total) * 100 : 0
  )}%`

function ShareChart({ rows, chart }) {
  const { items, total } = buildShare(rows, chart)
  return (
    <aside className="so-pop__chart" aria-label="Tỉ lệ phân chia">
      <h3>Tỉ lệ phân chia</h3>
      <div className="so-pop__donut">
        <Donut items={items} total={total} label={chart.totalLabel || 'Tổng'} />
      </div>
      <ul className="so-pop__share">
        {items.map(x => (
          <li key={x.label}>
            <i style={{ background: x.color }} aria-hidden="true"></i>
            <span title={x.label}>{x.label}</span>
            <b>{pctText(x.value, total)}</b>
            <s aria-hidden="true">
              <u
                style={{
                  width: `${total ? (x.value / total) * 100 : 0}%`,
                  background: x.color
                }}
              ></u>
            </s>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/* ===== Ô của bảng ===== */
const Zero = () => (
  <span className="so-dt__zero" aria-label="0">
    –
  </span>
)

function Cell({ col, row }) {
  const v = col.get(row)
  switch (col.type) {
    case 'money': {
      const n = Number(v) || 0
      const note = col.note && col.note(row)
      return (
        <>
          {n === 0 ? (
            <Zero />
          ) : (
            <span
              className={clsx(
                col.primary && 'so-dt__strong',
                col.key === 'Còn nợ' && 'so-dt__debt'
              )}
            >
              {fmtMoney(n)}
            </span>
          )}
          {note && <small className="so-dt__note">{note}</small>}
        </>
      )
    }
    case 'datetime':
      if (!v) return null
      return col.sameDay ? (
        <span className="so-dt__time">{moment(v).format('HH:mm')}</span>
      ) : (
        <>
          <span className="so-dt__time">{moment(v).format('HH:mm')}</span>
          <small className="so-dt__note">
            {moment(v).format('DD-MM-YYYY')}
          </small>
        </>
      )
    case 'customer':
      return (
        <>
          <span className="so-dt__name">
            {v.name}
            {v.walkIn && <em className="so-dt__badge">Vãng lai</em>}
          </span>
          {(v.phone || v.id) && (
            <small className="so-dt__note">
              {[v.id && `#${v.id}`, v.phone].filter(Boolean).join(' · ')}
            </small>
          )}
        </>
      )
    // cột gộp: inline -> 1 dòng "chính · phụ [nhãn]"; còn lại 2 tầng
    case 'stack':
      if (!v.main && !v.note && !v.badge) return null
      return v.inline ? (
        <span className="so-dt__line">
          <span className="so-dt__main">{v.main}</span>
          {v.note && <span className="so-dt__sub"> · {v.note}</span>}
          {v.badge && <em className="so-dt__tag is-mute">{v.badge}</em>}
        </span>
      ) : (
        <>
          <span className="so-dt__main">{v.main}</span>
          {(v.note || v.badge) && (
            <small className="so-dt__note">
              {v.note}
              {v.badge && <em className="so-dt__tag is-mute">{v.badge}</em>}
            </small>
          )}
        </>
      )
    case 'items': {
      const items = splitItems(v)
      const note = col.note && col.note(row)
      if (!items.length && !note) return null
      return (
        <>
          {items.length > 0 && (
            <ul className="so-dt__items">
              {items.map((x, i) => (
                <li key={i}>
                  {x.name}
                  {x.qty !== null && <b>×{x.qty}</b>}
                </li>
              ))}
            </ul>
          )}
          {note && <small className="so-dt__note">{note}</small>}
        </>
      )
    }
    // nhiều nhân viên: mỗi người 1 dòng
    case 'staff': {
      const names = splitStaff(v)
      if (!names.length) return null
      return names.map((n, i) => (
        <span key={i} className="so-dt__staff">
          {n}
        </span>
      ))
    }
    case 'stars': {
      const n = Number(v) || 0
      return n ? (
        <span className="so-dt__stars" aria-label={`${n} sao`}>
          {n} <i className="fa-solid fa-star" aria-hidden="true"></i>
        </span>
      ) : null
    }
    case 'tag':
      return v ? (
        <span
          className={clsx(
            'so-dt__tag',
            v === 'Đã cài' && 'is-pos',
            (v === 'Chưa' || v === 'Chưa phát sinh') && 'is-mute'
          )}
        >
          {String(v)}
        </span>
      ) : null
    case 'id':
      return v ? <span className="so-dt__id">#{v}</span> : null
    case 'name':
      return <span className="so-dt__name">{String(v ?? '')}</span>
    default:
      return formatCell(col.key, v)
  }
}

const cellClass = col =>
  clsx(
    col.type === 'money' && 'num',
    col.type === 'long' && 'is-long',
    col.type === 'items' && 'is-items',
    col.type === 'customer' && 'is-cust',
    col.type === 'stack' && 'is-stack',
    (col.type === 'staff' || col.key === 'Cơ sở') && 'nw',
    ['id', 'datetime', 'date', 'time', 'tag'].includes(col.type) && 'nw'
  )

/* ===== Bảng chi tiết ===== */
function DetailTable({ rows, cols, full, sort, onSort }) {
  const money = cols.filter(c => c.type === 'money')
  const firstMoney = cols.findIndex(c => c.type === 'money')
  return (
    <div className="so-pop__table-wrap">
      <table className={clsx('so-pop__table', full && 'is-full')}>
        <thead>
          <tr>
            <th className="so-dt__stt">STT</th>
            {cols.map(c => {
              const active = sort.key === c.key
              return (
                <th
                  key={c.key}
                  className={cellClass(c)}
                  aria-sort={
                    active
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="so-dt__sort"
                    onClick={() => onSort(c.key)}
                    title={`Sắp xếp theo ${c.label}`}
                  >
                    {c.label}
                    <i
                      className={clsx(
                        'fa-solid',
                        active
                          ? sort.dir === 'asc'
                            ? 'fa-arrow-up'
                            : 'fa-arrow-down'
                          : 'fa-sort',
                        !active && 'is-idle'
                      )}
                      aria-hidden="true"
                    ></i>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="so-dt__stt">{i + 1}</td>
              {cols.map(c => (
                <td key={c.key} className={cellClass(c)}>
                  {full ? (
                    formatCell(c.key, r[c.key])
                  ) : (
                    <Cell col={c} row={r} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* có cả phiếu thu lẫn chi (Tồn ngày): không cộng chung */}
        {money.length > 0 &&
          rows.length > 1 &&
          new Set(rows.map(r => r['Loại phiếu'])).size < 2 && (
            <tfoot>
              <tr>
                <td className="so-dt__total-label" colSpan={firstMoney + 1}>
                  {firstMoney > 0 ? `Tổng ${rows.length} dòng` : 'Tổng'}
                </td>
                {cols.slice(firstMoney).map(c => (
                  <td key={c.key} className={cellClass(c)}>
                    {c.type === 'money' ? fmtMoney(sumBy(rows, c)) : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
      </table>
    </div>
  )
}

/* ===== Bảng gom nhóm ===== */
function GroupTable({ groups, opt, money, primary, noun, noShare }) {
  const total = primary
    ? groups.reduce((a, g) => a + Math.abs(g.sums[primary.key] || 0), 0)
    : groups.reduce((a, g) => a + g.count, 0)
  return (
    <div className="so-pop__table-wrap so-dt__group-wrap">
      <table className="so-pop__table so-dt__group">
        <thead>
          <tr>
            <th>{opt.label}</th>
            <th className="num">{noun}</th>
            {money.map(c => (
              <th key={c.key} className="num">
                {c.label}
              </th>
            ))}
            {!noShare && <th className="so-dt__share-h">Tỉ trọng</th>}
          </tr>
        </thead>
        <tbody>
          {groups.map(g => {
            const v = primary ? Math.abs(g.sums[primary.key] || 0) : g.count
            return (
              <tr key={g.label}>
                <td>
                  <span className="so-dt__name">{g.label}</span>
                </td>
                <td className="num">{g.count}</td>
                {money.map(c => (
                  <td key={c.key} className="num">
                    {g.sums[c.key] ? (
                      <span
                        className={clsx(
                          c.primary && 'so-dt__strong',
                          c.key === 'Còn nợ' && 'so-dt__debt'
                        )}
                      >
                        {fmtMoney(g.sums[c.key])}
                      </span>
                    ) : (
                      <Zero />
                    )}
                  </td>
                ))}
                {!noShare && (
                  <td className="so-dt__share-c">
                    <span className="so-dt__bar" aria-hidden="true">
                      <i
                        style={{ width: `${total ? (v / total) * 100 : 0}%` }}
                      ></i>
                    </span>
                    <b>{pctText(v, total)}</b>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ô trống / bằng 0 -> không hiện trên thẻ
const isBlank = (col, row) => {
  const v = col.get(row)
  if (col.type === 'money') return !(Number(v) || 0)
  if (col.type === 'customer') return false
  if (col.type === 'stack') return !v.main && !v.note && !v.badge
  return v === null || v === undefined || String(v).trim() === ''
}

/* ===== Thẻ cho điện thoại ===== */
function Cards({ rows, cols, primary }) {
  const head =
    cols.find(c => c.type === 'customer') ||
    cols.find(c => c.type === 'name') ||
    cols.find(c => c.type === 'tag') ||
    cols.find(c => c.type === 'text')
  const sub = cols.filter(c => ['id', 'datetime', 'date'].includes(c.type))
  const rest = cols.filter(c => c !== head && c !== primary && !sub.includes(c))
  return (
    <div className="so-pop__cards">
      {rows.map((r, i) => (
        <article className="so-pop__card" key={i}>
          <header>
            <div>
              {head && <Cell col={head} row={r} />}
              {sub.length > 0 && (
                <small className="so-dt__note">
                  {sub
                    .map(c =>
                      c.type === 'id'
                        ? `#${r[c.key]}`
                        : c.type === 'datetime'
                        ? moment(r[c.key]).format(
                            c.sameDay ? 'HH:mm' : 'DD-MM-YYYY HH:mm'
                          )
                        : formatCell(c.key, r[c.key])
                    )
                    .filter(Boolean)
                    .join(' · ')}
                </small>
              )}
            </div>
            {primary && (
              <div className="so-pop__card-val">
                <Cell col={primary} row={r} />
              </div>
            )}
          </header>
          <dl>
            {rest
              .filter(c => !isBlank(c, r))
              .map(c => (
                <div
                  key={c.key}
                  className={clsx(c.type === 'items' && 'is-items')}
                >
                  <dt>{c.label}</dt>
                  <dd>
                    <Cell col={c} row={r} />
                  </dd>
                </div>
              ))}
          </dl>
        </article>
      ))}
    </div>
  )
}

function DetailPopup({
  open,
  title,
  rows,
  loading,
  onClose,
  chart,
  summary,
  stats
}) {
  const closeRef = useRef(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('rows') // 'rows' | id cách gom
  const [full, setFull] = useState(false)
  const [sort, setSort] = useState({ key: null, dir: 'desc' })

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current && closeRef.current.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  // mở danh sách khác: về mặc định
  useEffect(() => {
    setQuery('')
    setMode('rows')
    setFull(false)
    setSort({ key: null, dir: 'desc' })
  }, [title, open])

  const list = useMemo(() => rows || [], [rows])
  const kind = listKind(list)
  const profile = PROFILES[kind] || PROFILES.other
  const isFull = profile.forceFull || full
  const table = useMemo(
    () => prepareTable(list, { ...profile.table, full: isFull }),
    [list, isFull, profile]
  )
  const compact = useMemo(
    () => (isFull ? prepareTable(list, profile.table) : table),
    [isFull, list, table, profile]
  )
  const index = useMemo(
    () => list.map(r => rowText(r, SEARCH_KEYS[kind])),
    [list, kind]
  )

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    let out = q ? list.filter((_, i) => index[i].includes(q)) : list
    const col = table.cols.find(c => c.key === sort.key)
    if (col) {
      const d = sort.dir === 'asc' ? 1 : -1
      out = [...out].sort((a, b) => {
        const x = sortValue(col, a)
        const y = sortValue(col, b)
        return (typeof x === 'string' ? x.localeCompare(y, 'vi') : x - y) * d
      })
    }
    return out
  }, [list, index, query, table, sort])

  const groups = useMemo(
    () => groupOptions(list, compact.cols),
    [list, compact]
  )
  const group = groups.find(g => g.id === mode)
  const money = compact.cols.filter(c => c.type === 'money')
  const noun = countNoun(compact.cols)

  if (!open) return null

  const onSort = key =>
    setSort(s =>
      s.key === key
        ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    )

  // dải số tổng (theo dòng đang lọc)
  const cust = compact.cols.find(c => c.type === 'customer')
  const custN = cust
    ? new Set(
        list.map(r => {
          const v = cust.get(r)
          return `${v.name}|${v.phone}`
        })
      ).size
    : 0
  // thứ tự: số dòng, các số tiền (theo thứ tự cột, luôn có Còn nợ), rồi số khách
  const kpis = profile.noKpis
    ? []
    : [{ label: noun, value: filtered.length, count: true }]
  const debt = money.find(c => c.key === 'Còn nợ')
  ;(profile.noKpis ? [] : money.filter(c => c !== debt).slice(0, 4))
    .concat(!profile.noKpis && debt ? [debt] : [])
    .forEach(c => {
      const v = sumBy(filtered, c)
      kpis.push({
        label: c.label,
        value: v,
        tone:
          c.key === 'Còn nợ' && v > 0 ? 'bad' : c.primary ? 'acc' : undefined
      })
    })
  if (cust && !profile.noKpis) {
    const people = new Map()
    filtered.forEach(r => {
      const v = cust.get(r)
      people.set(`${v.name}|${v.phone}`, v.walkIn)
    })
    if (noun !== 'Khách hàng' && people.size !== filtered.length)
      kpis.push({ label: 'Số khách', value: people.size, count: true })
    const w = [...people.values()].filter(Boolean).length
    if (w && !profile.noWalkIn)
      kpis.push({ label: 'Khách vãng lai', value: w, count: true })
  }
  // stats (từ nơi mở popup, vd. Tồn ngày) thay dải số tổng mặc định
  if (stats) kpis.splice(0, kpis.length, ...stats(list))

  const showSearch =
    !profile.noSearch &&
    list.length > (profile.searchMin ?? (profile.inlineSearch ? 1 : 6))
  const showFullBtn = !profile.noFull && !profile.forceFull && !group
  const searchBox = showSearch && (
    <label className="so-dt__search">
      <i className="fa-regular fa-magnifying-glass" aria-hidden="true"></i>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={profile.placeholder}
        aria-label="Tìm trong danh sách"
      />
    </label>
  )
  const showTools =
    list.length > 1 &&
    ((showSearch && !profile.inlineSearch) || groups.length > 0 || showFullBtn)

  return createPortal(
    <div
      className="so-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="so-pop-title"
    >
      <div className="so-pop__panel">
        <div className="so-pop__head">
          <div className="so-pop__titles">
            <h2 id="so-pop-title">{title}</h2>
            <div className="so-pop__meta">
              <span className="so-pop__count">{list.length} dòng</span>
              {profile.custCount && custN > 0 && (
                <span className="so-pop__count">· {custN} khách</span>
              )}
              {(summary || []).map(x => (
                <span
                  key={x.label}
                  className={clsx(
                    'so-pop__ctx so-pop__sum',
                    x.label === 'Tổng tất cả' && 'is-total'
                  )}
                >
                  <small>{x.label}</small>
                  {fmtMoney(x.value)}₫
                </span>
              ))}
              {(profile.noContext ? [] : compact.context).map(x => (
                <span key={x.label} className="so-pop__ctx">
                  {!x.value.startsWith(x.label) && <small>{x.label}</small>}
                  {x.value}
                </span>
              ))}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="so-pop__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <i className="fa-regular fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="so-pop__body">
          {loading ? (
            <div className="so-pop__msg">
              <span className="so-dt__spin" aria-hidden="true"></span>
              Đang tải…
            </div>
          ) : !list.length ? (
            <div className="so-pop__msg">
              <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
              Không có dữ liệu
            </div>
          ) : (
            <div className={clsx('so-pop__layout', chart && 'has-chart')}>
              <div className="so-pop__main">
                {(kpis.length > 0 || (profile.inlineSearch && searchBox)) && (
                  <div
                    className={clsx(
                      'so-dt__kpis',
                      profile.inlineSearch && 'has-search'
                    )}
                  >
                    {kpis.map(k => (
                      <div
                        key={k.label}
                        className={clsx('so-dt__kpi', k.tone && `is-${k.tone}`)}
                      >
                        <small>{k.label}</small>
                        <b>
                          {k.count
                            ? new Intl.NumberFormat('vi-VN').format(k.value)
                            : `${k.sign || ''}${fmtMoney(k.value)}`}
                          {!k.count && <sup>₫</sup>}
                        </b>
                      </div>
                    ))}
                    {profile.inlineSearch && searchBox}
                  </div>
                )}

                {showTools && (
                  <div className="so-dt__tools">
                    {!profile.inlineSearch && searchBox}
                    {groups.length > 0 && (
                      <div
                        className="so-dt__seg"
                        role="group"
                        aria-label="Gom theo"
                      >
                        <span className="so-dt__seg-label">Gom theo</span>
                        {[{ id: 'rows', label: 'Chi tiết' }, ...groups].map(
                          g => (
                            <button
                              key={g.id}
                              type="button"
                              aria-pressed={mode === g.id}
                              className={clsx(mode === g.id && 'is-on')}
                              onClick={() => setMode(g.id)}
                            >
                              {g.label}
                            </button>
                          )
                        )}
                      </div>
                    )}
                    {showFullBtn && (
                      <button
                        type="button"
                        className={clsx('so-dt__full', full && 'is-on')}
                        aria-pressed={full}
                        onClick={() => setFull(f => !f)}
                        title="Hiện tất cả cột như dữ liệu gốc"
                      >
                        <i
                          className="fa-regular fa-table-columns"
                          aria-hidden="true"
                        ></i>
                        {full ? 'Bảng gọn' : 'Đủ cột'}
                      </button>
                    )}
                  </div>
                )}

                {!filtered.length ? (
                  <div className="so-pop__msg">
                    Không tìm thấy dòng nào khớp “{query}”
                  </div>
                ) : group ? (
                  <GroupTable
                    groups={groupRows(
                      filtered,
                      group,
                      group.noMoney ? [] : money,
                      group.noMoney ? null : compact.primary
                    )}
                    opt={group}
                    money={group.noMoney ? [] : money}
                    primary={group.noMoney ? null : compact.primary}
                    noun={noun}
                    noShare={profile.noShare}
                  />
                ) : (
                  <>
                    <DetailTable
                      rows={filtered}
                      cols={table.cols}
                      full={isFull}
                      sort={sort}
                      onSort={onSort}
                    />
                    <Cards
                      rows={filtered}
                      cols={compact.cols}
                      primary={compact.primary}
                    />
                  </>
                )}
              </div>
              {/* cột phải: biểu đồ phân chia theo từng thành phần + tên và tỉ lệ */}
              {chart && <ShareChart rows={filtered} chart={chart} />}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default DetailPopup
