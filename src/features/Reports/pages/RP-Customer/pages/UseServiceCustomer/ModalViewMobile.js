import React from 'react'
import TableRowModal, {
  TableRowDetails
} from 'src/features/Reports/components/TableRowModal'

export default function ModalViewMobile({ show, onHide, data, columns }) {
  return (
    <TableRowModal show={show} onHide={onHide} title={data?.MemberFullName}>
      <TableRowDetails columns={columns.slice(1, 5)} data={data} />
      {data?.ServiceList?.map((service, index) => (
        <div className="border m-15px rounded" key={index}>
          <TableRowDetails
            columns={columns.slice(5)}
            data={{ ...service, ...data }}
          />
        </div>
      ))}
    </TableRowModal>
  )
}
