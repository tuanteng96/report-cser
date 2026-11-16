import React, { Fragment, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import moment from 'moment'

/* ===== Định dạng ===== */
const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.abs(Math.round(n || 0)))
const plus = n => (n > 0 ? '+' : n < 0 ? '-' : '') + fmt(n)
const hm = s => (s ? moment(s).format('HH:mm') : '')

/* Số gọn: 150000 -> 150k, 1030000 -> 1.03M */
const short = n => {
  const a = Math.abs(n || 0)
  const s = n < 0 ? '-' : ''
  const r = x => String(Math.round(x * 100) / 100)
  if (a >= 1e6) return s + r(a / 1e6) + 'M'
  if (a >= 1e3) return s + r(a / 1e3) + 'k'
  return s + a
}
const shortSigned = n => (n > 0 ? '+' : '') + short(n)

const stripMarks = s =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')

/* "Trần Mai Linh" -> "LinhTM" (tên + chữ cái đầu họ và đệm, bỏ dấu) */
const shortName = full => {
  const w = String(full || '')
    .trim()
    .split(/\s+/)
    .map(stripMarks)
  if (w.length < 2) return w[0] || ''
  return (
    w[w.length - 1] +
    w
      .slice(0, -1)
      .map(s => s[0].toUpperCase())
      .join('')
  )
}

/* "Nguyễn Hùng Huy" -> "NH" (chữ đầu của họ và tên) */
const initials = full => {
  const w = String(full || '')
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!w.length) return '?'
  const a = w[0][0]
  const b = w.length > 1 ? w[w.length - 1][0] : ''
  return (a + b).toUpperCase()
}

const isWalkIn = c =>
  /vãng lai/i.test(c.FullName || '') || String(c.Phone || '').startsWith('0000')

