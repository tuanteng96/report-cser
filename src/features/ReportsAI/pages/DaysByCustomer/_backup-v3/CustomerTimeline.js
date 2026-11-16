import React, { Fragment, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import moment from 'moment'

/* ===== Định dạng ===== */
const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.abs(Math.round(n || 0)))
const signed = n => (n < 0 ? '-' : '') + fmt(n)
const hm = s => (s ? moment(s).format('HH:mm') : '--:--')

/* "Trần Mai Linh" -> "LinhTM" (tên + chữ cái đầu họ và đệm, bỏ dấu) */
const shortName = full => {
  const w = String(full || '')
    .trim()
    .split(/\s+/)
    .map(s =>
      s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
    )
  if (w.length < 2) return w[0] || ''
  return (
    w[w.length - 1] +
    w
      .slice(0, -1)
      .map(s => s[0].toUpperCase())
      .join('')
  )
}

/* ===== Icon & nhãn theo loại giao dịch ===== */
const TYPES = {
  NEW: {
    title: 'Bán mới',
    label: 'Mới',
    cls: 'bc-i-new',
    icon: (
      <>
        <path d="M3 4h2.2l2 9.5a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L19 8H6.2" />
        <circle cx="9" cy="19" r="1.3" />
        <circle cx="16" cy="19" r="1.3" />
      </>
    )
  },
  RETURN: {
    title: 'Trả hàng',
    label: 'Trả',
    cls: 'bc-i-ret',
    icon: (
      <>
        <path d="M9 14L4 9l5-5" />
        <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
      </>
    )
  },
  DEBT: {
    title: 'Thanh toán nợ',
    label: 'TT Nợ',
    cls: 'bc-i-debt',
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M16 15h2" />
      </>
    )
  }
}

const METHOD_ABBR = {
  'Tiền mặt': 'TM',
  'Chuyển khoản': 'CK',
  'Quẹt thẻ': 'QT',
  Ví: 'Ví',
  'Thẻ tiền': 'TT'
}

/* [tên, giá trị, cờ cảnh báo] — cờ "nw" = nợ, tô màu cảnh báo */
const paymentBreakdown = o => [
  ['Tiền mặt', o.ThanhToan_TienMat],
  ['Chuyển khoản', o.ThanhToan_CK],
  ['Quẹt thẻ', o.ThanhToan_QT],
  ['Ví', Math.abs(o.Vi || 0)],
  ['Thẻ tiền', Math.abs(o.TheTien || 0)]
]

/* ===== Thành phần nhỏ ===== */
function People({ list, label, short }) {
  if (!list || !list.length) return null
  const isDS = /doanh/i.test(label)
  const badge = short || (isDS ? 'DS' : 'HH')
  return (
    <div className="bc-s bc-pp">
      <span
        className="bc-ico"
        data-tip={label}
        tabIndex={0}
        role="img"
        aria-label={label}
      >
        {badge}
      </span>
      {list.map((x, i) => (
        <Fragment key={i}>
          {i > 0 && ', '}
          <span className="bc-nm" data-tip={x.FullName} tabIndex={0}>
            {shortName(x.FullName)}
          </span>{' '}
          <span className="bc-n">({signed(x.Bonus)})</span>
        </Fragment>
      ))}
    </div>
  )
}

function PeoplePair({ a, b, labelA, labelB }) {
  if (!(a && a.length) && !(b && b.length)) return null
  return (
    <div className="bc-pg">
      {a && a.length ? <People list={a} label={labelA} /> : <div />}
      {b && b.length ? <People list={b} label={labelB} /> : <div />}
    </div>
  )
}

function Prods({ list }) {
  return (list || []).map((p, i) => (
    <div className="bc-pr" key={i}>
      {p.Title}
      {Number(p.Qty) > 1 && (
        <>
          {' '}
          <span className="bc-sl bc-n">[x{p.Qty}]</span>
        </>
      )}
    </div>
  ))
}

/* Một dòng đơn: icon loại | #ID + giá trị + sản phẩm | nhãn + số tiền + phương thức */
function OrderRow({
  id,
  type,
  value,
  prods,
  tagText,
  isReturn,
  amount,
  items,
  staff
}) {
  const T = TYPES[type]
  const L = items.filter(i => i[1] > 0)
  const methods = L.filter(i => !i[2])
  const warns = L.filter(i => i[2])
  // chỉ 1 phương thức và bằng đúng số tiền: ghi tên viết tắt ngay cạnh số tiền
  const single = !!amount && methods.length === 1 && methods[0][1] === amount
  const lineMethods = single ? [] : methods

  return (
    <div className="bc-o">
      <div
        className={clsx('bc-ic', T.cls)}
        title={T.title}
        role="img"
        aria-label={T.title}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {T.icon}
        </svg>
        <span>{T.label}</span>
      </div>
      <div className="bc-p">
        <div className="bc-hd">
          <span className="bc-idl bc-n">#{id}</span>
          {!!value && <span className="bc-gv bc-n">{fmt(value)}</span>}
        </div>
        <Prods list={prods} />
      </div>
      <div className="bc-v">
        {!!amount && (
          <div className="bc-top">
            <span className={clsx('bc-tag', isReturn && 'bc-ret')}>
              {tagText}
            </span>
            <span className={clsx('bc-a bc-n', isReturn && 'bc-neg')}>
              {fmt(amount)}
            </span>
            {single && (
              <span className="bc-mth" title={methods[0][0]}>
                {METHOD_ABBR[methods[0][0]]}
              </span>
            )}
          </div>
        )}
        {/* phương thức thanh toán gộp một dòng, viết tắt; rê chuột xem tên đầy đủ */}
        {lineMethods.length > 0 && (
          <div className="bc-b">
            {lineMethods.map((i, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <span className="bc-cm"> · </span>}
                <span className="bc-pi bc-n" title={i[0]}>
                  {METHOD_ABBR[i[0]] || i[0]} {fmt(i[1])}
                </span>
              </Fragment>
            ))}
          </div>
        )}
        {warns.map((i, idx) => (
          <div className="bc-nw bc-n" key={idx}>
            {i[0]}: {fmt(i[1])}
          </div>
        ))}
      </div>
      {staff && <div className="bc-st">{staff}</div>}
    </div>
  )
}

