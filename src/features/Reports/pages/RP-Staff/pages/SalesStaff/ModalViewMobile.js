import React from 'react'
import TableRowModal, {
  TableRowDetails
} from 'src/features/Reports/components/TableRowModal'

export default function ModalViewMobile({
  show,
  onHide,
  data,
  columns,
  filters
}) {
  if (['2', '3', '4', '5'].includes(filters.ShowsType)) {
    return (
      <TableRowModal
        show={show}
        onHide={onHide}
        data={data}
        columns={columns}
        title={data?.Nhanvien || data?.nhan_vien || data?.Staff?.FullName}
      />
    )
  }
  return (
    <TableRowModal show={show} onHide={onHide} title="Chi tiết doanh số">
      <TableRowDetails columns={columns.slice(0, 2)} data={data} />
      {data?.StaffsList?.map((staff, index) => (
        <div className="border m-15px rounded" key={index}>
          <TableRowDetails
            columns={columns.slice(2, 6)}
            data={{ ...staff, TongThucStaff: staff.TongThuc }}
          />
          {staff.OrdersList?.map((order, orderIndex) => (
            <div className="border-top border-gray-200" key={orderIndex}>
              <TableRowDetails columns={columns.slice(6)} data={order} />
            </div>
          ))}
        </div>
      ))}
    </TableRowModal>
  )
}
