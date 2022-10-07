import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { PriceHelper } from 'src/helpers/PriceHelper'
import reportsApi from 'src/api/reports.api'
import { JsonFilter } from 'src/Json/JsonFilter'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function ModalViewDetail({ show, onHide, Member }) {
  const [ListData, setListData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    MemberID: '',
    Pi: 1,
    Ps: 15
  })
  const [PCount, setPCount] = useState(0)

  useEffect(() => {
    if (show && Member) {
      setFilters({ ...filters, MemberID: Member.Id })
    } else {
      setLoading(true)
      setFilters({
        MemberID: '',
        Pi: 1,
        Ps: 15
      })
      setListData([])
      setPCount(0)
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
        const { Items, PCount } = {
          Items: data.result?.Items || [],
          PCount: data.result?.PCount || 0
        }
        setListData(Items)
        setPCount(PCount)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Id',
        title: 'ID',
        dataKey: 'Id',
        cellRenderer: ({ rowData }) => <div>#{rowData.Id}</div>,
        sortable: false,
        mobileOptions: {
          visible: true
        },
        width: 120
      },
      {
        key: 'TotalValue',
        title: 'Giá trị',
        dataKey: 'TotalValue',
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVNDPositive(rowData.TotalValue),
        mobileOptions: {
          visible: true
        },
        width: 160,
        sortable: false
      },
      {
        key: 'Tag',
        title: 'Loại',
        dataKey: 'Tag',
        cellRenderer: ({ rowData }) => getTags(rowData.Tag),
        width: 180,
        sortable: false
      },
      {
        key: 'CreateDate',
        title: 'Ngày',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        width: 150,
        sortable: false
      },
      {
        key: 'StockName',
        title: 'Ngày',
        dataKey: 'StockName',
        width: 200,
        sortable: false
      },
      {
        key: 'Content',
        title: 'Nội dung',
        dataKey: 'Content',
        width: 200,
        sortable: false
      }
    ],
    [filters]
  )

  const getTags = tag => {
    const index = JsonFilter.TagWLList.findIndex(item => item.value === tag)
    if (index > -1) {
      return JsonFilter.TagWLList[index].label
    }
    return tag
  }

  const onPagesChange = ({ Pi, Ps }) => {
    setFilters({ ...filters, Pi, Ps })
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="font-size-lg text-uppercase line-height-md">
          {Member?.FullName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-15px">
        <ReactTableV7
          rowKey="CreateDate"
          filters={filters}
          columns={columns}
          data={ListData}
          loading={loading}
          pageCount={PCount}
          onPagesChange={onPagesChange}
        />
      </Modal.Body>
    </Modal>
  )
}

ModalViewDetail.propTypes = {
  show: PropTypes.bool
}

export default ModalViewDetail
