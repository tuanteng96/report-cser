import React from 'react'
import { render, screen, within } from '@testing-library/react'
import OverviewBlocks from '../OverviewBlocks'
import { BLOCKS } from '../query'

const fmt = n => new Intl.NumberFormat('vi-VN').format(n)
const key = (Key, Value, ByStock) => ({
  Key,
  Value,
  Count: 0,
  Qty: 0,
  ByStock: ByStock || []
})

// Số liệu lấy từ kết quả API thật ngày 14/11/2026 (đã gộp)
const DATA = {
  'khach-hang': {
    loading: false,
    groups: [
      {
        GroupTitle: 'Khách tạo mới',
        GroupValue: 2,
        Keys: [
          key('Khách tạo từ phần mềm', 2, [
            { StockID: 1, StockTitle: 'Cơ sở Hà Nội', Value: 1 },
            { StockID: 2, StockTitle: 'Cơ sở HCM', Value: 1 }
          ]),
          key('Khách đăng ký từ web / app', 0)
        ]
      }
    ]
  },
  'ban-hang': {
    loading: false,
    groups: [
      {
        GroupTitle: 'Đơn hàng mới',
        GroupValue: 21330000,
        Keys: [key('Nguyên giá', 21330000), key('Thanh toán Ví', -100000)]
      }
    ]
  },
  'dich-vu': { loading: true, groups: [] },
  'thu-chi': {
    loading: false,
    groups: [
      {
        GroupTitle: 'Tổng Chi',
        GroupValue: 1000000,
        Keys: [key('Chi', 1000000)]
      },
      {
        GroupTitle: 'Tồn ngày',
        GroupValue: 10530000,
        Keys: [key('Tồn trong ngày', 10530000)]
      }
    ]
  },
  'nhan-vien': {
    loading: false,
    groups: [
      {
        GroupTitle: 'Nhân viên đi làm',
        GroupValue: 0,
        Keys: [key('Đã về', 0)]
      },
      {
        GroupTitle: 'Tiền tour / HH / DS',
        GroupValue: -2567000,
        Keys: [key('Tổng Hoa hồng', -2320000)]
      }
    ]
  }
}

const card = title =>
  screen.getByRole('heading', { name: title }).closest('section')

describe('Tổng quan cơ sở – 5 khối', () => {
  it('hiện đủ 5 khối theo thứ tự bản mẫu', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    expect(screen.getAllByRole('heading').map(h => h.textContent)).toEqual([
      'Khách hàng',
      'Bán hàng',
      'Dịch vụ',
      'Thu chi',
      'Nhân viên'
    ])
  })

  it('khách hàng: tổng có dấu, chú thích theo từng cơ sở khi nhiều cơ sở', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    const c = card('Khách hàng')
    expect(within(c).getByText('Tổng khách hàng')).toBeInTheDocument()
    expect(c.querySelector('.so-pill').textContent).toBe('+2')
    const row = within(c).getByText('Khách tạo từ phần mềm').closest('li')
    expect(row).toHaveAttribute('title', 'Cơ sở Hà Nội: 1\nCơ sở HCM: 1')
    // một cơ sở: không cần chú thích
    expect(
      within(c).getByText('Khách đăng ký từ web / app').closest('li')
    ).not.toHaveAttribute('title')
  })

  it('bán hàng: tiền định dạng VN, giữ dấu âm ở chỉ số', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    const c = card('Bán hàng')
    expect(c.querySelector('.so-pill').textContent).toBe(`+${fmt(21330000)}`)
    expect(within(c).getByText(`-${fmt(100000)}`)).toBeInTheDocument()
  })

  it('đang tải hiện khung chờ', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    expect(card('Dịch vụ').querySelector('.so-skel')).not.toBeNull()
  })

  it('thu chi: "Tồn ngày" không liệt kê chỉ số', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    const c = card('Thu chi')
    expect(within(c).getByText('Chi')).toBeInTheDocument()
    expect(within(c).queryByText('Tồn trong ngày')).toBeNull()
  })

  it('nhân viên: ẩn tổng của "Tiền tour / HH / DS", số tiền hiện dương', () => {
    render(<OverviewBlocks blocks={BLOCKS} data={DATA} />)
    const c = card('Nhân viên')
    const groups = c.querySelectorAll('.so-group')
    expect(groups[0].querySelector('.so-pill')).not.toBeNull()
    expect(within(groups[0]).getByText('Tổng nhân viên')).toBeInTheDocument()
    expect(groups[1].querySelector('.so-pill')).toBeNull()
    expect(within(groups[1]).getByText(fmt(2320000))).toBeInTheDocument()
  })
})
