import React, { Fragment, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import {
  TYPE_LABEL,
  money,
  cell,
  qty,
  vnDate,
  normPhone,
  customerText,
  orderItems,
  ktOf,
  voucherValue,
  orderDiscount,
  sumCash,
  sumMoneyCard,
  rowKey
} from './format'

const ALL_TYPES = ['MOI', 'NO', 'KHAU_TRU']
const n = v => Number(v || 0)

/* ================= Tổng cộng toàn kỳ ================= */
function Bars({ list, total, color }) {
  return list.map(([k, v]) => (
    <div key={k}>
      <div className="sp-kv">
        <span className="sp-k">{k}</span>
        <span className="sp-v">{money(v)}</span>
      </div>
      <div className="sp-bar" aria-hidden="true">
        <i
          style={{
            width: `${total ? Math.round((n(v) / total) * 100) : 0}%`,
            background: color
          }}
        />
      </div>
    </div>
  ))
}

export function PaymentTotals({ summary }) {
  const t = summary || {}
  const moi = n(t.Moi_TienMat) + n(t.Moi_ChuyenKhoan) + n(t.Moi_QuetThe)
  const no = n(t.No_TienMat) + n(t.No_ChuyenKhoan) + n(t.No_QuetThe)
  return (
    <div className="sp-cards">
      <div className="sp-card sp-dark">
        <span className="sp-card-title">Tổng thực thu (TM + CK + QT)</span>
        <span className="sp-big">{money(moi + no)}</span>
        <div className="sp-kv">
          <span className="sp-k">Thanh toán mới</span>
          <span className="sp-v">{money(moi)}</span>
        </div>
        <div className="sp-kv">
          <span className="sp-k">Thu nợ</span>
          <span className="sp-v">{money(no)}</span>
        </div>
      </div>
      <div className="sp-card">
        <div className="sp-card-top">
          <span className="sp-card-title">Thanh toán mới</span>
          <span className="sp-pill MOI">Mới</span>
        </div>
        <span className="sp-big">{money(moi)}</span>
        <Bars
          total={moi}
          color="#2F8CF5"
          list={[
            ['Tiền mặt', t.Moi_TienMat],
            ['Chuyển khoản', t.Moi_ChuyenKhoan],
            ['Quẹt thẻ', t.Moi_QuetThe]
          ]}
        />
      </div>
      <div className="sp-card">
        <div className="sp-card-top">
          <span className="sp-card-title">Thu nợ</span>
          <span className="sp-pill NO">Nợ</span>
        </div>
        <span className="sp-big">{money(no)}</span>
        <Bars
          total={no}
          color="#E8A33D"
          list={[
            ['Tiền mặt', t.No_TienMat],
            ['Chuyển khoản', t.No_ChuyenKhoan],
            ['Quẹt thẻ', t.No_QuetThe]
          ]}
        />
      </div>
      <div className="sp-card sp-dashed">
        <div className="sp-card-top">
          <span className="sp-card-title">Khấu trừ</span>
          <span className="sp-pill KHAU_TRU">Không thu tiền</span>
        </div>
        <span className="sp-big" style={{ color: 'var(--sp-kt-fg)' }}>
          {money(t.KhauTru)}
        </span>
        <p className="sp-note">
          Kết thúc thẻ, trả hàng, đơn tặng, khóa nợ. Giảm công nợ nhưng không
          tính vào thực thu.
        </p>
      </div>
    </div>
  )
}

/* ================= Bảng danh sách ================= */
function ItemsCell({ list, max = 3 }) {
  if (!list.length) return <span className="sp-small">–</span>
  return (
    <>
      {list.slice(0, max).map((i, idx) => (
        <div
          key={idx}
          className="sp-item"
          tabIndex={0}
          aria-label={`${i.name}, SL ${qty(i.qty)}, ${money(i.tp)}, ID ${
            i.id
          }, mã ${i.pcode || 'không có'}`}
        >
          <span className="sp-item-name">{i.name}</span>
          <span className="sp-item-sep">-</span>
          <span className="sp-item-num">x{qty(i.qty)}</span>
          {list.length > 1 && (
            <>
              <span className="sp-item-sep">-</span>
              <span className="sp-item-num">{money(i.tp)}</span>
            </>
          )}
          <span className="sp-item-tip" aria-hidden="true">
            ID <b>{i.id}</b> · Mã <b>{i.pcode || '–'}</b> · {i.name}
          </span>
        </div>
      ))}
      {list.length > max && (
        <span className="sp-more">+{list.length - max} thành phần khác</span>
      )}
    </>
  )
}

const NumCell = ({ v }) => <span className="sp-r sp-num">{cell(v)}</span>

const Chevron = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
)

