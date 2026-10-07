var sv = '/admin/SpreadJSExcelIO/13/'

function parseKvString(s) {
  // 1) chuẩn hoá | thành newline
  const normalized = s.replace(/\s*\|\s*/g, '\n')

  const result = normalized
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      const idx = line.indexOf(':')
      if (idx === -1) return acc
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      acc[key] = value
      return acc
    }, {})

  if (!result['Số lượng khách'] && !result['Tags'] && !result['Ghi chú']) {
    return { 'Ghi chú': s.trim() }
  }

  return result
}

var PriceHelper = {
  formatVND: price => {
    if (!price || price === 0) {
      return '0'
    } else {
      return Number(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  }
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html')
  return doc.documentElement.textContent
}

function getValueInsideBracket(str, hasPrice = false) {
  if (!str) {
    return ''
  }
  let isStringHaveBrackets = htmlDecode(str).match(/(.*)\(.*\)/)
  if (isStringHaveBrackets) {
    let val = str.match(/\(([^)]+)\)?(){1}$/)[1]
    if (val && val.split(',').length > 1) {
      if (hasPrice) {
        return val.split(',')[1]
      } else {
        return val.split(',')[0]
      }
    }
    return val
  }
}

function removeValueInsideBracket(str) {
  if (!str) {
    return ''
  }
  let isStringHaveBrackets = htmlDecode(str).match(/(.*)\(.*\)/)
  if (isStringHaveBrackets) {
    return str.match(/\(([^)]+)\)?(){1}$/)[0]
  }
}

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function sumByColumn(arr, skipCols) {
  if (arr.length === 0) return []

  const colCount = arr[0].length

  const result = []

  for (let col = 0; col < colCount; col++) {
    if (skipCols.includes(col)) {
      if (col === 0) {
        result[col] = 'TỔNG'
      } else {
        result[col] = ''
      }
    } else {
      let sum = 0
      for (let row = 0; row < arr.length; row++) {
        sum += Number(arr[row][col] || 0)
      }
      result[col] = sum
    }
  }

  return result
}

function loadResource() {
  return new Promise(rs => {
    var link = document.createElement('link')
    link.href = `${sv}gc.spread.sheets.excel2016colorful.13.2.2.mode.css`
    link.rel = 'stylesheet'
    link.onload = () => {
      var s1 = document.createElement('script')
      s1.src = `${sv}gc.spread.sheets.all.13.2.2.min.mod.js?t=1`

      var n = 0

      s1.onload = () => {
        ;[
          `${sv}gc.spread.sheets.print.13.2.2.min.js?t=1`,
          `${sv}FileSaver.min.js?t=1`,
          `${sv}gc.spread.excelio.13.2.2.min.js?t=1`
        ].forEach(src => {
          var s1 = document.createElement('script')
          s1.src = src
          s1.onload = () => {
            n++
            if (n == 3) {
              rs()
            }
          }
          document.head.appendChild(s1)
        })
      }
      document.head.appendChild(s1)
    }
    document.head.appendChild(link)
  })
}

function dataToExcel(fileName, fn, hideLoading) {
  //1. Chuẩn bị xuất
  var excelIO = new GC.Spread.Excel.IO()
  var el = document.getElementById('ex')
  if (!el) {
    el = document.createElement('div')
    el.id = 'ex'
    el.style.position = 'fixed'
    el.style.bottom = 0
    el.style.left = 0
    el.style.width = 1
    el.style.height = 1
    el.style.overflow = 'hidden'
    el.style.visibility = 'hidden'
    document.body.appendChild(el)
  }
  var inner = document.querySelector('.inner')
  if (!inner) {
    inner = document.createElement('div')
    el.style.width = '100vw'
    el.style.height = '100vh'
    el.appendChild(inner)
  }
  var workbook = new GC.Spread.Sheets.Workbook(inner)
  var sheet = workbook.getActiveSheet()

  //2. Bind json
  //let fileName = 'aaaa.xlsx';
  //var demo = [
  //    1, 2, 3
  //];
  //demo.forEach((x, i) => {
  //    sheet.getCell(0, i).value(x);
  //});

  sheet.setRowCount(300000)
  sheet.setColumnCount(100)

  fn(sheet, workbook)

  //3. Xuất
  //var json = JSON.stringify(workbook.toJSON());
  var json = workbook.toJSON()
  excelIO.save(
    json,
    function (blob) {
      window.saveAs && window.saveAs(blob, fileName || 'ezs.xlsx') //xlsx

      if (typeof hideLoading === 'function') hideLoading()
    },
    function (e) {
      console.log(e)

      if (typeof hideLoading === 'function') hideLoading()
    }
  )
}

loadResource().then(() => {
  //code here

  window.ShowButton && window.ShowButton()
  //
  //dataToExcel('aaaa.xlsx',(sheet,workbook) => {
  //    //code
  //})
})

let getStockName = StockID => {
  if (StockID) {
    let index =
      window.top.Info.Stocks &&
      window.top.Info.Stocks.findIndex(x => x.ID == StockID)
    if (index > -1) {
      return window.top.Info.Stocks[index].Title.replaceAll('.', ' ')
    }
    return ''
  }
  return 'Tất cả cơ sở'
}

