import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import reportsApi from 'src/api/reports.api'

/* So sánh giữa các cơ sở — theo popup "Báo cáo tổng quan theo cơ sở" của trang mẫu.
   API /api/v3/r23/hang-ngay/tien-vi-datlich-dichvu (reportsApi.getBaselineSales):
   body { StockID: [ids], DateStart: 'YYYY/MM/DD', DateEnd, Pi: 1, Ps: 100 }
   -> result.Items[]: { StockID, StockTitle, Cash, MM, MMbook, Os }.
   Lọc khoảng ngày (dd/MM/yyyy); mỗi ô: số + thanh tỉ lệ + % so với tổng; bấm tiêu đề cột để sắp xếp. */

const COLS = [
  { key: 'Cash', title: 'TM / CK / QT', color: '#2f8cf5' },
  { key: 'MM', title: 'Ví / Thẻ tiền', color: '#7a5af0' },
  { key: 'MMbook', title: 'Đặt lịch', color: '#0c8a65' },
  { key: 'Os', title: 'Dịch vụ', color: '#e9a53a' }
]

const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Math.abs(Number(n) || 0)))
const share = (v, total) => (total ? (v / total) * 100 : 0)
const pctText = p =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(p)}%`

export const sortStocks = (items, key, dir) =>
  [...(items || [])].sort((a, b) =>
    dir === 'asc'
      ? (Number(a[key]) || 0) - (Number(b[key]) || 0)
      : (Number(b[key]) || 0) - (Number(a[key]) || 0)
  )

// ô ngày + nút lịch: gõ tay dd/MM/yyyy hoặc bấm icon để mở calendar
const DateField = forwardRef(({ label, onClick, ...inputProps }, ref) => {
  const inputRef = useRef(null)
  const setRef = el => {
    inputRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }
  return (
    <div className="so-cmp__field">
      <input
        {...inputProps}
        ref={setRef}
        onClick={onClick}
        aria-label={label}
        autoComplete="off"
      />
      <button
        type="button"
        className="so-cmp__cal"
        aria-label={`Chọn ${label.toLowerCase()} trên lịch`}
        title="Chọn trên lịch"
        onClick={e => {
          inputRef.current && inputRef.current.focus()
          onClick && onClick(e)
        }}
      >
        <i className="fa-regular fa-calendar-days" aria-hidden="true"></i>
      </button>
    </div>
  )
})

// ô chọn ngày dd/MM/yyyy (lịch mở ra ngoài popup để không bị che)
const DateInput = ({ value, onChange, minDate, maxDate, label }) => (
  <DatePicker
    selected={value}
    onChange={d => d && onChange(d)}
    dateFormat="dd/MM/yyyy"
    minDate={minDate}
    maxDate={maxDate}
    className="so-cmp__date"
    portalId="so-datepicker-portal"
    placeholderText={label}
    title={label}
    customInput={<DateField label={label} />}
  />
)

export function CompareStocksPopup({ open, onClose, date, stockIds }) {
  const [range, setRange] = useState({ from: date, to: date })
  const [draft, setDraft] = useState(range)
  const [st, setSt] = useState({ loading: false, items: [], error: '' })
  const [sort, setSort] = useState({ key: 'Cash', dir: 'desc' })
  const closeRef = useRef(null)

  // mở lại: lấy ngày đang xem của trang
  useEffect(() => {
    if (!open) return
    const r = { from: date, to: date }
    setRange(r)
    setDraft(r)
  }, [open, date])

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

  useEffect(() => {
    if (!open || !stockIds?.length) return
    let alive = true
    setSt(s => ({ ...s, loading: true, error: '' }))
    reportsApi
      .getBaselineSales({
        StockID: stockIds,
        DateStart: moment(range.from).format('YYYY/MM/DD'),
        DateEnd: moment(range.to).format('YYYY/MM/DD'),
        Pi: 1,
        Ps: 100
      })
      .then(({ data }) => {
        if (!alive) return
        if (data?.isRight || data?.error) throw new Error(data.error)
        setSt({ loading: false, items: data?.result?.Items || [], error: '' })
      })
      .catch(() => {
        if (alive)
          setSt({ loading: false, items: [], error: 'Không tải được dữ liệu' })
      })
    return () => {
      alive = false
    }
  }, [open, range, stockIds])

  if (!open) return null

  const totals = COLS.reduce(
    (acc, c) => ({
      ...acc,
      [c.key]: st.items.reduce((a, x) => a + (Number(x[c.key]) || 0), 0)
    }),
    {}
  )
  const rows = sortStocks(st.items, sort.key, sort.dir)
  const toggleSort = key =>
    setSort(s => ({
      key,
      dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc'
    }))
  const rangeText = moment(range.from).isSame(range.to, 'day')
    ? moment(range.from).format('DD/MM/YYYY')
    : `${moment(range.from).format('DD/MM/YYYY')} – ${moment(range.to).format(
        'DD/MM/YYYY'
      )}`

  return createPortal(
    <div
      className="so-pop so-pop--center so-pop--wide so-cmp"
      role="dialog"
      aria-modal="true"
      aria-labelledby="so-cmp-title"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="so-pop__panel">
        <div className="so-pop__head so-cmp__head">
          <div className="so-cmp__title">
            <h2 id="so-cmp-title">So sánh giữa các cơ sở</h2>
            <p>
              {rows.length} cơ sở · {rangeText}
            </p>
          </div>
          <form
            className="so-cmp__filter"
            onSubmit={e => {
              e.preventDefault()
              setRange(draft)
            }}
          >
            <DateInput
              label="Từ ngày"
              value={draft.from}
              maxDate={draft.to}
              onChange={d => setDraft(r => ({ ...r, from: d }))}
            />
            <span aria-hidden="true">–</span>
            <DateInput
              label="Đến ngày"
              value={draft.to}
              minDate={draft.from}
              onChange={d => setDraft(r => ({ ...r, to: d }))}
            />
            <button type="submit" className="so-cmp__go" disabled={st.loading}>
              Lọc
            </button>
          </form>
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
          {st.loading ? (
            <div className="so-pop__msg">Đang tải…</div>
          ) : st.error ? (
            <div className="so-pop__msg">{st.error}</div>
          ) : !rows.length ? (
            <div className="so-pop__msg">Không có dữ liệu</div>
          ) : (
            <div className="so-cmp__wrap">
              <table className="so-cmp__table">
                <colgroup>
                  <col style={{ width: 44 }} />
                  <col />
                  {COLS.map(c => (
                    <col key={c.key} style={{ width: '17%' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cơ sở</th>
                    {COLS.map(c => (
                      <th
                        key={c.key}
                        className="num"
                        aria-sort={
                          sort.key === c.key
                            ? sort.dir === 'desc'
                              ? 'descending'
                              : 'ascending'
                            : 'none'
                        }
                      >
                        <button
                          type="button"
                          className={clsx(
                            'so-cmp__sort',
                            sort.key === c.key && 'is-on'
                          )}
                          onClick={() => toggleSort(c.key)}
                        >
                          {c.title}
                          <i
                            className={clsx(
                              'fa-solid',
                              sort.key === c.key && sort.dir === 'asc'
                                ? 'fa-arrow-up'
                                : 'fa-arrow-down'
                            )}
                            aria-hidden="true"
                          ></i>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.StockID}>
                      <td>
                        <span
                          className={clsx('so-cmp__rank', i < 3 && `r${i + 1}`)}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="so-cmp__name" title={r.StockTitle}>
                        {r.StockTitle}
                      </td>
                      {COLS.map(c => {
                        const v = Number(r[c.key]) || 0
                        const p = share(v, totals[c.key])
                        return (
                          <td key={c.key} className="num">
                            <div className={clsx('so-cmp__val', !v && 'zero')}>
                              {fmt(v)}
                            </div>
                            <div className="so-cmp__share">
                              <span className="so-cmp__track">
                                <i
                                  style={{
                                    width: `${p}%`,
                                    background: c.color
                                  }}
                                ></i>
                              </span>
                              <em>{pctText(p)}</em>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td>Tổng</td>
                    {COLS.map(c => (
                      <td key={c.key} className="num">
                        {fmt(totals[c.key])}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* Nút mở popup (đặt bên phải menu dính) — chỉ hiện khi có quyền xem tất cả cơ sở */
export function CompareStocksButton({ date, stockIds }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button
        type="button"
        className="so-menu__action"
        onClick={() => setOpen(true)}
      >
        <i className="fa-regular fa-code-compare" aria-hidden="true"></i>
        So sánh giữa các cơ sở
      </button>
      <CompareStocksPopup
        open={open}
        onClose={close}
        date={date}
        stockIds={stockIds}
      />
    </>
  )
}
