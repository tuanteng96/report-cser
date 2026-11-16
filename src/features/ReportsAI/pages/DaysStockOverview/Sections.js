import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DetailPopup, { buildShare } from './DetailPopup'
import { enrichCustomers } from './popupTable'
import clsx from 'clsx'
import { Donut, HourChart, MiniWeekChart, WeekChart } from './Charts'

/* 5 phần nội dung theo bao-cao-tong-quan.html.
   Số 0 hiện màu nhạt để các số khác 0 nổi lên. */

const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Math.abs(Number(n) || 0)))
const pct = (v, total) =>
  total
    ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(
        (v / total) * 100
      )}%`
    : '0%'
const plus = n => `${n < 0 ? '-' : '+'}${fmt(n)}`

const groupOf = (state, title) =>
  (state?.groups || []).find(g => g.GroupTitle === title)
const keyOf = (group, key) => group?.Keys.find(k => k.Key === key)?.Value || 0

/* ===== Phần dùng chung ===== */
function Card({
  id,
  span,
  title,
  desc,
  chip,
  chipTone,
  aside, // nội dung riêng ở góc phải tiêu đề (thay cho chip)
  rowSpan, // 2 = cao bằng 2 hàng của lưới
  className,
  loading,
  children
}) {
  return (
    <section
      id={`so-sec-${id}`}
      className={clsx(
        'so-card',
        `so-span-${span}`,
        rowSpan === 2 && 'so-rowspan-2',
        className
      )}
      aria-labelledby={`so-sec-${id}-h`}
      aria-busy={!!loading}
    >
      <div className="so-card-h">
        <div>
          <h2 id={`so-sec-${id}-h`}>{title}</h2>
          {desc &&
            (typeof desc === 'string' ? (
              <p>{desc}</p>
            ) : (
              <div className="so-card-desc">{desc}</div>
            ))}
        </div>
        {!loading && aside}
        {chip && !loading && !aside && (
          <span className={clsx('so-chip', chipTone && `so-chip--${chipTone}`)}>
            {chip}
          </span>
        )}
      </div>
      {loading ? (
        <div className="so-skel" aria-hidden="true">
          <div className="so-skel__line w-40"></div>
          <div className="so-skel__line"></div>
          <div className="so-skel__line w-80"></div>
          <div className="so-skel__line w-60"></div>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

const Num = ({ v, abs = true, style }) => (
  <b className={clsx(!Number(v) && 'zero')} style={Number(v) ? style : null}>
    {abs ? fmt(v) : v}
  </b>
)

const Dot = ({ color }) => (
  <i className="so-dot" style={{ background: color }} aria-hidden="true"></i>
)

function Rows({ items, style }) {
  return (
    <ul className="so-rows" style={style}>
      {items.map(it => (
        <li key={it.label}>
          <span>
            {it.color && <Dot color={it.color} />}
            {it.label}
          </span>
          <Num v={it.value} style={it.valueStyle} />
        </li>
      ))}
    </ul>
  )
}

/* Thanh ngang xếp chồng: chỉ vẽ phần > 0 */
function StackBar({ items, label }) {
  const total = items.reduce((a, x) => a + Math.abs(x.value), 0)
  return (
    <div className="so-bar" role="img" aria-label={label}>
      {total > 0 &&
        items
          .filter(x => x.value)
          .map(x => (
            <i
              key={x.label}
              style={{
                width: `${(Math.abs(x.value) / total) * 100}%`,
                background: x.color
              }}
            ></i>
          ))}
    </div>
  )
}

/* Khối thanh toán: tiêu đề + tổng, thanh tỉ lệ, chú thích từng phương thức (%), dòng thêm */
function PayBlock({ title, total, tone, items, rows }) {
  const sum = items.reduce((a, x) => a + x.value, 0)
  return (
    <div className="so-pay">
      <div className="so-pay__h">
        <h3>{title}</h3>
        {/* total không truyền = không hiện số bên phải */}
        {total !== undefined && (
          <span className={clsx('so-chip', tone && `so-chip--${tone}`)}>
            {plus(total)}
          </span>
        )}
      </div>
      <StackBar
        items={items}
        label={`${title}: ${items
          .map(x => `${x.label} ${pct(x.value, sum)}`)
          .join(', ')}`}
      />
      <div className="so-legend">
        {items.map(x => (
          <div key={x.label}>
            <span>
              <Dot color={x.color} />
              {x.label}
              <em>{pct(x.value, sum)}</em>
            </span>
            <Num v={x.value} style={x.valueStyle} />
          </div>
        ))}
      </div>
      {rows && <Rows style={{ marginTop: 8 }} items={rows} />}
    </div>
  )
}

/* Popup danh sách: show(title, rows) có sẵn dữ liệu; load(title, promise) gọi API khi bấm */
function useListPopup() {
  const [st, setSt] = useState({
    open: false,
    title: '',
    rows: [],
    loading: false
  })
  const close = useCallback(() => setSt(s => ({ ...s, open: false })), [])
  // extra: { summary } -> các số tổng ghi dưới tiêu đề popup
  const show = (title, rows, loading = false, extra) =>
    setSt({ open: true, title, rows: rows || [], loading, ...extra })
  // chart: { labelKey, valueKey, totalLabel } -> popup có thêm cột biểu đồ phân chia
  // extra: { stats: rows => [ô số] } -> thay dải số tổng mặc định
  const load = (title, promise, chart, extra) => {
    setSt({ open: true, title, rows: [], loading: true, chart, ...extra })
    promise
      .then(rows =>
        setSt(s =>
          s.open && s.title === title ? { ...s, rows, loading: false } : s
        )
      )
      .catch(() =>
        setSt(s => (s.title === title ? { ...s, rows: [], loading: false } : s))
      )
  }
  const popup = (
    <DetailPopup
      open={st.open}
      title={st.title}
      rows={st.rows}
      loading={st.loading}
      chart={st.chart}
      summary={st.summary}
      stats={st.stats}
      onClose={close}
    />
  )
  return { show, load, popup }
}

/* Ô số liệu bấm được ở góc phải tiêu đề khối */
function StatButtons({ items, onClick }) {
  return (
    <div className="so-chips">
      {items.map(x => (
        <button
          key={x.label}
          type="button"
          className={clsx('so-stat-btn', x.tone && `so-stat-btn--${x.tone}`)}
          onClick={() => onClick(x)}
          title={x.hint}
        >
          <small>{x.label}</small>
          <b>
            {fmt(x.value)}
            {x.unit !== 'count' && '₫'}
          </b>
        </button>
      ))}
    </div>
  )
}

/* Biểu đồ tròn bên trái, bên phải là từng phần (bấm để xem chi tiết) */
// inline: mỗi phần 1 dòng "Tên --- Số lượng (%)"
function DonutLegend({ items, total, label, onPick, onPickAll, inline }) {
  return (
    <div className={clsx('so-mix', inline && 'so-mix--inline')}>
      {/* bấm vào biểu đồ (tổng) để xem tất cả */}
      <button
        type="button"
        className="so-mix__all"
        onClick={onPickAll}
        aria-label={`Xem tất cả chi tiết — ${label}`}
        title="Xem tất cả"
      >
        <Donut items={items} total={total} label={label} />
      </button>
      <ul className="so-mix__legend">
        {items.map(x => (
          <li key={x.label}>
            <button
              type="button"
              onClick={() => onPick(x)}
              title={`Xem chi tiết ${x.label}`}
            >
              <span className="so-mix__name">
                <Dot color={x.color} />
                {x.label}
              </span>
              <span className="so-mix__val">
                {/* inline: chỉ hiện % (số lượng đã có ở bảng bên cạnh) */}
                {!inline && <Num v={x.value} />}
                <em>{pct(x.value, total)}</em>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Popup chi tiết bán hàng: biểu đồ chia theo tên sản phẩm/dịch vụ, giá trị = tổng giá bán */
const SHARE_CHART = {
  labelKey: 'Tên',
  valueKey: 'Tổng Giá bán',
  totalLabel: 'Tổng giá bán'
}

/* ===== Doanh số bán hàng ===== */
export function SalesSection({ state, orders, debts, fetchList }) {
  const list = useListPopup()
  const og = groupOf(state, 'Đơn hàng mới')
  const detail = groupOf(state, 'Chi tiết bán hàng')

  const pay = [
    {
      label: 'TM / CK / QT',
      value: Math.abs(keyOf(og, 'Thanh toán TM/CK/QT')),
      color: 'var(--s1)'
    },
    {
      label: 'Ví',
      value: Math.abs(keyOf(og, 'Thanh toán Ví')),
      color: 'var(--s3)'
    },
    {
      label: 'Thẻ tiền',
      value: Math.abs(keyOf(og, 'Thanh toán thẻ tiền')),
      color: 'var(--pos)'
    },
    {
      label: 'Còn nợ lại',
      value: Math.abs(keyOf(og, 'Còn nợ lại')),
      color: 'var(--warn-bar)',
      valueStyle: { color: 'var(--warn)' }
    }
  ]
  const MIX_COLORS = ['var(--s1)', 'var(--s3)', 'var(--pos)', 'var(--s2)']
  const mix = [...(detail?.Keys || [])]
    .map(k => ({ label: k.Key, value: Math.abs(k.Value) }))
    .sort((a, b) => b.value - a.value)
    .map((x, i) => ({ ...x, color: MIX_COLORS[i % MIX_COLORS.length] }))
  const mixTotal = mix.reduce((a, x) => a + x.value, 0)
  const showOrders = () =>
    list.show('Đơn hàng mới', orders?.rows, orders?.loading)
  const [hourOpen, setHourOpen] = useState(false)
  const closeHour = useCallback(() => setHourOpen(false), [])

  return (
    <Card
      id="ban-hang"
      span={8}
      title="Doanh số bán hàng mới"
      desc="Giá trị đơn hàng mới, mức giảm giá và phương thức thanh toán"
      className="so-card--sales"
      // 3 ô: Nguyên giá - Giảm giá - Doanh số; bấm để xem danh sách đơn hàng mới
      aside={
        <StatButtons
          items={[
            { label: 'Nguyên giá', value: keyOf(og, 'Nguyên giá') },
            { label: 'Giảm giá', value: keyOf(og, 'Giảm giá'), tone: 'neg' },
            { label: 'Doanh số', value: og?.GroupValue, tone: 'acc' }
          ].map(x => ({ ...x, hint: 'Xem danh sách đơn hàng mới' }))}
          onClick={showOrders}
        />
      }
      loading={state?.loading}
    >
      {list.popup}
      <HourPopup open={hourOpen} orders={orders} onClose={closeHour} />
      <div className="so-two">
        <div>
          <PayBlock title="Phương thức thanh toán" items={pay} />
        </div>
        <div>
          <h3>Cơ cấu doanh số</h3>
          {/* biểu đồ tròn bên trái, 3 phần bên phải; bấm từng phần để xem chi tiết */}
          <DonutLegend
            items={mix}
            total={mixTotal}
            label="Tổng doanh số"
            onPick={x =>
              fetchList &&
              list.load(
                x.label,
                fetchList('ban-hang', 'Chi tiết bán hàng', x.label),
                SHARE_CHART
              )
            }
            // giống trang mẫu: bấm cả nhóm -> danh sách toàn bộ (không lọc theo phần)
            onPickAll={() =>
              fetchList &&
              list.load(
                'Chi tiết bán hàng',
                fetchList('ban-hang', 'Chi tiết bán hàng'),
                SHARE_CHART
              )
            }
          />
        </div>
      </div>

      {/* Thu nợ: ở cuối khối, cùng kiểu với phần đầu "Doanh số bán hàng mới" */}
      <hr className="so-hr-lg" />
      <DebtBlock state={state} debts={debts} list={list} />
      {/* ghi chú dưới Thu nợ + nút mở biểu đồ theo khung thời gian */}
      <div className="so-guide">
        <ul>
          <li>
            <i className="fa-regular fa-hand-pointer" aria-hidden="true"></i>
            Bấm vào <b>Doanh số</b> ở trên để xem danh sách đơn hàng
          </li>
          <li>
            <i className="fa-regular fa-hand-pointer" aria-hidden="true"></i>
            Bấm vào <b>từng thành phần</b> trong cơ cấu doanh số để xem chi tiết
            sản phẩm, dịch vụ bán ra
          </li>
        </ul>
        <button
          type="button"
          className="so-btn-soft"
          onClick={() => setHourOpen(true)}
        >
          <i className="fa-regular fa-chart-column" aria-hidden="true"></i>
          Xem doanh số theo khung giờ
        </button>
      </div>
    </Card>
  )
}

/* Thu nợ: tiêu đề + ô TM/CK/QT · Ví · Thẻ tiền · Tổng (chỉ 1 phương thức có tiền -> chỉ ô Tổng) */
function DebtBlock({ state, debts, list }) {
  const debt = groupOf(state, 'Thu nợ')
  const rows = debts?.rows || []
  // Thu nợ theo phương thức (khóa có dấu * trong API)
  const methods = [
    { label: 'TM/CK/QT', value: Math.abs(keyOf(debt, 'Thanh toán TM/CK/QT*')) },
    { label: 'Ví', value: Math.abs(keyOf(debt, 'Thanh toán Ví*')) },
    { label: 'Thẻ tiền', value: Math.abs(keyOf(debt, 'Thanh toán thẻ tiền*')) }
  ]
  const total = { label: 'Tổng', value: debt?.GroupValue, tone: 'pos' }
  const used = methods.filter(m => m.value)
  const boxes = used.length > 1 ? [...methods, total] : [total]
  // dưới tiêu đề popup: thu nợ từng phương thức (> 0), Tổng tất cả khi có từ 2 phương thức
  const summary = [
    ...used.map(m => ({ label: `Thu nợ ${m.label}`, value: m.value })),
    ...(used.length > 1
      ? [{ label: 'Tổng tất cả', value: Math.abs(debt?.GroupValue || 0) }]
      : [])
  ]
  return (
    <div className="so-debt" id="so-debt">
      <div>
        <div className="so-debt__title">Thu nợ</div>
        <p className="so-debt__desc">Khoản nợ cũ khách thanh toán trong ngày</p>
      </div>
      <StatButtons
        items={boxes.map(x => ({ ...x, hint: 'Xem danh sách thu nợ' }))}
        onClick={() => list.show('Thu nợ', rows, debts?.loading, { summary })}
      />
    </div>
  )
}

/* ===== Theo khung giờ — khối riêng ===== */
function HourTabs({ mode, setMode }) {
  return (
    <div className="so-tabs" role="group" aria-label="Chỉ số của biểu đồ">
      <button
        type="button"
        aria-pressed={mode === 'rev'}
        onClick={() => setMode('rev')}
      >
        Doanh thu
      </button>
      <button
        type="button"
        aria-pressed={mode === 'ord'}
        onClick={() => setMode('ord')}
      >
        Số đơn
      </button>
    </div>
  )
}

export function HourSection({ orders }) {
  const [mode, setMode] = useState('rev')
  return (
    <Card
      id="khung-gio"
      span={12}
      title="Theo khung giờ"
      desc="Doanh thu và số đơn hàng mới theo từng khung 2 giờ"
      aside={<HourTabs mode={mode} setMode={setMode} />}
      loading={orders?.loading}
    >
      <HourBody orders={orders} mode={mode} />
    </Card>
  )
}

/* Popup "Theo khung giờ" mở từ khối Doanh số bán hàng mới */
function HourPopup({ open, orders, onClose }) {
  const [mode, setMode] = useState('rev')
  const closeRef = useRef(null)
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
  if (!open) return null
  return createPortal(
    <div
      className="so-pop so-pop--center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="so-hour-title"
      // bấm ra ngoài khung để đóng
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="so-pop__panel">
        <div className="so-pop__head">
          <h2 id="so-hour-title">Theo khung giờ</h2>
          <HourTabs mode={mode} setMode={setMode} />
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
          {/* bọc .so-view để dùng màu / kiểu chữ của biểu đồ */}
          <div className="so-view">
            <HourBody orders={orders} mode={mode} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function HourBody({ orders, mode }) {
  const slots = orders?.slots || []
  const nOrders = slots.reduce((a, s) => a + s.orders, 0)
  const nRev = slots.reduce((a, s) => a + s.revenue, 0)
  const busy = slots.filter(s => s.orders > 0)
  const top = [...busy].sort(
    (a, b) => b.orders - a.orders || b.revenue - a.revenue
  )[0]
  return (
    <>
      {orders?.loading ? (
        <div className="so-skel" aria-hidden="true">
          <div className="so-skel__chart"></div>
        </div>
      ) : (
        <>
          <div className="so-scroll">
            <HourChart slots={slots} mode={mode} />
          </div>
          <p className="so-note">
            {!nOrders ? (
              'Chưa có đơn hàng mới trong ngày.'
            ) : busy.length === 1 ? (
              <>
                Cả <b>{nOrders} đơn</b> trong ngày phát sinh ở khung{' '}
                <b>{top.label}h</b>, doanh thu <b>{fmt(nRev)}</b>.
              </>
            ) : (
              <>
                <b>{nOrders} đơn</b> trong ngày, doanh thu <b>{fmt(nRev)}</b>.
                Nhiều nhất ở khung <b>{top.label}h</b> với{' '}
                <b>{top.orders} đơn</b>.
              </>
            )}
          </p>
        </>
      )}
    </>
  )
}

/* ===== Thu chi ===== */
const ALWAYS_ROWS = ['Thu', 'Thu nạp ví', 'Thu bán hàng', 'Chi', 'Chi trả ví']
const flowRows = g =>
  (g?.Keys || [])
    .filter(k => ALWAYS_ROWS.includes(k.Key) || k.Value)
    .map(k => ({ label: k.Key, value: k.Value }))

export function IncomeSection({ state, fetchList }) {
  const list = useListPopup()
  const tin = groupOf(state, 'Tổng Thu')
  const tout = groupOf(state, 'Tổng Chi')
  const net = groupOf(state, 'Tồn ngày')
  // bấm tổng -> cả nhóm; bấm dòng -> theo dòng đó (giống trang mẫu)
  const open = (GroupTitle, Key) =>
    fetchList &&
    list.load(Key || GroupTitle, fetchList('thu-chi', GroupTitle, Key))
  const rowsOf = (g, title) =>
    flowRows(g).map(x => ({ ...x, key: x.label, group: title }))
  const inV = Math.abs(tin?.GroupValue || 0)
  const outV = Math.abs(tout?.GroupValue || 0)
  // Tồn ngày: API không có danh sách riêng -> gộp danh sách Tổng Thu + Tổng Chi,
  // thêm cột "Loại phiếu"; đầu popup: số phiếu, tổng thu, tổng chi, tồn ngày
  const openNet = () => {
    if (!fetchList) return
    const tag = (p, loai) =>
      p.then(rows => (rows || []).map(r => ({ 'Loại phiếu': loai, ...r })))
    const netV = Number(net?.GroupValue) || 0
    list.load(
      'Tồn ngày',
      Promise.all([
        tag(fetchList('thu-chi', 'Tổng Thu'), 'Thu'),
        tag(fetchList('thu-chi', 'Tổng Chi'), 'Chi')
      ]).then(([a, b]) => [...a, ...b]),
      undefined,
      {
        stats: rows => {
          const n = loai => rows.filter(r => r['Loại phiếu'] === loai).length
          return [
            { label: 'Tổng phiếu thu chi', value: rows.length, count: true },
            { label: 'Phiếu thu', value: n('Thu'), count: true },
            { label: 'Phiếu chi', value: n('Chi'), count: true },
            { label: 'Tổng thu', value: inV, tone: 'pos' },
            { label: 'Tổng chi', value: outV, tone: 'bad' },
            {
              label: 'Tồn ngày',
              value: netV,
              sign: netV < 0 ? '−' : '',
              tone: 'acc'
            }
          ]
        }
      }
    )
  }
  // một cột Thu / Chi: tổng có màu (bấm -> cả nhóm) + từng dòng (bấm -> dòng đó)
  const Side = ({ title, group, value, sign, tone }) => (
    <div className={clsx('so-io', `so-io--${tone}`)}>
      <button
        type="button"
        className="so-io__head so-click"
        onClick={() => open(group)}
      >
        <span>{title}</span>
        <b>
          {sign}
          {fmt(value)}
        </b>
      </button>
      <ClickRows
        items={rowsOf(groupOf(state, group), group)}
        onPick={it => open(it.group, it.key)}
      />
    </div>
  )
  return (
    <Card
      id="thu-chi"
      span={8}
      title="Thu chi"
      desc="Dòng tiền trong ngày"
      // Tồn ngày ở góc phải tiêu đề (bấm -> danh sách)
      aside={
        <StatButtons
          items={[
            {
              label: 'Tồn ngày',
              value: net?.GroupValue,
              tone: 'acc',
              hint: 'Xem chi tiết tồn ngày'
            }
          ]}
          onClick={openNet}
        />
      }
      loading={state?.loading}
    >
      {list.popup}
      <div className="so-two">
        <Side
          title="Tổng thu"
          group="Tổng Thu"
          value={inV}
          sign="+"
          tone="in"
        />
        <Side
          title="Tổng chi"
          group="Tổng Chi"
          value={outV}
          sign=""
          tone="out"
        />
      </div>
    </Card>
  )
}

/* ===== Khách hàng ===== */
const CUSTOMER_KEYS = {
  'Khách tạo từ phần mềm': { label: 'Tạo từ phần mềm', color: 'var(--s1)' },
  'Khách đăng ký từ web / app': {
    label: 'Đăng ký từ web / app',
    color: 'var(--s2)'
  },
  'Khách mới tải app': { label: 'Khách mới tải app', color: 'var(--s3)' },
  'Khách cũ tải app': { label: 'Khách cũ tải app', color: 'var(--s4)' },
  'Khách chỉ làm dịch vụ': { label: 'Làm dịch vụ' },
  'Khách chỉ phát sinh mua': { label: 'Phát sinh mua' },
  'Khách phát sinh mua & làm dịch vụ': { label: 'Mua & làm DV' }
}

/* Khách hàng (số liệu trong ngày) — cột phải, cao 2 hàng, cạnh Doanh số bán hàng */
// nhóm hiển thị các dòng con trên 1 dòng (cho gọn chiều cao)
const INLINE_GROUPS = ['Khách tạo mới', 'Khách tải App', 'Khách có giao dịch']

export function CustomerSection({ state, week, fetchList }) {
  const list = useListPopup()
  const days = week?.days || []
  // danh sách tra cứu (tải app, loại giao dịch) — tải 1 lần cho mỗi lần dữ liệu trang đổi
  const lookup = useRef({ state: null, p: null })
  const getLookup = () => {
    if (lookup.current.state !== state || !lookup.current.p) {
      const ids = p =>
        p
          .then(rows => new Set((rows || []).map(r => r['ID khách'])))
          .catch(() => null)
      const TX = 'Khách có giao dịch'
      lookup.current = {
        state,
        p: Promise.all([
          ids(fetchList('khach-hang', 'Khách tải App')),
          ids(fetchList('khach-hang', TX, 'Khách chỉ phát sinh mua')),
          ids(fetchList('khach-hang', TX, 'Khách chỉ làm dịch vụ')),
          ids(fetchList('khach-hang', TX, 'Khách phát sinh mua & làm dịch vụ'))
        ]).then(([app, buy, svc, both]) => ({
          app,
          tx: buy && svc && both ? { buy, svc, both } : null
        }))
      }
    }
    return lookup.current.p
  }
  // giống trang mẫu: bấm nhóm -> danh sách cả nhóm; bấm dòng -> danh sách theo dòng đó
  // + thêm cột Cài app, Giao dịch cho từng khách
  const open = (GroupTitle, Key) =>
    fetchList &&
    list.load(
      Key || GroupTitle,
      Promise.all([fetchList('khach-hang', GroupTitle, Key), getLookup()]).then(
        ([rows, lk]) => enrichCustomers(rows, lk)
      )
    )
  return (
    <Card
      id="khach-hang"
      span={4}
      title="Khách hàng"
      // chú thích 4 trạng thái của biểu đồ, đặt ở dòng mô tả dưới tiêu đề
      desc={
        days.length > 0 ? (
          <div className="so-key so-key--sm">
            <span>
              <Dot color="var(--s1)" />
              Tạo mới
            </span>
            <span>
              <Dot color="var(--s2)" />
              Web / app
            </span>
            <span>
              <Dot color="var(--s3)" />
              Mới tải app
            </span>
            <span>
              <Dot color="var(--s4)" />
              Cũ tải app
            </span>
          </div>
        ) : (
          'Khách trong ngày'
        )
      }
      loading={state?.loading}
    >
      {list.popup}
      {/* biểu đồ 7 ngày (thanh mỏng) giữa tiêu đề và nội dung */}
      {days.length > 0 && (
        <div className="so-cust-chart">
          <MiniWeekChart days={days} />
        </div>
      )}
      {(state?.groups || []).map(g => (
        <div className="so-stat" key={g.GroupTitle}>
          <button
            type="button"
            className={clsx('so-stat__num so-click', !g.GroupValue && 'zero')}
            onClick={() => open(g.GroupTitle)}
            aria-label={`Xem danh sách ${g.GroupTitle}`}
          >
            {fmt(g.GroupValue)}
          </button>
          <div>
            <button
              type="button"
              className="so-stat__title so-click"
              onClick={() => open(g.GroupTitle)}
            >
              {g.GroupTitle}
            </button>
            <ul
              className={clsx(
                'so-rows',
                INLINE_GROUPS.includes(g.GroupTitle) && 'so-rows--inline'
              )}
            >
              {g.Keys.map(k => (
                <li key={k.Key}>
                  <button
                    type="button"
                    className="so-row-btn so-click"
                    onClick={() => open(g.GroupTitle, k.Key)}
                  >
                    <span>
                      {CUSTOMER_KEYS[k.Key]?.color && (
                        <Dot color={CUSTOMER_KEYS[k.Key].color} />
                      )}
                      {CUSTOMER_KEYS[k.Key]?.label || k.Key}
                    </span>
                    <Num v={k.Value} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </Card>
  )
}

/* Xu hướng khách hàng 7 ngày — khối riêng, cạnh Thu chi */
export function CustomerTrendSection({ state, week }) {
  const created = groupOf(state, 'Khách tạo mới')
  const days = week?.days || []
  const best = days.reduce(
    (m, d) => {
      const n = d.a[0] + d.a[1] + d.b[0] + d.b[1]
      return n > m.n ? { n, d } : m
    },
    { n: 0, d: null }
  )
  return (
    <Card
      id="khach-7-ngay"
      span={8}
      title="Khách hàng 7 ngày"
      desc="Khách tạo mới và khách tải app theo từng ngày trong tuần"
      chip={`+${fmt(created?.GroupValue)} khách mới`}
      loading={week?.loading}
    >
      <div>
        <div>
          <div className="so-key">
            <span>
              <Dot color="var(--s1)" />
              Tạo từ phần mềm
            </span>
            <span>
              <Dot color="var(--s2)" />
              Đăng ký web / app
            </span>
            <span>
              <Dot color="var(--s3)" />
              Mới tải app
            </span>
            <span>
              <Dot color="var(--s4)" />
              Cũ tải app
            </span>
          </div>
          {week?.loading ? (
            <div className="so-skel" aria-hidden="true">
              <div className="so-skel__chart"></div>
            </div>
          ) : !days.length ? (
            <p className="so-note">Không tải được biểu đồ 7 ngày.</p>
          ) : (
            <>
              <div className="so-scroll">
                <WeekChart days={days} />
              </div>
              <p className="so-note">
                Mỗi ngày có hai cột: bên trái là <b>khách tạo mới</b>, bên phải
                là <b>khách tải app</b>.{' '}
                {best.d ? (
                  <>
                    Ngày cao nhất là {best.d.dow} {best.d.short} với{' '}
                    <b>{best.n} khách</b>.
                  </>
                ) : (
                  'Chưa có khách mới hoặc tải app trong tuần.'
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ===== Dịch vụ ===== */
const BOOK_COLORS = {
  'Đã xác nhận': 'var(--s1)',
  'Đã xác nhận(Tự động)': 'var(--s1-soft)',
  'Khách có đến': 'var(--pos)',
  'Khách không đến': 'var(--warn-bar)',
  'Khách hủy lịch': 'var(--neg)',
  'Chưa xác nhận': 'var(--s4)',
  'Đang thực hiện': 'var(--s1)',
  'Đã xong': 'var(--pos)'
}
const niceKey = s =>
  String(s)
    .replace(/(\S)\(/, '$1 (')
    .replace('(Tự động)', '(tự động)')

/* Dòng số liệu bấm được (mở popup) */
function ClickRows({ items, onPick }) {
  return (
    <ul className="so-rows">
      {items.map(it => (
        <li key={it.label}>
          <button
            type="button"
            className="so-row-btn so-click"
            onClick={() => onPick(it)}
          >
            <span>
              {it.color && <Dot color={it.color} />}
              {it.label}
            </span>
            <Num v={it.value} />
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ===== Đặt lịch — giao diện như Thu chi; bấm tổng / từng dòng -> popup ===== */
export function BookingSection({ state, fetchList }) {
  const list = useListPopup()
  const book = groupOf(state, 'Đặt lịch')
  // "Đã xác nhận(Tự động)" hiển thị là "Đặt lịch dự kiến", màu xanh lá
  const BOOK_LABELS = { 'Đã xác nhận(Tự động)': 'Đặt lịch dự kiến' }
  const toItem = k => ({
    key: k.Key,
    label: BOOK_LABELS[k.Key] || niceKey(k.Key),
    value: k.Value,
    color: k.Key === 'Đã xác nhận(Tự động)' ? 'var(--pos)' : BOOK_COLORS[k.Key]
  })
  const MISS_KEYS = ['Khách không đến', 'Khách hủy lịch']
  const keys = book?.Keys || []
  // giữa: các trạng thái còn lại (xác nhận, chưa xác nhận); dưới: không đến / hủy lịch
  const middle = keys
    .filter(k => k.Key !== 'Khách có đến' && !MISS_KEYS.includes(k.Key))
    .map(toItem)
  const missItems = keys.filter(k => MISS_KEYS.includes(k.Key)).map(toItem)
  const came = keyOf(book, 'Khách có đến')
  const miss = keyOf(book, 'Khách không đến') + keyOf(book, 'Khách hủy lịch')
  // Tỉ lệ không đến = (hủy + không đến) / (đã xác nhận + có đến + không đến + hủy)
  // — không tính "Đặt lịch dự kiến" (đã xác nhận tự động) vào mẫu số
  const base = keyOf(book, 'Đã xác nhận') + came + miss
  const missRate = base ? (miss / base) * 100 : 0
  const open = Key =>
    fetchList &&
    list.load(
      Key ? niceKey(Key) : 'Đặt lịch',
      fetchList('dich-vu', 'Đặt lịch', Key)
    )
  return (
    <Card
      id="dat-lich"
      span={4}
      title="Đặt lịch"
      desc="Lịch hẹn trong ngày theo trạng thái"
      // Tổng đặt lịch ở bên phải tiêu đề (bấm -> danh sách)
      aside={
        <StatButtons
          items={[
            {
              label: 'Tổng đặt lịch',
              value: book?.GroupValue,
              unit: 'count',
              tone: 'acc',
              hint: 'Xem danh sách đặt lịch'
            }
          ]}
          onClick={() => open()}
        />
      }
      loading={state?.loading}
    >
      {list.popup}
      {/* 2. Khách có đến: thanh xanh 1 dòng */}
      <button
        type="button"
        className="so-came so-click"
        onClick={() => open('Khách có đến')}
      >
        <span>Khách có đến</span>
        <b>{fmt(came)}</b>
      </button>
      <div className="so-flow">
        {/* 3. Tỉ lệ không đến + khách không đến / hủy lịch */}
        <div className="so-miss">
          <div className="so-miss__rate">
            <span>Tỉ lệ không đến</span>
            <b>
              {new Intl.NumberFormat('vi-VN', {
                maximumFractionDigits: 1
              }).format(missRate)}
              %
            </b>
          </div>
          <div
            className="so-miss__bar"
            role="img"
            aria-label={`Tỉ lệ không đến ${missRate.toFixed(1)}%`}
          >
            <i style={{ width: `${Math.min(missRate, 100)}%` }}></i>
          </div>
          <ClickRows items={missItems} onPick={it => open(it.key)} />
        </div>
        {/* 4. Dưới cùng: đã xác nhận, đặt lịch dự kiến, chưa xác nhận */}
        <div className="so-confirm">
          <ClickRows items={middle} onPick={it => open(it.key)} />
        </div>
      </div>
    </Card>
  )
}

/* ===== Dịch vụ — buổi dịch vụ, có tổng (popup) và biểu đồ theo từng dịch vụ ===== */
const SERVICE_SHARE = { labelKey: 'Dịch vụ gốc', valueKey: null }

/* Popup biểu đồ dịch vụ (như trang mẫu): 4 nhóm × (doanh số | số buổi) */
const SVC_GROUPS = [
  { name: 'Nhom', title: 'Theo nhóm khách hàng', empty: 'Chưa có nhóm' },
  { name: 'Gioi_Tinh', title: 'Theo giới tính', empty: 'Chưa chọn giới tính' },
  { name: 'Cu_moi', title: 'Theo khách cũ / mới', empty: 'Chưa xác định' },
  {
    name: 'Thanh_toan',
    title: 'Theo phương thức thanh toán',
    empty: 'Chưa thanh toán'
  }
]
const SVC_COLORS = [
  '#2f8cf5',
  '#7a5af0',
  '#0c8a65',
  '#e9a53a',
  '#ec5d63',
  '#14b8a6'
]

function MiniDonut({ title, data, field, empty }) {
  const items = (data || [])
    .map((x, i) => ({
      label: x?.Name || empty,
      value: Math.abs(Number(x?.[field]) || 0),
      color: SVC_COLORS[i % SVC_COLORS.length]
    }))
    .filter(x => x.value > 0)
  const total = items.reduce((a, x) => a + x.value, 0)
  return (
    <div className="so-svc-chart">
      <h4>{title}</h4>
      {!total ? (
        <p className="so-note">Không có dữ liệu</p>
      ) : (
        <>
          <div className="so-svc-chart__donut">
            <Donut
              items={items}
              total={total}
              label={field === 'Value' ? 'Doanh số' : 'Số buổi'}
            />
          </div>
          <ul className="so-svc-chart__legend">
            {items.map(x => (
              <li key={x.label}>
                <i style={{ background: x.color }} aria-hidden="true"></i>
                <span title={x.label}>{x.label}</span>
                <b>{pct(x.value, total)}</b>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function ServiceChartsPopup({ open, onClose, fetchServiceGroups }) {
  const [st, setSt] = useState({ loading: false, data: null, error: '' })
  const closeRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current && closeRef.current.focus()
    let alive = true
    if (fetchServiceGroups) {
      setSt({ loading: true, data: null, error: '' })
      fetchServiceGroups()
        .then(data => alive && setSt({ loading: false, data, error: '' }))
        .catch(
          () =>
            alive &&
            setSt({
              loading: false,
              data: null,
              error: 'Không tải được biểu đồ'
            })
        )
    }
    return () => {
      alive = false
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, fetchServiceGroups])
  if (!open) return null
  return createPortal(
    <div
      className="so-pop so-pop--center so-pop--wide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="so-svc-chart-title"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="so-pop__panel">
        <div className="so-pop__head">
          <h2 id="so-svc-chart-title">Biểu đồ dịch vụ</h2>
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
          <div className="so-view">
            {st.loading ? (
              <div className="so-pop__msg">Đang tải…</div>
            ) : st.error ? (
              <div className="so-pop__msg">{st.error}</div>
            ) : (
              [
                ['Value', 'Theo doanh số'],
                ['Count', 'Theo số buổi']
              ].map(([field, rowTitle]) => (
                <section key={field} className="so-svc-row">
                  <h3>{rowTitle}</h3>
                  <div className="so-svc-grid">
                    {SVC_GROUPS.map(g => (
                      <MiniDonut
                        key={g.name}
                        title={g.title}
                        data={st.data?.[g.name]}
                        field={field}
                        empty={g.empty}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* Gộp buổi dịch vụ theo "Dịch vụ gốc": số lượng + doanh số (cộng "Giá buổi") */
export const groupServices = rows => {
  const map = new Map()
  for (const r of rows || []) {
    const name = String(r['Dịch vụ gốc'] ?? '').trim() || '(Không tên)'
    const g = map.get(name) || { name, qty: 0, value: 0 }
    g.qty += 1
    g.value += Math.abs(Number(r['Giá buổi']) || 0)
    map.set(name, g)
  }
  return [...map.values()]
}

const TOP_SERVICES = 7

export function ServiceSection({
  state,
  services,
  fetchList,
  fetchServiceGroups
}) {
  const list = useListPopup()
  const [sortBy, setSortBy] = useState('qty') // qty | value
  const [chartOpen, setChartOpen] = useState(false)
  const closeChart = useCallback(() => setChartOpen(false), [])
  const svc = groupOf(state, 'Dịch vụ')
  const rows = services?.rows || []
  const { items: share, total } = buildShare(rows, SERVICE_SHARE)
  // tiêu đề popup: "Dịch vụ thực hiện" (+ trạng thái / tên dịch vụ đang lọc)
  const SVC_TITLE = 'Dịch vụ thực hiện'
  const openAll = () => list.show(SVC_TITLE, rows, services?.loading)
  const openKey = (label, key) =>
    fetchList &&
    list.load(
      key ? `${SVC_TITLE} · ${label}` : SVC_TITLE,
      fetchList('dich-vu', 'Dịch vụ', key)
    )
  const openService = name =>
    list.show(
      `${SVC_TITLE} · ${name}`,
      rows.filter(
        r => (String(r['Dịch vụ gốc'] ?? '').trim() || '(Không tên)') === name
      )
    )

  const grouped = groupServices(rows).sort((a, b) =>
    sortBy === 'value'
      ? b.value - a.value || b.qty - a.qty
      : b.qty - a.qty || b.value - a.value
  )
  // chỉ hiện top 7 (không có nút xem thêm)
  const shown = grouped.slice(0, TOP_SERVICES)

  return (
    <Card
      id="dich-vu"
      span={8}
      title="Dịch vụ"
      desc="Buổi dịch vụ thực hiện trong ngày và theo từng dịch vụ"
      className="so-card--svc"
      // 3 ô Tổng / Đã xong / Đang thực hiện ở góc phải tiêu đề
      aside={
        <StatButtons
          items={[
            {
              label: 'Tổng',
              value: svc?.GroupValue,
              unit: 'count',
              tone: 'vio',
              hint: 'Xem danh sách buổi dịch vụ'
            },
            {
              label: 'Đã xong',
              value: keyOf(svc, 'Đã xong'),
              unit: 'count',
              key: 'Đã xong'
            },
            {
              label: 'Đang thực hiện',
              value: keyOf(svc, 'Đang thực hiện'),
              unit: 'count',
              key: 'Đang thực hiện'
            }
          ]}
          onClick={x => (x.key ? openKey(x.label, x.key) : openAll())}
        />
      }
      loading={state?.loading}
    >
      {list.popup}
      <ServiceChartsPopup
        open={chartOpen}
        onClose={closeChart}
        fetchServiceGroups={fetchServiceGroups}
      />
      <div className="so-two so-two--wide">
        <div>
          {/* hàng 2: danh sách theo dịch vụ gốc — SL, doanh số; top 10 + xem thêm */}
          <div className="so-svc-list">
            <div className="so-svc-list__h">
              <h3>Chi tiết dịch vụ</h3>
            </div>
            {services?.loading ? (
              <div className="so-skel" aria-hidden="true">
                <div className="so-skel__line"></div>
                <div className="so-skel__line w-80"></div>
              </div>
            ) : !grouped.length ? (
              <p className="so-note">Chưa có buổi dịch vụ trong ngày.</p>
            ) : (
              <>
                <table className="so-svc-table">
                  <thead>
                    <tr>
                      <th>Dịch vụ</th>
                      {/* mũi tên nhỏ cạnh tiêu đề: bấm để sắp xếp theo cột đó */}
                      {[
                        ['qty', 'SL'],
                        ['value', 'Doanh số']
                      ].map(([k, label]) => (
                        <th
                          key={k}
                          className="num"
                          aria-sort={sortBy === k ? 'descending' : 'none'}
                        >
                          <button
                            type="button"
                            className={clsx('so-sort', sortBy === k && 'is-on')}
                            onClick={() => setSortBy(k)}
                            title={`Sắp xếp theo ${label}`}
                          >
                            {label}
                            <i
                              className="fa-solid fa-arrow-down-wide-short"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map(g => (
                      <tr
                        key={g.name}
                        onClick={() => openService(g.name)}
                        tabIndex={0}
                        onKeyDown={e =>
                          (e.key === 'Enter' || e.key === ' ') &&
                          openService(g.name)
                        }
                        title="Xem danh sách buổi của dịch vụ này"
                      >
                        <td>{g.name}</td>
                        <td className="num">{fmt(g.qty)}</td>
                        <td className="num">{fmt(g.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
        <div>
          <h3>Theo dịch vụ thực hiện</h3>
          {services?.loading ? (
            <div className="so-skel" aria-hidden="true">
              <div className="so-skel__chart"></div>
            </div>
          ) : !share.length ? (
            <p className="so-note">Chưa có buổi dịch vụ trong ngày.</p>
          ) : (
            <DonutLegend
              items={share}
              total={total}
              label="Tổng buổi"
              inline
              onPick={x =>
                list.show(
                  x.label,
                  x.other
                    ? rows
                    : rows.filter(r => r['Dịch vụ gốc'] === x.label)
                )
              }
              onPickAll={openAll}
            />
          )}
        </div>
      </div>
      {/* nút phân loại: dưới cùng khối, hết chiều ngang */}
      <div className="so-svc-classify">
        <button
          type="button"
          className="so-btn-soft"
          onClick={() => setChartOpen(true)}
        >
          <i className="fa-regular fa-chart-pie" aria-hidden="true"></i>
          Phân loại dịch vụ theo nhóm khách, giới tính, khách cũ - mới, phương
          thức thanh toán
        </button>
      </div>
    </Card>
  )
}

/* ===== Nhân viên ===== */
function Mini({ label, value, text, onClick }) {
  return (
    <button type="button" className="so-mini so-click" onClick={onClick}>
      <span>{label}</span>
      <div className={clsx('so-money', !value && 'zero')}>
        {text ?? fmt(value)}
      </div>
    </button>
  )
}

export function StaffSection({ state, fetchList }) {
  const list = useListPopup()
  const work = groupOf(state, 'Nhân viên đi làm')
  const tour = groupOf(state, 'Tiền tour / HH / DS')
  const bonus = groupOf(state, 'Thưởng phạt')
  const thuong = keyOf(bonus, 'Tổng thưởng')
  const phat = keyOf(bonus, 'Tổng phạt')
  // bấm ô -> danh sách theo nhóm / dòng tương ứng (giống trang mẫu)
  const open = (GroupTitle, Key, title) =>
    fetchList &&
    list.load(
      title || Key || GroupTitle,
      fetchList('nhan-vien', GroupTitle, Key)
    )
  const W = 'Nhân viên đi làm'
  const T = 'Tiền tour / HH / DS'
  return (
    <Card
      id="nhan-vien"
      span={4}
      title="Nhân viên"
      desc="Chấm công, tiền tour và thưởng phạt"
      chip={`${fmt(work?.GroupValue)} đi làm`}
      loading={state?.loading}
    >
      {list.popup}
      {/* chấm công: 2 ô nhỏ */}
      <div className="so-staff-stats">
        <Mini
          label="Đang làm việc"
          value={keyOf(work, 'Đang làm việc')}
          onClick={() => open(W, 'Đang làm việc')}
        />
        <Mini
          label="Đã về"
          value={keyOf(work, 'Đã về')}
          onClick={() => open(W, 'Đã về')}
        />
      </div>
      {/* tiền: danh sách dọc cho vừa khối hẹp */}
      <h3>Tiền tour / Hoa hồng / Doanh số</h3>
      <ClickRows
        items={[
          ['Lương tour', 'Tổng Lương tour', 'var(--s1)'],
          ['Hoa hồng', 'Tổng Hoa hồng', 'var(--s3)'],
          ['Doanh số', 'Tổng Doanh số', 'var(--pos)']
        ].map(([label, key, color]) => ({
          label,
          key,
          color,
          value: Math.abs(keyOf(tour, key))
        }))}
        onPick={it => open(T, it.key, it.label)}
      />
      <h3 className="so-staff-h3">Thưởng phạt</h3>
      <ClickRows
        items={[
          {
            label: 'Thưởng',
            key: 'Tổng thưởng',
            color: 'var(--pos)',
            value: thuong
          },
          { label: 'Phạt', key: 'Tổng phạt', color: 'var(--neg)', value: phat }
        ]}
        onPick={it => open('Thưởng phạt', it.key, it.label)}
      />
    </Card>
  )
}