window.EzsExportExcel = function ({ Url, Data, hideLoading }) {
  console.log(Url)
  console.log(Data)
  switch (Url) {
    case '/khac/bao-cao-thong-tin-pos-3':
      dataToExcel(
        `bao-cao-thong-tin-${getStockName(Data.param.Body.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { Response, TotalRow, TotalColumn } = BAO_CAO_THONG_TIN3(
            Data.result,
            Data.param.Body
          )
          sheet.setArray(2, 0, Response)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          for (let i = 0; i <= TotalRow; i++) {
            for (let j = 1; j < TotalColumn; j++) {
              if (j >= 9 && j < 12) {
                workbook.getActiveSheet().setFormatter(i + 3, j, '#,#')
              }
            }
          }

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khac/bao-cao-khoa-hoc':
      dataToExcel(
        `bao-cao-khoa-hoc-${getStockName(Data.param.Body.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var {
            Response,
            TotalRow,
            TotalColumn,
            TongNo,
            TongThanhToan,
            TongTien,
            Total
          } = BAO_CAO_KHOA_HOC(Data.result)
          sheet.setArray(2, 0, Response)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value(
              'Danh sách học viên khoá học' +
                ` (Tổng : ${Total} học viên - Tổng tiền: ${PriceHelper.formatVND(
                  TongTien
                )}) - Đã thanh toán : ${PriceHelper.formatVND(
                  TongThanhToan
                )} - Tổng nợ : ${PriceHelper.formatVND(TongNo)}`
            )
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          for (let i = 0; i <= TotalRow; i++) {
            for (let j = 1; j < TotalColumn; j++) {
              if (j >= 9 && j < 12) {
                workbook.getActiveSheet().setFormatter(i + 3, j, '#,#')
              }
            }
          }

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
        },
        hideLoading
      )
      break
    case '/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan':
      dataToExcel(
        `bao-cao-cac-phuong-thuc-thanh-toan-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { Response, TotalRow, TotalColumn } = BAO_CAO_CAC_PT_CK(
            Data.result
          )
          sheet.setArray(2, 0, Response)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách các phương thức thanh toán chuyển khoản')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/dich-vu/dat-lich':
      dataToExcel(
        `bao-cao-dat-lich` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { Response, TotalRow, TotalColumn } = BAO_CAO_DAT_LICH(
            Data.result,
            Data.param.Body.ShowsType
          )
          sheet.setArray(2, 0, Response)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách đặt lịch')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          if (Data.param.Body.ShowsType === '2') {
            const numberColumns = [16, 17, 18, 19, 20, 21, 22, 23, 24, 26]
            for (let i = 0; i <= TotalRow; i++) {
              for (const col of numberColumns) {
                workbook.getActiveSheet().setFormatter(i + 3, col, '#,##0')
              }
            }
            for (const col of numberColumns) {
              workbook.getActiveSheet().autoFitColumn(col)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/chi-tiet-sp-dv-ban-ra':
      dataToExcel(
        `bao-cao-sp-dv-ban-ra` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { Response, TotalRow, TotalColumn } = CHI_TIET_SP_DV_BAN_RA(
            Data.result
          )
          sheet.setArray(2, 0, Response)

          //title
          workbook.getActiveSheet().getCell(0, 0).value(Data.param.Body.Title)
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          for (let i = 0; i <= TotalRow; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/dich-vu/ton-dich-vu':
      dataToExcel(
        `ton-dich-vu` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { Response, TotalRow, TotalColumn } = TON_DICH_VU(Data.result)
          sheet.setArray(2, 0, Response)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Tồn dịch vụ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          for (let i = 0; i <= TotalRow; i++) {
            for (let j = 1; j < TotalColumn; j++) {
              if (j > 6) {
                workbook.getActiveSheet().setFormatter(i + 3, j, '#,#')
              }
            }
          }

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          // ==== FORMAT DÒNG TỔNG ====
          var totalRowIndex = 1 + TotalRow

          var totalRange = workbook
            .getActiveSheet()
            .getRange(totalRowIndex, 0, 1, TotalColumn)

          // nền màu
          totalRange.backColor('#FFA800')

          // chữ đậm
          totalRange.font('bold 13pt Calibri, Arial, sans-serif')

          // căn phải các cột số
          for (let j = 1; j < TotalColumn; j++) {
            workbook
              .getActiveSheet()
              .getCell(totalRowIndex, j)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.right)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case 'telesale-reminder':
      dataToExcel(
        `lich-nhac-telesale-` +
          new Date().valueOf() +
          '-' +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.options.allowDynamicArray = true
          workbook.suspendPaint()
          workbook.suspendEvent()

          var arrList = KHACH_HANG_TELESALES_REMINDER(Data.data.lst)
          var arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách khách hàng lịch nhắc')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderTop(border)

          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 7)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            workbook.getActiveSheet().getCell(i, 8).wordWrap(true)
          }

          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(8, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 7)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case 'telesale-statistical':
      dataToExcel(
        `thong-ke-cham-soc-telesale-` +
          getStockName(Data.params.filter.StockID) +
          `-` +
          new Date().valueOf(),
        (sheet, workbook) => {
          workbook.options.allowDynamicArray = true
          workbook.suspendPaint()
          workbook.suspendEvent()

          var arrList = KHACH_HANG_TELESALES_STATISTICAL(Data.data.data)
          var arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách khách hàng thống kê')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderTop(border)

          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 7)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            workbook.getActiveSheet().getCell(i, 8).wordWrap(true)
          }

          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(8, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 7)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case 'telesale':
      dataToExcel(
        `danh-sach-khach-hang-telesale-` +
          getStockName(Data.params.filter.StockID) +
          `-` +
          new Date().valueOf(),
        (sheet, workbook) => {
          workbook.options.allowDynamicArray = true
          workbook.suspendPaint()
          workbook.suspendEvent()

          var arrList = KHACH_HANG_TELESALES(Data.data.data)
          var arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 8)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 8).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderTop(border)

          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 8)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            workbook.getActiveSheet().getCell(i, 8).wordWrap(true)
          }

          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(8, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 8)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/bao-cao-ngay/khach-hang':
      // dataToExcel(
      //     `bc-ngay-khach-hang-` + Data.param.Body.DateStart + '-' + getStockName(Data.param.Body.StockID),
      //     (sheet, workbook) => {
      //         workbook.options.allowDynamicArray = true;
      //         workbook.suspendPaint();
      //         workbook.suspendEvent();

      //         let arrList = CHI_TIET_KHACH_HANG(Data.result);

      //         // Convert \r\n -> \n để Excel xuống dòng đúng
      //         arrList = arrList.map(row =>
      //             row.map(col => {
      //                 if (typeof col === "string") {
      //                     return col
      //                         .replace(/\r\n/g, "\n")  // đồng bộ xuống dòng
      //                         .replace(/\n+$/g, "");    // xóa toàn bộ \n cuối
      //                 }
      //                 return col;
      //             })
      //         );

      //         const arrListLength = arrList.length;
      //         sheet.setArray(2, 0, arrList);

      //         // Title
      //         const ws = workbook.getActiveSheet();
      //         ws.getCell(0, 0).value("Danh sách khách hàng");
      //         ws.getCell(0, 0).font("18pt Calibri, Arial, sans-serif");
      //         ws.getRange(2, 0, 1, 10).font("12pt Calibri, Arial, sans-serif").backColor("#E7E9EB");

      //         // Border
      //         const border = new GC.Spread.Sheets.LineBorder("#000", GC.Spread.Sheets.LineStyle.thin);
      //         ws.getRange(2, 0, arrListLength, 10).setBorder(border, { all: true });

      //         // Filter
      //         const cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 10);
      //         const hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange);
      //         ws.rowFilter(hideRowFilter);

      //         // Center STT
      //         for (let i = 0; i <= arrListLength; i++) {
      //             ws.getCell(i + 3, 0).hAlign(GC.Spread.Sheets.HorizontalAlign.center);
      //         }

      //         // Set wordWrap cho các cột chứa text dài
      //         const wrapCols = [7, 8, 9]; // Nội dung, dịch vụ, nghiệp vụ khác
      //         for (let r = 3; r < arrListLength + 3; r++) {
      //             wrapCols.forEach(c => {
      //                 ws.getCell(r, c).wordWrap(true);
      //             });
      //         }

      //         // Auto fit row (sau khi đã wordWrap)
      //         for (let r = 0; r < arrListLength + 3; r++) {
      //             ws.autoFitRow(r);
      //         }

      //         // Auto width cột
      //         for (let c = 0; c < 10; c++) {
      //             ws.autoFitColumn(c);
      //         }

      //         // Fix width riêng cột "Dịch vụ thực hiện"
      //         ws.setColumnWidth(8, 250, GC.Spread.Sheets.SheetArea.viewport);

      //         workbook.resumePaint();
      //         workbook.resumeEvent();
      //         hideLoading();
      //     }
      // );

      dataToExcel(
        `bc-ngay-khach-hang-` +
          Data.param.Body.DateStart +
          '-' +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.options.allowDynamicArray = true
          workbook.suspendPaint()
          workbook.suspendEvent()

          let arrList = CHI_TIET_KHACH_HANG(Data.result)

          // Convert \r\n -> \n để Excel xuống dòng đúng
          arrList = arrList.map(row =>
            row.map(col => {
              if (typeof col === 'string') {
                return col
                  .replace(/\r\n/g, '\n') // đồng bộ xuống dòng
                  .replace(/\n+$/g, '') // xóa toàn bộ \n cuối
              }
              return col
            })
          )

          const arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)

          // Title
          const ws = workbook.getActiveSheet()
          ws.getCell(0, 0).value('Danh sách khách hàng')
          ws.getCell(0, 0).font('18pt Calibri, Arial, sans-serif')
          ws.getRange(2, 0, 1, 10)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border
          const border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          ws.getRange(2, 0, arrListLength, 10).setBorder(border, { all: true })

          // Filter
          const cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 10)
          const hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          ws.rowFilter(hideRowFilter)

          // Center STT
          for (let i = 0; i <= arrListLength; i++) {
            ws.getCell(i + 3, 0).hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }

          // WordWrap cho các cột text dài
          const wrapCols = [7, 8, 9]
          for (let r = 3; r < arrListLength + 3; r++) {
            wrapCols.forEach(c => {
              ws.getCell(r, c).wordWrap(true)
            })
          }

          // TÍNH CHIỀU CAO DỰA TRÊN SỐ DÒNG TRONG TEXT
          for (let r = 3; r < arrListLength + 3; r++) {
            let maxLines = 1

            wrapCols.forEach(c => {
              const text = ws.getCell(r, c).value()
              if (typeof text === 'string') {
                const lines = text.split('\n').length
                if (lines > maxLines) maxLines = lines
              }
            })

            // HEIGHT = số dòng * 20px + 100px
            const height = maxLines * 20 + 0
            ws.setRowHeight(r, height)
          }

          // Auto width cột
          for (let c = 0; c < 10; c++) {
            ws.autoFitColumn(c)
          }

          // Fix width riêng cột "Dịch vụ thực hiện"
          ws.setColumnWidth(8, 250, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )

      break
    case '/khach-hang/tong-quan':
      dataToExcel(
        `danh-sach-ban-hang-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          //var arrHeader = Object.keys(Data.result.Members[0])
          //console.log(arrHeader)
          //var arrHeader = ['STT', 'NGÀY TẠO', 'TÊN KHÁCH HÀNG', 'SỐ ĐIỆN THOẠI',
          //    'EMAIL', 'NGÀY SINH', 'GIỚI TÍNH', 'ĐỊA CHỈ', 'QUẬN HUYỆN', 'TỈNH/THÀNH PHỐ', 'CƠ SỞ', 'NHÓM KHÁCH HÀNG',
          //    'NGUỒN', 'MÃ THẺ', 'NHÂN VIÊN CHĂM SÓC', 'VÍ', 'CÔNG NỢ', 'THẺ TIỀN']
          //var arr = [
          //    arrHeader,
          //    //['a', 'b'],
          //    //[1, 2],
          //    //[10, 12]
          //];
          //console.log(exportMemberList(Data.result))
          ///backColor,forceColor

          //sheet.getCell(0, 0).backColor('#f00')
          //sheet.getCell(0, 0).forceColor('')
          //sheet.setRowHeight(0,32)
          //sheet.setColumnWidth

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Tổng quan khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 19)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 19).backColor('#E7E9EB')
          //border
          var { Response, TotalRow, TotalColumn } = exportMemberList(
            Data.result,
            Data.param.Body.ShowsX
          )
          sheet.setArray(2, 0, Response)
          //console.log(arr.length)
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= TotalRow; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 17, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          for (let i = 0; i <= TotalRow; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 16, '#,#')
          }
          for (let i = 0; i <= TotalRow; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 15, '#,#')
          }

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          //SUM
          //workbook.getActiveSheet().getCell(Data.result.Total + 6, 17).formula = `SUM(R4:R` + (Data.result.Total + 3) +`)`

          workbook.resumePaint()
          workbook.resumeEvent()

          hideLoading()
        }
      )
      break
    case '/khach-hang/tong-hop':
      dataToExcel(
        `danh-sach-tong-hop-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          var { Response, TotalRow, TotalColumn, showsX } = exportMemberList(
            Data.result,
            Data.param.Body.ShowsX
          )
          sheet.setArray(2, 0, Response)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Tổng hợp khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 18)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 18).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 18)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= TotalRow; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          for (let i = 0; i <= TotalRow; i++) {
            if (showsX == '2') {
              workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            } else {
              workbook.getActiveSheet().setFormatter(i + 3, 17, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 16, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 15, '#,#')
            }
          }

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn + 1; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/chuyen-doi':
      dataToExcel(
        `khach-hang-chuyen-doi-${getStockName(Data.param.Body.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { List, TotalColumn } = exportCustomerConvert(Data.result)
          var arrListLength = List.length
          sheet.setArray(2, 0, List)
          //title
          workbook.getActiveSheet().getCell(0, 0).value('Khách hàng chuyển đổi')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/dich-vu':
      dataToExcel(
        `dich-vu-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { List, TotalColumn, TotalRows } = exportServiceList(
            Data.param.Body.ShowsX != '1' ? Data.result : Data,
            Data.param.Body.ShowsX
          )
          sheet.setArray(2, 0, List)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Dịch vụ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRows, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRows, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRows, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRows, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= TotalRows; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 8, '#,#')
            if (Data.param.Body.ShowsX == '1') {
              workbook.getActiveSheet().setFormatter(i + 3, 4, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 8, '#,#')
            }
            if (Data.param.Body.ShowsX == '2') {
              workbook.getActiveSheet().setFormatter(i + 3, 11, '#,#')
            }
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          for (let i = 0; i <= TotalRows; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 17, '#,#')
          }
          for (let i = 0; i <= TotalRows; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 14, '#,#')
          }

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRows + 2)
          workbook.getActiveSheet().autoFitRow(0)
          workbook
            .getActiveSheet()
            .setColumnWidth(19, 150, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(
              TotalColumn,
              150,
              GC.Spread.Sheets.SheetArea.viewport
            )
          for (let i = 1; i < TotalColumn; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 19)
              .wordWrap(true)
            workbook
              .getActiveSheet()
              .getCell(i + 3, 20)
              .wordWrap(true)
            //workbook.getActiveSheet().getCell(i + 3, 17).wordWrap(true);
            workbook.getActiveSheet().autoFitColumn(i)
            workbook.getActiveSheet().autoFitRow(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(18, 200.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(19, 200.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 1; i < TotalColumn; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 18)
              .wordWrap(true)
            workbook
              .getActiveSheet()
              .getCell(i + 3, 19)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          if (Data.param.Body.ShowsX == '3') {
            workbook
              .getActiveSheet()
              .setColumnWidth(0, 300.0, GC.Spread.Sheets.SheetArea.viewport)
          }

          if (Data.param.Body.ShowsX == '0') {
            workbook
              .getActiveSheet()
              .setColumnWidth(22, 300.0, GC.Spread.Sheets.SheetArea.viewport)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/dich-vu/dv-diem-sd-diem-khac':
      dataToExcel(
        `dv-su-dung-diem-khac-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = DV_SU_DUNG_DIEM_KHAC(Data.result)
          var arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách sử dụng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 12)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 12).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 12)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/dich-vu/dich-vu-chua-upload-anh':
      dataToExcel(
        `dv-chua-upload-anh-` +
          Data.param.Body.From +
          `-` +
          Data.param.Body.To +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = DV_CHUA_UPLOAD_ANH(Data)
          var arrListLength = arrList.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách dịch vụ chưa upload ảnh')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 12)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 12).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 12)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/chinh-sua-the':
      dataToExcel(
        `bao-cao-nghiep-vu-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportFixCard(Data.result)
          var arrListLength = exportFixCard(Data.result).length
          sheet.setArray(2, 0, arrList)
          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách nghiệp vụ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 7)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/chi-tieu':
      dataToExcel(
        `khach-hang-chi-tieu-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportSpending(Data.result).newExport
          var arrListLength = exportSpending(Data.result).newExport.length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 16)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 16).backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 16)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 16)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 16)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 16)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 16)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 16)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          function formatCenter(e, space) {
            workbook
              .getActiveSheet()
              .getCell(e, space)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          }
          var q = 0
          var arr = exportSpending(Data.result).arr
          for (let z = 0; z < arr.length; z++) {
            q += arr[z]
            if (z == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 0, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 1, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 2, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 3, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 4, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 5, q, 1, GC.Spread.Sheets.SheetArea.viewport)

              formatCenter(3, 0)
              formatCenter(3, 1)
              formatCenter(3, 2)
              formatCenter(3, 3)
              formatCenter(3, 4)
              formatCenter(3, 5)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  0,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  1,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  2,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  3,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  4,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  5,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(q - arr[z] + 3, 0)
              formatCenter(q - arr[z] + 3, 1)
              formatCenter(q - arr[z] + 3, 2)
              formatCenter(q - arr[z] + 3, 3)
              formatCenter(q - arr[z] + 3, 4)
              formatCenter(q - arr[z] + 3, 5)
            }
          }
          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 11, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 12, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 13, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 14, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 15, '#,#')
          }
          for (let i = 1; i < 20; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(9, 200.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 9)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/su-dung-dich-vu':
      dataToExcel(
        `khach-hang-su-dung-dich-vu-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportUseService(Data.result).newExport
          var arrListLength = exportUseService(Data.result).newExport.length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 11)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 11).backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 16)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 11)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 11)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 11)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 11)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 11)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          function formatCenter(e, space) {
            workbook
              .getActiveSheet()
              .getCell(e, space)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          }
          var q = 0
          var arr = exportUseService(Data.result).arr
          for (let z = 0; z < arr.length; z++) {
            q += arr[z]
            if (z == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 0, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 1, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 2, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 3, q, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 4, q, 1, GC.Spread.Sheets.SheetArea.viewport)

              formatCenter(3, 0)
              formatCenter(3, 1)
              formatCenter(3, 2)
              formatCenter(3, 3)
              formatCenter(3, 4)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  0,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  1,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  2,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  3,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  q - arr[z] + 3,
                  4,
                  arr[z],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(q - arr[z] + 3, 0)
              formatCenter(q - arr[z] + 3, 1)
              formatCenter(q - arr[z] + 3, 2)
              formatCenter(q - arr[z] + 3, 3)
              formatCenter(q - arr[z] + 3, 4)
            }
          }
          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
          }
          for (let i = 1; i < 12; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 200.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/doanh-so-giam-tru':
      dataToExcel(
        `doanh-so-giam-tru-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportSaleReduced(Data.result)
          var arrListLength = exportSaleReduced(Data.result).length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách doanh số giảm trừ (Kết thúc thẻ, xóa buổi)')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 8)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 8).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 8)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 400.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/doanh-so':
      dataToExcel(
        `ban-hang-doanh-so-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { List, TotalColumn, Rows } = DOANH_SO_DON_HANG(
            Data.result,
            Data.param.Body.ShowsX
          )
          var arrListLength = List.length
          sheet.setArray(2, 0, List)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Doanh số bán hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 8, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 11, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 12, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 13, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 14, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 15, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 16, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 17, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 18, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 19, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 20, '#,#')
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i <= TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength + 10; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 19)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          if (Number(Data.param.Body.ShowsX) === 1) {
            for (const [index, x] of Rows.entries()) {
              for (let i = 0; i <= 28; i++) {
                //i là vị trí cột
                workbook
                  .getActiveSheet()
                  .addSpan(
                    x.row,
                    i,
                    x.rowCount,
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .getCell(x.row, i)
                  .vAlign(GC.Spread.Sheets.VerticalAlign.center)
              }
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/dich-vu-xuat-hoa-don':
      dataToExcel(
        `dich-vu-xuat-hoa-don-` +
          Data.param.Body.From +
          `-` +
          Data.param.Body.To +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { List, TotalColumn, Rows } = DICH_VU_XUAT_HOA_DON(Data.result)
          var arrListLength = List.length
          sheet.setArray(2, 0, List)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Dịch vụ xuất hoá đơn')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 11, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 14, '#,#')
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i <= TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength + 10; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 19)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/sp-dv-ban-ra':
      dataToExcel(
        `ban-hang-sp-dv-ban-ra-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          //border
          if (
            Data.param.Body.ShowsType == '2' ||
            Data.param.Body.ShowsType == '3' ||
            Data.param.Body.ShowsType == '4'
          ) {
            var { Lists, Columns, Rows } = exportProdSaleList(
              Data,
              Data.param.Body.ShowsType
            )

            sheet.setArray(2, 0, Lists)
            //title
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .value('Sản phẩm dịch vụ bán ra')
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .font('18pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, Columns)
              .font('12pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, Columns)
              .backColor('#E7E9EB')
            //border
            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            workbook
              .getActiveSheet()
              .getRange(2, 0, Rows, Columns)
              .borderLeft(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, Rows, Columns)
              .borderRight(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, Rows, Columns)
              .borderBottom(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, Rows, Columns)
              .borderTop(border)
            //filter
            var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, Columns)
            var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
              cellrange
            )
            workbook.getActiveSheet().rowFilter(hideRowFilter)

            //format number
            // for (let i = 0; i <= Rows; i++) {
            //     workbook
            //         .getActiveSheet()
            //         .getCell(i + 3, 0)
            //         .hAlign(GC.Spread.Sheets.HorizontalAlign.center);
            // }
            //auto fit width and height
            //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
            workbook.getActiveSheet().autoFitRow(0)
            for (let i = -1; i < Columns; i++) {
              workbook.getActiveSheet().autoFitColumn(i)
            }

            for (let i = 0; i < Rows; i++) {
              for (let k = 0; k < Columns; k++) {
                if (k > 12) {
                  workbook.getActiveSheet().setFormatter(i + 3, k, '#,#')
                }
              }
            }
            //for (let i = 0; i <= Rows; i++) {
            //    for (let k = 5; k < Columns; k++) {
            //        workbook.getActiveSheet().setFormatter(i + 3, k, '#,#')
            //    }
            //}
          } else {
            var arrListProd = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newProd
            var arrListSer = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newSer
            var arrListCard = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newCard

            var arrListProdLength = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newProd.length
            var arrListSerLength = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newSer.length
            var arrListCardLength = exportProdSaleList(
              Data.result,
              Data.param.Body.ShowsType
            ).newCard.length
            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            if (arrListProdLength > 1) {
              //Prod
              sheet.setArray(2, 0, arrListProd)
              workbook.getActiveSheet().getCell(0, 0).value('Sản phẩm / NVL')
              workbook
                .getActiveSheet()
                .getCell(0, 0)
                .font('18pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, 7)
                .font('12pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, 7)
                .backColor('#E7E9EB')
              workbook
                .getActiveSheet()
                .getRange(2, 0, arrListProdLength, 7)
                .borderLeft(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, arrListProdLength, 7)
                .borderRight(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, arrListProdLength, 7)
                .borderBottom(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, arrListProdLength, 7)
                .borderTop(border)
              //filter
              //var cellrange3 = new GC.Spread.Sheets.Range(3, 0, 1, 3);
              //var hideRowFilter3 = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange3);
              //workbook.getActiveSheet().rowFilter(hideRowFilter3);
            }

            if (arrListSerLength > 1) {
              //newSer
              var space = arrListProdLength > 1 ? 8 : 0
              workbook.getActiveSheet().setArray(2, space, arrListSer)
              workbook
                .getActiveSheet()
                .getCell(0, space)
                .value('Dịch vụ / Phụ phí')
              workbook
                .getActiveSheet()
                .getCell(0, space)
                .font('18pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, space, 1, 7)
                .font('12pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, space, 1, 7)
                .backColor('#E7E9EB')
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListSerLength, 7)
                .borderLeft(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListSerLength, 7)
                .borderRight(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListSerLength, 7)
                .borderBottom(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListSerLength, 7)
                .borderTop(border)
              //filter
              //var cellrange1 = new GC.Spread.Sheets.Range(3, space, 1, 3);
              //var hideRowFilter1 = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange1);
              //workbook.getActiveSheet().rowFilter(hideRowFilter1);
            }

            if (arrListCardLength > 1) {
              //newCard
              var space =
                (arrListProdLength > 1 ? 8 : 0) + (arrListSerLength > 1 ? 8 : 0)
              workbook.getActiveSheet().setArray(2, space, arrListCard)
              workbook.getActiveSheet().getCell(0, space).value('Thẻ tiền')
              workbook
                .getActiveSheet()
                .getCell(0, space)
                .font('18pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, space, 1, 7)
                .font('12pt Calibri, Arial, sans-serif')
              workbook
                .getActiveSheet()
                .getRange(2, space, 1, 7)
                .backColor('#E7E9EB')
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListCardLength, 7)
                .borderLeft(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListCardLength, 7)
                .borderRight(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListCardLength, 7)
                .borderBottom(border)
              workbook
                .getActiveSheet()
                .getRange(2, space, arrListCardLength, 7)
                .borderTop(border)
              //filter
              //var cellrange2 = new GC.Spread.Sheets.Range(3, space, 1, 3);
              //var hideRowFilter2 = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange2);
              //workbook.getActiveSheet().rowFilter(hideRowFilter2);
            }

            var min_l =
              arrListProdLength + arrListSerLength + arrListCardLength >= 21
                ? arrListProdLength + arrListSerLength + arrListCardLength
                : 21
            for (let i = 0; i < min_l; i++) {
              workbook.getActiveSheet().autoFitColumn(i)
              workbook.getActiveSheet().autoFitRow(i)
              workbook.getActiveSheet().setFormatter(i, 2, '#,#')
              workbook.getActiveSheet().setFormatter(i, 3, '#,#')
              workbook.getActiveSheet().setFormatter(i, 4, '#,#')
              workbook.getActiveSheet().setFormatter(i, 8, '#,#')
              workbook.getActiveSheet().setFormatter(i, 9, '#,#')
              workbook.getActiveSheet().setFormatter(i, 10, '#,#')
              workbook.getActiveSheet().setFormatter(i, 14, '#,#')
              workbook.getActiveSheet().setFormatter(i, 15, '#,#')
              workbook.getActiveSheet().setFormatter(i, 16, '#,#')
            }
            workbook
              .getActiveSheet()
              .setColumnWidth(1, 100.0, GC.Spread.Sheets.SheetArea.viewport)

            workbook
              .getActiveSheet()
              .setColumnWidth(5, 100.0, GC.Spread.Sheets.SheetArea.viewport)
            workbook
              .getActiveSheet()
              .setColumnWidth(9, 100.0, GC.Spread.Sheets.SheetArea.viewport)
            workbook
              .getActiveSheet()
              .setColumnWidth(2, 130.0, GC.Spread.Sheets.SheetArea.viewport)
            workbook
              .getActiveSheet()
              .setColumnWidth(6, 130.0, GC.Spread.Sheets.SheetArea.viewport)
            workbook
              .getActiveSheet()
              .setColumnWidth(10, 130.0, GC.Spread.Sheets.SheetArea.viewport)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/doanh-so-thuc-thu':
      dataToExcel(
        `doanh-so-thuc-thu` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          //border
          const { Total, Pay, NewForSale } = exportActualSell(Data.result)
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin

          //Tổng
          sheet.setArray(2, 0, Total)
          workbook.getActiveSheet().getCell(0, 0).value('Tổng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 4)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 4).backColor('#E7E9EB')
          workbook.getActiveSheet().getRange(2, 0, 5, 4).borderLeft(border)
          workbook.getActiveSheet().getRange(2, 0, 5, 4).borderRight(border)
          workbook.getActiveSheet().getRange(2, 0, 5, 4).borderBottom(border)
          workbook.getActiveSheet().getRange(2, 0, 5, 4).borderTop(border)

          //Bán mới
          sheet.setArray(2, 5, NewForSale)
          workbook.getActiveSheet().getCell(0, 5).value('Bán mới')
          workbook
            .getActiveSheet()
            .getCell(0, 5)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 5, 1, 4)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 5, 1, 4).backColor('#E7E9EB')
          workbook.getActiveSheet().getRange(2, 5, 5, 4).borderLeft(border)
          workbook.getActiveSheet().getRange(2, 5, 5, 4).borderRight(border)
          workbook.getActiveSheet().getRange(2, 5, 5, 4).borderBottom(border)
          workbook.getActiveSheet().getRange(2, 5, 5, 4).borderTop(border)

          //Thanh toán nợ
          sheet.setArray(2, 10, Pay)
          workbook.getActiveSheet().getCell(0, 10).value('Thanh toán nợ')
          workbook
            .getActiveSheet()
            .getCell(0, 10)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 10, 1, 4)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 10, 1, 4).backColor('#E7E9EB')
          workbook.getActiveSheet().getRange(2, 10, 5, 4).borderLeft(border)
          workbook.getActiveSheet().getRange(2, 10, 5, 4).borderRight(border)
          workbook.getActiveSheet().getRange(2, 10, 5, 4).borderBottom(border)
          workbook.getActiveSheet().getRange(2, 10, 5, 4).borderTop(border)

          for (let i = 0; i < 100; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
            workbook.getActiveSheet().autoFitRow(i)
          }

          for (let i = 3; i < 7; i++) {
            workbook.getActiveSheet().setFormatter(i, 1, '#,#')
            workbook.getActiveSheet().setFormatter(i, 2, '#,#')
            workbook.getActiveSheet().setFormatter(i, 3, '#,#')

            workbook.getActiveSheet().setFormatter(i, 6, '#,#')
            workbook.getActiveSheet().setFormatter(i, 7, '#,#')
            workbook.getActiveSheet().setFormatter(i, 8, '#,#')

            workbook.getActiveSheet().setFormatter(i, 11, '#,#')
            workbook.getActiveSheet().setFormatter(i, 12, '#,#')
            workbook.getActiveSheet().setFormatter(i, 13, '#,#')
          }

          workbook
            .getActiveSheet()
            .setColumnWidth(1, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(2, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(3, 150.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook
            .getActiveSheet()
            .setColumnWidth(6, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(7, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(8, 150.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook
            .getActiveSheet()
            .setColumnWidth(11, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(12, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(13, 150.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/loi-nhuan':
      dataToExcel(
        `loi-nhuan-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          //border
          var { ListProduct, ListService } = exportProfitList(Data.result)
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          //Producs
          sheet.setArray(2, 0, ListProduct)
          workbook.getActiveSheet().getCell(0, 0).value('Sản phẩm / NVL')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, 0, ListProduct.length, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, ListProduct.length, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, ListProduct.length, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, ListProduct.length, 7)
            .borderTop(border)
          //filter
          //var cellrange3 = new GC.Spread.Sheets.Range(3, 0, 1, 3);
          //var hideRowFilter3 = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange3);
          //workbook.getActiveSheet().rowFilter(hideRowFilter3);

          //Services
          var space = ListProduct.length > 1 ? 8 : 0
          workbook.getActiveSheet().setArray(2, space, ListService)
          workbook.getActiveSheet().getCell(0, space).value('Dịch vụ / Phụ phí')
          workbook
            .getActiveSheet()
            .getCell(0, space)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, space, 1, 5)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, space, 1, 5)
            .backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, space, ListService.length, 5)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, ListService.length, 5)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, ListService.length, 5)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, ListService.length, 5)
            .borderTop(border)
          //filter
          //var cellrange1 = new GC.Spread.Sheets.Range(3, space, 1, 3);
          //var hideRowFilter1 = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange1);
          //workbook.getActiveSheet().rowFilter(hideRowFilter1);

          var min_l =
            ListProduct.length + ListService.length >= 15
              ? ListProduct.length + ListService.length
              : 15
          for (let i = 0; i < min_l; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
            workbook.getActiveSheet().autoFitRow(i)
            workbook.getActiveSheet().setFormatter(i, 2, '#,#')
            workbook.getActiveSheet().setFormatter(i, 6, '#,#')
            workbook.getActiveSheet().setFormatter(i, 10, '#,#')
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(1, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(9, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(2, 130.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(6, 130.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(10, 130.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/tra-hang':
      dataToExcel(
        `ban-hang-tra-hang-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportReturnList(Data.result)
          var arrListLength = exportReturnList(Data.result).length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách trả hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 9)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 9).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 9)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 9)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 9)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 9)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 9)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < arrListLength + 20; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 7)
              .wordWrap(true)
            workbook
              .getActiveSheet()
              .getCell(i + 3, 8)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength + 20; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/thanh-toan-tra-no':
      dataToExcel(
        `thanh-toan-tra-no-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportReturnDebtList(Data.result).newExport
          var arrListLength = exportReturnDebtList(Data.result).newExport.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách thanh toán nợ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 12)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 12).backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 12)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 12)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 12)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 8, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
          }

          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < arrListLength + 20; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
            workbook.getActiveSheet().autoFitColumn(i)
          }

          function formatCenter(e, space) {
            workbook
              .getActiveSheet()
              .getCell(e, space)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          }
          //span date
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          var arr1 = exportReturnDebtList(Data.result).arr1

          var c = 0
          for (let i = 0; i < arr1.length; i++) {
            c += arr1[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 0, c, 1, GC.Spread.Sheets.SheetArea.viewport)
              formatCenter(3, 0)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  c - arr1[i] + 3,
                  0,
                  arr1[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(c - arr1[i] + 3, 0)
            }
          }

          var arr2 = exportReturnDebtList(Data.result).arr2

          var e = 0
          for (let i = 0; i < arr2.length; i++) {
            e += arr2[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 4, e, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 5, e, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 6, e, 1, GC.Spread.Sheets.SheetArea.viewport)

              formatCenter(3, 4)
              formatCenter(3, 5)
              formatCenter(3, 6)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  e - arr2[i] + 3,
                  4,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  e - arr2[i] + 3,
                  5,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  e - arr2[i] + 3,
                  6,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(e - arr2[i] + 3, 4)
              formatCenter(e - arr2[i] + 3, 5)
              formatCenter(e - arr2[i] + 3, 6)
            }
          }
          workbook.getActiveSheet().setColumnWidth(0, '150')
          //span name
          var arr3 = exportReturnDebtList(Data.result).arr3
          var d = 0
          for (let q = 0; q < arr3.length; q++) {
            d += arr3[q]
            if (q == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 1, d, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 2, d, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 3, d, 1, GC.Spread.Sheets.SheetArea.viewport)
              formatCenter(3, 1)
              formatCenter(3, 2)
              formatCenter(3, 3)
              //if (d > 4) {
              //    for (let i = 0; i <= d - 1; d++) {
              //        workbook.getActiveSheet().getCell(3, d - 1).value(0);
              //    }
              //}
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  d - arr3[q] + 3,
                  1,
                  arr3[q],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  d - arr3[q] + 3,
                  2,
                  arr3[q],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  d - arr3[q] + 3,
                  3,
                  arr3[q],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(d - arr3[q] + 3, 1)
              formatCenter(d - arr3[q] + 3, 2)
              formatCenter(d - arr3[q] + 3, 3)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/top-ban-hang-doanh-so':
      dataToExcel(
        `top-ban-hang-doanh-so-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrListSell = exportTopSaleList(Data.result).newSell
          var arrListSale = exportTopSaleList(Data.result).newSale
          var arrListSellLength = exportTopSaleList(Data.result).newSell.length
          var arrListSaleLength = exportTopSaleList(Data.result).newSale.length
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          //Sell
          sheet.setArray(2, 0, arrListSell)
          workbook.getActiveSheet().getCell(0, 0).value('TOP bán hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 3)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 3).backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListSellLength, 3)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListSellLength, 3)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListSellLength, 3)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListSellLength, 3)
            .borderTop(border)

          //Sale
          var space = 4
          workbook.getActiveSheet().setArray(2, space, arrListSale)
          workbook.getActiveSheet().getCell(0, space).value('TOP doanh số')
          workbook
            .getActiveSheet()
            .getCell(0, space)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, space, 1, 3)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, space, 1, 3)
            .backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, space, arrListSaleLength, 3)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, arrListSaleLength, 3)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, arrListSaleLength, 3)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, space, arrListSaleLength, 3)
            .borderTop(border)

          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListSellLength + 1, 11)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          for (let i = 0; i <= arrListSellLength + 2; i++) {
            workbook.getActiveSheet().autoFitRow(i)
            workbook.getActiveSheet().setFormatter(i, 2, '#,#')
            workbook.getActiveSheet().setFormatter(i, 6, '#,#')
          }
          for (let i = 0; i <= 8; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook
            .getActiveSheet()
            .setColumnWidth(1, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(5, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(2, 130.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(6, 130.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/gia-ban-san-pham-dich-vu':
      dataToExcel(
        `bang-gia-san-pham-dich-vu-` + getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var { List, TotalColumn, Rows } = exportPriceList(
            Data.result,
            Data.param.Body.ShowsX
          )
          var arrListLength = List.length
          sheet.setArray(2, 0, List)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách sản phẩm, dịch vụ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(11, 300.0, GC.Spread.Sheets.SheetArea.viewport)

          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 11)
              .wordWrap(true)
            workbook.getActiveSheet().setFormatter(i + 2, 4, '#,#')
            workbook.getActiveSheet().setFormatter(i + 2, 5, '#,#')
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          for (const x of Rows) {
            for (let i = 0; i <= 2; i++) {
              //i là vị trí cột
              workbook
                .getActiveSheet()
                .addSpan(
                  x.row,
                  i,
                  x.rowCount,
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .getCell(x.row, i)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/thu-chi-va-so-quy':
      dataToExcel(
        `thu-chi-va-so-quy-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportCashBook(Data.result, Data.param.Body.ShowsX)
          var arrListLength = exportCashBook(
            Data.result,
            Data.param.Body.ShowsX
          ).length
          var column = arrList[0].length
          sheet.setArray(2, 0, arrList)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách thu chi & sổ quỹ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, column)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 2, '#,#')
          }
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
          }
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 4, '#,#')
          }

          if (Number(Data.param.Body.ShowsX) === 1) {
            for (let i = 0; i <= arrListLength; i++) {
              workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 11, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 12, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 13, '#,#')
            }
          }

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(arrListLength + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < column + 1; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(6, 300.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 6)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          if (Number(Data.param.Body.ShowsX) === 1) {
            for (let i = 0; i <= arrListLength; i++) {
              workbook
                .getActiveSheet()
                .setColumnWidth(13, 350.0, GC.Spread.Sheets.SheetArea.viewport)

              workbook
                .getActiveSheet()
                .getCell(i + 3, 13)
                .wordWrap(true)

              workbook
                .getActiveSheet()
                .setColumnWidth(17, 350.0, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .getCell(i + 3, 17)
                .wordWrap(true)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/cong-no/danh-sach':
      dataToExcel(
        `danh-sach-cong-no-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          if (Number(Data.param.Body.ShowsType) == 2) {
            let { Columns, Rows, Items } = exportDebt2(
              Data.lst,
              Data.param.Body
            )

            sheet.setArray(2, 0, Items)
            //title
            workbook.getActiveSheet().getCell(0, 0).value('Danh sách công nợ')
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .font('18pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, Columns)
              .font('12pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, Columns)
              .backColor('#E7E9EB')
            //border
            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, Columns)
              .borderLeft(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, Columns)
              .borderRight(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, Columns)
              .borderBottom(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, Columns)
              .borderTop(border)
            //filter
            var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, Columns)
            var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
              cellrange
            )
            workbook.getActiveSheet().rowFilter(hideRowFilter)

            //format number
            for (let i = 0; i <= Rows; i++) {
              workbook
                .getActiveSheet()
                .getCell(i + 3, 0)
                .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            }
            //auto fit width and height
            //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
            workbook.getActiveSheet().autoFitRow(0)
            for (let i = 1; i < Columns; i++) {
              workbook.getActiveSheet().autoFitColumn(i)
            }

            for (let i = 0; i <= Rows; i++) {
              for (let k = 5; k < Columns; k++) {
                workbook.getActiveSheet().setFormatter(i + 3, k, '#,#')
              }
            }
          } else {
            var arrList = exportDebt(
              Data.result,
              Data.param.Body.ShowsType
            ).newExport
            var arrListLength = exportDebt(
              Data.result,
              Data.param.Body.ShowsType
            ).newExport.length
            let columns = arrList[0].length

            sheet.setArray(2, 0, arrList)

            //title
            workbook.getActiveSheet().getCell(0, 0).value('Danh sách công nợ')
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .font('18pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, columns)
              .font('12pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, columns)
              .backColor('#E7E9EB')
            //border
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength + 1, columns)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderLeft(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderRight(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderBottom(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderTop(border)
            //filter
            var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, columns)
            var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
              cellrange
            )
            workbook.getActiveSheet().rowFilter(hideRowFilter)

            function formatCenter(e, space) {
              workbook
                .getActiveSheet()
                .getCell(e, space)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            }
            var q = 0
            var arr = exportDebt(Data.result).arr
            for (let z = 0; z < arr.length; z++) {
              q += arr[z]
              if (z == 0) {
                workbook
                  .getActiveSheet()
                  .addSpan(3, 0, q, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 1, q, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 2, q, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 3, q, 1, GC.Spread.Sheets.SheetArea.viewport)

                formatCenter(3, 0)
                formatCenter(3, 1)
                formatCenter(3, 2)
                formatCenter(3, 3)
              } else {
                workbook
                  .getActiveSheet()
                  .addSpan(
                    q - arr[z] + 3,
                    0,
                    arr[z],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    q - arr[z] + 3,
                    1,
                    arr[z],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    q - arr[z] + 3,
                    2,
                    arr[z],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    q - arr[z] + 3,
                    3,
                    arr[z],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                formatCenter(q - arr[z] + 3, 0)
                formatCenter(q - arr[z] + 3, 1)
                formatCenter(q - arr[z] + 3, 2)
                formatCenter(q - arr[z] + 3, 3)
              }
            }
            var e = 0
            var arr1 = exportDebt(Data.result).arr1
            for (let i = 0; i < arr1.length; i++) {
              e += arr1[i]
              if (i == 0) {
                workbook
                  .getActiveSheet()
                  .addSpan(3, 4, e, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 5, e, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 6, e, 1, GC.Spread.Sheets.SheetArea.viewport)

                formatCenter(3, 4)
                formatCenter(3, 5)
                formatCenter(3, 6)
              } else {
                workbook
                  .getActiveSheet()
                  .addSpan(
                    e - arr1[i] + 3,
                    4,
                    arr1[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    e - arr1[i] + 3,
                    5,
                    arr1[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    e - arr1[i] + 3,
                    6,
                    arr1[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                formatCenter(e - arr1[i] + 3, 4)
                formatCenter(e - arr1[i] + 3, 5)
                formatCenter(e - arr1[i] + 3, 6)
              }
            }
            //format number
            for (let i = 0; i <= arrListLength; i++) {
              workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
            }
            for (let i = 1; i < columns; i++) {
              workbook.getActiveSheet().autoFitColumn(i)
            }
            for (let i = 0; i < arrListLength + 3; i++) {
              workbook
                .getActiveSheet()
                .getCell(i + 3, 7)
                .wordWrap(true)
              workbook.getActiveSheet().autoFitRow(i)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/tan-suat-su-dung':
      dataToExcel(
        `tan-suat-su-dung-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          const { data, Rows } = exportData_TAN_SUAT_SD(Data.result)

          const arrListLength = data?.length || 0
          sheet.setArray(2, 0, data)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Tần suất sử dụng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 11)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, data[0].length)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //
          //workbook.getActiveSheet().addSpan(3, 1, 2, 1, GC.Spread.Sheets.SheetArea.viewport);

          // add row span
          for (const [index, x] of Rows.entries()) {
            for (let i = 0; i <= 5; i++) {
              //i là vị trí cột
              workbook
                .getActiveSheet()
                .addSpan(
                  x.row,
                  i,
                  x.rowCount,
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .getCell(x.row, i)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            }
          }

          //format number
          //for (let i = 0; i <= arrListLength; i++) {
          //    workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
          //}
          for (let i = 1; i < 12; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 7)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/tan-suat-thang':
      dataToExcel(
        `tan-suat-thang-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          const { data } = exportData_TAN_SUAT_SD_THANG(Data.result)

          const arrListLength = data.length
          sheet.setArray(2, 0, data)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Tần suất sử dụng tháng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 11)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, data[0].length)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //
          //workbook.getActiveSheet().addSpan(3, 1, 2, 1, GC.Spread.Sheets.SheetArea.viewport);

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 8, '#,#')
          }
          for (let i = 1; i < 12; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 7)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/du-kien':
      dataToExcel(
        `khach-hang-du-kien-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          const { data, Rows } = exportData_KH_DU_KIEN(Data.result)
          const arrListLength = data.length
          sheet.setArray(2, 0, data)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Khách hàng dự kiến')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, data[0].length)
            .backColor('#E7E9EB')
          //border
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 11)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, data[0].length)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, data[0].length)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //
          //workbook.getActiveSheet().addSpan(3, 1, 2, 1, GC.Spread.Sheets.SheetArea.viewport);

          // add row span
          for (const x of Rows) {
            for (let i = 0; i <= 4; i++) {
              //i là vị trí cột
              workbook
                .getActiveSheet()
                .addSpan(
                  x.row,
                  i,
                  x.rowCount,
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .getCell(x.row, i)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            }
          }

          //format number
          //for (let i = 0; i <= arrListLength; i++) {
          //    workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 9, '#,#')
          //    workbook.getActiveSheet().setFormatter(i + 3, 10, '#,#')
          //}
          for (let i = 1; i < 12; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 0; i < arrListLength + 3; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 7)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/cong-no/khoa-no':
      dataToExcel(
        `danh-sach-khoa-no-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportDebtLockList(Data.result)
          var arrListLength = exportDebtLockList(Data.result).length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khóa nợ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 10)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 10).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 10)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 11; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/cong-no/tang':
      dataToExcel(
        `danh-sach-tang-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportGiftList(Data.result)
          var arrListLength = exportGiftList(Data.result).length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách tặng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 10)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 10).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 10)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 10)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 11; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/nhan-vien/luong-ca-dich-vu':
      dataToExcel(
        `danh-sach-luong-ca-dich-vu-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportServiceSalaryList(
            Data.result,
            Data.param.Body.ShowsX
          )
          var arrListLength = arrList.length
          let column = arrList[0].length

          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách lương ca dịch vụ')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, Math.max(arrListLength - 1, 1), column)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          // Format only numeric columns; keep dates and phone numbers as text.
          const numericColumns = Data.param.Body.ShowsX === '3' ? [5, 6, 7] : [2, 10]
          for (let i = 0; i < arrListLength - 1; i++) {
            for (const c of numericColumns) {
              workbook.getActiveSheet().setFormatter(i + 3, c, '#,##0')
            }
            workbook.getActiveSheet().getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < column; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(10, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 2)
          }

          if (Data.param.Body.ShowsX === '3') {
            let Sums = []
            Sums.push(['STT', 'ID NHÂN VIÊN', 'TÊN NHÂN VIÊN', 'HỆ SỐ DỊCH VỤ', 'TỔNG LƯƠNG'])

            if (Data.result.sum && Data.result.sum.length > 0) {
              for (let [i, item] of Data.result.sum.entries()) {
                Sums.push([i + 1, item.UserID, item.UserFullName, item.TourSalaryRatio, item.Value])
              }
            }

            let endRow1 = 2 + arrListLength - 1 // dòng cuối bảng 1
            let titleRow = endRow1 + 2 // cách 1 dòng và ghi tiêu đề
            let startRow = endRow1 + 4 // dòng bắt đầu bảng 2

            // --- TIÊU ĐỀ BẢNG 2 --- //
            workbook
              .getActiveSheet()
              .getCell(titleRow, 0)
              .value('Tổng lương ca nhân viên')
            workbook
              .getActiveSheet()
              .getCell(titleRow, 0)
              .font('18pt Calibri, Arial, sans-serif bold')

            workbook
              .getActiveSheet()
              .getRange(titleRow, 0, 1, Sums[0].length)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

            workbook.getActiveSheet().autoFitRow(titleRow)

            // --- BẢNG DỮ LIỆU BẢNG 2 --- //
            sheet.setArray(startRow, 0, Sums)

            // style header
            workbook
              .getActiveSheet()
              .getRange(startRow, 0, 1, Sums[0].length)
              .font('12pt Calibri, Arial, sans-serif bold')
              .backColor('#D1ECF1')

            // border
            var border2 = new GC.Spread.Sheets.LineBorder(
              '#000',
              GC.Spread.Sheets.LineStyle.thin
            )
            workbook
              .getActiveSheet()
              .getRange(startRow, 0, Sums.length, Sums[0].length)
              .setBorder(border2, { all: true })

            // căn giữa cột STT
            workbook
              .getActiveSheet()
              .getRange(startRow + 1, 0, Sums.length - 1, 1)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

            // format số
            for (let r = 1; r < Sums.length; r++) {
              workbook.getActiveSheet().setFormatter(startRow + r, 4, '#,##0')
            }

            // autofit
            for (let c = 0; c < Sums[0].length; c++) {
              workbook.getActiveSheet().autoFitColumn(c)
            }
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/nhan-vien/luong-ca-dich-vu-tip':
      dataToExcel(
        `danh-sach-luong-ca-dich-vu-tip` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          var arrList = exportServiceSalaryTIP(Data.result)
          var arrListLength = exportServiceSalaryTIP(Data.result).length
          let column = arrList[0].length

          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách nhân viên TIP')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, column)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, column)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, column)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 4, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(10, 150.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/nhan-vien/hoa-hong':
      if (Data.param.Body.ShowsX === '3') {
        dataToExcel(
          `danh-sach-hoa-hong-nhan-vien-` +
            Data.param.Body.DateStart +
            `-` +
            Data.param.Body.DateEnd +
            `-` +
            getStockName(Data.param.Body.StockID),
          (sheet, workbook) => {
            workbook.suspendPaint()
            workbook.suspendEvent()

            let Items = []

            let Bg = []

            Items.push([
              'NGÀY',
              'NHÂN VIÊN',
              'HOA HỒNG',
              'SP/DV',
              'KHÁCH HÀNG',
              'SỐ ĐIỆN THOẠI',
              'CƠ SỞ',
              'ĐƠN HÀNG',
              'HH SẢN PHẨM',
              'HH DỊCH VỤ',
              'HH THẺ TIỀN',
              'HH NVL',
              'HH PHỤ PHÍ'
            ])

            if (Data.result.List && Data.result.List.length > 0) {
              for (let [i, item] of Data.result.List.entries()) {
                Items.push([
                  window.top.moment(item.ngay).format('DD/MM/YYYY'),
                  item.nhan_vien,
                  item.tra_lai_don_hang ? item.khau_tru : item.gia_tri,
                  item.sp_dv,
                  item.khach_hang,
                  item.kh_sdt,
                  item.StockTitle,
                  item.don_hang,
                  item.tra_lai_don_hang ? '' : item.gia_tri_sanpham,
                  item.tra_lai_don_hang ? '' : item.gia_tri_dichvu,
                  item.tra_lai_don_hang ? '' : item.gia_tri_thetien,
                  item.tra_lai_don_hang ? '' : item.gia_tri_nvl,
                  item.tra_lai_don_hang ? '' : item.gia_tri_phuphi
                ])

                if (item.tra_lai_don_hang) {
                  Bg.push(i + 3)
                }
              }
            }

            var arrList = Items
            var arrListLength = Items.length
            var columns = Items[0].length
            sheet.setArray(2, 0, arrList)

            //title
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .value('Danh sách hoa hồng nhân viên')
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .font('18pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, columns)
              .font('12pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, columns)
              .backColor('#E7E9EB')
            workbook
              .getActiveSheet()
              .getRange(arrListLength + 1, 0, 1, columns)
              .backColor('#f8f9fa')
            workbook
              .getActiveSheet()
              .getRange(arrListLength + 1, 0, 1, columns)
              .font('10pt Calibri, Arial, sans-serif bold')

            //border
            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderLeft(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderRight(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderBottom(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, columns)
              .borderTop(border)
            //filter
            var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, columns)
            var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
              cellrange
            )
            workbook.getActiveSheet().rowFilter(hideRowFilter)

            //format number
            for (let i = 0; i <= arrListLength; i++) {
              for (let c of [2, 8, 9, 10, 11, 12]) {
                workbook.getActiveSheet().setFormatter(i + 3, c, '#,#')
              }
              workbook
                .getActiveSheet()
                .getCell(i + 3, 0)
                .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            }
            workbook
              .getActiveSheet()
              .getCell(2, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

            workbook.getActiveSheet().autoFitRow(0)
            for (let i = 1; i < columns + 1; i++) {
              workbook
                .getActiveSheet()
                .getCell(i + 3, 10)
                .wordWrap(true)
              workbook.getActiveSheet().autoFitColumn(i)
            }
            for (let i = 1; i < arrListLength; i++) {
              workbook.getActiveSheet().autoFitRow(i + 3)
            }

            if (Bg.length > 0) {
              for (let r of Bg) {
                workbook
                  .getActiveSheet()
                  .getRange(r, 0, 1, columns)
                  .backColor('#F8D7DA') // đỏ nhạt
              }
            }

            // Bảng thứ 2

            let Sums = []
            Sums.push([
              'STT',
              'ID NHÂN VIÊN',
              'TÊN NHÂN VIÊN',
              'TỔNG HOA HỒNG',
              'HH SẢN PHẨM',
              'HH DỊCH VỤ',
              'HH THẺ TIỀN',
              'HH NVL',
              'HH PHỤ PHÍ',
              'KHẤU TRỪ',
              'CÒN LẠI'
            ])
            if (Data.result.sum && Data.result.sum.length > 0) {
              for (let [i, item] of Data.result.sum.entries()) {
                Sums.push([
                  i + 1,
                  item.nv_id,
                  item.nhan_vien,
                  item.gia_tri,
                  item.gia_tri_sanpham,
                  item.gia_tri_dichvu,
                  item.gia_tri_thetien,
                  item.gia_tri_nvl,
                  item.gia_tri_phuphi,
                  item.khau_tru,
                  item.gia_tri - item?.khau_tru
                ])
              }
            }

            let endRow1 = 2 + arrListLength - 1 // dòng cuối bảng 1
            let titleRow = endRow1 + 2 // cách 1 dòng và ghi tiêu đề
            let startRow = endRow1 + 4 // dòng bắt đầu bảng 2

            // --- TIÊU ĐỀ BẢNG 2 --- //
            workbook
              .getActiveSheet()
              .getCell(titleRow, 0)
              .value('Tổng hoa hồng nhân viên')
            workbook
              .getActiveSheet()
              .getCell(titleRow, 0)
              .font('18pt Calibri, Arial, sans-serif bold')

            workbook
              .getActiveSheet()
              .getRange(titleRow, 0, 1, Sums[0].length)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

            workbook.getActiveSheet().autoFitRow(titleRow)

            // --- BẢNG DỮ LIỆU BẢNG 2 --- //
            sheet.setArray(startRow, 0, Sums)

            // style header
            workbook
              .getActiveSheet()
              .getRange(startRow, 0, 1, Sums[0].length)
              .font('12pt Calibri, Arial, sans-serif bold')
              .backColor('#D1ECF1')

            // border
            var border2 = new GC.Spread.Sheets.LineBorder(
              '#000',
              GC.Spread.Sheets.LineStyle.thin
            )
            workbook
              .getActiveSheet()
              .getRange(startRow, 0, Sums.length, Sums[0].length)
              .setBorder(border2, { all: true })

            // căn giữa cột STT
            workbook
              .getActiveSheet()
              .getRange(startRow + 1, 0, Sums.length - 1, 1)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

            // format số cho bảng 2
            for (let r = 1; r < Sums.length; r++) {
              for (let c of [3, 4, 5, 6, 7, 8, 9, 10]) {
                workbook.getActiveSheet().setFormatter(startRow + r, c, '#,#')
              }
            }

            // autofit
            for (let c = 0; c < Sums[0].length; c++) {
              workbook.getActiveSheet().autoFitColumn(c)
            }

            workbook.resumePaint()
            workbook.resumeEvent()
            hideLoading()
          }
        )
      } else {
        dataToExcel(
          `danh-sach-hoa-hong-nhan-vien-` +
            Data.param.Body.DateStart +
            `-` +
            Data.param.Body.DateEnd +
            `-` +
            getStockName(Data.param.Body.StockID),
          (sheet, workbook) => {
            workbook.suspendPaint()
            workbook.suspendEvent()
            var arrList = exportCommissionStaffList(Data.result).newExport
            var arrListLength = exportCommissionStaffList(Data.result).newExport
              .length
            sheet.setArray(2, 0, arrList)

            //title
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .value('Danh sách hoa hồng nhân viên')
            workbook
              .getActiveSheet()
              .getCell(0, 0)
              .font('18pt Calibri, Arial, sans-serif')
            workbook
              .getActiveSheet()
              .getRange(2, 0, 1, 14)
              .font('12pt Calibri, Arial, sans-serif')
            workbook.getActiveSheet().getRange(2, 0, 1, 14).backColor('#E7E9EB')
            //border
            var border = new GC.Spread.Sheets.LineBorder()
            border.color = '#000'
            border.style = GC.Spread.Sheets.LineStyle.thin
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, 14)
              .borderLeft(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, 14)
              .borderRight(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, 14)
              .borderBottom(border)
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, 14)
              .borderTop(border)
            //filter
            var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 14)
            var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
              cellrange
            )
            workbook.getActiveSheet().rowFilter(hideRowFilter)

            function formatCenter(e, space) {
              workbook
                .getActiveSheet()
                .getCell(e, space)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            }

            //format number
            for (let i = 0; i <= arrListLength + 1; i++) {
              workbook.getActiveSheet().setFormatter(i + 3, 1, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
              workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
              workbook
                .getActiveSheet()
                .getCell(i + 3, 0)
                .vAlign(GC.Spread.Sheets.VerticalAlign.center)
              workbook
                .getActiveSheet()
                .getCell(i + 3, 0)
                .hAlign(GC.Spread.Sheets.HorizontalAlign.left)
            }
            workbook
              .getActiveSheet()
              .getRange(2, 0, arrListLength, 14)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.left)
            workbook
              .getActiveSheet()
              .getCell(2, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
            //auto fit width and height
            //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
            workbook.getActiveSheet().autoFitRow(0)
            workbook
              .getActiveSheet()
              .setColumnWidth(0, 100.0, GC.Spread.Sheets.SheetArea.viewport)

            var arr1 = exportCommissionStaffList(Data.result).arr1
            var a = 0
            for (let i = 0; i < arr1.length; i++) {
              a += arr1[i]
              if (i == 0) {
                workbook
                  .getActiveSheet()
                  .addSpan(3, 0, a, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 1, a, 1, GC.Spread.Sheets.SheetArea.viewport)
                formatCenter(3, 0)
                formatCenter(3, 1)
              } else {
                workbook
                  .getActiveSheet()
                  .addSpan(
                    a - arr1[i] + 3,
                    0,
                    arr1[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    a - arr1[i] + 3,
                    1,
                    arr1[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                formatCenter(a - arr1[i] + 3, 0)
                formatCenter(a - arr1[i] + 3, 1)
              }
            }

            var arr2 = exportCommissionStaffList(Data.result).arr2
            var b = 0
            for (let i = 0; i < arr2.length; i++) {
              b += arr2[i]
              if (i == 0) {
                workbook
                  .getActiveSheet()
                  .addSpan(3, 2, b, 1, GC.Spread.Sheets.SheetArea.viewport)
                workbook
                  .getActiveSheet()
                  .addSpan(3, 3, b, 1, GC.Spread.Sheets.SheetArea.viewport)
                formatCenter(3, 2)
                formatCenter(3, 3)
              } else {
                workbook
                  .getActiveSheet()
                  .addSpan(
                    b - arr2[i] + 3,
                    2,
                    arr2[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                workbook
                  .getActiveSheet()
                  .addSpan(
                    b - arr2[i] + 3,
                    3,
                    arr2[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                formatCenter(b - arr2[i] + 3, 2)
                formatCenter(b - arr2[i] + 3, 3)
              }
            }

            for (let i = 1; i < 15; i++) {
              workbook
                .getActiveSheet()
                .getCell(i + 3, 14)
                .wordWrap(true)
            }
            workbook
              .getActiveSheet()
              .setColumnWidth(8, 300.0, GC.Spread.Sheets.SheetArea.viewport)
            for (let i = 0; i < arrListLength; i++) {
              workbook
                .getActiveSheet()
                .getCell(i + 3, 8)
                .wordWrap(true)
              workbook.getActiveSheet().autoFitRow(i + 3)
            }
            for (let i = 1; i < 15; i++) {
              workbook.getActiveSheet().autoFitColumn(i)
            }

            workbook.resumePaint()
            workbook.resumeEvent()
            hideLoading()
          }
        )
      }
      break
    case '/nhan-vien/doanh-so':
      dataToExcel(
        `danh-sach-doanh-so-nhan-vien-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportStaffSalesList(
            Data.result,
            Data.configs
          ).newExport
          var arrListLength = exportStaffSalesList(Data.result, Data.configs)
            .newExport.length
          sheet.setArray(2, 0, arrList)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách doanh số nhân viên')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, arrList[0].length)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, arrList[0].length)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, arrList[0].length)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, arrList[0].length)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, arrList[0].length)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, arrList[0].length)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, arrList[0].length)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          function formatCenter(e, space) {
            workbook
              .getActiveSheet()
              .getCell(e, space)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          }

          //format number
          for (let i = 0; i <= arrListLength + 1; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 1, '#,#')
            workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
            if (
              window.top.GlobalConfig &&
              window.top.GlobalConfig.Admin.kpi_ngay
            ) {
              workbook.getActiveSheet().setFormatter(i + 3, 4, '#,#')
            }

            workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.left)
          }
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, arrList[0].length)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          workbook
            .getActiveSheet()
            .setColumnWidth(0, 100.0, GC.Spread.Sheets.SheetArea.viewport)

          var arr1 = exportStaffSalesList(Data.result, Data.configs).arr1
          var a = 0
          for (let i = 0; i < arr1.length; i++) {
            a += arr1[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 0, a, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 1, a, 1, GC.Spread.Sheets.SheetArea.viewport)
              formatCenter(3, 0)
              formatCenter(3, 1)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  a - arr1[i] + 3,
                  0,
                  arr1[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  a - arr1[i] + 3,
                  1,
                  arr1[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(a - arr1[i] + 3, 0)
              formatCenter(a - arr1[i] + 3, 1)
            }
          }

          var arr2 = exportStaffSalesList(Data.result, Data.configs).arr2
          var b = 0
          for (let i = 0; i < arr2.length; i++) {
            b += arr2[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 2, b, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 3, b, 1, GC.Spread.Sheets.SheetArea.viewport)
              formatCenter(3, 2)
              formatCenter(3, 3)
              if (
                window.top.GlobalConfig &&
                window.top.GlobalConfig.Admin.kpi_ngay
              ) {
                workbook
                  .getActiveSheet()
                  .addSpan(3, 4, b, 1, GC.Spread.Sheets.SheetArea.viewport)
                formatCenter(3, 4)
              }
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  b - arr2[i] + 3,
                  2,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  b - arr2[i] + 3,
                  3,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(b - arr2[i] + 3, 2)
              formatCenter(b - arr2[i] + 3, 3)
              if (
                window.top.GlobalConfig &&
                window.top.GlobalConfig.Admin.kpi_ngay
              ) {
                workbook
                  .getActiveSheet()
                  .addSpan(
                    b - arr2[i] + 3,
                    4,
                    arr2[i],
                    1,
                    GC.Spread.Sheets.SheetArea.viewport
                  )
                formatCenter(b - arr2[i] + 3, 4)
              }
            }
          }

          for (let i = 1; i < arrList[0].length + 1; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(8, 300.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 0; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 8)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/nhan-vien/bang-luong':
      dataToExcel(
        `danh-sach-bang-luong-nhan-vien-thang-` +
          Data.param.Body.Mon +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportemployeeList(Data.result, Data.param.Body.Shows)
          var arrListLength = exportemployeeList(
            Data.result,
            Data.param.Body.Shows
          ).length
          var columns = arrList[0].length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách nhân viên')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, columns)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, columns)
            .backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(arrListLength + 1, 0, 1, columns)
            .backColor('#f8f9fa')
          workbook
            .getActiveSheet()
            .getRange(arrListLength + 1, 0, 1, columns)
            .font('10pt Calibri, Arial, sans-serif bold')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 4)
            .foreColor('#5cb85c')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 6)
            .foreColor('#ff0000')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 8)
            .foreColor('#ff0000')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 16)
            .foreColor('#5cb85c')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, columns)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          //set SUM
          workbook
            .getActiveSheet()
            .addSpan(
              arrListLength + 1,
              0,
              1,
              4,
              GC.Spread.Sheets.SheetArea.viewport
            )
          //format number
          for (let i = 0; i <= arrListLength; i++) {
            for (let c = 4; c < columns; c++) {
              workbook.getActiveSheet().setFormatter(i + 3, c, '#,#')
            }
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < columns + 1; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ton-kho/danh-sach':
      dataToExcel(
        `danh-sach-ton-kho-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportInventoryList(Data.result).newExport
          var arrListLength = exportInventoryList(Data.result).newExport.length
          var columns = arrList[0].length

          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách tồn kho')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, columns)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, columns)
            .backColor('#E7E9EB')
          //border
          for (
            i = 0;
            i < exportInventoryList(Data.result).arr.length + 5;
            i++
          ) {
            if (exportInventoryList(Data.result).arr[i] == -1) {
              workbook
                .getActiveSheet()
                .getRange(i + 3, 0, 1, 10)
                .backColor('#ffa0a0')
            }
          }

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, columns)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, columns)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 21; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 9)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(2, 100.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ton-kho/tieu-hao':
      dataToExcel(
        `danh-sach-tieu-hao-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          var arrList = exportattritionList(
            Data.result,
            Data.param.Body.ShowDetail,
            Data.param.Body.ShowDetailX,
            Data.param.Body.xuat_nhap_diem
          )
          var arrListLength = exportattritionList(
            Data.result,
            Data.param.Body.ShowDetail,
            Data.param.Body.ShowDetailX,
            Data.param.Body.xuat_nhap_diem
          ).length
          sheet.setArray(2, 0, arrList)

          let Columns = arrList && arrList.length > 0 ? arrList[0].length : 0

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách tiêu hao')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, Columns)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, Columns)
            .backColor('#E7E9EB')

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, Columns)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, Columns)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, Columns)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, Columns)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, Columns)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 10; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook
            .getActiveSheet()
            .setColumnWidth(5, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 2, 5)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 2)

            workbook.getActiveSheet().setFormatter(i, 3, '#,#')
            /*workbook.getActiveSheet().setFormatter(i, 6, "#,#");*/
          }
          for (let o = 6; o <= Columns; o++) {
            workbook.getActiveSheet().autoFitColumn(o + 1)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(1, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(2, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(3, 100.0, GC.Spread.Sheets.SheetArea.viewport)
          workbook
            .getActiveSheet()
            .setColumnWidth(4, 100.0, GC.Spread.Sheets.SheetArea.viewport)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ton-kho/du-kien-nvl':
      dataToExcel(
        `danh-sach-nvl-du-kien-${getStockName(Data.param.Body.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportExpectedList(Data.result).newExport
          var arrListLength = exportExpectedList(Data.result).newExport.length
          sheet.setArray(2, 0, arrList)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách nguyên vật liệu dự kiến')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          //border
          for (i = 0; i < exportExpectedList(Data.result).arr.length + 5; i++) {
            if (exportExpectedList(Data.result).arr[i] == -1) {
              workbook
                .getActiveSheet()
                .getRange(i + 3, 0, 1, 7)
                .backColor('#ffa0a0')
            }
          }

          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 7)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 7; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          workbook
            .getActiveSheet()
            .setColumnWidth(6, 300.0, GC.Spread.Sheets.SheetArea.viewport)
          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 6)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khach-hang/su-dung-app':
      dataToExcel(
        `khach-hang-su-dung-app-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportAppSetting(Data.result)
          var arrListLength = exportAppSetting(Data.result).length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Khách hàng sử dụng app')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 7)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 7).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 7)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 6)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 7)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 15; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khac/bao-cao-vi':
      dataToExcel(
        `danh-sach-vi-khach-hang-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportCardCustomerList(Data.result).newExport
          var arrListLength = exportCardCustomerList(Data.result).newExport
            .length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách ví khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 19)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 19).backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(arrListLength + 1, 0, 1, 19)
            .backColor('#f8f9fa')
          workbook
            .getActiveSheet()
            .getRange(arrListLength + 1, 0, 1, 19)
            .font('10pt Calibri, Arial, sans-serif bold')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 3)
            .foreColor('#5cb85c')
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 18)
            .foreColor('#5cb85c')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 19)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 19)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 19)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 19)
            .borderTop(border)
          //setSUM
          workbook
            .getActiveSheet()
            .addSpan(
              arrListLength + 1,
              0,
              1,
              3,
              GC.Spread.Sheets.SheetArea.viewport
            )
          workbook
            .getActiveSheet()
            .getCell(arrListLength + 1, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 19)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          for (let i = 0; i <= arrListLength; i++) {
            for (let a = 3; a < 20; a++) {
              workbook.getActiveSheet().setFormatter(i + 3, a, '#,#')
            }
          }

          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 20; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 6)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khac/bao-cao-su-dung-the-tien':
      dataToExcel(
        `danh-sach-su-dung-the-tien-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportUseCardList(Data.result).newExport
          var arrListLength = exportUseCardList(Data.result).newExport.length
          sheet.setArray(2, 0, arrList)
          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value('Danh sách sử dụng thẻ tiền')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 8)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 8).backColor('#E7E9EB')
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength + 1, 8)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.left)

          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 8)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          for (let i = 0; i <= arrListLength; i++) {
            workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
          }

          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < arrListLength + 20; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          function formatCenter(e, space) {
            workbook
              .getActiveSheet()
              .getCell(e, space)
              .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          }
          //span date
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .vAlign(GC.Spread.Sheets.VerticalAlign.center)
          var arr1 = exportUseCardList(Data.result).arr1
          var c = 0
          for (let i = 0; i < arr1.length; i++) {
            c += arr1[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 0, c, 1, GC.Spread.Sheets.SheetArea.viewport)
              formatCenter(3, 0)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  c - arr1[i] + 3,
                  0,
                  arr1[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(c - arr1[i] + 3, 0)
            }
          }
          var arr2 = exportUseCardList(Data.result).arr2
          var e = 0
          for (let i = 0; i < arr2.length; i++) {
            e += arr2[i]
            if (i == 0) {
              workbook
                .getActiveSheet()
                .addSpan(3, 1, e, 1, GC.Spread.Sheets.SheetArea.viewport)
              workbook
                .getActiveSheet()
                .addSpan(3, 2, e, 1, GC.Spread.Sheets.SheetArea.viewport)

              formatCenter(3, 1)
              formatCenter(3, 2)
            } else {
              workbook
                .getActiveSheet()
                .addSpan(
                  e - arr2[i] + 3,
                  1,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              workbook
                .getActiveSheet()
                .addSpan(
                  e - arr2[i] + 3,
                  2,
                  arr2[i],
                  1,
                  GC.Spread.Sheets.SheetArea.viewport
                )
              formatCenter(e - arr2[i] + 3, 1)
              formatCenter(e - arr2[i] + 3, 2)
            }
          }
          workbook.getActiveSheet().setColumnWidth(0, '150')
          //workbook.getActiveSheet().setColumnWidth(7, "300")
          for (let i = 1; i < arrListLength; i++) {
            //workbook.getActiveSheet().getCell(i + 3, 7).wordWrap(true);
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/khac/bao-cao-the-tien':
      dataToExcel(
        `danh-sach-the-tien-` +
          Data.param.Body.DateStart +
          `-` +
          Data.param.Body.DateEnd +
          `-` +
          getStockName(Data.param.Body.StockID),
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportCardList(Data.result)
          var arrListLength = exportCardList(Data.result).length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách thẻ tiền')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 17)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 17).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 17)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 17)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 17)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 17)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 17)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          //format number
          for (let i = 0; i <= arrListLength; i++) {
            for (let c = 4; c < 17; c++) {
              workbook.getActiveSheet().setFormatter(i + 3, c, '#,#')
            }
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 21; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/ban-hang/doanh-so-2':
      dataToExcel(
        `bao-cao-danh-so-moi-${getStockName(Data.param.Body.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()
          var arrList = exportSales2(Data)
          var arrListLength = exportSales2(Data).length
          sheet.setArray(2, 0, arrList)

          //title
          workbook.getActiveSheet().getCell(0, 0).value('Danh sách khách hàng')
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, 8)
            .font('12pt Calibri, Arial, sans-serif')
          workbook.getActiveSheet().getRange(2, 0, 1, 8).backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, arrListLength, 8)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, 8)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)
          //format number
          for (let i = 0; i <= arrListLength; i++) {
            for (let c = 4; c < 15; c++) {
              workbook.getActiveSheet().setFormatter(i + 3, c, '#,#')
            }
            workbook
              .getActiveSheet()
              .getCell(i + 3, 0)
              .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          }
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          //auto fit width and height
          //workbook.getActiveSheet().autoFitRow(Data.result.Total + 2);
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < 21; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }
          for (let i = 1; i < arrListLength; i++) {
            workbook
              .getActiveSheet()
              .getCell(i + 3, 10)
              .wordWrap(true)
            workbook.getActiveSheet().autoFitRow(i + 3)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break

    case '/ban-hang/doanh-so-co-so':
      dataToExcel(`bao-cao-danh-so-co-so`, (sheet, workbook) => {
        workbook.suspendPaint()
        workbook.suspendEvent()
        var arrList = exportSalesStocks(Data)
        var arrListLength = exportSalesStocks(Data).length
        sheet.setArray(2, 0, arrList)

        //title
        workbook.getActiveSheet().getCell(0, 0).value('Danh sách Cơ sở')
        workbook
          .getActiveSheet()
          .getCell(0, 0)
          .font('18pt Calibri, Arial, sans-serif')
        workbook
          .getActiveSheet()
          .getRange(2, 0, 1, arrList[0].length)
          .font('12pt Calibri, Arial, sans-serif')
        workbook
          .getActiveSheet()
          .getRange(2, 0, 1, arrList[0].length)
          .backColor('#E7E9EB')
        //border
        var border = new GC.Spread.Sheets.LineBorder()
        border.color = '#000'
        border.style = GC.Spread.Sheets.LineStyle.thin
        workbook
          .getActiveSheet()
          .getRange(2, 0, arrListLength, arrList[0].length)
          .borderLeft(border)
        workbook
          .getActiveSheet()
          .getRange(2, 0, arrListLength, arrList[0].length)
          .borderRight(border)
        workbook
          .getActiveSheet()
          .getRange(2, 0, arrListLength, arrList[0].length)
          .borderBottom(border)
        workbook
          .getActiveSheet()
          .getRange(2, 0, arrListLength, arrList[0].length)
          .borderTop(border)
        //filter
        var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, arrList[0].length)
        var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(cellrange)
        workbook.getActiveSheet().rowFilter(hideRowFilter)
        //format number
        for (let i = 0; i <= arrListLength; i++) {
          workbook
            .getActiveSheet()
            .getCell(i + 3, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
        }
        workbook
          .getActiveSheet()
          .getCell(2, 0)
          .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

        workbook.getActiveSheet().autoFitRow(0)
        for (let i = 1; i < arrListLength; i++) {
          for (let c = 2; c < arrList[0].length; c++) {
            sheet.setFormatter(i + 2, c, '#,##0')
          }
        }
        for (let i = 1; i < arrList[0].length + 1; i++) {
          workbook.getActiveSheet().autoFitColumn(i)
        }
        for (let i = 1; i < arrListLength; i++) {
          workbook
            .getActiveSheet()
            .getCell(i + 3, 10)
            .wordWrap(true)
          workbook.getActiveSheet().autoFitRow(i + 3)
        }

        workbook.resumePaint()
        workbook.resumeEvent()
        hideLoading()
      })
      break
  }
}

function safeGet(obj, path, fallback) {
  try {
    var parts = path.split('.')
    for (var i = 0; i < parts.length; i++) {
      obj = obj[parts[i]]
      if (obj === undefined || obj === null) return fallback
    }
    return obj
  } catch (e) {
    return fallback
  }
}

window.EzsExportNoFechExcel = function ({
  Url,
  Data,
  hideLoading,
  filters,
  Title
}) {
  console.log(filters)
  switch (Url) {
    case '/khac/bao-cao-thong-tin-pos-1':
      dataToExcel(
        `thong-tin-${Title}-${getStockName(filters.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          let Response = []

          let Head = ['TIÊU CHÍ']

          if (
            Data &&
            Data.length > 0 &&
            Data[0].Dates &&
            Data[0].Dates.length > 0
          ) {
            for (let date of Data[0].Dates) {
              Head.push(window.top.moment(date.CreateDate).format('DD-MM-YYYY'))
            }
          }
          Head.push('TĂNG/GIẢM')
          Response.push(Head)

          for (let item of Data) {
            let newItems = [item.title]

            for (let date of item.Dates) {
              newItems.push(Number(date[item.title] || 0))
            }

            let ValueTypeText = ''

            if (item.Dates && item.Dates.length > 1) {
              let Value = round(
                Number(item.Dates[item.Dates.length - 1][item.title]) -
                  Number(item.Dates[0][item.title]),
                1
              )
              ValueTypeText = Value >= 0 ? `Tăng (${Value})` : `Giảm (${Value})`
            }

            newItems.push(ValueTypeText)

            Response.push(newItems)
          }

          let TotalRow = Response.length
          let TotalColumn = Response[0].length

          sheet.setArray(2, 0, Response)

          //title
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .value(
              Title +
                ` (${window.top
                  .moment(filters.FromDate)
                  .format('DD-MM-YYYY')} - ${window.top
                  .moment(filters.ToDate)
                  .format('DD-MM-YYYY')})`
            )
          workbook
            .getActiveSheet()
            .getCell(0, 0)
            .font('18pt Calibri, Arial, sans-serif')
          workbook
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
          workbook
            .getActiveSheet()
            .getRange(2, 0, 1, TotalColumn)
            .backColor('#E7E9EB')
          //border
          var border = new GC.Spread.Sheets.LineBorder()
          border.color = '#000'
          border.style = GC.Spread.Sheets.LineStyle.thin
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderRight(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderBottom(border)
          workbook
            .getActiveSheet()
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderTop(border)
          //filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          var hideRowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(
            cellrange
          )
          workbook.getActiveSheet().rowFilter(hideRowFilter)

          //format number
          workbook
            .getActiveSheet()
            .getCell(2, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          //auto fit width and height
          workbook.getActiveSheet().autoFitRow(TotalRow + 2)
          workbook.getActiveSheet().autoFitRow(0)
          for (let i = 1; i < TotalColumn; i++) {
            workbook.getActiveSheet().autoFitColumn(i)
          }

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )
      break
    case '/nhan-vien/doanh-so-kpi-ngay':
      dataToExcel(
        `Thưởng doanh số ${getStockName(filters.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          let Response = []
          let Head = [
            'NGÀY',
            'ID NHÂN VIÊN',
            'NHÂN VIÊN',
            'CƠ SỞ NHÂN VIÊN',
            'THƯỞNG',
            'CƠ SỞ'
          ]
          Response.push(Head)

          for (let item of Data) {
            Response.push([
              window.top.moment(item.CreateDate).format('DD-MM-YYYY'),
              item.Staff && item.Staff.ID,
              item.Staff && item.Staff.FullName,
              item.Staff && item.Staff.StockTitle,
              item.ThresholdRewards,
              item.StockTitle
            ])
          }

          let TotalRow = Response.length
          let TotalColumn = Response[0].length

          sheet.setArray(2, 0, Response)

          let active = workbook.getActiveSheet()

          // ======================================================
          //                     TITLE
          // ======================================================

          let titleText =
            Title +
            ` (${window.top
              .moment(filters.FromDate)
              .format('DD-MM-YYYY')} - ${window.top
              .moment(filters.ToDate)
              .format('DD-MM-YYYY')})`

          let titleCell = active.getCell(0, 0)

          titleCell.value(titleText)
          titleCell.font('18pt Calibri, Arial, sans-serif')

          // wrap title
          titleCell.wordWrap(true)

          // tăng height để không bị cắt
          active.setRowHeight(0, 40)

          // merge nhiều cột (cho đẹp hơn)
          active.addSpan(0, 0, 1, TotalColumn)

          // ======================================================
          //                     HEADER BẢNG 1
          // ======================================================

          active
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border bảng 1
          var border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          active
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
            .borderRight(border)
            .borderTop(border)
            .borderBottom(border)

          // Filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          active.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(cellrange))

          // Format thưởng
          active
            .getRange(3, 4, Data.length, 1)
            .formatter('#,##0')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // ======================================================
          //       FIX WIDTH CỘT 0 CHO TOÀN BỘ CÁC BẢNG
          // ======================================================

          active.setColumnWidth(0, 150)

          // ======================================================
          //                   BẢNG 2 - TỔNG HỢP
          // ======================================================

          let MapStaff = {}

          for (let item of Data) {
            let id = item.Staff?.ID
            if (!id) continue

            if (!MapStaff[id]) {
              MapStaff[id] = {
                ID: id,
                Name: item.Staff.FullName,
                Stock: item.Staff.StockTitle,
                StockTitle: item.StockTitle,
                Total: 0
              }
            }
            MapStaff[id].Total += Number(item.ThresholdRewards) || 0
          }

          let SumList = Object.values(MapStaff)

          let Head2 = [
            'ID NHÂN VIÊN',
            'NHÂN VIÊN',
            'CƠ SỞ NHÂN VIÊN',
            'THƯỞNG',
            'CƠ SỞ'
          ]
          let Table2 = [Head2]

          for (let s of SumList) {
            Table2.push([s.ID, s.Name, s.Stock, s.Total, s.StockTitle])
          }

          // Vị trí bắt đầu bảng 2
          let StartRow = TotalRow + 3

          sheet.setArray(StartRow, 0, Table2)

          // Header bảng 2
          active
            .getRange(StartRow, 0, 1, Head2.length)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border bảng 2
          active
            .getRange(StartRow, 0, Table2.length, Head2.length)
            .borderLeft(border)
            .borderRight(border)
            .borderTop(border)
            .borderBottom(border)

          // Format thưởng bảng 2
          active
            .getRange(StartRow + 1, 3, SumList.length, 1)
            .formatter('#,##0')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // AutoFit các cột còn lại
          for (let i = 1; i < TotalColumn; i++) {
            active.autoFitColumn(i)
          }

          // FIX width cột 0 bảng 2
          active.setColumnWidth(0, 150)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )

      break
    case '/nhan-vien/doanh-so-kpi-thang-hoa-hong':
      dataToExcel(
        `Thưởng phạt doanh số nhân viên (${window.top
          .moment(filters.FromDate)
          .format('DD-MM-YYYY')} - ${window.top
          .moment(filters.ToDate)
          .format('DD-MM-YYYY')})`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          let Response = []
          let Head = [
            'ID NHÂN VIÊN',
            'NHÂN VIÊN',
            'CƠ SỞ NHÂN VIÊN',
            'CƠ SỞ HOA HỒNG',
            'GIÁ TRỊ HOA HỒNG',
            'KPI CỦA CƠ SỞ',
            'THƯỞNG'
          ]
          Response.push(Head)

          for (let item of Data) {
            let TitleStocks =
              window.top.Info &&
              window.top.Info.Stocks?.find(x => x.ID === item.nv_stockID)
            Response.push([
              item.nv_id,
              item.nhan_vien,
              TitleStocks.Title && TitleStocks.Title,
              item.StockTitle,
              item.gia_tri_hoa_hong,
              item.ValueRange,
              item.con_lai
            ])
          }

          let TotalRow = Response.length
          let TotalColumn = Response[0].length

          sheet.setArray(2, 0, Response)

          let active = workbook.getActiveSheet()

          // ======================================================
          //                     TITLE
          // ======================================================

          let titleText =
            Title +
            ` (${window.top
              .moment(filters.FromDate)
              .format('DD-MM-YYYY')} - ${window.top
              .moment(filters.ToDate)
              .format('DD-MM-YYYY')})`

          let titleCell = active.getCell(0, 0)

          titleCell.value(titleText)
          titleCell.font('18pt Calibri, Arial, sans-serif')

          // wrap title
          titleCell.wordWrap(true)

          // tăng height để không bị cắt
          active.setRowHeight(0, 40)

          // merge nhiều cột (cho đẹp hơn)
          active.addSpan(0, 0, 1, TotalColumn)

          // ======================================================
          //                     HEADER BẢNG 1
          // ======================================================

          active
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border bảng 1
          var border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          active
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
            .borderRight(border)
            .borderTop(border)
            .borderBottom(border)

          // Filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          active.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(cellrange))

          // Format thưởng
          active
            .getRange(3, 4, Data.length, 1)
            .formatter('#,##0')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)
          active
            .getRange(3, 6, Data.length, 1)
            .formatter('#,##0')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // ======================================================
          //       FIX WIDTH CỘT 0 CHO TOÀN BỘ CÁC BẢNG
          // ======================================================

          active.setColumnWidth(0, 150)

          // AutoFit các cột còn lại
          for (let i = 1; i < TotalColumn; i++) {
            active.autoFitColumn(i)
          }

          // FIX width cột 0 bảng 2
          active.setColumnWidth(0, 150)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )

      break
    case '/nhan-vien/bang-luong-4':
      dataToExcel(
        `${Title}-${getStockName(filters.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          let Response = []
          let Head = [
            'STT',
            'MÃ NHÂN VIÊN',
            'TÊN NHÂN VIÊN',
            'CHỨC DANH',
            'MÃ ĐỊA ĐIỂM HỆ THỐNG',
            'LỊCH NGHỈ CỐ ĐỊNH',
            'NGÀY CÔNG THÁNG',
            'LƯƠNG NGÀY CÔNG',
            'LƯƠNG CƠ BẢN',
            'PHỤ CẤP',
            'ĐI MUỘN, VỀ SỚM',
            'ĐI SỚM, VỀ MUỘN',
            'TĂNG CA OFF',
            'TĂNG CA LỄ',
            'NGHỈ TRỪ LƯƠNG CÓ PHÉP',
            'NGHỈ TRỪ LƯƠNG KHÔNG PHÉP',
            'LƯƠNG TOUR',
            'THƯỞNG DOANH SỐ',
            'THƯỞNG KHÁC',
            'PHẠT KHÁC',
            'TỔNG THU NHẬP',
            'LƯƠNG BHXH',
            'NGƯỜI LAO ĐỘNG ĐÓNG 10.5%',
            'THỰC NHẬN',
            'GIẢM TRỪ GIA CẢNH',
            'LƯƠNG CHỊU THUẾ TNCN',
            'THUẾ TNCN',
            'TỔNG LƯƠNG THỰC NHẬN',
            'ĐÃ TẠM ỨNG LƯƠNG',
            'CÒN LẠI'
          ]
          Response.push(Head)

          for (let [i, rowData] of Data.entries()) {
            Response.push([
              i + 1,
              safeGet(rowData, 'User.YahooID', ''),
              safeGet(rowData, 'User.FullName', ''),
              safeGet(rowData, 'User.Address', ''),
              rowData?.BANGLUONGBC?.DiemQL &&
              rowData?.BANGLUONGBC?.DiemQL.length > 0
                ? rowData?.BANGLUONGBC?.DiemQL.map(
                    stock => stock.StockTitle
                  ).join(', ')
                : 'Chưa xác định',
              `${rowData?.LICH_NGHI_CO_DINH ?? 0}${
                rowData?.NGAY_NGHI_CO_DINH
                  ? ` (${rowData.NGAY_NGHI_CO_DINH})`
                  : ''
              }`,
              rowData?.NGAY_CONG_THANG ?? 0,
              rowData?.LUONG_NGAY_CONG ?? 0,
              rowData?.LUONG_CB ?? 0,
              rowData?.PHU_CAP_THANG ?? 0,
              rowData?.DI_MUON_VE_SOM ?? 0,
              rowData?.DI_SOM_VE_MUON ?? 0,
              rowData?.TANG_CA_OFF ?? 0,
              rowData?.TANG_CA_LE ?? 0,
              rowData?.NGHI_TRU_LUONG ?? 0,
              rowData?.NGHI_TRU_LUONG_NOT_PHEP ?? 0,
              rowData?.LUONG_TOUR ?? 0,
              rowData?.THUONG_DOANH_SO ?? 0,
              rowData?.THUONG_KHAC ?? 0,
              rowData?.PHAT_KHAC ?? 0,
              rowData?.TONG_THU_NHAP ?? 0,
              rowData?.LUONG_BHXH ?? 0,
              rowData?.TIEN_TRA_BHXH ?? 0,
              rowData?.THUC_NHAN ?? 0,
              rowData?.GIAM_TRU_GIA_CANH ?? 0,
              rowData?.LUONG_CHIU_THUE_TNCN ?? 0,
              rowData?.THUE_TNCN ?? 0,
              rowData?.TONG_LUONG_THUC_NHAN ?? 0,
              rowData?.TAM_UNG ?? 0,
              rowData?.CON_LAI ?? 0
            ])
          }

          let TotalRow = Response.length
          let TotalColumn = Response[0].length

          sheet.setArray(2, 0, Response)

          let active = workbook.getActiveSheet()

          // ======================================================
          //                     TITLE
          // ======================================================

          let titleText = `${Title} - ${getStockName(filters.StockID)}`

          let titleCell = active.getCell(0, 0)

          titleCell.value(titleText)
          titleCell.font('18pt Calibri, Arial, sans-serif')

          // wrap title
          titleCell.wordWrap(true)

          // tăng height để không bị cắt
          active.setRowHeight(0, 40)

          // merge nhiều cột (cho đẹp hơn)
          active.addSpan(0, 0, 1, TotalColumn)

          // ======================================================
          //                     HEADER BẢNG 1
          // ======================================================

          active
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border bảng 1
          var border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          active
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
            .borderRight(border)
            .borderTop(border)
            .borderBottom(border)

          // Filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, Math.max(Data.length, 1), TotalColumn)
          active.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(cellrange))

          // Format thưởng
          active
            .getRange(3, 6, Data.length, TotalColumn - 6)
            .formatter('#,##0')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // ======================================================
          //       FIX WIDTH CỘT 0 CHO TOÀN BỘ CÁC BẢNG
          // ======================================================

          active.setColumnWidth(0, 150)

          // AutoFit các cột còn lại
          for (let i = 1; i < TotalColumn; i++) {
            active.autoFitColumn(i)
          }

          // FIX width cột 0 bảng 2
          active.setColumnWidth(0, 150)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )

      break
    case '/nhan-vien/bang-luong-3':
      dataToExcel(
        `${Title}-${getStockName(filters.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          let Response = []
          let Head = [
            'STT',
            'MÃ NHÂN VIÊN',
            'TÊN NHÂN VIÊN',
            'CƠ SỞ',
            'VỊ TRÍ',
            'BẬC',
            'CHỈ TIÊU THAO TÁC',
            'HỆ SỐ TOUR',
            'CHỈ TIÊU THÁNG',
            'LƯƠNG THỎA THUẬN',
            'LCB',
            'LƯƠNG THEO NĂNG LỰC',
            'DOANH SỐ',
            'SỐ CÔNG',
            'LƯƠNG THEO NĂNG LỰC THEO KPI',
            'TỔNG LƯƠNG CHẤM CÔNG',
            'TỔNG TĂNG CA, THÊM GIỜ',
            'THƯỞNG / PHỤ CẤP',
            'TIỀN THAO TÁC',
            'HH SẢN PHẨM',
            '% DOANH SỐ',
            'KPI 1',
            'KPI 2',
            'KPI 3',
            'KPI 4',
            'KPI 5',
            'KPI 6',
            'TỔNG THU NHẬP',
            'PHẠT ĐI TRỄ, VỀ SỚM',
            'ĐỒNG PHỤC',
            'TỔNG LƯƠNG CƠ SỞ PHẢI CHI',
            'PHẠT VI PHẠM QUY ĐỊNH CHẾ TÀI',
            'PHẠT HÌNH TƯỢNG',
            'GIỮ LƯƠNG',
            'TẠM ỨNG',
            'TIỀN BẰNG',
            'TỔNG LƯƠNG SAU PHẠT',
            'BHXH 10.5%',
            'THUẾ TNCN',
            'KHÁC',
            'PHẢI TRẢ NHÂN VIÊN'
          ]
          Response.push(Head)

          for (let [i, rowData] of Data.entries()) {
            Response.push([
              i + 1,
              safeGet(rowData, 'User.ID', ''),
              safeGet(rowData, 'User.FullName', ''),
              rowData?.BANGLUONGBC?.DiemQL &&
              rowData?.BANGLUONGBC?.DiemQL.length > 0
                ? rowData?.BANGLUONGBC?.DiemQL.map(
                    stock => stock.StockTitle
                  ).join(', ')
                : 'Chưa xác định',
              rowData?.User?.Address,
              rowData?.BAC,
              rowData?.CHI_TIEU_THAO_TAC,
              rowData?.BANGLUONGBC?.TourSalaryRatio,
              rowData?.CHI_TIEU_THANG,
              rowData?.LUONG_CB,
              rowData?.LUONG_DONG_BH,
              rowData?.LUONG_THEO_NANG_LUC,
              rowData?.BANGLUONGBC?.DOANH_SO_THANG,
              rowData?.TrackValue?.WorkQty,
              rowData?.LUONG_THEO_NANG_LUC_KPI,
              rowData?.TONG_LUONG_CHAM_CONG,
              rowData?.TONG_TANG_CA_THEM_GIO,
              rowData?.THUONG_PHU_CAP,
              rowData?.BANGLUONGBC?.LUONG_CA,
              rowData?.BANGLUONGBC?.HOA_HONG,
              rowData?.PHAN_TRAM_DOANH_SO,
              rowData?.KPI_1,
              rowData?.KPI_2,
              rowData?.KPI_3,
              rowData?.KPI_4,
              rowData?.KPI_5,
              rowData?.KPI_6,
              rowData?.TONG_THU_NHAP,
              rowData?.PHAT_DI_TRE_VE_SOM,
              rowData?.DONG_PHUC,
              rowData?.TONG_LUONG_CO_SO_PHAI_CHI,
              rowData?.PHAT_VI_PHAM_QUY_CHE,
              rowData?.PHAT_HINH_TUONG,
              rowData?.GIU_LUONG,
              rowData?.TAM_UNG,
              rowData?.TIEN_BANG,
              rowData?.TONG_LUONG_SAU_PHAT,
              rowData?.TIEN_TRA_BHXH,
              rowData?.THUE_TNCN,
              rowData?.KHAC,
              rowData?.PHAI_TRA_NHAN_VIEN
            ])
          }

          let TotalRow = Response.length
          let TotalColumn = Response[0].length

          sheet.setArray(2, 0, Response)

          let active = workbook.getActiveSheet()

          // ======================================================
          //                     TITLE
          // ======================================================

          let titleText = `${Title} - ${getStockName(filters.StockID)}`

          let titleCell = active.getCell(0, 0)

          titleCell.value(titleText)
          titleCell.font('18pt Calibri, Arial, sans-serif')

          // wrap title
          titleCell.wordWrap(true)

          // tăng height để không bị cắt
          active.setRowHeight(0, 40)

          // merge nhiều cột (cho đẹp hơn)
          active.addSpan(0, 0, 1, TotalColumn)

          // ======================================================
          //                     HEADER BẢNG 1
          // ======================================================

          active
            .getRange(2, 0, 1, TotalColumn)
            .font('12pt Calibri, Arial, sans-serif')
            .backColor('#E7E9EB')

          // Border bảng 1
          var border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          active
            .getRange(2, 0, TotalRow, TotalColumn)
            .borderLeft(border)
            .borderRight(border)
            .borderTop(border)
            .borderBottom(border)

          // Filter
          var cellrange = new GC.Spread.Sheets.Range(3, 0, 1, TotalColumn)
          active.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(cellrange))

          // Format thưởng
          active
            .getRange(3, 6, Data.length, TotalColumn - 6)
            .formatter('#,##0.##')
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // ======================================================
          //       FIX WIDTH CỘT 0 CHO TOÀN BỘ CÁC BẢNG
          // ======================================================

          active.setColumnWidth(0, 150)

          // AutoFit các cột còn lại
          for (let i = 1; i < TotalColumn; i++) {
            active.autoFitColumn(i)
          }

          // FIX width cột 0 bảng 2
          active.setColumnWidth(0, 150)

          workbook.resumePaint()
          workbook.resumeEvent()
          hideLoading()
        }
      )

      break
    case '/nhan-vien/bang-luong-2':
      dataToExcel(
        `${Title}-${getStockName(filters.StockID)}`,
        function (sheet, workbook) {
          workbook.suspendPaint()
          workbook.suspendEvent()

          var r1 = 1,
            r2 = 2
          var startRow = 3

          // ===== Config =====
          var cfg =
            window.top &&
            window.top.GlobalConfig &&
            window.top.GlobalConfig.Admin
              ? window.top.GlobalConfig.Admin
              : {}
          var hasPhiKhac = !!cfg.chiphikhacbangluong
          var hideHH = !!cfg.bc_an_hhpp_hhnvl

          var border = new GC.Spread.Sheets.LineBorder(
            '#aaa',
            GC.Spread.Sheets.LineStyle.thin
          )
          var moneyFmt = '#,##0'

          // ===== Column schema (NO index splice) =====
          var colDefs = []

          function addCol(key, label, isMoney, getter, enabled) {
            colDefs.push({
              key: key,
              label: label,
              isMoney: !!isMoney,
              get: getter,
              enabled: enabled === false ? false : true
            })
          }

          addCol('stt', 'STT', false, function (_, idx) {
            return idx + 1
          })
          addCol('ma_nv', 'MÃ NHÂN VIÊN', false, function (row) {
            return safeGet(row, 'User.YahooID', '')
          })
          addCol('ten_nv', 'TÊN NHÂN VIÊN', false, function (row) {
            return safeGet(row, 'User.FullName', '')
          })
          addCol('cap_bac', 'CẤP BẬC', false, function (row) {
            return safeGet(row, 'User.Level', '')
          })
          addCol('loai_hd', 'LOẠI HỢP ĐỒNG', false, function (row) {
            return safeGet(row, 'User.Address', '')
          }) // giữ như code bạn
          addCol('co_so', 'CƠ SỞ', false, function (row) {
            var arr = safeGet(row, 'BANGLUONGBC.DiemQL', [])
            return arr && arr.length > 0
              ? arr
                  .map(function (d) {
                    return d.StockTitle
                  })
                  .join(', ')
              : 'Chưa xác định'
          })

          addCol('luong_cb', 'LƯƠNG CƠ BẢN', true, function (row) {
            return row.TINH_THEO_CONG ? row.LUONG_CO_BAN_THANG || 0 : ''
          })
          addCol('ngay_cong_chuan', 'NGÀY CÔNG CHUẨN', false, function (row) {
            return row.TINH_THEO_CONG ? row.NGAY_CONG || 0 : ''
          })

          addCol('tong_cong', 'TỔNG CÔNG', false, function (row) {
            return row.TINH_THEO_CONG ? row.NGAY_CONG_THUC_TE || 0 : ''
          })
          addCol('cong_thuc_te', 'CÔNG THỰC TẾ', false, function (row) {
            return row.TINH_THEO_CONG ? row.CONG_THUC_TE || 0 : ''
          })
          addCol('cong_ngay_nghi', 'CÔNG NGÀY NGHỈ', false, function (row) {
            return row.TINH_THEO_CONG ? row.CONG_NGAY_NGHI || 0 : ''
          })

          addCol(
            'luong_theo_cong',
            'LƯƠNG THEO NGÀY CÔNG',
            true,
            function (row) {
              return row.TINH_THEO_CONG ? row.LUONG_THEO_NGAY_CONG || 0 : ''
            }
          )

          if (hasPhiKhac) {
            addCol(
              'phi_khac',
              String(cfg.chiphikhacbangluong).toUpperCase(),
              true,
              function (row) {
                return row.PHAT_SINH_KHAC || 0
              }
            )
          }

          addCol('thuong_hieu_suat', 'THƯỞNG HIỆU SUẤT', true, function (row) {
            return row.THUONG_HIEU_SUAT || 0
          })
          addCol(
            'phu_cap_chuyen_can',
            'PHỤ CẤP CHUYÊN CẦN',
            true,
            function (row) {
              return row.PHU_CAP_CHUYEN_CAN || 0
            }
          )
          addCol('tien_tour', 'TIỀN TOUR', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.LUONG_CA', 0)
          })

          // HH columns (toggle by config, NOT by index)
          addCol('hh_sanpham', 'HH SẢN PHẨM', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.HOA_HONG_Sanpham', 0)
          })
          addCol('hh_dichvu', 'HH DỊCH VỤ', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.HOA_HONG_Dichvu', 0)
          })
          addCol('hh_ban_the', 'HH BÁN THẺ', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.HOA_HONG_Thetien', 0)
          })
          addCol('hh_phu_phi', 'HH THƯỞNG', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.HOA_HONG_Phuphi', 0)
          })
          addCol(
            'hh_nvl',
            'HH NVL',
            true,
            function (row) {
              return safeGet(row, 'BANGLUONGBC.HOA_HONG_NVL', 0)
            },
            !hideHH
          )

          addCol(
            'phu_cap_ngoai_gio',
            'PHỤ CẤP NGOÀI GIỜ',
            true,
            function (row) {
              return row.PHU_CAP_NGOAI_GIO || 0
            }
          )
          addCol('phat_di_tre', 'PHẠT ĐI TRỄ, VỀ SỚM', true, function (row) {
            return row.PHAT_DI_TRE_VE_SOM || 0
          })
          addCol('phat_khac', 'PHẠT KHÁC', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.TRU_PHAT', 0)
          })
          addCol('thuong_khac', 'THƯỞNG KHÁC', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.THUONG', 0)
          })
          addCol('thuong_doanh_so', 'THƯỞNG DOANH SỐ', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.KPI_Hoa_hong', 0)
          })

          addCol('tong_phu_cap', 'TỔNG PHỤ CẤP', true, function (row) {
            return (
              (row.TONG_PHU_CAP || 0) - safeGet(row, 'BANGLUONGBC.PHU_CAP', 0)
            )
          })
          addCol('thuong_nam', 'THƯỞNG NĂM', true, function (row) {
            return safeGet(row, 'BANGLUONGBC.PHU_CAP', 0)
          })
          addCol('tong_luong_thang', 'TỔNG LƯƠNG THÁNG', true, function (row) {
            return row.TONG_LUONG_THANG || 0
          })
          addCol('luong_nop_bhxh', 'LƯƠNG NỘP BHXH', true, function (row) {
            return row.LUONG_NOP_BHXH || 0
          })

          // filter enabled
          colDefs = colDefs.filter(function (d) {
            return d.enabled !== false
          })

          // ===== Render fixed headers (2 rows) =====
          var c = 0
          for (var i = 0; i < colDefs.length; i++) {
            sheet.addSpan(r1, c + i, 2, 1)
            sheet.setValue(r1, c + i, colDefs[i].label)
          }
          c += colDefs.length

          // NSDLĐ group
          var nsdldStart = c
          var nsdldCols = ['BHXH 17.5%', 'BHYT 3%', 'BHTN 1%', 'TỔNG BH']
          sheet.addSpan(r1, c, 1, nsdldCols.length)
          sheet.setValue(r1, c, 'NGƯỜI SỬ DỤNG LAO ĐỘNG TRẢ 21.5%')
          for (i = 0; i < nsdldCols.length; i++)
            sheet.setValue(r2, c + i, nsdldCols[i])
          c += nsdldCols.length

          // NLĐ group
          var nldStart = c
          var nldCols = ['BHXH 8%', 'BHYT 1.5%', 'BHTN 1%', 'TỔNG BH']
          sheet.addSpan(r1, c, 1, nldCols.length)
          sheet.setValue(r1, c, 'NGƯỜI LAO ĐỘNG TRẢ 10.5%')
          for (i = 0; i < nldCols.length; i++)
            sheet.setValue(r2, c + i, nldCols[i])
          c += nldCols.length

          // Tail headers
          var tailHeaders = [
            'GIẢM TRỪ GIA CẢNH',
            'THU NHẬP TỐI THIỂU',
            'THU NHẬP TÍNH THUẾ',
            'THUẾ TNCN',
            'TẠM ỨNG',
            'LƯƠNG NV THỰC NHẬN',
            'TỔNG QUỸ LƯƠNG CÔNG TY TRẢ'
          ]
          for (i = 0; i < tailHeaders.length; i++) {
            sheet.addSpan(r1, c + i, 2, 1)
            sheet.setValue(r1, c + i, tailHeaders[i])
          }
          var totalCols = c + tailHeaders.length

          // Header style
          var headerRange = sheet.getRange(r1, 0, 2, totalCols)
          headerRange.font('bold 10pt Calibri, Arial, sans-serif')
          headerRange.backColor('#E7E9EB')
          headerRange.hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          headerRange.vAlign(GC.Spread.Sheets.VerticalAlign.center)
          headerRange.setBorder(border, { all: true })
          sheet.setRowHeight(r1, 35)
          sheet.setRowHeight(r2, 35)

          // NSDLĐ style (giữ như bạn)
          sheet
            .getRange(r1, nsdldStart, 2, nsdldCols.length)
            .foreColor('#ff0000')
            .font('bold 10pt Calibri, Arial, sans-serif')
            .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          // ===== Data rows =====
          var Response = []
          for (var rIdx = 0; rIdx < Data.length; rIdx++) {
            var row = Data[rIdx]

            var base = colDefs.map(function (d) {
              return d.get(row, rIdx)
            })

            var nsdld = [
              safeGet(row, 'NSD_LD_TRA.17_5_percent', 0),
              safeGet(row, 'NSD_LD_TRA.3_percent', 0),
              safeGet(row, 'NSD_LD_TRA.1_percent', 0),
              safeGet(row, 'NSD_LD_TRA.total', 0)
            ]

            var nld = [
              safeGet(row, 'NLD_TRA.8_percent', 0),
              safeGet(row, 'NLD_TRA.1_5_percent', 0),
              safeGet(row, 'NLD_TRA.1_percent', 0),
              safeGet(row, 'NLD_TRA.total', 0)
            ]

            var tail = [
              row.GIAM_TRU_GIA_CANH || 0,
              row.THU_NHAP_TOI_THIEU || 0,
              row.THU_NHAP_TINH_THUE || 0,
              row.THUE_TNCN || 0,
              safeGet(row, 'BANGLUONGBC.TAM_UNG', 0) -
                safeGet(row, 'BANGLUONGBC.HOAN_UNG', 0) || 0,
              row.LUONG_NV_THUC_NHAN || 0,
              row.TONG_QUY_LUONG_CTY_TRA || 0
            ]

            Response.push(base.concat(nsdld, nld, tail))
          }

          // Total row sum (noMoney by key, NOT by index fixed)
          var noMoneyKeys = {
            stt: 1,
            ma_nv: 1,
            ten_nv: 1,
            cap_bac: 1,
            loai_hd: 1,
            co_so: 1,
            ngay_cong_chuan: 1,
            cong_thuc_te: 1
          }
          var noMoneyCols = []
          for (i = 0; i < colDefs.length; i++) {
            if (noMoneyKeys[colDefs[i].key]) noMoneyCols.push(i)
          }

          var totalRow = sumByColumn(Response, noMoneyCols)
          Response.push(totalRow)

          if (Response.length > 0) sheet.setArray(startRow, 0, Response)

          // Total row style
          var totalRowIndex = startRow + Response.length - 1
          sheet
            .getRange(totalRowIndex, 0, 1, totalCols)
            .backColor('#ffcccc')
            .foreColor('#b30000')
            .font('bold 12pt Calibri, Arial, sans-serif')

          sheet.addSpan(totalRowIndex, 0, 1, 5)
          sheet.setValue(totalRowIndex, 0, 'TỔNG CỘNG')
          sheet
            .getCell(totalRowIndex, 0)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center)

          // Money formatting: based on isMoney, NOT hard-coded indexes
          for (i = 0; i < colDefs.length; i++) {
            if (colDefs[i].isMoney) {
              sheet
                .getRange(startRow, i, Response.length, 1)
                .formatter(moneyFmt)
                .hAlign(GC.Spread.Sheets.HorizontalAlign.right)
            }
          }
          // NSDLĐ + NLĐ + Tail are numeric => format all those columns
          var numericStart = colDefs.length
          sheet
            .getRange(
              startRow,
              numericStart,
              Response.length,
              totalCols - numericStart
            )
            .formatter(moneyFmt)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.right)

          // Borders & row heights
          sheet
            .getRange(startRow, 0, Response.length, totalCols)
            .setBorder(border, { all: true })
          for (i = startRow; i < startRow + Response.length; i++)
            sheet.setRowHeight(i, 28)

          // Title
          var titleText = `${Title} - ${getStockName(filters.StockID)}`
          sheet
            .getCell(0, 0)
            .value(titleText)
            .font('18pt Calibri, Arial, sans-serif')
          sheet.addSpan(0, 0, 1, totalCols)
          sheet.getCell(0, 0).hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          sheet.getCell(0, 0).wordWrap(true)
          sheet.setRowHeight(0, 40)

          for (i = 0; i < totalCols; i++) sheet.autoFitColumn(i)

          workbook.resumePaint()
          workbook.resumeEvent()
        },
        hideLoading
      )

      break
    case '/ban-hang/sp-dv-ban-ra-2':
      dataToExcel(
        `${Title}-${getStockName(filters.StockID)}`,
        (sheet, workbook) => {
          workbook.suspendPaint()
          workbook.suspendEvent()

          var Items = Data && Data.Items ? Data.Items : []
          var BlockTimes = Data && Data.BlockTimes ? Data.BlockTimes : []

          var headRow1 = ['Loại', 'Mặt hàng']
          var headRow2 = ['', '']

          for (var i = 0; i < BlockTimes.length; i++) {
            var bt = BlockTimes[i]
            var label =
              window.top.moment(bt.start).format('DD/MM/YYYY') +
              ' - ' +
              window.top.moment(bt.end).format('DD/MM/YYYY')
            headRow1.push(label, '')
            headRow2.push('Số lượng', 'Doanh số')
          }

          var Response = [headRow1, headRow2]
          var sumRows = []

          for (var g = 0; g < Items.length; g++) {
            var group = Items[g]
            var list = group.Items || []
            for (var p = 0; p < list.length; p++) {
              var prod = list[p]
              var row = [
                prod.isSum ? '' : group.TypeTitle,
                prod.ProdTitle || ''
              ]
              var blocks = prod.BlockTimes || []
              for (var b = 0; b < blocks.length; b++) {
                var block = blocks[b] || {}
                row.push(block.Qty || 0, block.actualAmount || 0)
              }
              Response.push(row)
              if (prod.isSum) {
                sumRows.push(Response.length - 1)
              }
            }
          }

          var totalCols = Response[0].length
          var startRow = 2

          sheet.setArray(startRow, 0, Response)

          var titleText = `${Title} - ${getStockName(filters.StockID)}`
          sheet
            .getCell(0, 0)
            .value(titleText)
            .font('18pt Calibri, Arial, sans-serif')
          sheet.addSpan(0, 0, 1, totalCols)
          sheet.getCell(0, 0).hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          sheet.setRowHeight(0, 40)

          sheet.addSpan(startRow, 0, 2, 1)
          sheet.addSpan(startRow, 1, 2, 1)
          for (var k = 0; k < BlockTimes.length; k++) {
            sheet.addSpan(startRow, 2 + k * 2, 1, 2)
          }

          var headerRange = sheet.getRange(startRow, 0, 2, totalCols)
          headerRange.font('bold 12pt Calibri, Arial, sans-serif')
          headerRange.backColor('#E7E9EB')
          headerRange.hAlign(GC.Spread.Sheets.HorizontalAlign.center)
          headerRange.vAlign(GC.Spread.Sheets.VerticalAlign.center)

          var border = new GC.Spread.Sheets.LineBorder(
            '#000',
            GC.Spread.Sheets.LineStyle.thin
          )
          sheet
            .getRange(startRow, 0, Response.length, totalCols)
            .setBorder(border, { all: true })

          if (Response.length > 2) {
            for (var m = 0; m < BlockTimes.length; m++) {
              var qtyCol = 2 + m * 2
              var amountCol = 3 + m * 2
              sheet
                .getRange(startRow + 2, qtyCol, Response.length - 2, 1)
                .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
              sheet
                .getRange(startRow + 2, amountCol, Response.length - 2, 1)
                .formatter('#,##0')
                .hAlign(GC.Spread.Sheets.HorizontalAlign.right)
            }
          }

          for (var s = 0; s < sumRows.length; s++) {
            var rowIndex = startRow + sumRows[s]
            sheet
              .getRange(rowIndex, 0, 1, totalCols)
              .backColor('#f2e783')
              .font('bold 11pt Calibri, Arial, sans-serif')
          }

          // Mỗi blocktime gồm 2 cột (Số lượng + Thực thu) => tổng 300px
          for (var btIdx = 0; btIdx < BlockTimes.length; btIdx++) {
            sheet.setColumnWidth(2 + btIdx * 2, 150)
            sheet.setColumnWidth(3 + btIdx * 2, 150)
          }
          sheet.autoFitColumn(0)
          sheet.autoFitColumn(1)

          sheet.autoFitRow(0)

          workbook.resumePaint()
          workbook.resumeEvent()
        },
        hideLoading
      )
  }
}

const BAO_CAO_KHOA_HOC = ({
  Items,
  TongNo,
  TongThanhToan,
  TongTien,
  Total
}) => {
  let HeadTable = [
    'STT',
    'HỌC VIÊN',
    'SỐ ĐIỆN THOẠI',
    'NGÀY SINH',
    'ĐỊA CHỈ',
    'KTX',
    'TÊN LỚP',
    'KHOÁ HỌC',
    'TAGS KHOÁ HỌC',
    'TAGS HỌC VIÊN',
    'TỔNG TIỀN',
    'ĐÃ THANH TOÁN',
    'NỢ',
    'NGÀY HẸN THANH TOÁN',
    'NGÀY NHẬP HỌC',
    'SỐ BUỔI HỌC',
    'TRẠNG THÁI',
    'THỜI GIAN ĐỔI TRẠNG THÁI',
    'GHI CHÚ'
  ]
  var newExport = [HeadTable]

  for (const [index, item] of Items.entries()) {
    let status = ''
    if (Number(item.CourseMember.Status) === 1) {
      status = 'Đã tốt nghiệp'
    }
    if (Number(item.CourseMember.Status) === 2) {
      status = 'Chưa tốt nghiệp'
    }
    if (Number(item.CourseMember.Status) === 3) {
      status = 'Đã tạm dừng'
    }
    if (Number(item.CourseMember.Status) === 4) {
      status = 'Chờ tốt nghiệp'
    }
    let newArr = [
      index + 1,
      item.Member.FullName,
      item.Member.MobilePhone,
      item.Member.BirthDate
        ? window.top.moment(item.Member.BirthDate).format('DD/MM/YYYY')
        : '',
      item.Member.HomeAddress,
      item.CourseMember.Places,
      item.Course.Title,
      item.OrderItem.prodtitle || '',
      item.Course.Tags,
      item.CourseMember.Tags,
      item.OrderItem?.ToPay,
      item.CPayed,
      item.RemainPay,
      item.RemainPay > 0 && item.CourseMember.DayToPay
        ? window.top.moment(item.CourseMember.DayToPay).format('DD/MM/YYYY')
        : '',
      item.CourseMember.CreateDate
        ? window.top.moment(item.CourseMember.CreateDate).format('DD/MM/YYYY')
        : '',
      item.TotalCheck,
      status,
      item.CourseMember.DayStatus &&
      item.CourseMember.DayStatus !== '1900-01-01T00:00:00'
        ? window.top
            .moment(item.CourseMember.DayStatus)
            .format('HH:mm DD-MM-YYYY')
        : '',
      item.CourseMember.Desc
    ]
    newExport.push(newArr)
  }

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length,
    TongNo,
    TongThanhToan,
    TongTien,
    Total
  }
}

const BAO_CAO_THONG_TIN3 = ({ lst }, filters) => {
  let HeadTable = [
    'STT',
    'MÃ KH',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'TUỔI',
    'SỐ BUỔI',
    'BUỔI ĐẦU',
    'BUỔI CUỐI',
    'TĂNG/GIẢM',
    'GIÁ TRỊ'
  ]
  var newExport = [HeadTable]

  let Key = 'Data1'

  let rs = []

  if (lst && lst.length > 0) {
    rs = lst.map(item => ({
      ...item,
      Items: item.Items.sort((a, b) =>
        window.top.moment(a.CreateDate).diff(window.top.moment(b.CreateDate))
      ).map(k => {
        let newObj = { ...k, Value: 0 }
        if (k[Key]) {
          let parse = JSON.parse(k[Key])

          let index = parse.findIndex(x => x.title === filters.Criterias?.value)
          if (index > -1) newObj.Value = Number(parse[index].value)
        }
        return newObj
      })
    }))
  }

  for (const [index, item] of rs.entries()) {
    let Value = 0

    if (item.Items.length > 1) {
      Value = round(
        Number(item.Items[item.Items.length - 1]['Value']) -
          Number(item.Items[0]['Value']),
        1
      )
    } else {
      Value = ''
    }

    let newArr = [
      index + 1,
      item.MemberID,
      item.FullName,
      item.MobilePhone,
      item.BirthDate
        ? window.top.moment().diff(window.top.moment(item.BirthDate), 'years')
        : '',
      item.Items.length,
      item.Items[0].Value,
      item.Items.length > 1
        ? Number(item.Items[item.Items.length - 1].Value)
        : '',
      Value === '' ? '' : Value > 0 ? 'Tăng' : 'Giảm',
      Math.abs(Value)
    ]
    newExport.push(newArr)
  }

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length
  }
}

const BAO_CAO_CAC_PT_CK = ({ Items, Banks }) => {
  let HeadTable = [
    'STT',
    'THỜI GIAN',
    'MÃ ĐƠN HÀNG',
    'KHÁCH HÀNG',
    'TỔNG GIÁ TRỊ'
  ]
  let TotalTable = ['', '', '', '', 'TỔNG']
  if (Banks) {
    for (let bank of Banks) {
      HeadTable.push(bank.ngan_hang)
      TotalTable.push(bank.Value)
    }
  }
  TotalTable = [...TotalTable, '']
  HeadTable = [...HeadTable, 'GHI CHÚ']
  var newExport = [HeadTable]
  Items.map((item, index) => {
    let newArr = [
      index + 1,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.ID,
      item.KhachHang,
      item.TongGiaTri
    ]
    if (item.BankValue) {
      for (let bank of item.BankValue) {
        newArr.push(bank.Value)
      }
    }
    newArr = [...newArr, item.Desc]
    newExport.push(newArr)
  })

  newExport.push(TotalTable)

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length
  }
}

const BAO_CAO_DAT_LICH = ({ Items }, ShowsType) => {
  let newExport = []
  let HeadTable = []

  const ListStatus = [
    {
      value: 'CHUA_XAC_NHAN',
      label: 'Chưa xác nhận',
      className: 'text-warning'
    },
    {
      value: 'XAC_NHAN',
      label: 'Đã xác nhận',
      className: 'text-primary'
    },
    {
      value: 'KHACH_KHONG_DEN',
      label: 'Khách không đến',
      className: 'text-danger'
    },
    {
      value: 'TU_CHOI',
      label: 'Khách hủy lịch',
      className: 'text-danger'
    },
    {
      value: 'KHACH_DEN',
      label: 'Khách có đến',
      className: 'text-success'
    }
  ]

  if (ShowsType === '2') {
    HeadTable = [
      'STT',
      'ID',
      'NGÀY TẠO',
      'NGÀY ĐẶT LỊCH',
      'CƠ SỞ',
      'KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'DỊCH VỤ',
      'TRẠNG THÁI',
      'GIÁ TRỊ SỬ DỤNG',
      'THỰC HIỆN',
      'NHÂN VIÊN THỰC HIỆN',
      'NHÂN VIÊN TẠO',
      'ĐẶT LỊCH THÀNH CÔNG',
      'TRẠNG THÁI',
      'ĐƠN HÀNG',
      'GIÁ TRỊ ĐƠN HÀNG',
      'THANH TOÁN TM/CK/QT',
      'THANH TOÁN VÍ/THẺ TIỀN',
      'TIỀN MẶT',
      'CHUYỂN KHOẢN',
      'QUẸT THẺ',
      'VÍ',
      'THẺ TIỀN',
      'HOA HỒNG',
      'CHI TIẾT HOA HỒNG',
      'DOANH SỐ',
      'CHI TIẾT DOANH SỐ',
      'SỐ LƯỢNG KHÁCH',
      'TAGS',
      'GHI CHÚ'
    ]

    newExport = [HeadTable]

    let newItems = []
    for (let item of Items) {
      if (item.OrderInDateInfo && item.OrderInDateInfo.length > 0) {
        for (let order of item.OrderInDateInfo) {
          newItems.push({
            ...item,
            ...order
          })
        }
      } else {
        newItems.push(item)
      }
    }

    for (let [index, item] of newItems.entries()) {
      let SL = ''
      let TAGS = ''
      let DESC = ''

      if (item.Desc) {
        let newDesc = item.Desc
          ? item.Desc.replaceAll('\n', ' | ').replaceAll('</br>', ', ')
          : ''
        const parsed = parseKvString(newDesc)
        SL = parsed['Số lượng khách'] || ''
        TAGS = parsed['Tags'] || ''
        DESC = parsed['Ghi chú'] || ''
      }

      if (
        window.top?.GlobalConfig?.Admin?.isMultipleMembersBook &&
        item?.InfoMore?.Clients &&
        item?.InfoMore?.Clients.length > 0
      ) {
        const count = new Set(rowData?.InfoMore?.Clients.map(x => x.Index)).size
        SL = count || 1
      }

      const stt = item?.Status
        ? ListStatus.filter(x => x.value === item?.Status)
        : ''

      const newArr = [
        index + 1,
        item.ID,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        window.top.moment(item.BookDate).format('HH:mm DD/MM/YYYY'),
        item.Stock && item.Stock.Title,
        item.Member && item.Member.MobilePhone != '0000000000'
          ? item.Member.FullName
          : item.FullName,
        item.Member && item.Member.MobilePhone != '0000000000'
          ? item.Member.MobilePhone
          : item.Phone,
        item.RootTitles,
        stt && stt.length > 0
          ? item.Desc &&
            item.Desc.toUpperCase().indexOf('TỰ ĐỘNG ĐẶT LỊCH') > -1
            ? 'Đặt lịch dự kiến'
            : stt[0].label
          : '',
        PriceHelper.formatVND(item.OsUsedValue),
        item.AtHome ? 'Tại nhà' : 'Tại Spa',
        item.UserServices && item.UserServices.length > 0
          ? item.UserServices.map(x => x.FullName).join(', ')
          : '',
        item.UserName ? item.UserName : 'Đặt lịch Online',
        `${(item.BookCount && item.BookCount.Done) || 0} / ${
          (item.BookCount && item.BookCount.Total) || 0
        }`,
        item.IsNewMember ? 'Khách mới' : 'Khách cũ',
        item.OrderID,
        item.ToPay,
        item.TM + item.CK + item.QT,
        item.VI + item.TT,
        item.TM,
        item.CK,
        item.QT,
        item.VI,
        item.TT,
        item.HH,
        item.HHList && item.HHList.length > 0
          ? item.HHList.map(x => `${x.Name}(${PriceHelper.formatVND(x.Value)})`)
          : '',
        item.DS,
        item.DSList && item.DSList.length > 0
          ? item.DSList.map(x => `${x.Name}(${PriceHelper.formatVND(x.Value)})`)
          : '',
        SL,
        TAGS,
        DESC
      ]
      newExport.push(newArr)
    }
  } else {
    HeadTable = [
      'STT',
      'NGÀY TẠO',
      'NGÀY ĐẶT LỊCH',
      'CƠ SỞ',
      'KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'DỊCH VỤ',
      'TRẠNG THÁI',
      'GIÁ TRỊ SỬ DỤNG',
      'THỰC HIỆN',
      'NHÂN VIÊN THỰC HIỆN',
      'NHÂN VIÊN TẠO',
      'ĐẶT LỊCH THÀNH CÔNG',
      'TRẠNG THÁI',
      'ĐƠN HÀNG',
      'SỐ LƯỢNG KHÁCH',
      'TAGS',
      'GHI CHÚ'
    ]
    newExport = [HeadTable]
    Items.map((item, index) => {
      let SL = ''
      let TAGS = ''
      let DESC = ''

      if (item.Desc) {
        let newDesc = item.Desc
          ? item.Desc.replaceAll('\n', ' | ').replaceAll('</br>', ', ')
          : ''
        const parsed = parseKvString(newDesc)
        SL = parsed['Số lượng khách'] || ''
        TAGS = parsed['Tags'] || ''
        DESC = parsed['Ghi chú'] || ''
      }

      const stt = item?.Status
        ? ListStatus.filter(x => x.value === item?.Status)
        : ''

      const newArr = [
        index + 1,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        window.top.moment(item.BookDate).format('HH:mm DD/MM/YYYY'),
        item.Stock && item.Stock.Title,
        item.Member && item.Member.MobilePhone != '0000000000'
          ? item.Member.FullName
          : item.FullName,
        item.Member && item.Member.MobilePhone != '0000000000'
          ? item.Member.MobilePhone
          : item.Phone,
        item.RootTitles,
        stt && stt.length > 0
          ? item.Desc &&
            item.Desc.toUpperCase().indexOf('TỰ ĐỘNG ĐẶT LỊCH') > -1
            ? 'Đặt lịch dự kiến'
            : stt[0].label
          : '',
        PriceHelper.formatVND(item.OsUsedValue),
        item.AtHome ? 'Tại nhà' : 'Tại Spa',
        item.UserServices && item.UserServices.length > 0
          ? item.UserServices.map(x => x.FullName).join(', ')
          : '',
        item.UserName ? item.UserName : 'Đặt lịch Online',
        `${(item.BookCount && item.BookCount.Done) || 0} / ${
          (item.BookCount && item.BookCount.Total) || 0
        }`,
        item.IsNewMember ? 'Khách mới' : 'Khách cũ',
        item.OrderInDate,
        SL,
        TAGS,
        DESC
      ]
      newExport.push(newArr)
    })
  }

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length
  }
}