function EntryRow({ note, title, amount, sub, cls }) {
  return (
    <div className="bc-e">
      {note && <div className="bc-k">{note}</div>}
      <div className="bc-t">{title}</div>
      <div className={clsx('bc-a bc-n', cls)}>{amount}</div>
      {sub}
    </div>
  )
}

function Column({ title, rows, className }) {
  return (
    <section className={clsx('bc-col', className, !rows.length && 'bc-none')}>
      <h3>
        <span>{title}</span>
        {rows.length ? (
          <span className="bc-h-count bc-n">{rows.length}</span>
        ) : (
          <span className="bc-h-empty">Không có</span>
        )}
      </h3>
      {rows}
    </section>
  )
}

/* Tách dữ liệu một khách thành 3 cột: Đơn hàng / Dịch vụ thực hiện / Nghiệp vụ khác */
function buildColumns(customer) {
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
            tagText="Thực thu"
            amount={o.ThanhToan || 0}
            items={[...paymentBreakdown(o), ['Nợ', o.No, 'nw']]}
            staff={
              <PeoplePair
                a={o.HoaHong}
                b={o.DoanhSo}
                labelA="Hoa hồng"
                labelB="Doanh số"
              />
            }
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
            tagText="Thực thu"
            amount={o.ThanhToan || 0}
            items={[...paymentBreakdown(o), ['Còn nợ', o.No, 'nw']]}
            staff={
              <PeoplePair
                a={o.HoaHong}
                b={o.DoanhSo}
                labelA="Hoa hồng"
                labelB="Doanh số"
              />
            }
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
            tagText="Hoàn tiền"
            isReturn
            amount={o.GiaTriDonTra}
            items={[
              ['Tiền mặt', o.HoanTienMat],
              ['Ví', o.HoanVi],
              ['Thẻ tiền', o.HoanTheTien]
            ]}
            staff={
              <PeoplePair
                a={o.HoaHongGiam}
                b={o.DoanhSoGiam}
                labelA="Khấu trừ hoa hồng"
                labelB="Khấu trừ doanh số"
              />
            }
          />
        )
      }
      ;(x.Services || []).forEach((s, si) =>
        services.push(
          <EntryRow
            key={`s-${k}-${si}`}
            title={s.Title}
            amount=""
            sub={
              <>
                {(s.PhuPhi || []).map((p, pi) => (
                  <div className="bc-s bc-fee" key={pi}>
                    {p.Title}
                  </div>
                ))}
                <People
                  list={s.HoaHong}
                  label="Lương tour"
                  short="Lương tour"
                />
              </>
            }
          />
        )
      )
    })
    ;(ch.More || []).forEach((x, mi) =>
      others.push(
        <EntryRow
          key={`m-${ci}-${mi}`}
          note={x.KhongTinh === 1 ? 'Không tính vào doanh thu' : ''}
          title={x.Title}
          amount={(x.Value > 0 ? '+' : '-') + fmt(x.Value)}
          sub={x.Desc ? <div className="bc-s">{x.Desc}</div> : null}
          cls={x.Value > 0 ? 'bc-pos' : 'bc-neg'}
        />
      )
    )
  })

  return (
    <>
      <Column title="Đơn hàng" rows={orders} className="bc-orders" />
      <div className="bc-side">
        <Column title="Dịch vụ thực hiện" rows={services} />
        <Column title="Nghiệp vụ khác" rows={others} />
      </div>
    </>
  )
}

function CustomerItem({ customer }) {
  const [open, setOpen] = useState(true)
  return (
    <article className={clsx('bc-item', open && 'bc-open')}>
      <button
        type="button"
        className="bc-head"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="bc-who">
          <span className="bc-name">{customer.FullName}</span>
          <span className="bc-sub">
            <span className="bc-time">
              <span className="bc-lbl">Check-in</span>{' '}
              <span className="bc-n">{hm(customer.CheckIn)}</span>
            </span>
            <span className="bc-ph bc-n">{customer.Phone}</span>
          </span>
        </span>
        <span className={clsx('bc-tot', !customer.TongThanhToan && 'bc-zero')}>
          <span className="bc-lbl">Tổng thanh toán</span>
          <span className="bc-tot-v bc-n">{fmt(customer.TongThanhToan)}</span>
        </span>
        <svg
          className="bc-chev"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="bc-cols">{buildColumns(customer)}</div>}
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