// Các cột ở chế độ "cơ bản" của file HTML
const COLUMNS = [
  {
    id: 'order',
    label: 'Đơn hàng / Khách',
    w: '270px',
    render: (r, c, open) => (
      <div
        className="sp-order"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Xem chi tiết đơn ${r.OrderID}`}
        onClick={open}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          }
        }}
      >
        <div className="sp-stack">
          <span className="sp-num">
            <b style={{ fontWeight: 700 }}>#{r.OrderID}</b>{' '}
            <span className="sp-small">· {vnDate(r.OrderDay)}</span>
          </span>
          <span className="sp-cust" title={c.cust}>
            {c.cust}
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'payday',
    label: 'Ngày TT',
    w: '96px',
    render: r => (
      <span className="sp-num" style={{ fontSize: 13, fontWeight: 500 }}>
        {vnDate(r.PayDay)}
      </span>
    )
  },
  {
    id: 'type',
    label: 'Loại',
    w: '96px',
    render: r => (
      <div>
        <span className={`sp-pill ${r.PayCode}`}>
          {TYPE_LABEL[r.PayCode] || 'Khác'}
        </span>
      </div>
    )
  },
  {
    id: 'items',
    label: 'Chi tiết đơn',
    w: '280px',
    render: (r, c) => (
      <div className="sp-items">
        <ItemsCell list={c.items} />
      </div>
    )
  },
  {
    id: 'orig',
    label: 'Nguyên giá',
    w: 'minmax(110px,1fr)',
    r: 1,
    render: r => <NumCell v={r.TotalProdValue} />
  },
  {
    id: 'disc',
    label: 'Tổng giảm giá',
    w: 'minmax(110px,1fr)',
    r: 1,
    render: r => <NumCell v={n(r.TotalProdValue) - n(r.ToPay)} />
  },
  {
    id: 'vcode',
    label: 'Mã giảm giá',
    w: '110px',
    render: r => (
      <span className="sp-num" style={{ fontSize: 13 }}>
        {r.VCode || '–'}
      </span>
    )
  },
  {
    id: 'value',
    label: 'Giá trị',
    w: 'minmax(110px,1fr)',
    r: 1,
    render: r => (
      <span className="sp-r sp-num" style={{ fontWeight: 500 }}>
        {money(r.ToPay)}
      </span>
    )
  },
  {
    id: 'tm',
    label: 'Tiền mặt',
    w: 'minmax(110px,1fr)',
    r: 1,
    group: 'cash',
    render: r => <NumCell v={r.TienMat} />
  },
  {
    id: 'ck',
    label: 'Chuyển khoản',
    w: 'minmax(110px,1fr)',
    r: 1,
    group: 'cash',
    render: r => <NumCell v={r.ChuyenKhoan} />
  },
  {
    id: 'qt',
    label: 'Quẹt thẻ',
    w: 'minmax(110px,1fr)',
    r: 1,
    group: 'cash',
    render: r => <NumCell v={r.QuetThe} />
  },
  {
    id: 'vi',
    label: 'Ví',
    w: 'minmax(110px,1fr)',
    r: 1,
    group: 'mm',
    render: r => <NumCell v={r.Vi} />
  },
  {
    id: 'tt',
    label: 'Thẻ tiền',
    w: 'minmax(110px,1fr)',
    r: 1,
    group: 'mm',
    render: r => <NumCell v={r.TheTien} />
  },
  {
    id: 'kt',
    label: 'Khấu trừ',
    w: 'minmax(120px,1fr)',
    r: 1,
    render: (r, c) => (
      <div className="sp-stack" style={{ alignItems: 'flex-end' }}>
        <span className="sp-num">{cell(c.kt.value)}</span>
        <span className="sp-kt-label">{c.kt.label}</span>
      </div>
    )
  },
  {
    id: 'sumcash',
    label: 'Tổng TM/CK/QT',
    w: 'minmax(120px,1fr)',
    r: 1,
    render: r => (
      <span className="sp-r sp-num" style={{ fontWeight: 600 }}>
        {money(sumCash(r))}
      </span>
    )
  },
  {
    id: 'summm',
    label: 'Tổng ví/thẻ tiền',
    w: 'minmax(120px,1fr)',
    r: 1,
    render: r => (
      <span className="sp-r sp-num" style={{ fontWeight: 600 }}>
        {money(sumMoneyCard(r))}
      </span>
    )
  },
  {
    id: 'debt',
    label: 'Nợ cuối kỳ',
    w: 'minmax(130px,1fr)',
    r: 1,
    render: r => (
      <span className={`sp-r sp-num sp-debt ${n(r.NoCuoiNgay) ? '' : 'sp-ok'}`}>
        {n(r.NoCuoiNgay) ? money(r.NoCuoiNgay) : 'Đã đủ'}
      </span>
    )
  },
  {
    id: 'desc',
    label: 'Ghi chú',
    w: '220px',
    render: r => (
      <span className="sp-desc" title={r.Desc || ''}>
        {r.Desc || '–'}
      </span>
    )
  },
  {
    id: 'more',
    label: '',
    w: '64px',
    render: (r, c, open) => (
      <button
        type="button"
        className="sp-toggle"
        aria-haspopup="dialog"
        aria-label={`Xem chi tiết đơn ${r.OrderID}`}
        onClick={open}
      >
        <Chevron />
      </button>
    )
  }
]
const GROUP_LABEL = { cash: 'TM / CK / QT', mm: 'Ví / Thẻ tiền' }
const GRID_COLS = COLUMNS.map(c => c.w).join(' ')

function GroupHead() {
  const cells = []
  for (let i = 0; i < COLUMNS.length; ) {
    const grp = COLUMNS[i].group
    if (!grp) {
      cells.push(<span key={i} />)
      i++
      continue
    }
    let span = 0
    while (i + span < COLUMNS.length && COLUMNS[i + span].group === grp) span++
    cells.push(
      <span
        key={i}
        className={`sp-g ${grp}`}
        style={{ gridColumn: `span ${span}` }}
      >
        {GROUP_LABEL[grp]}
      </span>
    )
    i += span
  }
  return <div className="sp-grid sp-group-head">{cells}</div>
}

export function PaymentTable({ rows, onOpen }) {
  return (
    <div className="sp-scroll">
      <div className="sp-table" style={{ '--sp-cols': GRID_COLS }}>
        <div className="sp-thead">
          <GroupHead />
          <div className="sp-grid sp-col-head">
            {COLUMNS.map(c => (
              <span key={c.id} className={c.r ? 'sp-r' : ''}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
        {!rows.length ? (
          <div className="sp-empty">Không có thanh toán nào khớp bộ lọc.</div>
        ) : (
          rows.map(r => {
            const key = rowKey(r)
            const c = {
              kt: ktOf(r),
              items: orderItems(r),
              cust: customerText(r)
            }
            const open = () => onOpen(r)
            return (
              <div className="sp-row" key={key}>
                <div className="sp-grid">
                  {COLUMNS.map(col => (
                    <Fragment key={col.id}>{col.render(r, c, open)}</Fragment>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ================= Popup chi tiết đơn ================= */
const Field = ({ k, v, full }) => (
  <div className={`sp-stack ${full ? 'sp-full' : ''}`}>
    <span className="sp-k">{k}</span>
    <span className="sp-v">{v}</span>
  </div>
)

export function PaymentDetailModal({ row, onHide }) {
  const items = useMemo(() => (row ? orderItems(row) : []), [row])
  return (
    <Modal
      show={!!row}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      dialogClassName="sp-dlg"
      aria-labelledby="sp-dlg-title"
    >
      {row && (
        <>
          <Modal.Header closeButton closeLabel="Đóng">
            <h3 className="sp-dlg-title" id="sp-dlg-title">
              Đơn #{row.OrderID}
              <span className={`sp-pill ${row.PayCode}`}>
                {TYPE_LABEL[row.PayCode] || 'Khác'}
              </span>
            </h3>
          </Modal.Header>
          <Modal.Body className="sp-dlg-body">
            <section className="sp-dlg-sec sp-dlg-lg">
              <h4>Khách hàng</h4>
              <div className="sp-dlg-grid">
                <Field k="Tên khách hàng" v={row.SenderName || '–'} />
                <Field
                  k="Số điện thoại"
                  v={normPhone(row.SenderPhone) || '–'}
                />
                <Field k="ID khách hàng" v={row.SenderID || '–'} />
              </div>
            </section>
            <section className="sp-dlg-sec sp-dlg-lg">
              <h4>Chi tiết đơn</h4>
              {items.length ? (
                <table className="sp-dlg-items">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mã</th>
                      <th>Tên</th>
                      <th className="sp-r">Số lượng</th>
                      <th className="sp-r">Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, idx) => (
                      <tr key={idx}>
                        <td>{i.id}</td>
                        <td>{i.pcode || '–'}</td>
                        <td>{i.name}</td>
                        <td className="sp-r">{qty(i.qty)}</td>
                        <td className="sp-r">{money(i.tp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <span className="sp-small">–</span>
              )}
            </section>
            <section className="sp-dlg-sec">
              <h4>Giá và giảm giá</h4>
              <div className="sp-dlg-grid">
                <Field k="Nguyên giá" v={money(row.TotalProdValue)} />
                <Field
                  k="Giảm giá / KM"
                  v={money(n(row.TotalProdValue) - n(row.TotalValue))}
                />
                <Field k="Sau giảm giá" v={money(row.TotalValue)} />
                <Field k="Mã giảm giá" v={row.VCode || '–'} />
                <Field k="Giá trị mã giảm giá" v={voucherValue(row)} />
                <Field k="Sau mã giảm giá" v={money(row.ToMoney)} />
                <Field k="Giảm giá cả đơn" v={orderDiscount(row)} />
                <Field k="Thanh toán" v={money(row.ToPay)} />
              </div>
            </section>
            <section className="sp-dlg-sec">
              <h4>Thông tin đơn</h4>
              <div className="sp-dlg-grid">
                <Field
                  k="Ngày dự kiến thanh toán"
                  v={row.DayToPay ? vnDate(row.DayToPay) : '–'}
                />
                <Field k="Ghi chú" v={row.Desc || '–'} full />
              </div>
            </section>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}

/* ================= Toàn bộ phần nội dung ================= */
export default function PaymentReport({
  summary,
  rows,
  loading,
  from,
  to,
  payTypes,
  pageStart,
  total,
  pagination
}) {
  const [detail, setDetail] = useState(null)
  const types = payTypes && payTypes.length ? payTypes : ALL_TYPES

  return (
    <div className="sp">
      <section aria-labelledby="sp-h-tong">
        <div className="sp-sec-head">
          <h2 className="sp-h2" id="sp-h-tong">
            Tổng cộng toàn kỳ
          </h2>
          <span className="sp-hint">
            {vnDate(from)} – {vnDate(to)} · không đổi khi chuyển trang
          </span>
        </div>
        <PaymentTotals summary={summary} />
      </section>

      <section className="sp-list" aria-labelledby="sp-h-ds">
        <div className="sp-list-head">
          <h2 className="sp-h2" id="sp-h-ds">
            Danh sách thanh toán
          </h2>
          <div className="sp-chips" aria-label="Kiểu thanh toán đang lọc">
            {types.map(c => (
              <span key={c} className={`sp-pill ${c}`}>
                {TYPE_LABEL[c]}
              </span>
            ))}
          </div>
        </div>
        <div aria-busy={loading}>
          {loading ? (
            <div className="sp-loading">
              <div className="spinner spinner-primary" />
            </div>
          ) : (
            <PaymentTable rows={rows} onOpen={setDetail} />
          )}
        </div>
        {!loading && total > 0 && (
          <div className="sp-range">
            Hiển thị {pageStart + 1}–{pageStart + rows.length} trong {total}{' '}
            dòng
          </div>
        )}
        <div className="sp-pager">{pagination}</div>
      </section>

      <PaymentDetailModal row={detail} onHide={() => setDetail(null)} />
    </div>
  )
}
