import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'
import reportsApi from 'src/api/reports.api'
import moment from 'moment'
import { useMutation, useQuery } from '@tanstack/react-query'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'

let CellEdit = ({ rowData, id, setId, onRefetch, hasRight }) => {
  let [value, setValue] = useState(rowData.GuestCount)

  useEffect(() => {
    setValue(rowData.GuestCount)
  }, [rowData.GuestCount])

  const didMount = useRef(false) // chặn submit lần đầu
  const userChange = useRef(false) // chỉ submit khi user gõ

  const addMutation = useMutation({
    mutationFn: async body => {
      let data = await reportsApi.updateGuestsCount(body)
      await onRefetch()
      return data
    }
  })

  const onSubmit = newValue => {
    setId(rowData?.ID)
    addMutation.mutate(
      {
        CheckInID: rowData?.ID,
        Count: newValue
      },
      {
        onSuccess: data => {
          setId(null)
        }
      }
    )
  }

  const handleValueChange = val => {
    userChange.current = true
    setValue(
      typeof val?.floatValue !== 'undefined' ? val.floatValue : val.value
    )
  }

  useEffect(() => {
    // Lần đầu mount thì không làm gì
    if (!didMount.current) {
      didMount.current = true
      return
    }

    // Nếu chưa có hành động từ user => bỏ qua
    if (!userChange.current) return

    const timeout = setTimeout(() => {
      onSubmit(value)
    }, 500)

    return () => clearTimeout(timeout)
  }, [value])
  if (hasRight) {
    return (
      <div className="position-relative">
        <NumberFormat
          allowNegative={false}
          name="GuestCount"
          placeholder="Nhập số lượng khách"
          className={`form-control`}
          isNumericString={true}
          //thousandSeparator={true}
          value={value}
          onValueChange={handleValueChange}
          autoComplete="off"
          disabled={id && id !== rowData.ID}
        />
        {id && id === rowData.ID && (
          <div
            className="top-0 right-0 flex items-center justify-center w-[40px] h-full position-absolute"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="w-6 text-gray-200 animate-spin fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
    )
  }

  return <div>{rowData.GuestCount}</div>
}

function PickerView({ children, refetch, filters }) {
  const { rightTree, CrStockID } = useSelector(({ auth }) => ({
    rightTree: auth?.Info?.rightTree,
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  let [visible, setVisible] = useState(false)
  let [params, setParams] = useState({
    StockID: filters?.StockID,
    DateStart: filters?.DateStart,
    DateEnd: filters?.DateEnd,
    Pi: 1,
    Ps: 15
  })
  let [id, setId] = useState(null)
  let [hasRight, setHasRight] = useState(true)

  const open = () => setVisible(true)
  const onHide = () => {
    setVisible(false)
    refetch()
  }

  let elRef = useRef(null)

  useEffect(() => {
    const hasRight =
      rightTree?.groups?.some(
        p =>
          p.group === 'Chức năng khác' &&
          p.rights?.some(
            r =>
              r.name === 'adminTools' &&
              r.subs?.some(s => {
                if (s.name !== 'adminTools_byStock' || !s.hasRight) return false
                if (s.IsAllStock) return true
                return s.stocksList?.some(x => x.ID === Number(CrStockID))
              })
          )
      ) || false
    setHasRight(hasRight)
  }, [rightTree, CrStockID])

  useEffect(() => {
    setParams(prevState => ({
      ...prevState,
      StockID: filters?.StockID,
      DateStart: filters?.DateStart,
      DateEnd: filters?.DateEnd,
      Pi: 1
    }))
  }, [filters])

  const {
    isLoading,
    data,
    refetch: onRefetch
  } = useQuery({
    queryKey: ['PreviewCountMember', { ...params }],
    queryFn: async () => {
      const { data } = await reportsApi.getGuestsCount({
        ...params,
        StockID: params?.StockID,
        From: params?.DateStart
          ? moment(params?.DateStart).format('YYYY-MM-DD')
          : '',
        To: params?.DateEnd ? moment(params?.DateEnd).format('YYYY-MM-DD') : ''
      })
      return data || null
    },
    keepPreviousData: true,
    enabled: visible
  })

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          params.Ps * (params.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'FullName',
        title: 'Khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GuestCount',
        title: 'Số lượng khách',
        dataKey: 'GuestCount',
        cellRenderer: props => (
          <CellEdit
            {...props}
            refetch={refetch}
            id={id}
            setId={setId}
            onRefetch={onRefetch}
            hasRight={hasRight}
          />
        ),
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ],
    [params, id, hasRight]
  )

  return (
    <AnimatePresence>
      <>
        {children({ open: open })}

        {visible &&
          createPortal(
            <div className="fixed z-[125001] inset-0 flex justify-end flex-col">
              <motion.div
                className="relative z-20 flex flex-col h-full bg-white"
                initial={{ opacity: 0, translateY: '100%' }}
                animate={{ opacity: 1, translateY: '0%' }}
                exit={{ opacity: 0, translateY: '100%' }}
              >
                <div className="relative flex justify-between px-4 py-4 border-b md:py-5">
                  <div className="flex align-items-center">
                    <div className="text-lg font-bold md:text-2xl">
                      Khách phục vụ
                    </div>
                  </div>
                  <div
                    className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-4 top-2/4 -translate-y-2/4"
                    onClick={onHide}
                  >
                    <XMarkIcon className="w-6 md:w-8" />
                  </div>
                </div>
                <div
                  className="p-4 overflow-auto grow md:overflow-hidden"
                  ref={elRef}
                >
                  <ReactTableV7
                    rowKey="ID"
                    rowHeight={60}
                    overscanRowCount={60}
                    filters={{
                      Pi: params.Pi,
                      Ps: params.Ps
                    }}
                    columns={columns}
                    data={data?.lst || []}
                    loading={isLoading}
                    pageCount={data?.pCount}
                    onPagesChange={({ Pi, Ps }) => {
                      setParams(prevState => ({
                        ...prevState,
                        Pi,
                        Ps
                      }))
                    }}
                    maxHeight={elRef?.current?.clientHeight - 90}
                  />
                </div>
              </motion.div>
            </div>,
            document.getElementById('root')
          )}
      </>
    </AnimatePresence>
  )
}

export default PickerView