/* ===== Icon ===== */
const Svg = ({ size = 12, children, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
)

const TYPES = {
  NEW: {
    title: 'Bán mới',
    label: 'Mới',
    cls: 'bc-t-new',
    icon: (
      <Svg size={10}>
        <path
          d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
          fill="currentColor"
        />
      </Svg>
    )
  },
  RETURN: {
    title: 'Trả hàng',
    label: 'Trả hàng',
    cls: 'bc-t-ret',
    icon: (
      <Svg size={10}>
        <path d="M9 14L4 9l5-5" />
        <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
      </Svg>
    )
  },
  DEBT: {
    title: 'Thanh toán nợ',
    label: 'TT nợ',
    cls: 'bc-t-debt',
    icon: <span className="bc-dot" aria-hidden="true" />
  }
}

const METHOD_ABBR = {
  'Tiền mặt': 'TM',
  'Chuyển khoản': 'CK',
  'Quẹt thẻ': 'QT',
  Ví: 'Ví',
  'Thẻ tiền': 'TT'
}

// Ví và thẻ tiền hiện riêng một dòng, sau nhóm TM / CK / QT
const WALLET = ['Ví', 'Thẻ tiền']

const paymentBreakdown = o => [
  ['Tiền mặt', o.ThanhToan_TienMat],
  ['Chuyển khoản', o.ThanhToan_CK],
  ['Quẹt thẻ', o.ThanhToan_QT],
  ['Ví', Math.abs(o.Vi || 0)],
  ['Thẻ tiền', Math.abs(o.TheTien || 0)]
]

/* ===== Nhân viên ===== */
// Tên rút gọn, rê chuột / chạm để xem tên đầy đủ
const Name = ({ full }) => (
  <span className="bc-nm" data-tip={full} tabIndex={0}>
    {shortName(full)}
  </span>
)

/* Chip "HH: LinhTM (+120k), ChuyenLH (+90k)" */
function StaffChip({ list, label, abbr }) {
  if (!list || !list.length) return null
  return (
    <span className="bc-chip">
      <span
        className="bc-ico"
        data-tip={label}
        tabIndex={0}
        role="img"
        aria-label={label}
      >
        {abbr}:
      </span>
      {list.map((x, i) => (
        <Fragment key={i}>
          {i > 0 && ', '}
          <Name full={x.FullName} />{' '}
          <span className="bc-n">({shortSigned(x.Bonus)})</span>
        </Fragment>
      ))}
    </span>
  )
}

function Prods({ list }) {
  const items = (list || []).map((p, i) => (
    <Fragment key={i}>
      {p.Title}
      {Number(p.Qty) > 1 && (
        <>
          {' '}
          <span className="bc-qty bc-n">[x{p.Qty}]</span>
        </>
      )}
    </Fragment>
  ))
  if (!items.length) return null
  if (items.length === 1) return <div className="bc-prods">{items[0]}</div>
  return (
    <ul className="bc-prods bc-list">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  )
}

/* ===== Một dòng đơn =====
   trái: loại + #mã + tổng giá trị, sản phẩm, chip nhân viên
   phải: số tiền (thực thu / hoàn tiền / nợ) */
function OrderRow({
  id,
  type,
  value,
  prods,
  amount,
  items,
  debt,
  isReturn,
  staff
}) {
  const T = TYPES[type]
  const methods = items.filter(i => i[1] > 0)
  const single = methods.length === 1
  const hasStaff = staff.some(s => s.list && s.list.length)

  let money
  if (amount > 0) {
    // Thực thu / Hoàn tiền: 1 phương thức ghi cạnh nhãn; nhiều phương thức liệt kê bên dưới
    const neg = isReturn && 'bc-neg'
    money = (
      <>
        <div className={clsx('bc-lab', neg)}>
          {isReturn ? 'Hoàn tiền' : 'Thực thu'}
          {single && <Abbr m={methods[0][0]} />}
        </div>
        <div className={clsx('bc-amt bc-n', neg)}>{fmt(amount)}</div>
        {/* dòng 1: TM / CK / QT — dòng 2: Ví / Thẻ tiền */}
        {methods.length > 1 &&
          [
            methods.filter(m => !WALLET.includes(m[0])),
            methods.filter(m => WALLET.includes(m[0]))
          ]
            .filter(g => g.length)
            .map((g, gi) => (
              <div className="bc-mths bc-n" key={gi}>
                {g.map((m, i) => (
                  <Fragment key={i}>
                    {i > 0 && <span className="bc-sep"> • </span>}
                    <span title={m[0]}>
                      {METHOD_ABBR[m[0]]} {fmt(m[1])}
                    </span>
                  </Fragment>
                ))}
              </div>
            ))}
      </>
    )
  } else if (debt > 0) {
    money = (
      <>
        <div className="bc-lab bc-warn">Nợ</div>
        <div className="bc-amt bc-n bc-warn">{fmt(debt)}</div>
      </>
    )
  }

  return (
    <div className="bc-o">
      <div className="bc-p">
        <div className="bc-hd">
          <span className={clsx('bc-type', T.cls)} title={T.title}>
            {T.icon}
            {T.label}
          </span>
          <span className="bc-id bc-n">#{id}</span>
          {!!value && (
            <span className="bc-gv">
              Tổng giá trị: <span className="bc-n">{fmt(value)}</span>
            </span>
          )}
        </div>
        <Prods list={prods} />
        {hasStaff && (
          <div className="bc-chips">
            {staff.map((s, i) => (
              <StaffChip key={i} {...s} />
            ))}
          </div>
        )}
      </div>
      <div className="bc-v">
        {money}
        {amount > 0 && debt > 0 && (
          <div className="bc-debt">
            <span>Còn nợ</span>
            <span className="bc-n">{fmt(debt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Abbr = ({ m }) => (
  <>
    {' '}
    <b className="bc-mth" title={m}>
      {METHOD_ABBR[m] || m}
    </b>
  </>
)

/* ===== Cột phải: dịch vụ, nghiệp vụ khác ===== */
function ServiceCard({ s }) {
  return (
    <div className="bc-card bc-svc">
      <div className="bc-card-t">{s.Title}</div>
      {(s.PhuPhi || []).map((p, i) => (
        <div className="bc-card-s" key={i}>
          {p.Title}
        </div>
      ))}
      {s.HoaHong && s.HoaHong.length > 0 && (
        <div className="bc-svc-staff">
          <div className="bc-lbl">Lương tour</div>
          {/* nhiều nhân viên trên một dòng, hết chỗ thì xuống dòng */}
          <div className="bc-card-s bc-tour">
            {s.HoaHong.map((x, i) => (
              <span key={i} className="bc-tour-i">
                <Name full={x.FullName} />{' '}
                <span className="bc-n">({plus(x.Bonus)})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoreCard({ x }) {
  return (
    <div className="bc-card">
      <div className="bc-card-h">
        <span className="bc-card-t">{x.Title}</span>
        <span
          className={clsx('bc-card-a bc-n', x.Value > 0 ? 'bc-pos' : 'bc-neg')}
        >
          {(x.Value > 0 ? '+' : '-') + fmt(x.Value)}
        </span>
      </div>
      {x.KhongTinh === 1 && (
        <div className="bc-lbl bc-k" title="Không tính vào doanh thu">
          Không tính vào DT
        </div>
      )}
      {x.Desc && <div className="bc-card-s">{x.Desc}</div>}
    </div>
  )
}

/* Tách dữ liệu một khách: đơn hàng / dịch vụ / nghiệp vụ khác */
function collect(customer) {
  const orders = []
  const services = []
  const others = []
  ;(customer.children || []).forEach((ch, ci) => {
    ;(ch.MajorList || []).forEach((x, xi) => {
      const k = `${ci}-${xi}`
      if (x.Order) {
        const o = x.Order
        orders.push(
          <OrderRow
            key={`o-${k}`}
            id={o.ID}
            type="NEW"
            value={o.GiaBanDonHang}
            prods={o.Prods}
            amount={o.ThanhToan || 0}
            items={paymentBreakdown(o)}
            debt={o.No || 0}
            staff={[
              { list: o.HoaHong, label: 'Hoa hồng', abbr: 'HH' },
              { list: o.DoanhSo, label: 'Doanh số', abbr: 'DS' }
            ]}
          />
        )
      }
      if (x.PayDebt) {
        const o = x.PayDebt
        orders.push(
          <OrderRow
            key={`d-${k}`}
            id={o.ID}
            type="DEBT"
            value={0}
            prods={o.Prods}
            amount={o.ThanhToan || 0}
            items={paymentBreakdown(o)}
            debt={o.No || 0}
            staff={[
              { list: o.HoaHong, label: 'Hoa hồng', abbr: 'HH' },
              { list: o.DoanhSo, label: 'Doanh số', abbr: 'DS' }
            ]}
          />
        )
      }
      if (x.Returns) {
        const o = x.Returns
        orders.push(
          <OrderRow
            key={`r-${k}`}
            id={o.ID}
            type="RETURN"
            value={0}
            prods={o.Prods}
            isReturn
            amount={o.GiaTriDonTra || 0}
            items={[
              ['Tiền mặt', o.HoanTienMat],
              ['Ví', o.HoanVi],
              ['Thẻ tiền', o.HoanTheTien]
            ]}
            debt={0}
            staff={[
              { list: o.HoaHongGiam, label: 'Khấu trừ hoa hồng', abbr: 'HH' },
              { list: o.DoanhSoGiam, label: 'Khấu trừ doanh số', abbr: 'DS' }
            ]}
          />
        )
      }
      ;(x.Services || []).forEach((s, si) =>
        services.push(<ServiceCard key={`s-${k}-${si}`} s={s} />)
      )
    })
    ;(ch.More || []).forEach((x, mi) =>
      others.push(<MoreCard key={`m-${ci}-${mi}`} x={x} />)
    )
  })
  return { orders, services, others }
}

function CustomerItem({ customer }) {
  const [open, setOpen] = useState(true)
  const walk = isWalkIn(customer)
  const time = hm(customer.CheckIn)
  const { orders, services, others } = collect(customer)
  const noSide = !services.length && !others.length

  return (
    <article className={clsx('bc-item', walk && 'bc-walk')}>
      <button
        type="button"
        className="bc-head"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="bc-av" aria-hidden="true">
          {walk ? (
            <Svg size={18} strokeWidth="0">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6z" fill="currentColor" />
            </Svg>
          ) : (
            initials(customer.FullName)
          )}
        </span>
        <span className="bc-who">
          <span className="bc-l1">
            <span className="bc-name">
              {walk ? 'Khách vãng lai' : customer.FullName}
            </span>
            {walk && <span className="bc-ph-in bc-n">{customer.Phone}</span>}
          </span>
          <span className="bc-l2">
            {!walk && customer.Phone && (
              <span className="bc-meta">
                <Svg size={12}>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </Svg>
                <span className="bc-n">{customer.Phone}</span>
              </span>
            )}
            {time && (
              <span className="bc-meta" title="Giờ check-in">
                <Svg size={12}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </Svg>
                <span className="bc-n">{time}</span>
              </span>
            )}
          </span>
        </span>
        {customer.TongThanhToan > 0 && (
          <span className="bc-tot">
            <span className="bc-lbl">Tổng thanh toán</span>
            <span>
              <span className="bc-tot-v bc-n">
                {fmt(customer.TongThanhToan)}
              </span>{' '}
              <span className="bc-cur">VND</span>
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="bc-body">
          <section className="bc-main">
            {orders.length > 0 ? (
              <>
                <h3 className="bc-sec">Danh sách đơn hàng ({orders.length})</h3>
                {orders}
              </>
            ) : (
              <div className="bc-blank">Không có đơn hàng</div>
            )}
          </section>
          <aside className="bc-side">
            {noSide ? (
              <div className="bc-ghost">
                <Svg size={28} strokeWidth="1.6">
                  <path d="M5 20V11a7 7 0 0 1 14 0v9l-2.3-1.6L14.3 20 12 18.4 9.7 20l-2.4-1.6z" />
                  <path d="M9.5 11h.01M14.5 11h.01" />
                </Svg>
                <div>
                  Không có nghiệp vụ
                  <br />
                  hay dịch vụ phát sinh
                </div>
              </div>
            ) : (
              <>
                {services.length > 0 && (
                  <div className="bc-group">
                    <h4 className="bc-sec">Dịch vụ thực hiện</h4>
                    {services}
                  </div>
                )}
                {others.length > 0 && (
                  <div className="bc-group">
                    <h4 className="bc-sec">Nghiệp vụ khác</h4>
                    {others}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </article>
  )
}

function CustomerTimeline({ data }) {
  const rootRef = useRef(null)

  // Điện thoại không có rê chuột: chạm HH, DS hoặc tên nhân viên để hiện chú thích, chạm chỗ khác để ẩn
  useEffect(() => {
    const onClick = e => {
      const root = rootRef.current
      if (!root) return
      const t = e.target.closest ? e.target.closest('.bc-ico,.bc-nm') : null
      root.querySelectorAll('.bc-ico.bc-show,.bc-nm.bc-show').forEach(x => {
        if (x !== t) x.classList.remove('bc-show')
      })
      if (t && root.contains(t)) t.classList.toggle('bc-show')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  if (!data || !data.length) {
    return (
      <div className="bc-none-msg">
        Không có khách nào trong bộ lọc đã chọn.
      </div>
    )
  }

  return (
    <div className="bc-tl" ref={rootRef}>
      {data.map((c, i) => (
        <CustomerItem key={c.MemberID || i} customer={c} />
      ))}
    </div>
  )
}

export default CustomerTimeline
