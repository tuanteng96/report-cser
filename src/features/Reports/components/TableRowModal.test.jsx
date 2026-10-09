import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TableRowModal, {
  TableRowDetails
} from 'src/features/Reports/components/TableRowModal'
import ExpenseModal from 'src/features/Reports/pages/RP-Customer/pages/ExpenseCustomer/ModalViewMobile'
import FrequencyModal from 'src/features/Reports/pages/RP-Customer/pages/FrequencyUseCustomer/ModalViewMobile'
import SalesStaffModal from 'src/features/Reports/pages/RP-Staff/pages/SalesStaff/ModalViewMobile'
import RoseStaffModal from 'src/features/Reports/pages/RP-Staff/pages/RoseStaff/ModalViewMobile'
import { PriceHelper } from 'src/helpers/PriceHelper'

const field = dataKey => ({ dataKey, title: dataKey })
const money = dataKey => ({
  ...field(dataKey),
  cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData[dataKey])
})

test('uses table renderers, nested fields and legacy formatters without losing zero or signed decimals', () => {
  const hidden = jest.fn(() => {
    throw new Error('A hidden column must not be evaluated')
  })
  render(
    <TableRowDetails
      data={{
        Member: { ID: 17 },
        Phone: '0901234567',
        Qty: 0,
        Vi: -1234.5,
        ReducedValue: 10
      }}
      columns={[
        { title: 'STT', cellRenderer: hidden },
        { title: 'Cost', hidden: true, cellRenderer: hidden },
        field('Member.ID'),
        field('Qty'),
        money('Vi'),
        {
          title: 'Giảm giá',
          dataKey: 'computed',
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatValueVoucher(rowData.ReducedValue)
        },
        {
          text: 'Điện thoại',
          dataField: 'Phone',
          formatter: (cell, row) => `${cell} / #${row.Member.ID}`
        }
      ]}
    />
  )
  expect(screen.getByText('17')).toBeInTheDocument()
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText('-1.234,5')).toBeInTheDocument()
  expect(screen.getByText('10%')).toBeInTheDocument()
  expect(screen.getByText('0901234567 / #17')).toBeInTheDocument()
  expect(screen.queryByText('Cost')).not.toBeInTheDocument()
  expect(hidden).not.toHaveBeenCalled()
})

test('changing table mode updates visible columns and their renderer', () => {
  const data = { ID: 1, MemberID: 77, Value: 99 }
  const { rerender } = render(
    <TableRowDetails data={data} columns={[field('ID')]} />
  )
  expect(screen.getByText('1')).toBeInTheDocument()
  rerender(
    <TableRowDetails
      data={data}
      columns={[
        { ...field('ID'), hidden: true },
        {
          ...field('MemberID'),
          cellRenderer: ({ rowData }) => `KH #${rowData.MemberID}`
        }
      ]}
    />
  )
  expect(screen.queryByText('ID')).not.toBeInTheDocument()
  expect(screen.getByText('KH #77')).toBeInTheDocument()
})

