import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function ModalViewDetail({ show, onHide, Member }) {
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    MemberID: '',
    Pi: 1,
    Ps: 10
  })

  useEffect(() => {
    if (show && Member) {
      setFilters({ ...filters, MemberID: Member.Id })
    } else {
      setLoading(true)
      setFilters({
        MemberID: '',
        Pi: 1,
        Ps: 10
      })
      setListData([])
      setPageTotal(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Member, show])

  useEffect(() => {
    getListWallet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListWallet = () => {
    if (!filters.MemberID) return
    !loading && setLoading(true)
    reportsApi
      .getListTotalWalletDetail(filters)
      .then(({ data }) => {
        const { Items, Total } = {
          Items: data.result?.Items || [],
          Total: data.result?.Total || 0
        }
        setListData(Items)
        setPageTotal(Total)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  const getTags = tag => {
    const index = JsonFilter.TagWLList.findIndex(item => item.value === tag)
    if (index > -1) {
      return JsonFilter.TagWLList[index].label
    }
    return tag
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="font-size-lg text-uppercase line-height-md">
          {Member?.FullName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-15px">
        <BaseTablesCustom
          data={ListData}
          textDataNull="Không có dữ liệu."
          optionsMoible={{
            itemShow: 7,
            hideBtnDetail: true
          }}
          options={{
            custom: true,
            totalSize: PageTotal,
            page: filters.Pi,
            sizePerPage: filters.Ps,
            alwaysShowAllBtns: true,
            onSizePerPageChange: sizePerPage => {
              setListData([])
              const Ps = sizePerPage
              setFilters({ ...filters, Ps: Ps, Pi: 1 })
            },
            onPageChange: page => {
              setListData([])
              const Pi = page
              setFilters({ ...filters, Pi: Pi })
            }
          }}
          columns={[
            {
              dataField: '',
              text: 'STT',
              formatter: (cell, row, rowIndex) => (
                <span className="font-number">
                  {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                </span>
              ),
              headerStyle: () => {
                return { width: '60px' }
              },
              headerAlign: 'center',
              style: { textAlign: 'center' },
              attrs: { 'data-title': 'STT' }
            },
            {
              dataField: 'Id',
              text: 'ID',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => <div>#{row.Id}</div>,
              attrs: { 'data-title': 'ID' },
              headerStyle: () => {
                return { minWidth: '100px', width: '100px' }
              }
            },
            {
              dataField: 'TotalValue',
              text: 'Giá trị',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                PriceHelper.formatVNDPositive(row.TotalValue),
              attrs: { 'data-title': 'Giá trị' },
              headerStyle: () => {
                return { minWidth: '160px', width: '160px' }
              }
            },
            {
              dataField: 'Tag',
              text: 'Loại',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => getTags(row.Tag),
              attrs: { 'data-title': 'Loại' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'CreateDate',
              text: 'Ngày',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'StockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row?.StockName,
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Content',
              text: 'Nội dung',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row?.Content,
              attrs: { 'data-title': 'Nội dung' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            }
          ]}
          loading={loading}
          keyField="Id"
          className="table-responsive-attr"
          classes="table-bordered"
        />
      </Modal.Body>
    </Modal>
  )
}

ModalViewDetail.propTypes = {
  show: PropTypes.bool
}

export default ModalViewDetail