const CHI_TIET_SP_DV_BAN_RA = ({ Items }) => {
  const HeadTable = [
    'STT',
    'ID',
    'NGÀY TẠO',
    'TÊN',
    'SỐ LƯỢNG',
    'TỔNG THANH TOÁN',
    'CƠ SỞ',
    'ID ĐƠN HÀNG',
    'ID KHÁCH HÀNG',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'TRẠNG THÁI'
  ]
  var newExport = [HeadTable]
  Items.map((item, index) => {
    const ListStatus = [
      {
        value: 'CHUA_XAC_NHAN',
        label: 'Chưa xác nhận',
        className: 'text-warning'
      },
      {
        value: 'XAC_NHAN',
        label: 'Đã xác nhận',
        className: 'text-primary'
      },
      {
        value: 'KHACH_KHONG_DEN',
        label: 'Khách không đến',
        className: 'text-danger'
      },
      {
        value: 'TU_CHOI',
        label: 'Từ chối đặt lịch',
        className: 'text-danger'
      },
      {
        value: 'KHACH_DEN',
        label: 'Khách đến',
        className: 'text-success'
      }
    ]

    const stt = item?.Status
      ? ListStatus.filter(x => x.value === item?.Status)
      : ''

    const newArr = [
      index + 1,
      item.ID,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.ProdTitle,
      item.Qty,
      item.ToPay,
      item.StockTitle,
      item.OrderID,
      item.SenderID,
      item.SenderName,
      item.SenderPhone,
      item.Status === 'finish' ? 'Hoàn thành' : 'Đặt Trả hàng'
    ]
    newExport.push(newArr)
  })

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length
  }
}

