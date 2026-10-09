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
  if (filters.ShowsX === '3') {
    return (
      <TableRowModal
        show={show}
        onHide={onHide}
        data={data}
        columns={columns}
        title={data?.nhan_vien}
      />
    )
  }
  return (
    <TableRowModal show={show} onHide={onHide} title="Chi tiết hoa hồng">
      <TableRowDetails columns={columns.slice(0, 2)} data={data} />
      {data?.StaffsList?.map((staff, index) => (
        <div className="border m-15px rounded" key={index}>
          <TableRowDetails
            columns={columns.slice(2, 4)}
            data={{ ...staff, TongThucStaff: staff.TongThuc }}
          />
          {staff.OrdersList?.map((order, orderIndex) => (
            <div className="border-top border-gray-200" key={orderIndex}>
              <TableRowDetails columns={columns.slice(4)} data={order} />
            </div>
          ))}
        </div>
      ))}
    </TableRowModal>
  )
}
