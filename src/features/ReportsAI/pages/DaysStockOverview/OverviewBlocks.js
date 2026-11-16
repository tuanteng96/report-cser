import React from 'react'
import clsx from 'clsx'
import './OverviewBlocks.css'

/* Hiển thị 5 khối giống trang mẫu (act20=daily): Khách hàng, Bán hàng, Dịch vụ, Thu chi, Nhân viên.
   Mỗi nhóm: icon + tên nhóm + chữ phụ + tổng; bên dưới là từng chỉ số.
   Rê chuột vào chỉ số để xem số liệu theo từng cơ sở. */

const fmtMoney = n =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0))
const fmtAbs = n => fmtMoney(Math.abs(Number(n) || 0))
const fmtCount = n => String(Math.round(Number(n) || 0))

// Màu chấm của khối Khách hàng (theo bản mẫu)
const CUSTOMER_COLORS = {
  'Khách tạo từ phần mềm': '#3699FF',
  'Khách đăng ký từ web / app': '#F64E60',
  'Khách mới tải app': '#8950FC',
  'Khách cũ tải app': '#EEE5FF',
  'Khách chỉ làm dịch vụ': '#C9F7F5',
  'Khách chỉ phát sinh mua': '#1BC5BD',
  'Khách phát sinh mua & làm dịch vụ': '#06837d'
}

const TONES = ['so-tone-blue', 'so-tone-purple', 'so-tone-green']

/* Quy tắc hiển thị từng khối — bám theo bản mẫu */
const RULES = {
  'khach-hang': {
    icons: ['fa-user-plus', 'fa-arrow-down-to-bracket', 'fa-money-bill-wave'],
    sub: () => 'Tổng khách hàng',
    total: g => fmtCount(Math.abs(g.GroupValue)),
    key: k => fmtCount(k.Value),
    dot: k => CUSTOMER_COLORS[k.Key]
  },
  'ban-hang': {
    icons: ['fa-cart-shopping', 'fa-layer-group', 'fa-money-bill-wave'],
    sub: () => 'Tổng tiền',
    total: g => fmtAbs(g.GroupValue),
    key: k => fmtMoney(k.Value)
  },
  'dich-vu': {
    icons: ['fa-calendar-days', 'fa-heart'],
    sub: (g, i) => (i === 0 ? 'Tổng đặt lịch' : 'Tổng buổi dịch vụ'),
    total: g => fmtCount(Math.abs(g.GroupValue)),
    key: k => fmtCount(k.Value)
  },
  'thu-chi': {
    icons: ['fa-money-bill-wave'],
    sub: () => 'Tổng tiền',
    total: g => fmtAbs(g.GroupValue),
    key: k => fmtMoney(k.Value),
    hideKeys: g => g.GroupTitle === 'Tồn ngày'
  },
  'nhan-vien': {
    icons: ['fa-users', 'fa-money-bill-wave'],
    sub: (g, i) => (i === 0 ? 'Tổng nhân viên' : 'Tổng tiền'),
    total: g => fmtAbs(g.GroupValue),
    key: k => fmtAbs(k.Value),
    hideTotal: g =>
      g.GroupTitle === 'Tiền tour / HH / DS' || g.GroupTitle === 'Thưởng phạt'
  }
}

// Chú thích theo cơ sở: "Cơ sở Hà Nội: 2 · Cơ sở HCM: 1"
const byStockTip = (k, rule) =>
  k.ByStock && k.ByStock.length > 1
    ? k.ByStock.map(s => `${s.StockTitle}: ${rule.key(s)}`).join('\n')
    : undefined

function Group({ g, index, rule }) {
  const tone = TONES[index % TONES.length]
  const icon = rule.icons[Math.min(index, rule.icons.length - 1)]
  const showKeys = !(rule.hideKeys && rule.hideKeys(g)) && g.Keys.length > 0
  return (
    <div className="so-group">
      <div className="so-ghead">
        <div className={clsx('so-ico', tone)} aria-hidden="true">
          <i className={`fa-regular ${icon}`}></i>
        </div>
        <div className="so-gtext">
          <div className="so-gtitle">{g.GroupTitle}</div>
          <div className="so-gsub">{rule.sub(g, index)}</div>
        </div>
        {!(rule.hideTotal && rule.hideTotal(g)) && (
          <div className={clsx('so-pill', tone)}>
            {g.GroupValue >= 0 ? '+' : '-'}
            {rule.total(g)}
          </div>
        )}
      </div>
      {showKeys && (
        <ul className="so-keys">
          {g.Keys.map(k => (
            <li key={k.Key} className="so-key" title={byStockTip(k, rule)}>
              <span
                className="so-dot"
                style={
                  rule.dot && rule.dot(k) ? { background: rule.dot(k) } : null
                }
                aria-hidden="true"
              ></span>
              <span className="so-kname">{k.Key}</span>
              <span className="so-kval">{rule.key(k)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="so-skel" aria-hidden="true">
      {[0, 1].map(i => (
        <div className="so-group" key={i}>
          <div className="so-ghead">
            <div className="so-ico so-skel-box"></div>
            <div className="so-gtext">
              <div className="so-skel-line w-60"></div>
              <div className="so-skel-line w-30"></div>
            </div>
          </div>
          <div className="so-skel-line"></div>
          <div className="so-skel-line"></div>
        </div>
      ))}
    </div>
  )
}

export function OverviewBlock({ type, title, state }) {
  const rule = RULES[type]
  const groups = state?.groups || []
  return (
    <section className="so-card" aria-busy={!!state?.loading}>
      <h2 className="so-title">{title}</h2>
      {state?.loading ? (
        <Skeleton />
      ) : state?.error ? (
        <div className="so-error">{state.error}</div>
      ) : groups.length ? (
        groups.map((g, i) => (
          <Group key={g.GroupTitle} g={g} index={i} rule={rule} />
        ))
      ) : (
        <div className="so-empty">Không có dữ liệu</div>
      )}
    </section>
  )
}

export default function OverviewBlocks({ blocks, data }) {
  return (
    <div className="so-grid">
      {blocks.map(b => (
        <OverviewBlock
          key={b.type}
          type={b.type}
          title={b.title}
          state={data[b.type]}
        />
      ))}
    </div>
  )
}