const TON_DICH_VU = ({
  Items,
  so_luong,
  da_su_dung,
  so_buoi_con,
  tong_so_buoi,
  tong_so_tien
}) => {
  const HeadTable = [
    'STT',
    'MÃ KH',
    'HỌ TÊN',
    'SỐ ĐIỆN THOẠI',
    'CƠ SỞ',
    'NGÀY MUA',
    'NGÀY HẾT HẠN',
    'MÃ ĐƠN HÀNG',
    'MÃ DỊCH VỤ',
    'TÊN DỊCH VỤ',
    'DỊCH VỤ GỐC',
    'SỐ LƯỢNG',
    'ĐÃ SỬ DỤNG',
    'SỐ BUỔI CÒN',
    'TỔNG SỐ BUỔI',
    'TỔNG SỐ TIỀN',
    'GIÁ TRỊ CHƯA DÙNG',
    'ĐÃ THANH TOÁN',
    'TT Tiền mặt',
    'TT Chuyển khoản',
    'TT Quẹt thẻ',
    'VÍ',
    'THẺ TIỀN',
    'CÔNG NỢ'
  ]
  var newExport = [HeadTable]
  Items.map((item, index) => {
    let StockName = ''
    if (window.top && window.top.Info.Stocks) {
      let Stock = window.top.Info.Stocks.find(x => x.ID === item.StockID)
      if (Stock) StockName = Stock.Title
    }

    const newArr = [
      index + 1,
      item.SenderID,
      item.SenderName,
      item.SenderPhone,
      StockName,
      window.top.moment(item.NgayMua).format('DD/MM/YYYY'),
      window.top.moment(item.NgayHetHan).format('DD/MM/YYYY'),
      item.MaDonHang,
      item.MaDichVu,
      item.Ten_dich_vu,
      item.Ton_dich_vu_goc,
      item.SoLuong,
      item.Da_su_dung,
      (item.Tong_buoi || 0) - (item.Da_su_dung || 0),
      item.Tong_buoi,
      item.Tong_tien,
      item.CostTotal,
      item.Da_Thanh_toan,
      item.tien_mat,
      item.ck,
      item.qt,
      item.Vi,
      item.The_tien,
      item.Cong_no
    ]
    newExport.push(newArr)
  })

  newExport.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    so_luong,
    da_su_dung,
    so_buoi_con,
    tong_so_buoi,
    tong_so_tien,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ])

  return {
    Response: newExport,
    TotalColumn: HeadTable.length,
    TotalRow: newExport.length
  }
}