test('the modal close button calls onHide', () => {
  const onHide = jest.fn()
  render(
    <TableRowModal
      show
      onHide={onHide}
      data={{ Qty: 0 }}
      columns={[field('Qty')]}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Đóng' }))
  expect(onHide).toHaveBeenCalledTimes(1)
})

test('expense details keep customer creation and each order purchase date and payments separate', () => {
  const columns = [
    { title: 'STT' },
    field('CreateDate'),
    field('MemberFullName'),
    field('MemberPhone'),
    field('StockName'),
    money('TongChiTieu'),
    field('NgayMuaHang'),
    field('CoSoMuaHang'),
    money('DaThanhToan'),
    money('Vi'),
    money('TheTien')
  ]
  render(
    <ExpenseModal
      show
      columns={columns}
      data={{
        MemberFullName: 'Khách A',
        CreateDate: 'customer-date',
        StockName: 'customer-stock',
        OrdersList: [
          {
            CreateDate: 'purchase-one',
            StockName: 'stock-one',
            DaThanhToan: 1500,
            Vi: -12.5,
            TheTien: 500
          },
          {
            CreateDate: 'purchase-two',
            StockName: 'stock-two',
            DaThanhToan: 2500,
            Vi: -22.5,
            TheTien: 600
          }
        ]
      }}
    />
  )
  for (const value of [
    'customer-date',
    'purchase-one',
    'purchase-two',
    'stock-one',
    'stock-two',
    '1.500',
    '2.500',
    '-12,5',
    '-22,5',
    '500',
    '600'
  ]) {
    expect(screen.getByText(value)).toBeInTheDocument()
  }
})

test('frequency details preserve parent and service frequencies, then switch to the other data shape', () => {
  const columns = [
    { title: 'STT' },
    field('CreateDate'),
    field('MemberFullName'),
    field('MemberPhone'),
    field('StockName'),
    field('TanSuatSD'),
    field('CreateDateProd'),
    field('Title'),
    field('LastUsedTime'),
    field('TanSuatSDProd')
  ]
  const { rerender } = render(
    <FrequencyModal
      show
      View={0}
      columns={columns}
      data={{
        MemberFullName: 'Khách A',
        TanSuatSD: 3,
        ProdsList: [
          { CreateDate: 'purchase-date', Title: 'Dịch vụ A', TanSuatSD: 7 }
        ]
      }}
    />
  )
  expect(screen.getByText('3')).toBeInTheDocument()
  expect(screen.getByText('7')).toBeInTheDocument()
  expect(screen.getByText('purchase-date')).toBeInTheDocument()
  rerender(
    <FrequencyModal
      show
      View={1}
      columns={[field('Member.ID'), money('Present_vi')]}
      data={{
        Member: { ID: 87, FullName: 'Khách B' },
        Present_vi: -1200
      }}
    />
  )
  expect(screen.getByText('87')).toBeInTheDocument()
  expect(screen.getByText('-1.200')).toBeInTheDocument()
  expect(screen.queryByText('Dịch vụ A')).not.toBeInTheDocument()
})

test.each(['3', '4'])(
  'staff sales mode %s uses the flat KPI data',
  ShowsType => {
    render(
      <SalesStaffModal
        show
        filters={{ ShowsType }}
        columns={[field('nv_id'), field('StockTitle'), money('con_lai')]}
        data={{
          nhan_vien: 'Nhân viên A',
          nv_id: 18,
          StockTitle: 'Cơ sở A',
          con_lai: -550.5
        }}
      />
    )
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('Cơ sở A')).toBeInTheDocument()
    expect(screen.getByText('-550,5')).toBeInTheDocument()
  }
)

test('staff reward mode uses the already calculated table reward without rounding again', () => {
  render(
    <SalesStaffModal
      show
      filters={{ ShowsType: '2' }}
      columns={[
        field('Staff.ID'),
        field('CreateDate'),
        field('StockTitle'),
        money('ThresholdRewards')
      ]}
      data={{
        Staff: { ID: 41, FullName: 'Nhân viên A' },
        CreateDate: 'reward-date',
        StockTitle: 'Cơ sở bán',
        ThresholdRewards: 1235
      }}
    />
  )
  expect(screen.getByText('41')).toBeInTheDocument()
  expect(screen.getByText('reward-date')).toBeInTheDocument()
  expect(screen.getByText('Cơ sở bán')).toBeInTheDocument()
  expect(screen.getByText('1.235')).toBeInTheDocument()
})

test('commission mode 3 renders returns from the active table columns', () => {
  render(
    <RoseStaffModal
      show
      filters={{ ShowsX: '3' }}
      columns={[
        field('ngay'),
        field('don_hang'),
        {
          title: 'Hoa hồng',
          cellRenderer: ({ rowData }) =>
            PriceHelper.formatVND(
              rowData.tra_lai_don_hang ? rowData.khau_tru : rowData.gia_tri
            )
        }
      ]}
      data={{
        ngay: 'return-date',
        don_hang: 99,
        tra_lai_don_hang: true,
        khau_tru: -250,
        gia_tri: 1000
      }}
    />
  )
  expect(screen.getByText('return-date')).toBeInTheDocument()
  expect(screen.getByText('99')).toBeInTheDocument()
  expect(screen.getByText('-250')).toBeInTheDocument()
  expect(screen.queryByText('1.000')).not.toBeInTheDocument()
})

test('details tolerate the empty record while a modal is closed', () => {
  const { container } = render(
    <TableRowDetails data={null} columns={[field('Member.ID')]} />
  )
  expect(container).toBeEmptyDOMElement()
})
