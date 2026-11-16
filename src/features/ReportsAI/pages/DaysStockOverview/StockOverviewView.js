import React, { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { buildKpis } from './query'
import {
  BookingSection,
  CustomerSection,
  IncomeSection,
  SalesSection,
  ServiceSection,
  StaffSection
} from './Sections'

/* Nội dung trang Tổng quan cơ sở — theo bao-cao-tong-quan.html:
   menu dính (cuộn tới đâu sáng tới đó), dải 6 chỉ số, rồi
   Doanh số bán hàng mới (8) + Khách hàng (4), Đặt lịch (4) + Dịch vụ (8),
   Thu chi (4) + Nhân viên (8). Biểu đồ theo khung giờ chỉ mở bằng popup.
   Menu gom theo hàng; thứ tự theo trang (để sáng đúng mục khi cuộn). */

export const SECTIONS = [
  { id: 'tong-quan', title: 'Tổng quan' },
  { id: 'ban-hang', title: 'Bán hàng & Khách hàng' },
  { id: 'dat-lich', title: 'Đặt lịch & Dịch vụ' },
  { id: 'thu-chi', title: 'Thu chi & Nhân viên' }
]

const sectionDomId = id => `so-sec-${id}`
const fmt = n =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Math.abs(Number(n) || 0)))

/* Chiều cao phần cố định phía trên (thanh menu báo cáo + tiêu đề trang) + menu dính */
const topOffset = menuEl => {
  const fixedTop = window.innerWidth >= 1200 ? 110 : 55
  return fixedTop + (menuEl ? menuEl.offsetHeight : 0)
}

function useScrollSpy(ids, menuRef) {
  const [active, setActive] = useState(ids[0])
  const lockRef = useRef(0) // khi bấm menu: tạm khoá theo dõi cho đến khi cuộn xong

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (Date.now() < lockRef.current) return
      const line = topOffset(menuRef.current) + 24
      const tops = ids.map(id => {
        const el = document.getElementById(sectionDomId(id))
        return el ? el.getBoundingClientRect().top : Infinity
      })
      // phần cuối cùng đã chạm vạch; nếu nhiều phần cùng hàng (cùng top) thì lấy phần đầu hàng
      let idx = 0
      tops.forEach((top, i) => {
        if (top <= line) idx = i
      })
      while (idx > 0 && Math.abs(tops[idx - 1] - tops[idx]) < 2) idx--
      // cuộn tới cuối trang: sáng mục cuối (chỉ khi trang cuộn được và đã cuộn)
      const doc = document.scrollingElement || document.documentElement
      const scrollable = doc.scrollHeight > window.innerHeight + 2
      if (
        scrollable &&
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2
      ) {
        idx = ids.length - 1
      }
      setActive(ids[idx])
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      frame && window.cancelAnimationFrame(frame)
    }
  }, [ids, menuRef])

  const goTo = useCallback(
    id => {
      const el = document.getElementById(sectionDomId(id))
      if (!el) return
      setActive(id)
      lockRef.current = Date.now() + 800
      const top =
        el.getBoundingClientRect().top +
        window.scrollY -
        topOffset(menuRef.current) -
        16
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      )?.matches
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    },
    [menuRef]
  )

  return [active, goTo]
}

function KpiBox({ k }) {
  return (
    <div className={clsx('so-kpi', k.tone && `so-kpi--${k.tone}`)}>
      <span className="so-kpi__label">{k.label}</span>
      {k.loading ? (
        <>
          <div className="so-skel__line so-skel__line--big"></div>
          <div className="so-skel__line w-60"></div>
        </>
      ) : (
        <>
          <b className="so-kpi__value">
            {fmt(k.value)}
            {k.unit === 'money' && <i>₫</i>}
            {k.extra && <span className="so-kpi__extra">{k.extra}</span>}
          </b>
          <small className="so-kpi__sub">{k.sub}</small>
        </>
      )}
    </div>
  )
}

const ids = SECTIONS.map(s => s.id)

function StockOverviewView({
  data,
  fetchList,
  fetchServiceGroups,
  menuAction // nút bên phải menu (vd. So sánh giữa các cơ sở)
}) {
  const menuRef = useRef(null)
  const [active, goTo] = useScrollSpy(ids, menuRef)
  const kpis = buildKpis(data)

  return (
    <div className="so-view">
      <nav className="so-menu" ref={menuRef} aria-label="Các phần báo cáo">
        <ul className="so-menu__list">
          {SECTIONS.map(s => (
            <li key={s.id}>
              <button
                type="button"
                className={clsx(
                  'so-menu__item',
                  active === s.id && 'is-active'
                )}
                aria-current={active === s.id ? 'true' : undefined}
                onClick={() => goTo(s.id)}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
        {menuAction && <div className="so-menu__right">{menuAction}</div>}
      </nav>

      <div className="so-main">
        <section
          id={sectionDomId('tong-quan')}
          className="so-kpis"
          aria-label="Chỉ số chính"
          style={{ '--kpi-n': kpis.length }}
        >
          {kpis.map(k => (
            <KpiBox key={k.id} k={k} />
          ))}
        </section>
        <SalesSection
          state={data['ban-hang']}
          orders={data.orders}
          debts={data.debts}
          fetchList={fetchList}
        />
        <CustomerSection
          state={data['khach-hang']}
          week={data.week}
          fetchList={fetchList}
        />
        <BookingSection state={data['dich-vu']} fetchList={fetchList} />
        <ServiceSection
          state={data['dich-vu']}
          services={data.services}
          fetchList={fetchList}
          fetchServiceGroups={fetchServiceGroups}
        />
        <IncomeSection state={data['thu-chi']} fetchList={fetchList} />
        <StaffSection state={data['nhan-vien']} fetchList={fetchList} />
      </div>
    </div>
  )
}

export default StockOverviewView