function exportMemberList(List, showsX) {
  let newExport = []
  if (showsX == '2') {
    const { Items } = List
    newExport.push([
      'STT',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'TÊN SẢN PHẨM',
      'SỐ LƯỢNG',
      'ĐƠN GIÁ',
      'THÀNH TIỀN',
      'ĐƠN HÀNG ID',
      'CƠ SỞ MUA'
    ])

    for (let [index, item] of Items.entries()) {
      let obj = [
        index + 1,
        item.Ten_KH,
        item.SDT,
        item.Ten_SP,
        item.SL,
        item.Don_gia,
        item.Thanh_tien,
        item.OrderID,
        item.Co_so
      ]
      newExport.push(obj)
    }
  } else if (showsX == '1') {
    const { Items } = List
    newExport.push([
      'STT',
      'NGÀY TẠO',
      'CƠ SỞ',
      'ID KHÁCH HÀNG',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'LÊN CẤP'
    ])

    for (let [index, item] of Items.entries()) {
      let obj = [
        index + 1,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        item.StockTitle,
        item.ID,
        item.FullName,
        item.MobilePhone,
        item.GroupTitle
      ]
      newExport.push(obj)
    }
  } else {
    const { Members } = List

    newExport.push([
      'STT',
      'NGÀY TẠO',
      'TÊN KHÁCH HÀNG',
      'ID',
      'SỐ ĐIỆN THOẠI',
      'EMAIL',
      'NGÀY SINH',
      'GIỚI TÍNH',
      'ĐỊA CHỈ',
      'QUẬN HUYỆN',
      'TỈNH/THÀNH PHỐ',
      'CƠ SỞ',
      'NGƯỜI GIỚI THIỆU',
      'NGHỀ NGHIỆP',
      'NHÓM KHÁCH HÀNG',
      'NGUỒN',
      'MÃ THẺ',
      'NHÂN VIÊN CHĂM SÓC',
      'VÍ',
      'CÔNG NỢ',
      'THẺ TIỀN',
      'TÍCH ĐIỂM'
    ])
    Members.map((item, index) => {
      const newArr = [
        index + 1,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        item.FullName,
        item.Id,
        item.MobilePhone,
        item.Email == '' ? 'Không có Email' : item.Email,
        item.BirthDate
          ? window.top.moment(item.BirthDate).format('DD/MM/YYYY')
          : 'Không có',
        item.Gender,
        item.HomeAddress == '' ? 'Không có' : item.HomeAddress,
        item.DistrictsName == '' ? 'Không có' : item.DistrictsName,
        item.ProvincesName == '' ? 'Không có' : item.ProvincesName,
        item.ByStockName == '' ? 'Không có' : item.ByStockName,
        item.AFF ? `#${item.AFF.MID} - ${item.AFF.Name}` : '',
        item.Jobs,
        item.GroupCustomerName == '' ? 'Không có' : item.GroupCustomerName,
        item.Source == '' ? 'Không có' : item.Source,
        item.HandCardID == '' ? 'Chưa có' : item.HandCardID,
        item.ByUserName == '' ? 'Chưa có' : item.ByUserName,
        item.vi_dien_tu == 0 ? 0 : item.vi_dien_tu,
        item.cong_no == 0 ? 0 : item.cong_no,
        item.the_tien == 0 ? 0 : item.the_tien,
        item.tich_diem
      ]
      newExport.push(newArr)
    })
  }

  return {
    Response: newExport,
    TotalRow: newExport.length,
    TotalColumn: newExport[0].length,
    showsX
  }
}

function exportSpending(member) {
  const { Members } = member
  const HeadTable = [
    'STT',
    'NGÀY TẠO',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'CƠ SỞ',
    'TỔNG TIỀN CHI TIÊU',
    'THỜI GIAN MUA HÀNG',
    'CƠ SỞ MUA HÀNG',
    'MÃ ĐƠN HÀNG',
    'TÊN MẶT HÀNG MUA',
    'DOANH SỐ',
    'GIẢM GIÁ',
    'DOANH THU',
    'ĐÃ THANH TOÁN',
    'VÍ',
    'THẺ TIỀN'
  ]
  const newExport = [HeadTable]
  var arr = []
  Members.map((item, index) => {
    var stt = index + 1
    var date = window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY')
    var name = item.MemberFullName
    var phone = item.MemberPhone
    var stock = item.StockName
    var money_Spend = item.TongChiTieu
    var number = 0
    item.OrdersList.map(e => {
      var listProd = ''
      if (e.Prods && e.Prods != 1 && e.Prods.length > 0) {
        for (let i = 0; i < e.Prods.length; i++) {
          listProd += e.Prods[i].name + '(x' + e.Prods[i].qty + '), '
        }
      }
      const newArr = [
        stt,
        date,
        name,
        phone,
        stock,
        money_Spend,
        window.top.moment(e.CreateDate).format('HH:mm DD/MM/YYYY'),
        e.StockName,
        e.ID,
        listProd == ''
          ? 'Không có mặt hàng.'
          : listProd.substring(0, listProd.lastIndexOf(',')),
        e.DoanhSo,
        e.GiamGia,
        e.DoanhThu,
        e.DaThanhToan,
        e.Vi,
        e.TheTien
      ]
      newExport.push(newArr)
      number++
    })
    arr.push(number)
  })
  return {
    newExport,
    arr
  }
}

function exportUseService(member) {
  const { Members } = member
  const HeadTable = [
    'STT',
    'NGÀY TẠO',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'CƠ SỞ',
    'TÊN DỊCH VỤ',
    'SỐ BUỔI CÒN',
    'TỔNG GIÁ TRỊ BUỔI CÒN',
    'THỜI GIAN DÙNG CUỐI',
    'TRẠNG THÁI',
    'MÔ TẢ'
  ]
  const newExport = [HeadTable]
  var arr = []
  Members.map((item, index) => {
    var stt = index + 1
    var date = window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY')
    var name = item.MemberFullName
    var phone = item.MemberPhone
    var stock = item.StockName
    var number = 0
    item.ServiceList.map(e => {
      const newArr = [
        stt,
        date,
        name,
        phone,
        stock,
        e.Title,
        e.BuoiCon,
        e.TongGiatriBuoicon,
        e.UseEndTime == null
          ? 'Invalid date'
          : window.top.moment(e.UseEndTime).format('HH:mm DD/MM/YYYY'),
        e.Status,
        e.Desc
      ]
      newExport.push(newArr)
      number++
    })
    arr.push(number)
  })
  return {
    newExport,
    arr
  }
}

function exportServiceList(member, type) {
  if (type == '1') {
    const { lst } = member
    const HeadTable = [
      'STT',
      'NHÂN VIÊN',
      'CƠ SỞ',
      'SỐ LƯỢNG',
      'TM/CK/QT',
      'VI/TT',
      'TIỀN MẶT',
      'CHUYỂN KHOẢN',
      'QUẸT THẺ',
      'VÍ',
      'THẺ TIỀN'
    ]
    let newExport = [HeadTable]

    for (let [i, item] of (lst || []).entries()) {
      let arr = [
        i + 1,
        item.User.FullName,
        item.Stock.Title,
        item.Qty,
        item.TM + item.CK + item.QT,
        item.VI + item.TT,
        item.TM,
        item.CK,
        item.QT,
        item.VI,
        item.TT
      ]
      newExport.push(arr)
    }
    return {
      List: newExport,
      TotalColumn: newExport[0].length,
      TotalRows: newExport.length
    }
  } else if (type == '3') {
    const { items } = member
    const HeadTable = ['THỜI GIAN', 'TỔNG SỐ CA', 'TỈ LỆ']
    let newExport = [HeadTable]

    let roundToDecimalPlaces = (num, decimalPlaces) => {
      const factor = Math.pow(10, decimalPlaces)
      return Math.round(num * factor) / factor
    }

    let total =
      items && items.length > 0
        ? items.reduce((accumulator, object) => {
            return accumulator + object.Data.Done
          }, 0)
        : 0
    for (let item of items) {
      let Percentage = roundToDecimalPlaces((item.Data.Done / total) * 100, 2)
      newExport.push([
        `${item.From} - ${item.To}`,
        item.Data.Done,
        `${Percentage}%`
      ])
    }

    return {
      List: newExport,
      TotalColumn: newExport[0].length,
      TotalRows: newExport.length
    }
  } else if (type == '5') {
    const { Items } = member
    const HeadTable = ['ID dịch vụ', 'Tên dịch vụ', 'Số lượng', 'Tỉ lệ']
    let newExport = [HeadTable]
    for (let item of Items) {
      newExport.push([
        item.ProServiceId,
        item.ProServiceName,
        item.CasesNum,
        `${item.CasesPercent}%`
      ])
    }
    return {
      List: newExport,
      TotalColumn: newExport[0].length,
      TotalRows: newExport.length
    }
  } else {
    const { Items } = member
    const HeadTable = [
      'STT',
      'ID',
      'ID ĐƠN HÀNG',
      'NGÀY BÁN',
      'NGÀY ĐẶT LỊCH',
      'CƠ SỞ',
      'KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'NHÓM KHÁCH HÀNG',
      'LOẠI KHÁCH HÀNG',
      'DỊCH VỤ GỐC',
      'THẺ',
      'GIÁ BUỔI',
      'BUỔI',
      Number(type) === 2 ? 'LOẠI' : 'BẢO HÀNH',
      'PHỤ PHÍ',
      'TỔNG PHỤ PHÍ',
      'NHÓM DỊCH VỤ',
      'NHÂN VIÊN CHUYỂN CA',
      'NHÂN VIÊN THỰC HIỆN',
      'TỔNG LƯƠNG NHÂN VIÊN',
      'TRẠNG THÁI',
      'ĐÁNH GIÁ SAO',
      'NỘI DUNG ĐÁNH GIÁ',
      'MÔ TẢ'
    ]
    let newExport = [HeadTable]

    function numberWithCommas(x) {
      return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, '.')
    }
    Items.map((item, index) => {
      var staffSal = 0
      var staffName = ''
      item.StaffSalaries &&
        item.StaffSalaries.map(e => {
          staffName += e.FullName + '(' + numberWithCommas(e.Salary) + '),'
          staffSal += parseInt(e.Salary)
        })
      let SessionPrice = 0
      let { CostMerthod, Cost1, Cost2, Cost3 } = item
      if (CostMerthod === 1) {
        SessionPrice = Cost1
      }
      if (CostMerthod === 2) {
        SessionPrice = Cost2
      }
      if (CostMerthod === 3) {
        SessionPrice = Cost3
      }

      let FCost = 0
      if (item.FCostMethod === 1) {
        FCost = item.FCost1
      }
      if (item.FCostMethod === 2) {
        FCost = item.FCost2
      }
      if (item.FCostMethod === 3) {
        FCost = item.FCost3
      }

      let colors = []
      let { SessionCost, SessionIndex, isfirst, Warranty, payment } = item
      if (isfirst) {
        colors.push('Khách buổi đầu')
      }
      if (SessionIndex) {
        const { CurentIndex, TotalIndex } = {
          CurentIndex: Number(SessionIndex.split('/')[0]),
          TotalIndex: Number(SessionIndex.split('/')[1])
        }
        if (Number(payment) < CurentIndex * SessionCost) {
          colors.push('Cần thanh toán thêm')
        }
        if (CurentIndex === 1 && TotalIndex > 1) {
          colors.push('Khách thẻ buổi đầu')
        }
        if (CurentIndex === TotalIndex && TotalIndex > 1 && Warranty === '') {
          colors.push('Khách thẻ buổi cuối')
        }
      }

      const newArr = [
        index + 1,
        '#' + item.Id,
        '#' + item.OrderID,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        window.top.moment(item.BookDate).format('HH:mm DD/MM/YYYY'),
        item.StockName,
        item.MemberName,
        item.MemberPhone,
        item.MemberGroups && item.MemberGroups.length > 0
          ? item.MemberGroups.map(x => x.Title).toString()
          : '',
        colors.join(', '),
        item.ProServiceName,
        item.Card,
        SessionPrice,
        item.SessionIndex,
        Number(type) === 2
          ? item.Loai
          : item.Warranty == 'BAO_HANH'
          ? 'Bảo hành'
          : 'Không có',
        item.AddFeeTitles && item.AddFeeTitles.length != 0
          ? item.AddFeeTitles.toString()
          : 'Không có',
        FCost,
        item.ProServiceType,
        item.UserFullName,
        !item.StaffSalaries || item.StaffSalaries.length == 0
          ? ''
          : staffName.slice(0, -1),

        staffSal,
        item.Status == 'done' ? 'Hoàn thành' : 'Đang thực hiện',
        item.Rate == '' || item.Rate == null ? 'Chưa đánh giá' : item.Rate,
        item.RateNote == '' ? 'Chưa có' : item.RateNote,
        item.Desc == '' ? 'Chưa có' : item.Desc
      ]
      newExport.push(newArr)
    })

    if (Number(type) === 2) {
      newExport = newExport.map(x => {
        let valuesArr = [...x]
        let removeValFrom = [12, 16]
        valuesArr = valuesArr.filter((value, index) => {
          return removeValFrom.indexOf(index) == -1
        })

        return valuesArr
      })
    } else {
      newExport = newExport.map(x => {
        let valuesArr = [...x]
        let removeValFrom = [15]
        valuesArr = valuesArr.filter((value, index) => {
          return removeValFrom.indexOf(index) == -1
        })

        return valuesArr
      })
    }

    return {
      List: newExport,
      TotalColumn: newExport[0].length,
      TotalRows: newExport.length
    }
  }
}

function exportFixCard(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'NGÀY',
    'NHÂN VIÊN THỰC HIỆN',
    'CƠ SỞ',
    'NGHIỆP VỤ',
    'CHI TIẾT THỰC HIỆN',
    'MÔ TẢ'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, '.')
    }
    var vang_Lai =
      item.OrderFromAnonymous == true
        ? 'Khách vãng lai'
        : item.OrderFromSenderName + ' - ' + item.OrderFromSenderPhone
    var text = ''
    switch (item.Title) {
      case 'Đơn hàng thay đổi khách mua hàng':
        text =
          'Đơn hàng #' +
          item.OrderID +
          ' được chuyển từ khách hàng ' +
          vang_Lai +
          ' đến khách hàng ' +
          item.OrderToSenderName +
          ' - ' +
          item.OrderToSenderPhone
        break
      case 'Xóa đơn hàng':
        text =
          'Xóa đơn hàng # ' +
          item.OrderID +
          ' của khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone
        break
      case 'Tạo buổi bảo hành':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' tạo buổi bảo hành - dịch vụ thẻ ' +
          item.ProdTitle
        break
      case 'Kết thúc dich vụ':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' kết thúc ' +
          item.OSUpdate +
          ' buổi ' +
          ' của ' +
          item.ProdTitle +
          ', Hoàn tiền: ' +
          numberWithCommas(item.GiveCash) +
          ', Hoàn Ví: ' +
          numberWithCommas(item.GiveMM) +
          ', Hoàn thẻ tiền: ' +
          numberWithCommas(item.GiveMoneyCard) +
          ', Thu thêm từ khách: ' +
          numberWithCommas(item.TakeCash)
        break
      case 'Chuyển nhượng thẻ':
        text =
          'Chuyển nhượng ' +
          item.ProdTitle +
          ' - ' +
          item.OSUpdate +
          ' buổi từ khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' tới khách hàng ' +
          item.ToMemberName +
          ' - ' +
          item.ToMemberPhone
        break
      case 'Tặng buổi':
        text =
          'Tặng ' +
          item.OSAdd +
          ' buổi dịch vụ ' +
          item.ProdTitle +
          ' cho ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone
        break
      case 'Thay đổi ngày hết hạn':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' thay đổi ngày hết hạn dịch vụ ' +
          item.ProdTitle +
          ' từ ' +
          window.top.moment(item.OSFromEndDate).format('HH:mm DD/MM/YYYY') +
          ' đến ' +
          window.top.moment(item.OSToEndDate).format('HH:mm DD/MM/YYYY')
        break
      case 'Xóa buổi':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' xóa ' +
          item.OSUpdate +
          ' buổi dịch vụ ' +
          item.ProdTitle +
          ' hoàn ví: ' +
          numberWithCommas(item.GiveMM)
        break
      case 'Thêm buổi':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' thêm ' +
          item.OSUpdate +
          ' buổi dịch vụ ' +
          item.ProdTitle
        break
      case 'Kích hoạt bảo hành':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' kích hoạt bảo hành - dịch vụ thẻ ' +
          item.ProdTitle
        break
      case 'Thay đổi cơ sở':
        text =
          'Khách hàng ' +
          item.MemberName +
          ' - ' +
          item.MemberPhone +
          ' chuyển dịch vụ ' +
          item.ProdTitle +
          ' tới cơ sở ' +
          item.ToStockTitle
        break
    }
    const newArr = [
      index + 1,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.UserName,
      item.StockTitle,
      item.Title,
      text,
      item.Desc
    ]
    newExport.push(newArr)
  })
  return newExport
}

function DV_SU_DUNG_DIEM_KHAC(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'ĐÃ DÙNG',
    'NGÀY DÙNG GẦN NHẤT',
    'CƠ SỞ MUA',
    'SỐ BUỔI',
    'GIÁ TRỊ BUỔI',
    'GIÁ TRỊ THẺ',
    'TÊN THẺ',
    'ID THẺ',
    'NGÀY MUA'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [
      index + 1,
      item.Ho_ten,
      item.SDT,
      item.Da_dung,
      window.top.moment(item.Ngay_dung_gan_nhat).format('HH:mm DD/MM/YYYY'),
      item.Diem_mua,
      item.So_buoi,
      item.Gia_tri_buoi,
      item.Gia_tri_the,
      item.The,
      item.The_ID,
      window.top.moment(item.Ngay_mua).format('HH:mm DD/MM/YYYY')
    ]
    newExport.push(newArr)
  })
  return newExport
}

function DV_CHUA_UPLOAD_ANH(member) {
  const { Lst } = member
  const HeadTable = [
    'STT',
    'ID',
    'ID ĐƠN HÀNG',
    'NGÀY BÁN',
    'NGÀY ĐẶT LỊCH',
    'CƠ SỞ',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'DỊCH VỤ',
    'DỊCH VỤ THẺ',
    'NHÂN VIÊN THỰC HIỆN'
  ]
  const newExport = [HeadTable]
  Lst.map((item, index) => {
    let Member = item?.MemberInfo ? JSON.parse(item?.MemberInfo) : null
    let SalaryJSON = item?.SalaryJSON ? JSON.parse(item?.SalaryJSON) : null
    let StockTitle = ''

    if (window.top.Info && window.top.Info.Stocks) {
      let index = window.top.Info.Stocks.findIndex(x => x.ID === item.StockID)
      if (index > -1) {
        StockTitle = window.top.Info.Stocks[index].Title
      }
    }

    const newArr = [
      index + 1,
      item.ID,
      item.OrderID,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.BookDate
        ? window.top.moment(item.BookDate).format('HH:mm DD/MM/YYYY')
        : '',
      StockTitle,
      Member.FullName,
      Member.MobilePhone,
      item.RootTitle,
      item.OrderTitle,
      SalaryJSON && SalaryJSON.salaryList && SalaryJSON.salaryList.length > 0
        ? SalaryJSON?.salaryList
            .map(
              item => `${item.StaffName} (${PriceHelper.formatVND(item.Value)})`
            )
            .join(', ')
        : 'Chưa xác định'
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportSaleReduced(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'NGÀY',
    'CƠ SỞ',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'THẺ DỊCH VỤ',
    'SỐ BUỔI',
    'DOANH SỐ GIẢM TRỪ'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [
      index + 1,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.StockTitle,
      item.MemberName,
      item.MemberPhone,
      item.ProdTitle,
      item.OSUpdate,
      item.Title === 'Xóa buổi' ? item.GiveMM : item.OrderToToPayAdj
    ]
    newExport.push(newArr)
  })
  return newExport
}

function DOANH_SO_DON_HANG(member, type) {
  const { Items } = member
  let HeadTable = [
    'STT',
    'MÃ ĐƠN HÀNG',
    'CƠ SỞ',
    'NGÀY',
    'MÃ KHÁCH HÀNG',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'NGUỒN KHÁCH HÀNG',
    'NGUYÊN GIÁ',
    'GIẢM / TĂNG GIÁ',
    'TỔNG TIỀN',
    'VOUCHER',
    'CÒN LẠI',
    'GIẢM GIÁ CẢ ĐƠN',
    'GIÁ TRỊ GIẢM CẢ ĐƠN',
    'CẦN THANH TOÁN',
    'KHẤU TRỪ TRẢ HÀNG - KT',
    'TỔNG ĐÃ THANH TOÁN',
    'TM+CK+QT',
    'TIỀN MẶT',
    'CHUYỂN KHOẢN',
    'QUẸT THẺ',
    'VÍ',
    'THẺ TIỀN',
    'CÒN NỢ',
    'NGÀY HẸN THANH TOÁN',
    'LOẠI',
    'SHIP CODE',
    'GHI CHÚ',
    'CHI TIẾT'
  ]
  let newExport = [HeadTable]
  let newRows = []
  if (Number(type) === 1) {
    var indexStart = 3
    newExport = [[...HeadTable, 'SỐ LƯỢNG', 'THÀNH TIỀN']]
    for (let [index, item] of Items.entries()) {
      let count = 0
      if (item.Prod) {
        let newProd = htmlDecode(item.Prod).split(';')
        for (let [idx, prod] of newProd.entries()) {
          let newArr = [
            index + 1,
            '#' + item.Id,
            item.StockName,
            window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
            item.MemberID,
            item.MemberName,
            item.MemberPhone,
            item.MemberSource || 'Chưa xác định',
            item.Value,
            Math.abs(parseInt(item.ReducedValue)),
            item.TotalValue,
            item.VoucherCode == '' ? 'Chưa có' : item.VoucherCode,
            item.ToMoney,
            item.CustomeDiscount,
            item.ToMoney - item.ToPay,
            item.ToPay,
            item.Khau_tru,
            item.DaThToan +
              (item.DaThToan_ThTien == null ? 0 : item.DaThToan_ThTien) +
              (item.DaThToan_Vi == null ? 0 : item.DaThToan_Vi),
            item.DaThToan,
            item.DaThToan_TM == null ? 0 : item.DaThToan_TM,
            item.DaThToan_CK == null ? 0 : item.DaThToan_CK,
            item.DaThToan_QT == null ? 0 : item.DaThToan_QT,
            Math.abs(parseInt(item.DaThToan_Vi)),
            Math.abs(parseInt(item.DaThToan_ThTien)),
            Math.abs(parseInt(item.ConNo)),
            item.DayToPay
              ? window.top.moment(item.DayToPay).format('HH:mm DD/MM/YYYY')
              : '',
            item.IsNewMember == 0 ? 'Khách cũ' : 'Khách mới',
            item.ShipCode,
            item.Desc,
            prod.replaceAll(removeValueInsideBracket(prod), ''),
            Number(getValueInsideBracket(prod)),
            Number(getValueInsideBracket(prod, true))
          ]
          newExport.push(newArr)
        }

        count = count + newProd.length
      }
      if (item.Svr) {
        let newSvr = htmlDecode(item.Svr).split(';')
        for (let [idx, sv] of newSvr.entries()) {
          let newArr = [
            index + 1,
            '#' + item.Id,
            item.StockName,
            window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
            item.MemberID,
            item.MemberName,
            item.MemberPhone,
            item.MemberSource || 'Chưa xác định',
            item.Value,
            Math.abs(parseInt(item.ReducedValue)),
            item.TotalValue,
            item.VoucherCode == '' ? 'Chưa có' : item.VoucherCode,
            item.ToMoney,
            item.CustomeDiscount,
            item.ToMoney - item.ToPay,
            item.ToPay,
            item.Khau_tru,
            item.DaThToan +
              (item.DaThToan_ThTien == null ? 0 : item.DaThToan_ThTien) +
              (item.DaThToan_Vi == null ? 0 : item.DaThToan_Vi),
            item.DaThToan,
            item.DaThToan_TM == null ? 0 : item.DaThToan_TM,
            item.DaThToan_CK == null ? 0 : item.DaThToan_CK,
            item.DaThToan_QT == null ? 0 : item.DaThToan_QT,
            Math.abs(parseInt(item.DaThToan_Vi)),
            Math.abs(parseInt(item.DaThToan_ThTien)),
            Math.abs(parseInt(item.ConNo)),
            item.DayToPay
              ? window.top.moment(item.DayToPay).format('HH:mm DD/MM/YYYY')
              : '',
            item.IsNewMember == 0 ? 'Khách cũ' : 'Khách mới',
            item.ShipCode,
            item.Desc,
            sv.replaceAll(removeValueInsideBracket(sv), ''),
            Number(getValueInsideBracket(sv)),
            Number(getValueInsideBracket(sv, true))
          ]
          newExport.push(newArr)
        }
        count = count + newSvr.length
      }

      if (index > 0) {
        if (count > 0) {
          indexStart = indexStart + newRows[index - 1].rowCount
        } else {
          indexStart = indexStart + 1
        }
      }

      let rowObj = {
        row: indexStart,
        rowCount: count || 1
      }
      newRows.push(rowObj)
    }
  } else {
    if (Number(type) !== 3) {
      Items.map((item, index) => {
        var lines = `${item.Prod ? `${item.Prod}, ` : ''}${item.Svr || ''}`

        const newArr = [
          index + 1,
          '#' + item.Id,
          item.StockName,
          window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
          '#' + item.MemberID,
          item.MemberName,
          item.MemberPhone,
          item.MemberSource || 'Chưa xác định',
          item.Value,
          Math.abs(parseInt(item.ReducedValue)),
          item.TotalValue,
          item.VoucherCode == '' ? 'Chưa có' : item.VoucherCode,
          item.ToMoney,
          item.CustomeDiscount,
          item.ToMoney - item.ToPay,
          item.ToPay,
          item.Khau_tru,
          item.DaThToan +
            (item.DaThToan_ThTien == null
              ? 0
              : Math.abs(item.DaThToan_ThTien)) +
            (item.DaThToan_Vi == null ? 0 : Math.abs(item.DaThToan_Vi)),
          item.DaThToan,
          item.DaThToan_TM == null ? 0 : item.DaThToan_TM,
          item.DaThToan_CK == null ? 0 : item.DaThToan_CK,
          item.DaThToan_QT == null ? 0 : item.DaThToan_QT,
          Math.abs(parseInt(item.DaThToan_Vi)),
          Math.abs(parseInt(item.DaThToan_ThTien)),
          Math.abs(parseInt(item.ConNo)),
          item.DayToPay
            ? window.top.moment(item.DayToPay).format('HH:mm DD/MM/YYYY')
            : '',
          item.IsNewMember == 0 ? 'Khách cũ' : 'Khách mới',
          item.ShipCode,
          item.Desc,
          lines
        ]
        newExport.push(newArr)
      })
    }

    if (Number(type) === 2) {
      newExport = newExport.map(x => {
        let valuesArr = [...x]
        let removeValFrom = [7, 26, 27]
        valuesArr = valuesArr.filter((value, index) => {
          return removeValFrom.indexOf(index) == -1
        })

        return valuesArr
      })
    }

    if (Number(type) === 3) {
      HeadTable = [
        'STT',
        'MÃ ĐƠN HÀNG',
        'CƠ SỞ',
        'NGÀY',
        'MÃ KHÁCH HÀNG',
        'KHÁCH HÀNG',
        'SỐ ĐIỆN THOẠI',
        'NGUỒN KHÁCH HÀNG',
        'NGUYÊN GIÁ',
        'GIẢM / TĂNG GIÁ',
        'TỔNG TIỀN',
        'VOUCHER',
        'CÒN LẠI',
        'GIẢM GIÁ CẢ ĐƠN',
        'GIÁ TRỊ GIẢM CẢ ĐƠN',
        'CẦN THANH TOÁN',
        'KHẤU TRỪ TRẢ HÀNG - KT',
        'TỔNG ĐÃ THANH TOÁN',
        'TM+CK+QT',
        'TIỀN MẶT',
        'CHUYỂN KHOẢN',
        'QUẸT THẺ',
        'VÍ',
        'THẺ TIỀN',
        'CÒN NỢ',
        'NGÀY HẸN THANH TOÁN',
        'LOẠI',
        'TAGS ĐƠN HÀNG',
        'SHIP CODE',
        'GHI CHÚ',
        'CHI TIẾT'
      ]

      Items.map((item, index) => {
        var lines = `${item.Prod ? `${item.Prod}, ` : ''}${item.Svr || ''}`

        const newArr = [
          index + 1,
          '#' + item.Id,
          item.StockName,
          window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
          '#' + item.MemberID,
          item.MemberName,
          item.MemberPhone,
          item.MemberSource || 'Chưa xác định',
          item.Value,
          Math.abs(parseInt(item.ReducedValue)),
          item.TotalValue,
          item.VoucherCode == '' ? 'Chưa có' : item.VoucherCode,
          item.ToMoney,
          item.CustomeDiscount,
          item.ToMoney - item.ToPay,
          item.ToPay,
          item.Khau_tru,
          item.DaThToan +
            (item.DaThToan_ThTien == null
              ? 0
              : Math.abs(item.DaThToan_ThTien)) +
            (item.DaThToan_Vi == null ? 0 : Math.abs(item.DaThToan_Vi)),
          item.DaThToan,
          item.DaThToan_TM == null ? 0 : item.DaThToan_TM,
          item.DaThToan_CK == null ? 0 : item.DaThToan_CK,
          item.DaThToan_QT == null ? 0 : item.DaThToan_QT,
          Math.abs(parseInt(item.DaThToan_Vi)),
          Math.abs(parseInt(item.DaThToan_ThTien)),
          Math.abs(parseInt(item.ConNo)),
          item.DayToPay
            ? window.top.moment(item.DayToPay).format('HH:mm DD/MM/YYYY')
            : '',
          item.IsNewMember == 0 ? 'Khách cũ' : 'Khách mới',
          item.TagOrder,
          item.ShipCode,
          item.Desc,
          lines
        ]
        newExport.push(newArr)
      })
    }
  }
  return {
    List: newExport,
    TotalColumn: newExport[0].length,
    Rows: newRows
  }
}

function DICH_VU_XUAT_HOA_DON(member, type) {
  const { Lst } = member
  let HeadTable = [
    'STT',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'ID ĐƠN HÀNG',
    'CƠ SỞ',
    'NGÀY BÁN',
    'TÊN SẢN PHẨM',
    'SỐ LƯỢNG',
    'SỐ BUỔI LIỆU TRÌNH',
    'THÀNH TIỀN',
    'ĐÃ THANH TOÁN',
    'CÒN NỢ',
    'SỐ BUỔI KM',
    'SỐ BUỔI ĐÃ SỬ DỤNG',
    'GIÁ TRỊ XUẤT HĐ',
    'SỐ BUỔI CHUYỂN LIỆU TRÌNH',
    'SỐ BUỔI ĐÃ XOÁ',
    'NGÀY THANH NỢ',
    'GHI CHÚ'
  ]
  let newExport = [HeadTable]
  let newRows = []

  for (let [index, item] of Lst.entries()) {
    newExport.push([
      index + 1,
      item.Ten_Khach_Hang,
      item.SDT,
      item.DonHangID,
      item.Co_so,
      item.Ngay_ban
        ? window.top.moment(item.Ngay_ban).format('DD/MM/YYYY')
        : '',
      item.Ten_san_pham,
      item.So_luong,
      item.So_buoi_lieu_tring,
      item.Thanh_tien,
      item.Da_Thanh_toan,
      item.Con_no,
      item.So_buoi_km,
      item.So_buoi_su_dung,
      item.Gia_tri_xuat_hd,
      item.So_buoi_chuyen_lieu_trinh,
      item.So_buoi_da_xoa,
      item.Ngay_thanh_toan_no
        ? window.top.moment(item.Ngay_thanh_toan_no).format('DD/MM/YYYY')
        : '',
      item.Ghi_chu
    ])
  }

  return {
    List: newExport,
    TotalColumn: newExport[0].length
  }
}

function exportProdSaleList(member, ShowX) {
  if (ShowX == '3') {
    const HeadTable = [
      'TÊN CƠ SỞ',
      'MÃ CƠ SỞ',
      'VÙNG (THÀNH PHỐ)',
      'LOẠI',
      'MÃ HÀNG',
      'TÊN MẶT HÀNG',
      'ĐƠN VỊ',
      'SỐ LƯỢNG'
    ]

    let Lists = []

    for (let item of member.lst || []) {
      for (let stock of item.Stocks || []) {
        let DescSEO = stock.Ent.DescSEO ? JSON.parse(stock.Ent.DescSEO) : null
        let City = ''
        let Type = ''
        if (DescSEO && DescSEO.place && DescSEO.place.length > 0) {
          City = DescSEO.place[0].Title
        }

        let Stocks = null

        if (window.top.Info && window.top.Info.Stocks) {
          Stocks = window.top.Info.Stocks.filter(x => x.ParentID > 0)
        }

        let index = Stocks && Stocks.findIndex(x => x.ID == stock.ID)

        if (item.ProdOrService === 0) Type = 'Sản phẩm'
        if (item.ProdOrService === 1) Type = 'Dịch vụ'
        if (item.ProdOrService === 2) Type = 'Phụ phí'
        if (item.ProdOrService === 3) Type = 'Nguyên vật liệu'
        if (item.ProdOrService === 4) Type = 'Thẻ tiền'

        Lists.push([
          stock.ID,
          stock.Title,
          index > -1 ? Stocks[index].TitleSEO : '',
          City,
          Type,
          item.ProdCode,
          item.ProdTitle,
          item.Unit,
          stock.Qty
        ])
      }
    }

    Lists.sort((a, b) => a[0] - b[0]).map(x => x.shift())

    Lists.unshift(HeadTable)

    if (
      window.top.GlobalConfig &&
      !window.top.GlobalConfig.Admin.dinh_dang_ma_don_nhap_xuat_kho
    ) {
      Lists = Lists.map(item => {
        item.splice(1, 1)
        return item
      })
    }

    return {
      Lists,
      Columns: HeadTable.length,
      Rows: Lists.length
    }
  } else if (ShowX === '4') {
    const HeadTable = [
      'STT',
      'ID',
      'CƠ SỞ',
      'MÃ CƠ SỞ',
      'VÙNG (THÀNH PHỐ)',
      'NGÀY',
      'MÃ ĐH',
      'ID KHÁCH',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'ID MẶT HÀNG',
      'MÃ MẶT HÀNG',
      'TÊN MẶT HÀNG',
      'LOẠI',
      'NHÓM PHÂN LOẠI',
      'SỐ LƯỢNG',
      'GIÁ GỐC',
      'GIÁ GIẢM',
      'VOUCHER',
      'GIÁ SAU VOUCHER',
      'GIẢM GIÁ CẢ ĐƠN',
      'TỔNG TIỀN',
      'TM/CK/QT',
      'VÍ / THẺ TIỀN',
      'TRẢ HÀNG / KTT',
      'CÒN NỢ',
      'LOẠI',
      'TAGS ĐƠN HÀNG'
    ]
    let Lists = [HeadTable]

    for (let [i, rowData] of (member.result || []).entries()) {
      let Type = ''
      if (rowData.ProdOrService === 0) Type = 'Sản phẩm'
      if (rowData.ProdOrService === 1) Type = 'Dịch vụ'
      if (rowData.ProdOrService === 2) Type = 'Phụ phí'
      if (rowData.ProdOrService === 3) Type = 'Nguyên vật liệu'
      if (rowData.ProdOrService === 4) Type = 'Thẻ tiền'

      let obj = [
        i + 1,
        rowData.ID,
        rowData.StockTitle,
        rowData.StockCode,
        rowData.StockCity,
        window.top.moment(rowData.CreateDate).format('HH:mm DD/MM/YYYY'),
        rowData.OrderID,
        rowData.SenderID,
        rowData.SenderName,
        rowData.SenderPhone,
        rowData.ProdID,
        rowData.ProdCode,
        rowData.ProdTitle,
        Type,
        rowData.TypeTitle,
        rowData.Qty,
        rowData.Price,
        rowData.PriceOrder,
        rowData.VoucherValue,
        rowData.ToMoney - rowData.VoucherValue,
        rowData.CustomeDiscount > 0
          ? rowData.CustomeDiscount
          : `${rowData.CustomeDiscount}%`,
        rowData.ToPay,
        rowData.CPayedReal,
        rowData.MPayed,
        Math.abs((rowData.CPayed || 0) - (rowData.CPayedReal || 0)),
        Math.abs(
          (rowData.ToPay || 0) -
            Math.abs(rowData.CPayed || 0) -
            Math.abs(rowData.MPayed || 0)
        ),
        rowData.IsNewMember && rowData.IsNewMember === 1
          ? 'Khách mới'
          : 'Khách cũ',
        rowData.TagOrder
      ]

      Lists.push(obj)
    }

    if (
      window.top.GlobalConfig &&
      !window.top.GlobalConfig.Admin.dinh_dang_ma_don_nhap_xuat_kho
    ) {
      Lists = Lists.map(item => {
        item.splice(3, 1)
        return item
      })
    }

    return {
      Lists,
      Columns: HeadTable.length,
      Rows: Lists.length
    }
  } else if (ShowX == '2') {
    const HeadTable = ['TÊN MẶT HÀNG', 'MÃ', 'SL']

    if (window.top.Info && window.top.Info.StockRights.length > 0) {
      for (let stock of window.top.Info.StockRights) {
        HeadTable.push(stock.Title.toUpperCase())
      }
    }

    let Lists = [HeadTable]

    for (let item of member.lst || []) {
      let obj = [item.ProdTitle, item.ProdCode, item.Qty]
      if (window.top.Info && window.top.Info.StockRights.length > 0) {
        for (let stock of window.top.Info.StockRights) {
          let index =
            item.Stocks && item.Stocks.findIndex(x => x.Title == stock.Title)
          if (index > -1) {
            obj.push(item.Stocks[index].Qty)
          } else {
            obj.push('')
          }
        }
      }
      Lists.push(obj)
    }

    return {
      Lists,
      Columns: HeadTable.length,
      Rows: Lists.length
    }
  } else {
    const HeadTable = [
      'TÊN MẶT HÀNG',
      'MÃ',
      'ĐƠN VỊ',
      'SL',
      'DOANH SỐ',
      'VÍ + THẺ TIỀN',
      'THỰC THU'
    ]
    const newProd = [[...HeadTable]]
    const newSer = [HeadTable]
    const newCard = [HeadTable]
    member.map(item => {
      if (item.Format == 1) {
        const newArrProd = [
          item.ProdTitle,
          item.DynamicID,
          item.StockUnit,
          item.SumQTy,
          item.SumTopay,
          item.Vi + item.TT,
          item.QT + item.CK + item.TM
        ]
        newProd.push(newArrProd)
      } else if (item.Format == 2) {
        const newArrSer = [
          item.ProdTitle,
          item.DynamicID,
          item.StockUnit,
          item.SumQTy,
          item.SumTopay,
          item.Vi + item.TT,
          item.QT + item.CK + item.TM
        ]
        newSer.push(newArrSer)
      } else if (item.Format == 3) {
        const newArrCard = [
          item.ProdTitle,
          item.DynamicID,
          item.StockUnit,
          item.SumQTy,
          item.SumTopay,
          item.Vi + item.TT,
          item.QT + item.CK + item.TM
        ]
        newCard.push(newArrCard)
      }
    })
    return {
      newProd,
      newSer,
      newCard
    }
  }
}

function exportReturnList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'MÃ ĐƠN HÀNG',
    'CƠ SỞ',
    'NGÀY',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'GIÁ TRỊ',
    'SẢN PHẨM TRẢ LẠI'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    var lines = `${item.Prod ? `${item.Prod} ` : ''}${item.Svr ? ',' : ''}${
      item.Svr || ''
    }`
    const newArr = [
      index + 1,
      '#' + item.Id,
      item.StockName,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.MemberName,
      item.MemberPhone,
      item.ToPay,
      lines
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportReturnDebtList(member) {
  const { Items } = member
  const HeadTable = [
    'NGÀY',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'TỔNG THANH TOÁN NỢ',
    'ĐƠN HÀNG',
    'CƠ SỞ',
    'THANH TOÁN NỢ',
    'CHI TIẾT',
    'THANH TOÁN',
    'VÍ',
    'THẺ TIỀN',
    'SẢN PHẨM'
  ]
  const newExport = [HeadTable]
  var arr1 = []
  var arr2 = []
  var arr3 = []
  Items.map(item => {
    var count1 = 0
    var date = window.top.moment(item.CreateDate).format('DD/MM/YYYY')
    item.ListCustomer.map(e => {
      var count2 = 0
      var cus = e.MemberName
      var phone = e.MemberPhone
      var debt = e.TTToanNo
      e.ListOrders.map(prod => {
        count2 += prod.OrderItems.length
        var inDebt = prod.TTToanNo
        arr2.push(prod.OrderItems.length)
        prod.OrderItems.map(last_prod => {
          const newArr = [
            date,
            cus,
            phone,
            debt,
            '#' + prod.Id,
            prod.StockTitle,
            inDebt,
            last_prod.ToPay,
            last_prod.DaThToan,
            last_prod.DaThToan_Vi,
            last_prod.DaThToan_ThTien,
            last_prod.lines[0].ProdTitle
          ]
          debt = 0
          inDebt = 0
          newExport.push(newArr)
          count1++
        })
      })
      arr3.push(count2)
    })
    arr1.push(count1)
  })

  return {
    newExport,
    arr1,
    arr2,
    arr3
  }
}

function exportTopSaleList(member) {
  const HeadTable = ['TÊN MẶT HÀNG', 'SL', 'DOANH SỐ']
  const newSell = [HeadTable]
  const newSale = [HeadTable]
  var memberSell = member
  var memberSale = member

  memberSell.sort(function (a, b) {
    return b.SumQTy - a.SumQTy
  })
  memberSell.map(item => {
    const newArrSell = [item.ProdTitle, item.SumQTy, item.SumTopay]
    newSell.push(newArrSell)
  })

  memberSale.sort(function (a, b) {
    return b.SumTopay - a.SumTopay
  })
  memberSale.map(item => {
    const newArrSale = [item.ProdTitle, item.SumQTy, item.SumTopay]
    newSale.push(newArrSale)
  })

  return {
    newSell,
    newSale
  }
}

function exportPriceList(member, Type) {
  const { Items } = member
  if (Type === '2') {
    const newArrays = [
      ['STT', 'DỊCH VỤ GỐC', 'TÊN THẺ', 'THEO DỊCH VỤ GỐC', 'THEO THẺ DỊCH VỤ']
    ]

    const newRows = []

    if (!Items || Items.length === 0) {
      return newArrays
    }
    var indexStart = 3

    for (let [index, obj] of Items.entries()) {
      let { NVL, Root, Prod } = obj
      let count = NVL.length > Root.NVL.length ? NVL.length : Root.NVL.length

      if (index > 0) {
        let countPrev =
          Items[index - 1].NVL.length > Items[index - 1].Root.NVL.length
            ? Items[index - 1].NVL.length
            : Items[index - 1].Root.NVL.length
        indexStart = indexStart + (countPrev || 1)
      }
      for (let i = 0; i < (count || 1); i++) {
        let NVLG = Root.NVL && Root.NVL.length > 0 ? Root.NVL[i] : null
        let NVLTT = NVL && NVL.length > 0 ? NVL[i] : null
        let newArray = [
          index + 1,
          `${Root.Prod.DynamicID} - ${Root.Prod.Title}`,
          `${Prod.DynamicID} - ${Prod.Title}`,
          NVLG
            ? `${NVLG.ItemDynamicID} - ${NVLG.Prod.Title} : ${
                NVLG.Qty || '--'
              } (${NVLG.Unit || '--'})`
            : '',
          NVLTT
            ? `${NVLTT.ItemDynamicID} - ${NVLTT.Prod.Title} : ${
                NVLTT.Qty || '--'
              } (${NVLTT.Unit || '--'})`
            : ''
        ]

        if (i === 0 && count > 1) {
          const rowObj = {
            row: indexStart,
            rowCount: count
          }
          newRows.push(rowObj)
        }
        newArrays.push(newArray)
      }
    }

    return {
      List: newArrays,
      Rows: newRows,
      TotalColumn: newArrays[0].length
    }
  } else {
    let HeadTable = [
      'STT',
      'ID',
      'TÊN MẶT HÀNG',
      'MÃ',
      'GIÁ GỐC',
      'NGUYÊN GIÁ',
      'GIÁ HIỆN TẠI',
      'TỒN KHO',
      'DANH MỤC',
      'NHÃN HÀNG',
      'COMBOS',
      window?.top?.GlobalConfig?.Admin?.hoa_hong_tu_van || 'HOA HỒNG TƯ VẤN',
      window?.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_khm ||
        'HOA HỒNG TƯ VẤN KHÁCH MỚI',
      'LƯƠNG CA'
    ]
    if (window?.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_ktv_an) {
      HeadTable = HeadTable.filter(
        x =>
          x !==
          (window?.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_khm ||
            'HOA HỒNG TƯ VẤN KHÁCH MỚI')
      )
    }
    let newExport = [HeadTable]
    Items.map((item, index) => {
      var don_Vi = item.DonVi == null ? '' : item.DonVi
      var txt = item.TonKho == null ? '' : item.TonKho + ' ' + don_Vi
      var price = item.GiaKM == 0 ? item.NguyenGia : item.GiaKM
      let luong_ca = item.luong_ca_dv_goc
        ? item.luong_ca_dv_goc.map(
            o =>
              `${o.RootTitle} - ${
                o.Luong_ca_cap_bac && o.Luong_ca_cap_bac.length > 0
                  ? o.Luong_ca_cap_bac.map(
                      x => `${x.LevelName} : ${x.Salary}`
                    ).join(', ')
                  : 'Lương ca ' + o.Luong_ca
              }`
          )
        : ''
      if (
        item?.Luong_ca > 0 ||
        (item?.Luong_ca_cap_bac && item?.Luong_ca_cap_bac.length > 0)
      ) {
        if (item?.Luong_ca_cap_bac && item?.Luong_ca_cap_bac.length > 0) {
          luong_ca = item?.Luong_ca_cap_bac.map(
            x => `${x.LevelName} : ${x.Salary}`
          ).join(', ')
        } else {
          luong_ca = 'Lương ca ' + item.Luong_ca
        }
      }
      let newArr = []

      let Combos = item?.Combo ? JSON.parse(item?.Combo) : null
      Combos =
        Combos && Combos.length > 1
          ? Combos.map(x => `${x.Title || 'Không xác định'} (x${x.qty})`).join(
              ', '
            )
          : ''

      if (window?.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_ktv_an) {
        newArr = [
          index + 1,
          '#' + item.ID,
          item.Ten,
          item.MaSP,
          item.gia_goc,
          item.NguyenGia,
          price,
          txt,
          item.DanhMuc,
          item.NhanHang,
          Combos,
          item.BonusSaleLevels &&
          item.BonusSaleLevels.length > 0 &&
          item.BonusSaleLevels.some(x => x.Salary)
            ? item.BonusSaleLevels.map(
                x =>
                  `${x.Level} ${
                    Number(x.Salary) > 100
                      ? PriceHelper.formatVND(x.Salary)
                      : x.Salary + '%'
                  }`
              ).join(', ')
            : item.hoa_hong_sale,
          luong_ca
        ]
      } else {
        newArr = [
          index + 1,
          '#' + item.ID,
          item.Ten,
          item.MaSP,
          item.gia_goc,
          item.NguyenGia,
          price,
          txt,
          item.DanhMuc,
          item.NhanHang,
          Combos,
          item.BonusSaleLevels &&
          item.BonusSaleLevels.length > 0 &&
          item.BonusSaleLevels.some(x => x.Salary)
            ? item.BonusSaleLevels.map(
                x =>
                  `${x.Level} ${
                    Number(x.Salary) > 100
                      ? PriceHelper.formatVND(x.Salary)
                      : x.Salary + '%'
                  }`
              ).join(', ')
            : item.hoa_hong_sale,
          item.hoa_hong_ktv,
          luong_ca
        ]
      }
      newExport.push(newArr)
    })

    if (Number(Type) === 1) {
      newExport = newExport.map(x => {
        let valuesArr = [...x]
        let removeValFrom = [6, 7]
        valuesArr = valuesArr.filter((value, index) => {
          return removeValFrom.indexOf(index) == -1
        })

        return valuesArr
      })
    }

    return {
      List: newExport,
      Rows: [],
      TotalColumn: newExport[0].length
    }
  }
}

function exportCashBook(member, ShowsX) {
  let { Items } = member
  let HeadTable = [
    'STT',
    'NGÀY',
    'TIỀN MẶT',
    'CHUYỂN KHOẢN',
    'QUẸT THẺ',
    'TAG',
    'PHÂN LOẠI',
    'NỘI DUNG',
    'CƠ SỞ',
    'KHÁCH HÀNG',
    'NHÂN VIÊN TẠO'
  ]
  if (Number(ShowsX) === 1) {
    HeadTable = [
      'STT',
      'NGÀY',
      'TAG',
      'PHÂN LOẠI',
      'CƠ SỞ',
      'ID ĐƠN HÀNG',
      'KHÁCH HÀNG',
      'ĐIỆN THOẠI',
      'SP/DV',
      'GIÁ TRỊ ĐƠN HÀNG',
      'TIỀN MẶT',
      'CHUYỂN KHOẢN',
      'QUẸT THẺ',
      'CÒN NỢ',
      'NGÀY DỰ KIẾN TT',
      'GHI CHÚ',
      'HOA HỒNG',
      'DOANH SỐ',
      'NHÂN VIÊN TẠO',
      'NGÂN HÀNG'
    ]
  }

  const newExport = [HeadTable]
  Items.map((item, index) => {
    var id = item.Member == null ? '' : item.Member['ID']
    var name = item.Member == null ? 'Chưa xác định' : item.Member['FullName']
    var nameStaff = item.Staff['FullName']
    var idStaff = item.Staff['ID']
    switch (item.Tag) {
      case 'THU_BAN_HANG':
        var tag = 'Thu bán hàng'
        break
      case 'THU_NAP_VI':
        var tag = 'Thu nạp ví'
        break
      case 'CHI_TRA_VI':
        var tag = 'Chi trả ví'
        break
      case 'CHI_TAM_UNG':
        var tag = 'Chi tạm ứng'
        break
      case 'CHI_LUONG':
        var tag = 'Trả lương'
        break
      case 'THU_HOAN_UNG':
        var tag = 'Thu hoàn ứng'
        break
      case 'THU':
        var tag = 'Thu'
        break
      case 'CHI':
        var tag = 'Chi'
        break
      case 'THU_XUAT_KHO':
        var tag = 'Thu xuất kho'
        break
      case 'CHI_NHAP_KHO':
        var tag = 'Chi nhập kho'
        break
    }
    let newArr = [
      index + 1,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      Math.abs(parseInt(item.TM)),
      Math.abs(parseInt(item.CK)),
      Math.abs(parseInt(item.QT)),
      tag,
      item.CustomType,
      item.Content,
      item.StockName,
      name == 'Chưa xác định' ? 'Chưa xác định' : name + '(#' + id + ')',
      nameStaff + '(#' + idStaff + ')'
    ]
    if (Number(ShowsX) === 1) {
      newArr = [
        index + 1,
        window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
        tag,
        item.CustomType,
        item.StockName,
        item.OrderID,
        name == 'Chưa xác định' ? 'Chưa xác định' : name + '(#' + id + ')',
        item.Dien_Thoai,
        item.SPDV,
        item.Gia_tri_Don_hang,
        Math.abs(parseInt(item.TM)),
        Math.abs(parseInt(item.CK)),
        Math.abs(parseInt(item.QT)),
        item.Con_no,
        item.Ngay_TT_Du_kien
          ? window.top.moment(item.Ngay_TT_Du_kien).format('DD/MM/YYYY')
          : '',
        tag === 'Thu bán hàng' ? item.Ghi_chu : item.Content,
        item.Hoa_Hong,
        item.Doanh_So,
        nameStaff + '(#' + idStaff + ')',
        item.Ngan_Hang
      ]
    }
    newExport.push(newArr)
  })
  return newExport
}

function exportDebt(member, ShowsType) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'TỔNG NỢ',
    'ID ĐƠN HÀNG',
    'CƠ SỞ',
    'NGÀY BÁN',
    'TỔNG SỐ TIỀN NỢ',
    'TÊN SẢN PHẨM',
    'SỐ LƯỢNG',
    'THÀNH TIỀN',
    'CÒN NỢ',
    'NGÀY THANH TOÁN NỢ',
    'GHI CHÚ'
  ]
  if (Number(ShowsType) === 3) {
    HeadTable.splice(13, 0, 'NHÂN VIÊN')
  }
  const newExport = [HeadTable]
  var arr = []
  var arr1 = []
  Items.map((item, index) => {
    var stt = index
    var number = 0
    var nameCustomer =
      item.Member && item.Member.FullName
        ? item.Member['FullName']
        : 'Chưa xác định'
    var phoneCustomer =
      item.Member && item.Member.Phone ? item.Member['Phone'] : 'Chưa xác định'
    var totalDebt = item.TongNo
    item.ListOrders.map(e => {
      var create = window.top.moment(e.CreateDate).format('DD/MM/YYYY')
      var id = e.Id
      arr1.push(e.ListDebt.length)
      var conNo = 0
      if (e.ListDebt.length == 1) {
        conNo = e.ListDebt[0].ConNo
      } else {
        for (let i = 0; i < e.ListDebt.length; i++) {
          conNo += e.ListDebt[i].ConNo
        }
      }
      e.ListDebt.map((el, i) => {
        let newArr = [
          stt + 1,
          nameCustomer,
          phoneCustomer,
          totalDebt,
          '#' + id,
          e.StockName,
          create,
          i == 0 ? conNo : 0,
          el.ProdTitle,
          el.Qty,
          el.ToPay,
          el.ConNo,
          e.DayToPay ? window.top.moment(e.DayToPay).format('DD-MM-YYYY') : '',
          e.Desc
        ]

        if (Number(ShowsType) === 3) {
          newArr.splice(
            13,
            0,
            el.Staffs && el.Staffs.length > 0
              ? el.Staffs.map(x => x.FullName).join(', ')
              : ''
          )
        }

        number++
        newExport.push(newArr)
        totalDebt = 0
      })
    })
    arr.push(number)
  })
  return {
    newExport,
    arr,
    arr1
  }
}

function exportDebt2(Items, filters) {
  const HeadTable = ['STT']
  const newExport = []

  const formatText = text => {
    if (text.includes('Nợ trước')) {
      return 'Nợ trước kỳ'
    }
    if (text.includes('Bán mới trong kỳ')) {
      return 'Nợ phát sinh trong kỳ'
    }
    if (text.includes('Tổng thanh toán') && !text.includes(')_')) {
      return 'Thanh toán, trả nợ cũ'
    }
    if (text.includes('Nợ cuối')) {
      return 'Nợ cuối kỳ'
    }
    if (text.includes('_TM')) {
      return 'Tiền mặt'
    }
    if (text.includes('_CK')) {
      return 'Chuyển khoản'
    }
    if (text.includes('_QT')) {
      return 'Quẹt thẻ'
    }
    if (text.includes('_TT')) {
      return 'Thẻ tiền'
    }
    if (text.includes('_VI')) {
      return 'Ví'
    }
    if (text.includes('_KTT')) {
      return 'Kết thúc thẻ'
    }
    if (text.includes('_TRA_HANG')) {
      return 'Trả hàng'
    }
    if (text.includes('_KET_NO')) {
      return 'Tặng'
    }
    if (text.includes('_KHOA_NO')) {
      return 'Khoá nợ'
    }
    return text
  }

  const convertArray2 = arrays => {
    const newArray = []
    if (!arrays || arrays.length === 0) {
      return newArray
    }
    for (let item of arrays) {
      let obj = {
        TTTK: [],
        TTT: []
      }
      for (const property in item) {
        if (
          property !== 'SenderID' &&
          !property.includes('Thanh toán nợ trước') &&
          !property.includes('Còn lại nợ trước') &&
          !property.includes('Nợ của các đơn trong kỳ')
        ) {
          if (
            property.includes('Thanh toán cho đơn trong kỳ') &&
            property.includes(')_')
          ) {
            obj.TTTK.push({
              name: property,
              value: item[property]
            })
          } else if (
            property.includes('Tổng thanh toán') &&
            property.includes(')_')
          ) {
            obj.TTT.push({
              name: property,
              value: item[property]
            })
          } else {
            if (!property.includes('Thanh toán cho đơn trong kỳ')) {
              obj[property] = item[property]
            }
          }
        }
      }
      newArray.push(obj)
    }
    return newArray
  }

  if (Items && Items.length > 0) {
    let newItems = convertArray2(Items)
    let subItems = []

    for (const property in newItems[0]) {
      if (property !== 'TTTK' && property !== 'TTT') {
        HeadTable.push(formatText(property))
      } else {
        if (property === 'TTTK') {
          for (let key of newItems[0]['TTTK']) {
            subItems.push('Trong kỳ - ' + formatText(key.name))
          }
        }
        if (property === 'TTT') {
          for (let key of newItems[0]['TTT']) {
            subItems.push('Nợ cũ - ' + formatText(key.name))
          }
        }
      }
    }
    newExport.push([...HeadTable, ...subItems])
    for (let [i, item] of newItems.entries()) {
      let ItemBody = [i + 1]
      let SubBody = []

      for (const property in item) {
        if (property !== 'TTTK' && property !== 'TTT') {
          ItemBody.push(item[property])
        } else {
          if (property === 'TTTK') {
            for (let key of item['TTTK']) {
              SubBody.push(key.value)
            }
          }
          if (property === 'TTT') {
            for (let [idx, key] of item['TTT'].entries()) {
              SubBody.push(key.value - item['TTTK'][idx].value)
            }
          }
        }
      }
      newExport.push([...ItemBody, ...SubBody])
    }
  }

  return {
    Items: newExport,
    Columns: newExport[0].length,
    Rows: newExport.length
  }
}

function exportDebtLockList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'ID ĐƠN HÀNG',
    'NGÀY BÁN',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'NGÀY KHÓA NỢ',
    'SỐ TIỀN KHÓA NỢ',
    'NGƯỜI TẠO KHÓA NỢ',
    'THỜI GIAN KHÓA NỢ',
    'GHI CHÚ'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    var nameCustomer = item.Member['FullName']
    var phoneCustomer = item.Member['Phone']
    var nameStaff = item.Staff['FullName']
    var idStaff = item.Staff['ID']
    const newArr = [
      index + 1,
      '#' + item.Id,
      window.top.moment(item.NgayBanDH).format('HH:mm DD/MM/YYYY'),
      nameCustomer,
      phoneCustomer,
      window.top.moment(item.NgayKhoaNo).format('HH:mm DD/MM/YYYY'),
      item.SoTienKhoaNo,
      nameStaff + '(#' + idStaff + ')',
      window.top.moment(item.ThoiGianKhoaNo).format('HH:mm DD/MM/YYYY'),
      item.Desc
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportGiftList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'ID ĐƠN HÀNG',
    'NGÀY BÁN',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'NGÀY TẶNG',
    'SỐ TIỀN TẶNG',
    'NGƯỜI TẠO ĐƠN TẶNG',
    'THỜI GIAN TẶNG',
    'GHI CHÚ'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    var nameCustomer = item.Member['FullName']
    var phoneCustomer = item.Member['Phone']
    var nameStaff = item.Staff['FullName']
    var idStaff = item.Staff['ID']
    const newArr = [
      index + 1,
      '#' + item.OrderID,
      window.top.moment(item.NgayBanDH).format('HH:mm DD/MM/YYYY'),
      nameCustomer,
      phoneCustomer,
      window.top.moment(item.NgayTang).format('HH:mm DD/MM/YYYY'),
      item.SoTienTang,
      nameStaff + '(#' + idStaff + ')',
      window.top.moment(item.ThoiGianTang).format('HH:mm DD/MM/YYYY'),
      item.Desc
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportServiceSalaryList(member, ShowsX) {
  if (ShowsX === '3') {
    let Items = member.List || []
    const HeadTable = [
      'STT',
      'ID DỊCH VỤ / LỚP',
      'THỜI GIAN',
      'CƠ SỞ',
      'TÊN NHÂN VIÊN',
      'TỔNG LƯƠNG',
      'THEO SETUP',
      'EXTRA',
      'DỊCH VỤ GỐC',
      'THẺ DỊCH VỤ',
      'MÔ TẢ',
      'HỆ SỐ DỊCH VỤ',
      'KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI'
    ]

    const newExport = [HeadTable]
    Items.map((item, index) => {
      const newArr = [
        index + 1,
        item.OrderServiceID || `Lớp (${item.ClassID})`,
        item.CreateDate
          ? window.top.moment(item.CreateDate).format('HH:mm DD-MM-YYYY')
          : 'Không xác định',
        item.Stock && item.Stock.Title,
        item.UserFullName,
        item.Value,
        item.OrderServiceID ? item.ValueSetup : '',
        item.OrderServiceID ? item.ValueExtra : '',
        item.Root && item.Root.Title,
        item.OrderServiceID ? item.Prod?.Title || '' : item.MethodTitle || '',
        item.Desc,
        item.TourSalaryRatio,
        item.Member && item.Member.FullName,
        item.Member && item.Member.MobilePhone
      ]
      newExport.push(newArr)
    })
    return newExport
  }

  const HeadTable = [
    'STT',
    'TÊN NHÂN VIÊN',
    'LƯƠNG CA VÀ PHỤ PHÍ',
    'NGÀY LÀM',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'DỊCH VỤ GỐC',
    'THẺ DỊCH VỤ',
    'ID ĐƠN HÀNG',
    'ID BUỔI DỊCH VỤ / LỚP',
    'GIÁ BUỔI',
    'PHỤ PHÍ',
    'CƠ SỞ'
  ]
  const newExport = [HeadTable]
  for (const [index, item] of (member.Items || []).entries()) {
    newExport.push([
      index + 1,
      (item.Staffs || []).map(staff => staff.FullName).join(', '),
      item.LuongCa_PPhi?.Tong_Luong ?? 0,
      item.Ngay_Lam
        ? window.top.moment(item.Ngay_Lam).format('HH:mm DD-MM-YYYY')
        : 'Không xác định',
      item.Member?.FullName,
      item.Member?.Phone,
      item.DV_Goc?.ProdTitle,
      item.ID ? item.The_DV?.CardTitle : item.MethodTitle,
      item.Salary?.salaryList?.[0]?.OrderID ?? '',
      item.ID ? item.ID_Buoi_Dv : `Lớp (${item.ClassID})`,
      item.ID ? item.giabuoi : '',
      (item.LuongCa_PPhi?.DS_PP || []).map(fee => fee.Title).join(', '),
      item.StockName
    ])
  }
  return newExport
}

function exportServiceSalaryTIP(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'TÊN NHÂN VIÊN',
    'THỜI GIAN',
    'CƠ SỞ',
    'TIỀN TIP',
    'NỘI DUNG'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [
      index + 1,
      item.ReceiverName,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.StockTitle,
      item.Value,
      item.Desc
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportCommissionStaffList(member) {
  const { Items } = member
  const HeadTable = [
    'NGÀY',
    'TỔNG HOA HỒNG',
    'NHÂN VIÊN',
    'HOA HỒNG',
    'ĐƠN HÀNG',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'HOA HỒNG',
    'HH SẢN PHẨM',
    'HH DỊCH VỤ',
    'HH THẺ TIỀN',
    'HH NVL',
    'HH PHỤ PHÍ',
    'CHI TIẾT'
  ]
  const newExport = [HeadTable]
  var arr1 = []
  var arr2 = []
  Items.map(item => {
    var number1 = 0
    var date = window.top.moment(item.CreateDate).format('DD/MM/YYYY')
    var totalCommission = item.Tong
    item.StaffsList.map(element => {
      var nameStaff = element.Staff['FullName']
      var commission = element.Tong
      arr2.push(element.OrdersList.length)
      element.OrdersList &&
        element.OrdersList.map((el, i) => {
          var nameCus = el.Member['FullName']
          var phoneCus = el.Member['Phone']
          var detailList = ''
          var valueList = 0
          el.Lines.map(name => {
            detailList += name.ProdTitle + '( ' + name.GiaTri + ' ), '
            valueList += name.GiaTri
          })
          const newArr = [
            date,
            item.TongThuc,
            nameStaff,
            element.TongThuc,
            '#' + el.ID,
            nameCus,
            phoneCus,
            el.GiaTriThuc,
            el.GiaTri_Sanpham,
            el.GiaTri_Dichvu,
            el.GiaTri_Thetien,
            el.GiaTri_NVL,
            el.GiaTri_Phuphi,
            detailList.substring(0, detailList.lastIndexOf(','))
          ]
          number1++
          totalCommission = 0
          commission = 0
          newExport.push(newArr)
        })
    })
    arr1.push(number1)
  })

  return {
    newExport,
    arr1,
    arr2
  }
}

function exportStaffSalesList(member, configs) {
  const { Items } = member
  const HeadTable = [
    'NGÀY',
    'TỔNG DOANH SỐ',
    'NHÂN VIÊN',
    'CƠ SỞ NHÂN VIÊN',
    'DOANH SỐ',
    'ĐƠN HÀNG',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'DOANH SỐ',
    'CHI TIẾT'
  ]

  if (window.top.GlobalConfig && window.top.GlobalConfig.Admin.kpi_ngay) {
    HeadTable.splice(5, 0, 'THƯỞNG')
  }

  //StockIDs

  const newExport = [HeadTable]
  var arr1 = []
  var arr2 = []
  Items.map(item => {
    var number1 = 0
    var date = window.top.moment(item.CreateDate).format('DD/MM/YYYY')
    var totalCommission = item.Tong

    let Threshold = null
    if (configs && item.StockIDs && item.StockIDs.length === 1) {
      let index = configs.findIndex(x => x.ID === item.StockIDs[0])
      if (
        index > -1 &&
        configs[index].Children &&
        configs[index].Children.length > 0
      ) {
        let ThresholdIndex = configs[index].Children.findIndex(
          x => x.FromValue <= item.TongThuc && item.TongThuc < x.ToValue
        )
        if (ThresholdIndex > -1)
          Threshold = configs[index].Children[ThresholdIndex].Value
      } else {
        let index = configs.findIndex(x => x.ID === '-1')
        if (
          index > -1 &&
          configs[index].Children &&
          configs[index].Children.length > 0
        ) {
          let ThresholdIndex = configs[index].Children.findIndex(
            x => x.FromValue <= item.TongThuc && item.TongThuc < x.ToValue
          )
          if (ThresholdIndex > -1)
            Threshold = configs[index].Children[ThresholdIndex].Value
        }
      }
    }

    item.StaffsList.map(element => {
      var nameStaff = element.Staff['FullName']
      var stockStaff = element.Staff['StockTitle']
      var commission = element.Tong
      arr2.push(element.OrdersList.length)

      let ThresholdRewards = 0
      if (Threshold) {
        if (Threshold <= 100) {
          ThresholdRewards = (Threshold * element.TongThuc) / 100
        } else {
          let StaffPercent = (element.TongThuc / item.TongThuc) * 100
          ThresholdRewards = (StaffPercent * Threshold) / 100
          //
        }
      }

      element.OrdersList &&
        element.OrdersList.map((el, i) => {
          var nameCus = el.Member['FullName']
          var phoneCus = el.Member['Phone']
          var detailList = ''
          var valueList = el.GiaTriThuc
          el.Lines.map(name => {
            detailList += name.ProdTitle + '( ' + name.GiaTri + ' ), '
            //valueList += name.GiaTri
          })
          const newArr = [
            date,
            totalCommission,
            nameStaff,
            stockStaff,
            commission,
            '#' + el.ID,
            nameCus,
            phoneCus,
            valueList,
            detailList.substring(0, detailList.lastIndexOf(','))
          ]

          if (
            window.top.GlobalConfig &&
            window.top.GlobalConfig.Admin.kpi_ngay
          ) {
            newArr.splice(5, 0, Math.round(ThresholdRewards * 100) / 100)
          }

          number1++
          totalCommission = 0
          commission = 0
          newExport.push(newArr)
        })
    })
    arr1.push(number1)
  })
  return {
    newExport,
    arr1,
    arr2
  }
}

function exportemployeeList(member, Shows) {
  const { Items, Sum } = member

  let NGUONG_TNCN = [
    {
      Min: 0,
      Max: 10000000,
      Value: 0,
      PercentDifference: 5
    },
    {
      Min: 10000000,
      Max: 30000000,
      Value: 500000,
      PercentDifference: 10
    },
    {
      Min: 30000000,
      Max: 60000000,
      Value: 2500000,
      PercentDifference: 20
    },
    {
      Min: 60000000,
      Max: 100000000,
      Value: 8500000,
      PercentDifference: 30
    },
    {
      Min: 100000000,
      Value: 20500000,
      PercentDifference: 35
    }
  ]

  if (Shows === '0') {
    let HeadTable = [
      'STT',
      'ID',
      'TÊN NHÂN VIÊN',
      'CƠ SỞ',
      'LOẠI HỢP ĐỒNG',
      'TÌNH TRẠNG',
      'LƯƠNG CHẤM CÔNG',
      'ĐI SỚM, VỀ MUỘN',
      'ĐI MUỘN, VỀ SỚM',
      'PHỤ CẤP NGÀY',
      'LƯƠNG CHÍNH SÁCH',
      'PHỤ CẤP',
      /*"NGÀY NGHỈ",*/
      'THƯỞNG',
      'PHẠT',
      // "LƯƠNG CÀI ĐẶT",
      // "THƯỞNG KH CHỌN",
      'LƯƠNG CA',
      'HH SẢN PHẨM',
      'HH DỊCH VỤ',
      'HH THẺ TIỀN',
      'HH NVL',
      'HH PHỤ PHÍ',
      'HOA HỒNG',
      'DOANH SỐ',
      'KPI',
      'THU NHẬP DỰ KIẾN',
      'BHXH (10.5%)',
      'GIẢM TRỪ GIA CẢNH',
      'THU NHẬP CHỊU THUẾ',
      'THUẾ THU NHẬP CÁ NHÂN',
      'LƯƠNG',
      'GIỮ LƯƠNG',
      'THỰC TRẢ DỰ KIẾN',
      'TẠM ỨNG',
      'PHẢI TRẢ NHÂN VIÊN',
      'ĐÃ TRẢ',
      'TỒN GIỮ LƯƠNG'
    ]
    var luongCauHinh = 0
    var phuCap = 0
    var ngayNghi = 0
    var thuong = 0
    var phat = 0
    var luongCa = 0
    var hoaHong = 0
    var KPI = 0
    var thuNhapDuKien = 0
    var giuLuong = 0
    var thucTraDuKien = 0
    var tamUng = 0
    var phaiTraNhanVien = 0
    var daTra = 0
    var tonGiuLuong = 0
    var tongDsMonth = 0
    let newExport = [HeadTable]

    Items.map((x, index) => {
      let item = { ...x }

      if (window.top?.GlobalConfig?.Admin?.bang_luong_nang_cao) {
        item['DONG_BHXH'] = 0

        item['GIAM_TRU_GIA_CANH'] = 0

        item['NGUONG_THUE'] = 0

        if (
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          item['DONG_BHXH'] =
            ((x?.TrackValue?.Config?.Values?.LUONG_NOP_BHXH || 0) * 10.5) / 100
        }

        if (
          x?.TrackValue?.Config?.Values?.WORKING_STATUS !== 0 &&
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          item['GIAM_TRU_GIA_CANH'] =
            x?.TrackValue?.Config?.Values?.GIAM_TRU_GIA_CANH || 0

          item['NGUONG_THUE'] = 15500000
        }

        item['THU_NHAP_CHIU_THUE'] =
          x.LUONG_DU_KIEN -
          item['NGUONG_THUE'] -
          item['DONG_BHXH'] -
          item['GIAM_TRU_GIA_CANH']

        if (item['THU_NHAP_CHIU_THUE'] < 0) {
          item['THU_NHAP_CHIU_THUE'] = 0
        }

        item['THUE_THU_NHAP_CA_NHAN'] = 0

        if (
          x?.TrackValue?.Config?.Values?.WORKING_STATUS !== 0 &&
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          const NGUONG_TNCN_CURRENT = NGUONG_TNCN.find(
            k =>
              item['THU_NHAP_CHIU_THUE'] > k.Min &&
              (k.Max ? item['THU_NHAP_CHIU_THUE'] <= k.Max : true)
          )
          if (NGUONG_TNCN_CURRENT) {
            item['THUE_THU_NHAP_CA_NHAN'] =
              NGUONG_TNCN_CURRENT.Value +
              (item['THU_NHAP_CHIU_THUE'] - NGUONG_TNCN_CURRENT.Min) *
                (NGUONG_TNCN_CURRENT.PercentDifference / 100)
          }
        } else {
          if (item['THU_NHAP_CHIU_THUE'] < 5000000) {
            item['THUE_THU_NHAP_CA_NHAN'] = 0
          } else {
            item['THUE_THU_NHAP_CA_NHAN'] =
              (item['THU_NHAP_CHIU_THUE'] * 10) / 100
          }
        }
        item['LUONG_THUC_NHAN'] =
          x?.LUONG_DU_KIEN - item['DONG_BHXH'] - item['THUE_THU_NHAP_CA_NHAN']

        item['GIU_LUONG'] = x?.TrackValue?.Config?.Values?.GIU_LUONG || 0

        if (item['GIU_LUONG'] <= 100) {
          item['GIU_LUONG'] =
            (item['LUONG_THUC_NHAN'] * item['GIU_LUONG']) / 100
        }

        item['THUC_TRA_DU_KIEN'] = item['LUONG_THUC_NHAN'] - item['GIU_LUONG']
      }

      var stock = ''
      item.DiemQL.map(e => {
        stock += e.StockTitle + ', '
      })
      var idStaff = item.Staff['ID']
      var nameStaff = item.Staff['FullName']
      luongCauHinh += parseInt(item.LUONG_CAU_HINH)
      phuCap += parseInt(item.PHU_CAP)
      ngayNghi += parseInt(item.TRU_NGAY_NGHI)
      thuong += parseInt(item.THUONG)
      phat += parseInt(item.TRU_PHAT)
      luongCa += parseInt(item.LUONG_CA)
      hoaHong += parseInt(item.HOA_HONG)
      KPI += parseInt(item.KPI_Hoa_hong)
      thuNhapDuKien += parseInt(item.LUONG_DU_KIEN)
      giuLuong += parseInt(item.GIU_LUONG)
      thucTraDuKien += parseInt(item.THUC_TRA_DU_KIEN)
      tamUng += parseInt(item.TAM_UNG) - parseInt(item.HOAN_UNG)
      phaiTraNhanVien +=
        parseInt(item.THUC_TRA_DU_KIEN) - parseInt(item.TAM_UNG)
      daTra += parseInt(item.DA_TRA)
      tonGiuLuong += parseInt(item.TON_GIU_LUONG)
      tongDsMonth += parseInt(item.DOANH_SO_THANG)

      let PHU_CAP_NGAY =
        safeGet(item, 'TrackValue.WorkQtyAllowance', 0) *
        safeGet(item, 'TRO_CAP_NGAY', 0)

      if (window.top?.GlobalConfig?.Admin?.phu_cap_ngay_cong2) {
        PHU_CAP_NGAY =
          safeGet(item, 'TrackValue.WorkQtyAllowance', 0) *
            safeGet(item, 'TRO_CAP_NGAY', 0) +
          safeGet(item, 'TrackValue.WorkQtyAllowance2', 0) *
            (safeGet(item, 'TRO_CAP_NGAY', 0) / 2)
      }

      const newArr = [
        index + 1,
        '#' + idStaff,
        nameStaff,
        stock.substring(0, stock.lastIndexOf(',')),
        item.Staff['Address'] || '',
        item?.TrackValue?.Config?.Values?.WORKING_STATUS === 0
          ? 'Đã nghỉ'
          : 'Hoạt động',
        safeGet(item, 'TrackValue.WorkQty', 0) *
          safeGet(item, 'NGAY_LUONG_CO_BAN', 0),
        safeGet(item, 'TrackValue.DI_SOM', 0) +
          safeGet(item, 'TrackValue.VE_MUON', 0),
        safeGet(item, 'TrackValue.DI_MUON', 0) +
          safeGet(item, 'TrackValue.VE_SOM', 0) >
        0
          ? (safeGet(item, 'TrackValue.DI_MUON', 0) +
              safeGet(item, 'TrackValue.VE_SOM', 0)) *
            1
          : safeGet(item, 'TrackValue.DI_MUON', 0) +
            safeGet(item, 'TrackValue.VE_SOM', 0),
        PHU_CAP_NGAY,
        item.LUONG_CHAM_CONG,
        item.PHU_CAP,
        /*item.TRU_NGAY_NGHI,*/
        item.THUONG,
        item.TRU_PHAT,
        // item.LUONG_CA_CAI_DAT,
        // item.LUONG_CA_EXTRA,
        item.LUONG_CA,
        item.HOA_HONG_Sanpham,
        item.HOA_HONG_Dichvu,
        item.HOA_HONG_Thetien,
        item.HOA_HONG_NVL,
        item.HOA_HONG_Phuphi,
        item.HOA_HONG,
        item.DOANH_SO_THANG,
        item.KPI_Hoa_hong,
        item.LUONG_DU_KIEN,
        item?.DONG_BHXH,
        item?.GIAM_TRU_GIA_CANH,
        item?.THU_NHAP_CHIU_THUE,
        item?.THUE_THU_NHAP_CA_NHAN,
        item?.LUONG_THUC_NHAN,
        item.GIU_LUONG,
        item.THUC_TRA_DU_KIEN,
        item.TAM_UNG - item.HOAN_UNG,
        item.THUC_TRA_DU_KIEN - (item.TAM_UNG - item.HOAN_UNG),
        item.DA_TRA,
        item.TON_GIU_LUONG
      ]
      newExport.push(newArr)
    })
    const FooterTable = [
      'Tổng',
      '',
      '',
      '',
      '',
      '',
      Sum.LUONG_CHAM_CONG,
      '',
      '',
      '',
      '',
      Sum.PHU_CAP,
      /*ngayNghi,*/
      Sum.THUONG,
      Sum.TRU_PHAT,
      '',
      '',
      '',
      '',
      '',
      '',
      Sum.HOA_HONG,
      Sum.DOANH_SO_THANG,
      Sum.KPI_Hoa_hong,
      Sum.LUONG_DU_KIEN,
      '',
      '',
      '',
      '',
      '',
      Sum.GIU_LUONG,
      Sum.THUC_TRA_DU_KIEN,
      Sum.TAM_UNG - Sum.HOAN_UNG,
      Sum.THUC_TRA_DU_KIEN - (Sum.TAM_UNG - Sum.HOAN_UNG),
      Sum.DA_TRA,
      Sum.TON_GIU_LUONG
    ]
    newExport.push(FooterTable)

    if (!window.top?.GlobalConfig?.Admin?.bang_luong_nang_cao) {
      const listIndex = [4, 5, 19, 24, 25, 26, 27, 28]

      newExport = newExport.map(row =>
        row.filter((_, index) => !listIndex.includes(index))
      )
    }

    return newExport
  } else {
    let HeadTable = [
      'STT',
      'ID',
      'TÊN NHÂN VIÊN',
      'CƠ SỞ',
      'LOẠI HỢP ĐỒNG',
      'TÌNH TRẠNG',
      'LƯƠNG CHẤM CÔNG',
      'ĐI SỚM, VỀ MUỘN',
      'ĐI MUỘN, VỀ SỚM',
      'PHỤ CẤP NGÀY',
      'LƯƠNG CHÍNH SÁCH',
      'PHỤ CẤP',
      /*"NGÀY NGHỈ",*/
      'THƯỞNG',
      'PHẠT',
      'LƯƠNG CÀI ĐẶT',
      'THƯỞNG KH CHỌN',
      'LƯƠNG CA',
      'HH SẢN PHẨM',
      'HH DỊCH VỤ',
      'HH THẺ TIỀN',
      'HH NVL',
      'HH PHỤ PHÍ',
      'HOA HỒNG',
      'DOANH SỐ',
      'KPI',
      'THU NHẬP DỰ KIẾN',
      'BHXH 10.5%',
      'GIẢM TRỪ GIA CẢNH',
      'THU NHẬP CHỊU THUẾ',
      'THUẾ THU NHẬP CÁ NHÂN',
      'LƯƠNG',
      'GIỮ LƯƠNG',
      'THỰC TRẢ DỰ KIẾN',
      'TẠM ỨNG',
      'PHẢI TRẢ NHÂN VIÊN',
      'ĐÃ TRẢ',
      'TỒN GIỮ LƯƠNG'
    ]
    var luongCauHinh = 0
    var phuCap = 0
    var ngayNghi = 0
    var thuong = 0
    var phat = 0
    var luongCa = 0
    var hoaHong = 0
    var KPI = 0
    var thuNhapDuKien = 0
    var giuLuong = 0
    var thucTraDuKien = 0
    var tamUng = 0
    var phaiTraNhanVien = 0
    var daTra = 0
    var tonGiuLuong = 0
    var tongDsMonth = 0
    let newExport = [HeadTable]

    let PHU_CAP_NGAY =
      safeGet(item, 'TrackValue.WorkQtyAllowance', 0) *
      safeGet(item, 'TRO_CAP_NGAY', 0)

    if (window.top?.GlobalConfig?.Admin?.phu_cap_ngay_cong2) {
      PHU_CAP_NGAY =
        safeGet(item, 'TrackValue.WorkQtyAllowance', 0) *
          safeGet(item, 'TRO_CAP_NGAY', 0) +
        safeGet(item, 'TrackValue.WorkQtyAllowance2', 0) *
          (safeGet(item, 'TRO_CAP_NGAY', 0) / 2)
    }

    Items.map((x, index) => {
      let item = { ...x }

      if (window.top?.GlobalConfig?.Admin?.bang_luong_nang_cao) {
        item['DONG_BHXH'] = 0

        item['GIAM_TRU_GIA_CANH'] = 0

        item['NGUONG_THUE'] = 0

        if (
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          item['DONG_BHXH'] =
            ((x?.TrackValue?.Config?.Values?.LUONG_NOP_BHXH || 0) * 10.5) / 100
        }

        if (
          x?.TrackValue?.Config?.Values?.WORKING_STATUS !== 0 &&
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          item['GIAM_TRU_GIA_CANH'] =
            x?.TrackValue?.Config?.Values?.GIAM_TRU_GIA_CANH || 0

          item['NGUONG_THUE'] = 15500000
        }

        item['THU_NHAP_CHIU_THUE'] =
          x.LUONG_DU_KIEN -
          item['NGUONG_THUE'] -
          item['DONG_BHXH'] -
          item['GIAM_TRU_GIA_CANH']

        if (item['THU_NHAP_CHIU_THUE'] < 0) {
          item['THU_NHAP_CHIU_THUE'] = 0
        }

        item['THUE_THU_NHAP_CA_NHAN'] = 0

        if (
          x?.TrackValue?.Config?.Values?.WORKING_STATUS !== 0 &&
          x?.Staff?.Address &&
          x?.Staff?.Address?.toUpperCase() === 'CHÍNH THỨC'
        ) {
          const NGUONG_TNCN_CURRENT = NGUONG_TNCN.find(
            k =>
              item['THU_NHAP_CHIU_THUE'] > k.Min &&
              (k.Max ? item['THU_NHAP_CHIU_THUE'] <= k.Max : true)
          )
          if (NGUONG_TNCN_CURRENT) {
            item['THUE_THU_NHAP_CA_NHAN'] =
              NGUONG_TNCN_CURRENT.Value +
              (item['THU_NHAP_CHIU_THUE'] - NGUONG_TNCN_CURRENT.Min) *
                (NGUONG_TNCN_CURRENT.PercentDifference / 100)
          }
        } else {
          if (item['THU_NHAP_CHIU_THUE'] < 5000000) {
            item['THUE_THU_NHAP_CA_NHAN'] = 0
          } else {
            item['THUE_THU_NHAP_CA_NHAN'] =
              (item['THU_NHAP_CHIU_THUE'] * 10) / 100
          }
        }
        item['LUONG_THUC_NHAN'] =
          x?.LUONG_DU_KIEN - item['DONG_BHXH'] - item['THUE_THU_NHAP_CA_NHAN']

        item['GIU_LUONG'] = x?.TrackValue?.Config?.Values?.GIU_LUONG || 0

        if (item['GIU_LUONG'] <= 100) {
          item['GIU_LUONG'] =
            (item['LUONG_THUC_NHAN'] * item['GIU_LUONG']) / 100
        }

        item['THUC_TRA_DU_KIEN'] = item['LUONG_THUC_NHAN'] - item['GIU_LUONG']
      }

      var stock = ''
      item.DiemQL.map(e => {
        stock += e.StockTitle + ', '
      })
      var idStaff = item.Staff['ID']
      var nameStaff = item.Staff['FullName']
      luongCauHinh += parseInt(item.LUONG_CAU_HINH)
      phuCap += parseInt(item.PHU_CAP)
      ngayNghi += parseInt(item.TRU_NGAY_NGHI)
      thuong += parseInt(item.THUONG)
      phat += parseInt(item.TRU_PHAT)
      luongCa += parseInt(item.LUONG_CA)
      hoaHong += parseInt(item.HOA_HONG)
      KPI += parseInt(item.KPI_Hoa_hong)
      thuNhapDuKien += parseInt(item.LUONG_DU_KIEN)
      giuLuong += parseInt(item.GIU_LUONG)
      thucTraDuKien += parseInt(item.THUC_TRA_DU_KIEN)
      tamUng += parseInt(item.TAM_UNG) - parseInt(item.HOAN_UNG)
      phaiTraNhanVien +=
        parseInt(item.THUC_TRA_DU_KIEN) - parseInt(item.TAM_UNG)
      daTra += parseInt(item.DA_TRA)
      tonGiuLuong += parseInt(item.TON_GIU_LUONG)
      tongDsMonth += parseInt(item.DOANH_SO_THANG)
      const newArr = [
        index + 1,
        '#' + idStaff,
        nameStaff,
        stock.substring(0, stock.lastIndexOf(',')),
        item.Staff['Address'] || '',
        item?.TrackValue?.Config?.Values?.WORKING_STATUS === 0
          ? 'Đã nghỉ'
          : 'Hoạt động',
        safeGet(item, 'TrackValue.WorkQty', 0) *
          safeGet(item, 'NGAY_LUONG_CO_BAN', 0),
        safeGet(item, 'TrackValue.DI_SOM', 0) +
          safeGet(item, 'TrackValue.VE_MUON', 0),
        safeGet(item, 'TrackValue.DI_MUON', 0) +
          safeGet(item, 'TrackValue.VE_SOM', 0) >
        0
          ? (safeGet(item, 'TrackValue.DI_MUON', 0) +
              safeGet(item, 'TrackValue.VE_SOM', 0)) *
            1
          : safeGet(item, 'TrackValue.DI_MUON', 0) +
            safeGet(item, 'TrackValue.VE_SOM', 0),
        PHU_CAP_NGAY,
        item.LUONG_CHAM_CONG,
        item.PHU_CAP,
        /*item.TRU_NGAY_NGHI,*/
        item.THUONG,
        item.TRU_PHAT,
        item.LUONG_CA_CAI_DAT,
        item.LUONG_CA_EXTRA,
        item.LUONG_CA,
        item.HOA_HONG_Sanpham,
        item.HOA_HONG_Dichvu,
        item.HOA_HONG_Thetien,
        item.HOA_HONG_NVL,
        item.HOA_HONG_Phuphi,
        item.HOA_HONG,
        item.DOANH_SO_THANG,
        item.KPI_Hoa_hong,
        item.LUONG_DU_KIEN,
        item?.DONG_BHXH,
        item?.GIAM_TRU_GIA_CANH,
        item?.THU_NHAP_CHIU_THUE,
        item?.THUE_THU_NHAP_CA_NHAN,
        item?.LUONG_THUC_NHAN,
        item.GIU_LUONG,
        item.THUC_TRA_DU_KIEN,
        item.TAM_UNG - item.HOAN_UNG,
        item.THUC_TRA_DU_KIEN - (item.TAM_UNG - item.HOAN_UNG),
        item.DA_TRA,
        item.TON_GIU_LUONG
      ]
      newExport.push(newArr)
    })
    const FooterTable = [
      'Tổng',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      Sum.LUONG_CHAM_CONG,
      Sum.PHU_CAP,
      /*ngayNghi,*/
      Sum.THUONG,
      Sum.TRU_PHAT,
      '',
      '',
      Sum.LUONG_CA_EXTRA,
      '',
      '',
      '',
      '',
      '',
      Sum.HOA_HONG,
      Sum.DOANH_SO_THANG,
      Sum.KPI_Hoa_hong,
      Sum.LUONG_DU_KIEN,
      '',
      '',
      '',
      '',
      Sum.GIU_LUONG,
      Sum.THUC_TRA_DU_KIEN,
      Sum.TAM_UNG - Sum.HOAN_UNG,
      Sum.THUC_TRA_DU_KIEN - (Sum.TAM_UNG - Sum.HOAN_UNG),
      Sum.DA_TRA,
      Sum.TON_GIU_LUONG
    ]
    newExport.push(FooterTable)

    if (!window.top?.GlobalConfig?.Admin?.bang_luong_nang_cao) {
      const listIndex = [4, 5, 19, 25, 26, 27, 28, 29]

      newExport = newExport.map(row =>
        row.filter((_, index) => !listIndex.includes(index))
      )
    }
    return newExport
  }
}

function exportInventoryList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'TÊN',
    'MÃ',
    'ĐƠN VỊ',
    'GIÁ NHẬP',
    'GIÁ NHẬP TRUNG BÌNH',
    'TỒN TRƯỚC',
    'NHẬP TRONG TỔNG',
    'NHẬP THỰC TẾ',
    'NHẬP TRẢ HÀNG',
    'NHẬP CÂN KHO',
    'XUẤT TRONG (TỔNG)',
    'XUẤT TRONG (BÁN)',
    'XUẤT TRONG (TIÊU HAO)',
    'XUẤT THỰC TẾ',
    'XUẤT CÂN KHO',
    'HIỆN TẠI',
    'TỔNG GIÁ TRỊ TỒN'
  ]
  const newExport = [HeadTable]
  var arr = []
  Items.map((item, index) => {
    if (item.Qty <= 5) {
      arr.push(-1)
    } else {
      arr.push(1)
    }
    const newArr = [
      index + 1,
      item.ProdTitle,
      item.Code,
      item.SUnit == null ? 'Chưa xác định' : item.SUnit,
      item.ImportPrice,
      item.AverageCost,
      item.QtyBefore,
      item.QtyImport,
      item.Qtyimport2,
      item.Qtyimport3,
      item.Qtyimport1,
      Math.abs(item.QtyExport),
      Math.abs(item.QtyExportSell),
      Math.abs(item.QtyExportConsumption),
      Math.abs(item.Qtydonxuat1),
      Math.abs(item.Qtydonxuat2),
      item.Qty,
      item.TotalValue
    ]
    newExport.push(newArr)
  })
  return {
    newExport,
    arr
  }
}

function exportattritionList(member, showsX, ShowDetailX, xuat_nhap_diem) {
  if (ShowDetailX == '2') {
    let { Items, Prods } = {
      Items: (member && member.Items) || [],
      Prods: (member && member.Prods) || []
    }

    let HeadTable = [
      'CƠ SỞ',
      'MÃ CƠ SỞ',
      'VÙNG (THÀNH PHỐ)',
      'MÃ NVL',
      'TÊN NVL',
      'ĐƠN VỊ NVL',
      'SỐ LƯỢNG',
      'SỐ LƯỢNG (*)',
      'TÊN SẢN PHẨM',
      'ĐƠN VỊ SP',
      'TỈ LỆ CHUYỂN ĐỔI'
    ]

    if (xuat_nhap_diem.hasRight) {
      HeadTable = [...HeadTable, 'GIÁ COST', 'GIÁ TRỊ TIÊU HAO']
    }

    let Stocks = null

    if (window.top.Info && window.top.Info.Stocks) {
      Stocks = window.top.Info.Stocks.filter(x => x.ParentID > 0)
    }

    let newExport = []

    for (let item of Items || []) {
      let index = Stocks.findIndex(x => x.ID === item.StockID)
      let obj = {
        ID: '',
        Title: '',
        City: '',
        NameFr: ''
      }

      if (index > -1) {
        obj.ID = Stocks[index].ID

        let newDesc = Stocks[index].DescSEO
          ? JSON.parse(Stocks[index].DescSEO)
          : null
        if (newDesc && newDesc.place && newDesc.place.length > 0) {
          obj.City = newDesc.place[0].Title
        }

        obj.NameFr = Stocks[index].TitleSEO || ''

        obj.Title = Stocks[index].Title || ''
      }

      let Product = {
        SProdTitle: '',
        ProdUnit: item.ProdCode,
        ProdTitle: '',
        Unit: '',
        SUnit: '',
        Qty: 0,
        PriceBase: ''
      }

      let indexProduct = Prods.findIndex(x => x.DynamicID === item.ProdCode)
      if (indexProduct > -1) {
        Product.SProdTitle = Prods[indexProduct].Title || ''
        Product.SUnit = Prods[indexProduct].StockUnit || ''
        Product.PriceBase = Prods[indexProduct].PriceBase || ''
        let Meta = Prods[indexProduct].Meta
          ? JSON.parse(Prods[indexProduct].Meta)
          : null
        if (Meta.otherUnit && Meta.otherUnit.length > 0) {
          Product = {
            ...Product,
            ...Meta.otherUnit[0]
          }
        }
      }

      let itemPush = [
        obj.ID,
        obj.Title,
        obj.NameFr,
        obj.City,
        item.ProdCode,
        Product.SProdTitle,
        Product.SUnit,
        item.Qty,
        Number.isFinite(item.Qty / Product.Qty) ? item.Qty / Product.Qty : 0,
        Product.ProdTitle,
        Product.Unit,
        Product.Qty
      ]

      if (xuat_nhap_diem.hasRight) {
        if (!xuat_nhap_diem?.StockRoles?.some(x => x.ID === item?.StockID)) {
          itemPush = [...itemPush, '', '']
        } else {
          itemPush = [
            ...itemPush,
            Product.PriceBase,
            Product.PriceBase * item.Qty
          ]
        }
      }

      newExport.push(itemPush)
    }

    newExport.sort((a, b) => a[0] - b[0]).map(item => item.shift())

    newExport.unshift(HeadTable)

    if (
      window.top.GlobalConfig &&
      !window.top.GlobalConfig.Admin.dinh_dang_ma_don_nhap_xuat_kho
    ) {
      newExport = newExport.map(item => {
        item.splice(1, 1)
        return item
      })
    }

    return newExport
  } else {
    const { Items } = member
    let HeadTable = [
      'STT',
      'TÊN',
      'MÃ',
      'GIÁ GỐC',
      'SỬ DỤNG',
      'ĐƠN VỊ',
      'TỔNG',
      'SỐ LƯỢNG',
      'SẢN PHẨM',
      'ĐƠN VỊ'
    ]

    let Stocks = null

    if (window.top.Info && window.top.Info.Stocks) {
      Stocks = window.top.Info.Stocks.filter(x => x.ParentID > 0)
    }

    if (showsX == '1') {
      HeadTable = [...HeadTable]

      if (Stocks && Stocks.length > 0) {
        for (let stock of Stocks) {
          HeadTable.push(stock.Title.toUpperCase())
          HeadTable.push(stock.Title.toUpperCase())
        }
      }

      HeadTable.push('TỈ LỆ VÀO CÁC DỊCH VỤ')
    }

    const newExport = [HeadTable]
    var useList
    var StockUsageList
    Items.map((item, index) => {
      useList = item.UsageList.map(it => {
        return it.Title + '(' + it.Unit + ' ' + item.SUnit + ')'
      }).join(',')
      StockUsageList = item.StockUsageList.map(it => {
        return it.Title + '(' + it.Unit + ' ' + item.SUnit + ')'
      }).join(',')

      let ProdQty = ''
      let ProdTitle = ''
      let ProdUnit = ''
      let MetaQty = ''

      if (item?.Meta) {
        let meta = item?.Meta ? JSON.parse(item?.Meta) : null
        if (meta.otherUnit && meta.otherUnit.length > 0) {
          let [other] = meta.otherUnit
          MetaQty = other.Qty
          ProdQty = Math.round((item.Unit / other.Qty) * 1000) / 1000
          ProdTitle = other.ProdTitle
          ProdUnit = other.ProdUnit
        }
      }

      let newArr = [
        index + 1,
        item.ProdTitle,
        item.Code,
        item.ProdPriceBase,
        item.Unit,
        item.SUnit,
        item.Total,
        ProdQty,
        ProdTitle,
        ProdUnit
      ]
      if (showsX == '1') {
        if (Stocks && Stocks.length > 0) {
          for (let stock of Stocks) {
            let index =
              item.StockUsageList &&
              item.StockUsageList.findIndex(x => x.Title == stock.Title)

            if (index > -1) {
              newArr.push(item.StockUsageList[index].Unit)
              newArr.push(
                Math.round((item.StockUsageList[index].Unit / MetaQty) * 1000) /
                  1000
              )
            } else {
              newArr.push('')
              newArr.push('')
            }
          }
        }
        newArr.push(useList)
        //newArr = [...newArr, ...newStockUsageList, useList]
      }

      newExport.push(newArr)
    })

    return newExport
  }
}

function exportExpectedList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'TÊN',
    'MÃ',
    'NVL DỰ KIẾN',
    'NVL THIẾU',
    'ĐƠN VỊ',
    'TỈ LỆ VÀO CÁC DỊCH VỤ'
  ]
  const newExport = [HeadTable]
  var arr = []
  var useList
  Items &&
    Items.map((item, index) => {
      if (item.LUnit > 0) {
        arr.push(-1)
      } else {
        arr.push(1)
      }
      useList = item.UsageList.map(it => {
        return it.Title + '(' + it.Unit + ' ' + it.SUnit + ')'
      }).join(',')
      const newArr = [
        index + 1,
        item.ProdTitle,
        item.Code,
        item.Unit,
        item.LUnit,
        item.SUnit,
        useList
      ]
      newExport.push(newArr)
    })
  return {
    newExport,
    arr
  }
}

function exportCustomerConvert(data) {
  const { Items } = data
  const Dates = Items && Items.length > 0 ? Items[0].Dates : []
  const HeadTable = ['Nhân viên', 'Tổng số đã chuyển đổi']
  for (const [index, item] of Dates.entries()) {
    HeadTable.push(window.top.moment(item.Date).format('DD/MM/YYYY'))
  }
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [item.UserName, item.Total]
    for (const [index, item] of Dates.entries()) {
      newArr.push(item.Total)
    }
    newExport.push(newArr)
  })
  return {
    List: newExport,
    TotalColumn: HeadTable.length
  }
}

function exportAppSetting(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'ID',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'THIẾT BỊ CÀI ĐẶT',
    'TRẠNG THÁI',
    'NGÀY CÀI ĐẶT'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    var status = ''
    if (item.LogoutDate == null) {
      status += 'Online'
    } else {
      status +=
        'Offline - ' +
        window.top.moment(item.LogoutDate).format('HH:mm DD/MM/YYYY')
    }
    var appType = item.App['AppType']

    const newArr = [
      index + 1,
      '#' + item.MemberID,
      item.FullName,
      item.MobilePhone,
      appType,
      status,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY')
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportCardCustomerList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'TỒN TRƯỚC',
    'NẠP VÍ',
    'TRẢ TIỀN MẶT TỪ VÍ',
    'KẾT THÚC LẺ BUỔI HOÀN VÍ',
    'HOÀN TIỀN TÍCH LŨY (MUA HÀNG)',
    'KHẤU TRỪ TÍCH LŨY (TRẢ HÀNG)',
    'TRẢ HÀNG HOÀN VÍ',
    'HOA HỒNG GIỚI THIỆU',
    'KHẤU TRỪ HOA HỒNG GIỚI THIỆU',
    'HOA HỒNG CHIA SẺ MÃ GIẢM GIÁ',
    'KẾT THÚC THẺ HOÀN VÍ',
    'TẶNG ĐĂNG KÝ ĐĂNG NHẬP',
    'TẶNG SINH NHẬT',
    'THANH TOÁN ĐƠN HÀNG',
    'TỒN TỚI THỜI GIAN LỌC',
    'HIỆN TẠI'
  ]
  const newExport = [HeadTable]
  var arr = []
  var tonTruoc = 0
  var napVi = 0
  var TTTV = 0
  var ketThucBL = 0
  var hoanTienTichLuy = 0
  var khauTruTichLuy = 0
  var traHangHoanVi = 0
  var hoaHongGioiThieu = 0
  var khauTruHH = 0
  var hoaHongCS = 0
  var ketThucTHV = 0
  var thangDKDN = 0
  var tangSN = 0
  var thanhToanDH = 0
  var tonTGL = 0
  var HT = 0
  Items.map((item, index) => {
    var id = item.Id
    tonTruoc += item.TonTruoc
    napVi += item.NapVi
    TTTV += item.TraTMTuVi
    ketThucBL += item.KetThucLe
    hoanTienTichLuy += item.HoanTienMuaHang
    khauTruTichLuy += item.KhauTruTichLuy
    traHangHoanVi += item.TraHangHoanVi
    hoaHongGioiThieu += item.HoaHongGT
    khauTruHH += item.KhauTruHoaHongGT
    hoaHongCS += item.HoaHongChiaSeMaGiamGia
    ketThucTHV += item.KetThucTheHoanVi
    thangDKDN += item.TangDKDN
    tangSN += item.TangSN
    thanhToanDH += item.ThanhToanDH
    tonTGL += item.TonCuoiKy
    HT += item.TonHienTai
    const newArr = [
      index + 1,
      item.FullName,
      item.Phone,
      item.TonTruoc,
      item.NapVi,
      item.TraTMTuVi,
      item.KetThucLe,
      item.HoanTienMuaHang,
      item.KhauTruTichLuy,
      item.TraHangHoanVi,
      item.HoaHongGT,
      item.KhauTruHoaHongGT,
      item.HoaHongChiaSeMaGiamGia,
      item.KetThucTheHoanVi,
      item.TangDKDN,
      item.TangSN,
      item.ThanhToanDH,
      item.TonCuoiKy,
      item.TonHienTai
    ]
    newExport.push(newArr)
  })
  const FooterTable = [
    'Tổng',
    '',
    '',
    tonTruoc,
    napVi,
    TTTV,
    ketThucBL,
    hoanTienTichLuy,
    khauTruTichLuy,
    traHangHoanVi,
    hoaHongGioiThieu,
    khauTruHH,
    hoaHongCS,
    ketThucTHV,
    thangDKDN,
    tangSN,
    thanhToanDH,
    tonTGL,
    HT
  ]
  newExport.push(FooterTable)
  return {
    newExport,
    arr
  }
}

function exportUseCardList(member) {
  const { Items } = member
  const HeadTable = [
    'NGÀY',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'SỬ DỤNG / HOÀN',
    'MÃ THẺ TIỀN',
    'TÊN THẺ TIỀN',
    'SỐ TIỀN',
    'SẢN PHẨM / DỊCH VỤ'
  ]
  const newExport = [HeadTable]
  var arr1 = []
  var arr2 = []
  Items.map((item, index) => {
    var number1 = 0
    var date = window.top.moment(item.CreateDate).format('DD/MM/YYYY')
    item.MemberList.map(it => {
      var nameCus = it.FullName
      var phoneCus = it.Phone
      arr2.push(it.UsageHistory.length)
      it.UsageHistory.map(e => {
        switch (e.Type) {
          case 'TRA_HANG':
            var type = 'Trả hàng'
            break
          case 'KET_THUC_THE':
            var type = 'Kết thúc thẻ'
            break
          case 'THE_TIEN':
            var type = 'Mua thẻ tiền'
            break
          case 'THANH_TOAN_DH':
            var type = 'Thanh toán đơn hàng'
            break
        }
        var useList = e.ProdLists.map(el => {
          return el.Title + '(x' + el.Qty + ')'
        }).join(',')
        const newArr = [
          date,
          nameCus,
          phoneCus,
          type,
          e.Code,
          e.Title,
          e.Value,
          useList
        ]
        number1++
        newExport.push(newArr)
      })
    })
    arr1.push(number1)
  })
  return {
    newExport,
    arr1,
    arr2
  }
}

function exportCardList(member) {
  const { Items } = member
  const HeadTable = [
    'STT',
    'ID',
    'TÊN THẺ TIỀN',
    'THỜI GIAN MUA',
    'HẠN SỬ DỤNG',
    'GIÁ BÁN',
    'TỔNG GIÁ TRỊ',
    'GIÁ TRỊ CHI TIÊU SP',
    'GIÁ TRỊ CHI TIÊU DV',
    'TỔNG CHI TIÊU',
    'ĐÃ CHI TIÊU SP',
    'ĐÃ CHI TIÊU DV',
    'TỔNG CÒN LẠI',
    'CÒN LẠI SẢN PHẨM',
    'CÒN LẠI DỊCH VỤ',
    'KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [
      index + 1,
      '#' + item.Id,
      `${item.TenTheTien}${item.IsLock ? ` - Đã khóa` : ''}`,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.MoneyEndDate
        ? window.top.moment(item.MoneyEndDate).format('DD/MM/YYYY')
        : '',
      item.GiaBan,
      item.TongGiaTri,
      item.GiaTriChiTieuSP == 0 ? item.TongGiaTri : item.GiaTriChiTieuSP,
      item.GiaTriChiTieuDV == 0 ? item.TongGiaTri : item.GiaTriChiTieuDV,
      item.TongChiTieu,
      item.DaChiTieuSP,
      item.DaChiTieuDV,
      item.TongConLai,
      item.GiaTriChiTieuSP === 0 && item.GiaTriChiTieuDV === 0
        ? item.TongConLai
        : item.ConLaiSP,
      item.GiaTriChiTieuSP === 0 && item.GiaTriChiTieuDV === 0
        ? item.TongConLai
        : item.ConLaiDV,
      item.Member['FullName'],
      item.Member['Phone']
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportSales2(member) {
  const Items = member.lst ? member.lst : []
  const HeadTable = [
    'STT',
    'ID KHÁCH HÀNG',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'NHÓM',
    'CHI TIÊU',
    'CẤP TIẾP THEO CÓ THỂ LÊN',
    'CHI TIẾT ĐƠN HÀNG'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    const newArr = [
      index + 1,
      '#' + item.MemberID,
      item.MemberName,
      item.MobilePhone,
      item.GroupList
        ? item.GroupList.map(
            x => `${x.Title} (Ngưỡng ${PriceHelper.formatVND(x.Point)})`
          )
        : '',
      item.ToPay,
      item.GroupNext
        ? item.GroupNext.map(
            x => `${x.Title} (${PriceHelper.formatVND(x.Point)})`
          ).join(', ')
        : '',
      item.Items
        ? item.Items.map(x => `[#${x.ID}] ${x.ProdTitle} (x${x.Qty})`).join(
            ', '
          )
        : ''
    ]
    newExport.push(newArr)
  })
  return newExport
}

function exportSalesStocks(data) {
  const Items = data.result && data.result.List ? data.result.List : []

  const calcValue = K2 => {
    if (K2 < 200000000) {
      return 35000000
    }

    if (K2 <= 250000000) {
      return K2 * 0.21
    }

    if (K2 <= 300000000) {
      return K2 * 0.2
    }

    if (K2 <= 350000000) {
      return K2 * 0.18
    }

    if (K2 <= 400000000) {
      return K2 * 0.17
    }

    if (K2 <= 450000000) {
      return K2 * 0.16
    }

    if (K2 <= 500000000) {
      return K2 * 0.15
    }

    if (K2 <= 600000000) {
      return K2 * 0.14
    }

    return K2 * 0.13
  }

  let HeadTable = [
    'STT',
    'CƠ SỞ',
    'DOANH SỐ MỚI',
    'THỰC THU MỚI',
    'THỰC THU NỢ CŨ',
    'TỔNG THỰC THU (ĐƠN MỚI + NỢ CŨ)',
    'THỰC THU DỊCH VỤ',
    'THỰC THU THẺ TIỀN',
    'THỰC THU SẢN PHẨM',
    'THỰC THU SẢN PHẨM ĐỐI TÁC',
    'THỰC THU CHUYỂN LIỆU TRÌNH',
    'KHÁC',
    'THỰC THU TÍNH %',
    'PHÍ ĐIỀU HÀNH',
    'THỰC THU TÍNH %',
    'PHÍ ĐIỀU HÀNH'
  ]
  const newExport = [HeadTable]
  Items.map((item, index) => {
    let THUC_THU_PHAN_TRAM =
      (item.Thuc_thu_dich_vu || 0) +
      (item.Thuc_thu_the_tien || 0) +
      (item.Thuc_thu_san_pham || 0) -
      (item.Thuc_thu_doi_tac || 0)
    let newArr = [
      index + 1,
      item.StockTitle,
      item.Doanh_so_moi,
      item.No_moi,
      item.Thuc_thu_moi,
      item.Thu_no_cu,
      (item.Thuc_thu_moi || 0) + (item.Thu_no_cu || 0),
      item.Thuc_thu_dich_vu,
      item.Thuc_thu_the_tien,
      (item.Thuc_thu_san_pham || 0) + (item.Thuc_thu_doi_tac || 0),
      item.Thuc_thu_doi_tac,
      item.Thu_tu_chuyen_lieu_trinh,
      item.Thu_khac,
      THUC_THU_PHAN_TRAM,
      calcValue(THUC_THU_PHAN_TRAM)
    ]
    newExport.push(newArr)
  })
  return newExport
}

const CHI_TIET_KHACH_HANG = member => {
  const { Items } = member

  // Gom các PayDebt của MajorList theo ID và merge Prods / DoanhSo / HoaHong
  const converItems = arr => {
    if (!arr) return []

    return arr.map(rowData => {
      const newChildren = [...rowData?.children]
      const arrPayDebt = []
      const newPayDebt = []

      // Thu thập tất cả PayDebt từ các children
      for (let rturn of newChildren) {
        for (let a of rturn.MajorList) {
          if (a.PayDebt) arrPayDebt.push(a.PayDebt)
        }
      }

      // Merge PayDebt theo ID
      for (let a of arrPayDebt) {
        const idx = newPayDebt.findIndex(x => x.ID === a.ID)

        if (idx > -1) {
          let target = newPayDebt[idx]
          let { DoanhSo, HoaHong, Prods } = target

          // Cộng các loại thanh toán
          target.ThanhToan += a.ThanhToan
          target.ThanhToan_CK += a.ThanhToan_CK
          target.ThanhToan_QT += a.ThanhToan_QT
          target.ThanhToan_TienMat += a.ThanhToan_TienMat
          target.TheTien += a.TheTien
          target.Vi += a.Vi

          // Merge sản phẩm
          let newProds = [...Prods]
          for (let prod of a.Prods) {
            const pIdx = newProds.findIndex(c => c.Title === prod.Title)
            if (pIdx > -1) {
              newProds[pIdx].Qty += prod.Qty
            } else {
              newProds.push({ ...prod })
            }
          }

          // Merge doanh số
          let newDoanhSo = [...(DoanhSo || [])].map(x => ({ ...x }))
          for (let user of a.DoanhSo || []) {
            const dsIdx = newDoanhSo.findIndex(
              c => c.FullName === user.FullName
            )
            if (dsIdx > -1) {
              newDoanhSo[dsIdx].Bonus += user.Bonus
            } else {
              newDoanhSo.push({ ...user })
            }
          }

          // Merge hoa hồng
          let newHoaHong = [...(HoaHong || [])].map(x => ({ ...x }))
          for (let user of a.HoaHong || []) {
            const hhIdx = newHoaHong.findIndex(
              c => c.FullName === user.FullName
            )
            if (hhIdx > -1) {
              newHoaHong[hhIdx].Bonus += user.Bonus
            } else {
              newHoaHong.push({ ...user })
            }
          }

          target.Prods = newProds
          target.DoanhSo = newDoanhSo
          target.HoaHong = newHoaHong
        } else {
          newPayDebt.push({ ...a })
        }
      }

      return {
        ...rowData,
        PayDebtWrap: newPayDebt
      }
    })
  }

  const newItems = converItems(Items)

  // ===== HEADER ===== //
  const HeadTable = [
    'STT',
    'NGÀY',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'THANH TOÁN',
    'GIỜ BẮT ĐẦU',
    'GIỜ KẾT THÚC',
    'ĐƠN HÀNG MỚI/THANH TOÁN NỢ/TRẢ HÀNG',
    'DỊCH VỤ THỰC HIỆN',
    'NHIỆP VỤ KHÁC'
  ]

  const newExport = [HeadTable]

  // ===== XỬ LÝ TỪNG ITEM ===== //
  newItems.map((item, index) => {
    // ----- GHÉP ĐƠN HÀNG + TRẢ HÀNG ----- //
    const content =
      item.children?.length > 0
        ? item.children
            .map(children => {
              return (children.MajorList || [])
                .map(major => {
                  let orderBlock = ''
                  let returnBlock = ''

                  if (major.Order) {
                    const o = major.Order
                    orderBlock = `
Đơn hàng mới - #${o.ID}
Sản phẩm / Dịch vụ : ${
                      o.Prods
                        ? o.Prods.map(p => `${p.Title} (x${p.Qty})`).join(', ')
                        : 'Không có'
                    }
Giá bán đơn hàng : ${o.GiaBanDonHang || 0}
Thanh toán : ${o.GiaBanDonHang || 0}
Thanh toán ví : ${o.Vi || 0}
Còn nợ : ${o.No || 0}
Hoa hồng : ${
                      o.HoaHong?.length > 0
                        ? o.HoaHong.map(x => `${x.FullName} (${x.Bonus})`).join(
                            ', '
                          )
                        : 'Không'
                    }
Doanh số : ${
                      o.DoanhSo?.length > 0
                        ? o.DoanhSo.map(x => `${x.FullName} (${x.Bonus})`).join(
                            ', '
                          )
                        : 'Không'
                    }
                            `
                  }

                  if (major.Returns) {
                    const r = major.Returns
                    returnBlock = `
Đơn trả hàng - #${r.ID}
Sản phẩm / Dịch vụ : ${
                      r.Prods
                        ? r.Prods.map(p => `${p.Title} (x${p.Qty})`).join(', ')
                        : 'Không có'
                    }
Giá trị đơn trả : ${r.GiaTriDonTra || 0}
Hoàn tiền mặt : ${r.HoanTienMat || 0}
Hoàn ví : ${r.HoanVi || 0}
Hoàn thẻ tiền : ${r.HoanTheTien || 0}
Hoa hồng : ${
                      r.HoaHong?.length > 0
                        ? r.HoaHong.map(x => `${x.FullName} (${x.Bonus})`).join(
                            ', '
                          )
                        : 'Không'
                    }
Doanh số : ${
                      r.DoanhSo?.length > 0
                        ? r.DoanhSo.map(x => `${x.FullName} (${x.Bonus})`).join(
                            ', '
                          )
                        : 'Không'
                    }
                            `
                  }

                  return orderBlock + returnBlock
                })
                .join('\n')
            })
            .join('\r\n')
        : ''

    // ----- THANH TOÁN NỢ (MERGED) ----- //
    const payDebt =
      item.PayDebtWrap?.length > 0
        ? item.PayDebtWrap.map(PayDebt => {
            return `
Thanh toán nợ - #${PayDebt.ID}
Sản phẩm / Dịch vụ : ${
              PayDebt.Prods
                ? PayDebt.Prods.map(p => `${p.Title} (x${p.Qty})`).join(', ')
                : 'Không có'
            }
Thanh toán : ${PayDebt.ThanhToan || 0}
Thanh toán ví : ${PayDebt.Vi || 0}
Thanh toán Thẻ tiền : ${PayDebt.TheTien || 0}
Còn nợ : ${PayDebt.No || 0}
Hoa hồng : ${
              PayDebt.HoaHong?.length > 0
                ? PayDebt.HoaHong.map(x => `${x.FullName} (${x.Bonus})`).join(
                    ', '
                  )
                : 'Không'
            }
Doanh số : ${
              PayDebt.DoanhSo?.length > 0
                ? PayDebt.DoanhSo.map(x => `${x.FullName} (${x.Bonus})`).join(
                    ', '
                  )
                : 'Không'
            }
                    `
          }).join('\r\n')
        : ''

    // ----- DỊCH VỤ THỰC HIỆN ----- //
    const service =
      item.children?.length > 0
        ? item.children
            .map(children => {
              return (children.MajorList || [])
                .map(major => {
                  if (!major.Services) return ''

                  return major.Services.map(service => {
                    return `
#${service.Type}
Sản phẩm / Dịch vụ : ${service.Title || 'Không có'}
Phụ Phí : ${
                      service.PhuPhi?.length > 0
                        ? service.PhuPhi.map(o => o.Title).join(', ')
                        : 'Không'
                    }
Hoa hồng : ${
                      service.HoaHong?.length > 0
                        ? service.HoaHong.map(
                            x => `${x.FullName} (${x.Bonus})`
                          ).join(', ')
                        : 'Không'
                    }
                                `
                  }).join('\r\n')
                })
                .join('\n')
            })
            .join('\r\n')
        : ''

    // ----- NGHIỆP VỤ KHÁC ----- //
    const more =
      item.children?.length > 0
        ? item.children
            .map(children => {
              return children.More?.length > 0
                ? children.More.map(more => {
                    return `
Tên nghiệp vụ : ${more.Title || 'Chưa xác định'}
Giá trị : ${more.Value || 0}
Phát sinh thu / Chi TM : ${more.PhatSinhThuChi || 0}
Chi tiết : ${more.Desc || ''}
                            `
                  }).join('\r\n')
                : ''
            })
            .join('\r\n')
        : ''

    // ----- PUSH DÒNG EXCEL ----- //
    const newArr = [
      index + 1,
      window.top.moment(item.CreateDate).format('HH:mm DD/MM/YYYY'),
      item.FullName,
      item.Phone,
      item.TongThanhToan,
      item.CheckIn
        ? window.top.moment(item.CheckIn).format('HH:mm DD/MM/YYYY')
        : 'Không',
      item.CheckOut
        ? window.top.moment(item.CheckOut).format('HH:mm DD/MM/YYYY')
        : 'Không',
      content + '\r\n' + payDebt,
      service,
      more
    ]

    newExport.push(newArr)
  })

  return newExport
}

const KHACH_HANG_TELESALES = members => {
  const HeadTable = [
    'STT',
    'HỌ VÀ TÊN',
    'SỐ ĐIỆN THOẠI',
    'CƠ SỞ',
    'NHÂN VIÊN PHỤ TRÁCH',
    'TRẠNG THÁI',
    'LIÊN HỆ GẦN NHẤT',
    'GHI CHÚ'
  ]
  const newExport = [HeadTable]
  members.map((item, index) => {
    const newArr = [
      index + 1,
      item.FullName,
      item?.MobilePhone,
      (item.ByStock && item.ByStock.Title) || '',
      item.TeleUser.FullName || 'Chưa có nhân viên',
      item.TeleTags,
      item.TopTele && item.TopTele.length > 0
        ? `${window.top.moment(item.TopTele[0]).format('HH:mm DD/MM/YYYY')} - ${
            item.TopTele[0].Content
          }`
        : 'Chưa liên hệ',
      item.TeleNote
    ]
    newExport.push(newArr)
  })
  return newExport
}

const KHACH_HANG_TELESALES_STATISTICAL = members => {
  const HeadTable = [
    'STT',
    'HỌ TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'CƠ SỞ',
    'NỘI DUNG',
    'KẾT QUẢ',
    'NHÂN VIÊN THỰC HIỆN'
  ]
  const newExport = [HeadTable]
  members.map((item, index) => {
    const newArr = [
      index + 1,
      item.MemberName,
      item?.MobilePhone,
      item.StockTitle || '',
      item.Content || '',
      item.Result,
      item.TeleName
    ]
    newExport.push(newArr)
  })
  return newExport
}

const KHACH_HANG_TELESALES_REMINDER = members => {
  const HeadTable = [
    'STT',
    'HỌ TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'NGÀY TẠO',
    'NGÀY NHẮC',
    'NỘI DUNG',
    'TRẠNG THÁI'
  ]

  const convertArray = arrays => {
    const newArray = []
    if (!arrays || arrays.length === 0) {
      return newArray
    }
    for (let [index, obj] of arrays.entries()) {
      for (let [x, noti] of obj.lst.entries()) {
        const newObj = {
          NotiCreateDate: noti.CreateDate,
          NotiDate: noti.Date,
          Desc: noti.Desc,
          IsNoti: noti.IsNoti,
          member: obj.member,
          lst: obj.lst,
          DetailNoti: noti
        }
        newArray.push(newObj)
      }
    }
    return newArray
  }

  const newMembers = convertArray(members)

  const newExport = [HeadTable]
  newMembers.map((item, index) => {
    const newArr = [
      index + 1,
      item?.member?.FullName,
      item?.member?.MobilePhone,
      window.top.moment(item.NotiCreateDate).format('HH:mm DD/MM/YYYY'),
      window.top.moment(item.NotiDate).format('HH:mm DD/MM/YYYY'),
      item.Desc,
      item.IsNoti ? 'Đã nhắc' : 'Chưa nhắc'
    ]
    newExport.push(newArr)
  })
  return newExport
}

const exportProfitList = ({ dich_vu, san_pham }) => {
  const HeadPrdTable = [
    'STT',
    'SẢN PHẨM / NGUYÊN VẬT LIỆU',
    'SỐ LƯỢNG THỰC TẾ',
    'DOANH THU THỰC',
    'GIÁ GỐC TRUNG BÌNH',
    'LỢI NHUẬN 1',
    'LỢI NHUẬN 2'
  ]
  const HeadSrvTable = [
    'STT',
    'DỊCH VỤ / PHỤ PHÍ',
    'SỐ LƯỢNG THỰC TẾ',
    'DOANH THU THEO BUỔI',
    'LỢI NHUẬN'
  ]
  const ListProduct = [HeadPrdTable]
  const ListService = [HeadSrvTable]

  if (san_pham) {
    san_pham.map((item, index) => {
      const newArr = [
        index + 1,
        item.ProdTitle,
        item.RealQty,
        item.RealPay,
        item.AverageCost,
        item.Revenue1,
        item.Revenue2
      ]
      ListProduct.push(newArr)
    })
  }

  if (dich_vu) {
    dich_vu.map((item, index) => {
      const newArr = [
        index + 1,
        item.ProdTitle,
        item.RealQty,
        item.RealPay,
        item.Revenue
      ]
      ListService.push(newArr)
    })
  }

  return {
    ListProduct,
    ListService
  }
}

const exportData_TAN_SUAT_SD = ({ Members }) => {
  //workbook.getActiveSheet().addSpan(3, 1, 2, 1, GC.Spread.Sheets.SheetArea.viewport);
  const newArrays = [
    [
      'STT',
      'NGÀY TẠO',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'CƠ SỞ',
      'TẦN SUẤT SỬ DỤNG',
      'THỜI GIAN MUA',
      'TÊN DỊCH VỤ',
      'TG DÙNG GẦN NHẤT',
      'TẦN SUẤT SỬ DỤNG'
    ]
  ]
  const newRows = []

  if (!Members || Members.length === 0) {
    return newArrays
  }
  var indexStart = 2
  for (let [index, obj] of Members.entries()) {
    //indexStart =
    //    index > 0 ? Members[index - 1].ProdsList.length + indexStart : indexStart;
    if (index > 0 && Members[index - 1].ProdsList.length > 1) {
      indexStart += Members[index - 1].ProdsList.length
    } else {
      indexStart += 1
    }

    if (obj.ProdsList && obj.ProdsList.length > 0) {
      for (let [x, order] of obj.ProdsList.entries()) {
        const newArray = [
          index + 1,
          window.top.moment(obj.CreateDate).format('HH:mm DD/MM/YYYY'),
          obj.MemberFullName,
          obj.MemberPhone,
          obj.StockName,
          obj.TanSuatSD,
          window.top.moment(order.CreateDate).format('HH:mm DD/MM/YYYY'),
          order.Title,
          order.LastUsedTime
            ? window.top.moment(order.LastUsedTime).format('HH:mm DD/MM/YYYY')
            : '',
          order.TanSuatSD ?? 0
        ]

        if (x === 0 && obj.ProdsList.length > 1) {
          const rowObj = {
            row: indexStart,
            rowCount: obj.ProdsList && obj.ProdsList.length
          }
          newRows.push(rowObj)
        }
        newArrays.push(newArray)
      }
    } else {
      const newArray = [
        index + 1,
        window.top.moment(obj.CreateDate).format('HH:mm DD/MM/YYYY'),
        obj.MemberFullName,
        obj.MemberPhone,
        obj.StockName,
        obj.TanSuatSD,
        '',
        '',
        '',
        ''
      ]
      newArrays.push(newArray)
    }
  }
  return {
    data: newArrays,
    Rows: newRows
  }
}

const exportData_TAN_SUAT_SD_THANG = ({ List, Mons }) => {
  const newArrays = [
    [
      'STT',
      'ID',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'CƠ SỞ',
      'VÍ',
      'THẺ TIỀN',
      'CÔNG NỢ',
      'ĐÃ CHI TIÊU',
      'TÍCH ĐIỂM',
      'DỊCH VỤ CÒN'
    ]
  ]
  if (Mons && Mons.length > 0) {
    for (let mon of Mons) {
      newArrays[0].push(mon)
    }
  }
  const newRows = []

  if (!List || List.length === 0) {
    return newArrays
  }
  for (let [index, obj] of List.entries()) {
    let Stock =
      window.top.Info.Stocks &&
      window.top.Info.Stocks.find(x => x.ID === obj.Member.ByStockID)
    let Present = obj?.Member?.Present ? JSON.parse(obj?.Member?.Present) : null

    const newArray = [
      index + 1,
      obj.Member.ID,
      obj.Member.FullName,
      obj.Member.MobilePhone,
      Stock?.Title,
      Present?.nap_vi,
      Present?.the_tien_kha_dung,
      Present?.no,
      Present?.da_chi_tieu,
      Present?.points,
      obj.Service
        ? obj.Service.map(x => `${x.DichVuThe} (${x.Sobuoi})`).join(', ')
        : ''
    ]
    if (obj.Mons && obj.Mons.length > 0) {
      for (let mon of obj.Mons) {
        newArray.push(mon.Qty)
      }
    }
    newArrays.push(newArray)
  }
  return {
    data: newArrays
  }
}

const exportData_KH_DU_KIEN = ({ Members }) => {
  //workbook.getActiveSheet().addSpan(3, 1, 2, 1, GC.Spread.Sheets.SheetArea.viewport);
  const newArrays = [
    [
      'STT',
      'NGÀY TẠO',
      'TÊN KHÁCH HÀNG',
      'SỐ ĐIỆN THOẠI',
      'CƠ SỞ',
      'THỜI GIAN MUA',
      'TÊN MẶT HÀNG',
      'TG ƯỚC TÍNH DÙNG HẾT'
    ]
  ]
  const newRows = []

  if (!Members || Members.length === 0) {
    return newArrays
  }
  var indexStart = 3
  for (let [index, obj] of Members.entries()) {
    indexStart =
      index > 0 ? Members[index - 1].ProdsList.length + indexStart : indexStart
    for (let [x, order] of obj.ProdsList.entries()) {
      const newArray = [
        index + 1,
        window.top.moment(obj.CreateDate).format('HH:mm DD/MM/YYYY'),
        obj.MemberFullName,
        obj.MemberPhone,
        obj.StockName,
        window.top.moment(order.CreateDate).format('HH:mm DD/MM/YYYY'),
        `${order.Title} (x${order.Qty})`,
        order.UsedUpDate
          ? window.top.moment(order.UsedUpDate).format('HH:mm DD/MM/YYYY')
          : rowData.DueDate
          ? window.top.moment(order.DueDate).format('HH:mm DD/MM/YYYY')
          : ''
      ]

      if (x === 0 && obj.ProdsList.length > 1) {
        const rowObj = {
          row: indexStart,
          rowCount: obj.ProdsList && obj.ProdsList.length
        }
        newRows.push(rowObj)
      }
      newArrays.push(newArray)
    }
  }
  return {
    data: newArrays,
    Rows: newRows
  }
}

const exportActualSell = data => {
  const head = ['LOẠI', 'TỔNG', 'TM/CK/QT', 'VÍ, THẺ TIỀN']
  const newList = {
    Total: [head],
    NewForSale: [head],
    Pay: [head]
  }
  if (!data) return newList
  for (var key in data) {
    let newArray = []
    const item = data[key]
    var TONG_TM_CK_QT = 0
    var TONG_Wallet_MoneyCard = 0
    for (var x in data[key]) {
      TONG_TM_CK_QT +=
        (data[key][x].ck || 0) + (data[key][x].qt || 0) + (data[key][x].tm || 0)
      TONG_Wallet_MoneyCard += (data[key][x].vi || 0) + (data[key][x].tt || 0)
    }
    newArray = [
      [
        'Tổng thu bán hàng',
        item.tong_thu,
        TONG_TM_CK_QT,
        TONG_Wallet_MoneyCard
      ],
      [
        'Sản phẩm & NVL',
        item.sp_nvl.tong,
        item.sp_nvl.ck + item.sp_nvl.qt + item.sp_nvl.tm,
        item.sp_nvl.vi + item.sp_nvl.tt
      ],
      [
        'Dịch vụ & Phụ phí',
        item.dv_pp.tong,
        item.dv_pp.ck + item.dv_pp.qt + item.dv_pp.tm,
        item.dv_pp.vi + item.dv_pp.tt
      ],
      [
        'Thẻ tiền',
        item.the_tien.tong,
        item.the_tien.ck + item.the_tien.qt + item.the_tien.tm,
        item.the_tien.vi + item.the_tien.tt
      ]
    ]
    if (key === 'tong') {
      newList.Total = [...newList.Total, ...newArray]
    }
    if (key === 'ban_moi') {
      newList.NewForSale = [...newList.NewForSale, ...newArray]
    }
    if (key === 'thu_no') {
      newList.Pay = [...newList.Pay, ...newArray]
    }
    // newArray = [
    //     {
    //       TotalPercent: convertoPrecision(
    //         (item?.sp_nvl?.tong / item.tong_thu) * 100
    //       ),
    //       TM_CK_QTPercent: convertoPrecision(
    //         ((item?.sp_nvl?.ck + item?.sp_nvl?.qt + item?.sp_nvl?.tm) /
    //           TONG_TM_CK_QT) *
    //           100
    //       ),
    //       Wallet_MoneyCardPercent: convertoPrecision(
    //         ((item?.sp_nvl?.vi + item?.sp_nvl?.tt) /
    //           TONG_Wallet_MoneyCard) *
    //           100
    //       )
    //     },
    //     {
    //       TotalPercent: convertoPrecision(
    //         (item?.dv_pp?.tong / item.tong_thu) * 100
    //       ),
    //       TM_CK_QTPercent: convertoPrecision(
    //         ((item?.dv_pp?.ck + item?.dv_pp?.qt + item?.dv_pp?.tm) /
    //           TONG_TM_CK_QT) *
    //           100
    //       ),
    //       Wallet_MoneyCardPercent: convertoPrecision(
    //         ((item?.dv_pp?.vi + item?.dv_pp?.tt) /
    //           TONG_Wallet_MoneyCard) *
    //           100
    //       )
    //     },
    //     {
    //       TotalPercent: convertoPrecision(
    //         (item?.the_tien?.tong / item.tong_thu) * 100
    //       ),
    //       TM_CK_QTPercent: convertoPrecision(
    //         ((item?.the_tien?.ck +
    //           item?.the_tien?.qt +
    //           item?.the_tien?.tm) /
    //           TONG_TM_CK_QT) *
    //           100
    //       ),
    //       Wallet_MoneyCardPercent: convertoPrecision(
    //         ((item?.the_tien?.vi + item?.the_tien?.tt) /
    //           TONG_Wallet_MoneyCard) *
    //           100
    //       )
    //     }
    //   ]
  }
  return newList
}
