const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const source = fs.readFileSync(`${__dirname}/index.js`, 'utf8')
const ui = fs.readFileSync(`${__dirname}/../src/features/Reports/pages/RP-Staff/pages/SalesStaff/index.js`, 'utf8')
const context = vm.createContext({ window: { top: { moment: require('moment') } } })
vm.runInContext(source.slice(source.indexOf('function exportAdvancedStaffSales('),
  source.indexOf('function exportStaffSalesList(')), context)
const input = {
  data: [{ Id: 8991, Ngay: '2026-10-22T22:20:30', Co_so: 'Cser Hà Nội',
    Gia_tri: 20000000, Don_hang: 65137, ProdTitle: 'Thẻ Member Kim Cương',
    LoaiKpi: 0, LoaiSpDv: 4, Nhanvien_ID: 11651, Nhanvien: 'Nguyễn Minh Anh' }],
  Sum: { Tong: 35950000, TongNhanvien: { 'Nguyễn Minh Anh': 34400000, 'hung(debug)': 650000, huonghn: 900000, Zero: 0 } }
}
const tables = JSON.parse(JSON.stringify(context.exportAdvancedStaffSales(input)))
assert.deepEqual(tables[0].rows[1], [8991, '22/10/2026', 'Cser Hà Nội', 20000000, 65137, 'Thẻ Member Kim Cương', '', 'Thẻ tiền', '11651 - Nguyễn Minh Anh'])
assert.equal(tables[0].rows[0][5], 'MẶT HÀNG')
for (const LoaiKpi of [0, '0', null, undefined, 2]) {
  const rows = context.exportAdvancedStaffSales({ data: [{ LoaiKpi }] })[0].rows
  assert.equal(rows[1][6], LoaiKpi === 2 ? 'Loại 2' : '')
}
assert.deepEqual(tables[1].rows[1], ['Nguyễn Minh Anh', 34400000])
assert.deepEqual(tables[1].rows[4], ['Zero', 0])
assert.equal(tables[0].rows.at(-1)[3], 35950000)
assert.equal(tables[1].rows.at(-1)[1], 35950000)
for (const table of tables) {
  assert.ok(table.rows.every(row => row.length === table.rows[0].length))
}
assert.equal(context.exportAdvancedStaffSales({})[0].rows.length, 2)

const writes = [], numericFormats = []
const cell = new Proxy({}, { get: () => () => cell })
const sheet = {
  getCell: () => cell,
  getRange: (...range) => {
    const style = new Proxy({}, { get: (_, name) => (...args) => {
      if (name === 'hAlign') numericFormats.push([range, args[0]])
      return style
    } })
    return style
  },
  setArray: (row, col, rows) => writes.push({ row, col, rows }),
  autoFitRow() {}, autoFitColumn() {}, setColumnWidth() {}
}
let hidden = false
Object.assign(context, {
  Data: { result: input, param: { Body: { from: '2026-11-01', to: '2026-11-08 23:59:59', stockid: 7 } } },
  getStockName: () => 'Cser Hà Nội', hideLoading: () => { hidden = true },
  GC: { Spread: { Sheets: { LineBorder: function () {}, LineStyle: { thin: 1 }, HorizontalAlign: { left: 0 } } } },
  dataToExcel: (name, render, done) => {
    render(sheet, { suspendPaint() {}, suspendEvent() {}, resumePaint() {}, resumeEvent() {} })
    assert.equal(hidden, true, 'Loading must end after rendering, before the save callback')
    done?.()
  }
})
const exportCase = source.slice(source.indexOf("    case '/nhan-vien/doanh-so-nang-cao':"),
  source.indexOf("    case '/nhan-vien/doanh-so':"))
vm.runInContext(`switch ('/nhan-vien/doanh-so-nang-cao') {${exportCase}}`, context)
assert.equal(writes.length, 2)
assert.ok(writes[1].row > writes[0].row + writes[0].rows.length)
assert.ok(numericFormats.every(([, alignment]) => alignment === 0))
assert.equal(hidden, true)

// Exercise the real helper while Excel IO has not called back yet.
let saveCallbacks
Object.assign(context, {
  document: { getElementById: () => ({}), querySelector: () => ({}) }
})
Object.assign(sheet, { setRowCount() {}, setColumnCount() {} })
context.GC.Spread.Excel = { IO: function () {
  this.save = (json, success, failure) => { saveCallbacks = { success, failure } }
} }
context.GC.Spread.Sheets.Workbook = function () {
  return {
    getActiveSheet: () => sheet, toJSON: () => ({}),
    suspendPaint() {}, suspendEvent() {}, resumePaint() {}, resumeEvent() {}
  }
}
vm.runInContext(source.slice(source.indexOf('function dataToExcel('),
  source.indexOf('loadResource().then(')), context)
hidden = false
vm.runInContext(`switch ('/nhan-vien/doanh-so-nang-cao') {${exportCase}}`, context)
assert.ok(saveCallbacks, 'The workbook must still be submitted for export')
assert.equal(hidden, true, 'A pending Excel IO save must not keep loading active')
saveCallbacks.success({})

let exportOptions, apiParams, loading
let amountExport
const requestSource = fs.readFileSync(`${__dirname}/../src/helpers/BrowserHelpers.js`, 'utf8')
Object.assign(context, {
  moment: require('moment'), _: require('lodash'),
  store: { getState: () => ({ auth: { GlobalConfig: { Admin: { AmountExport: amountExport } } } }) },
  filters: {
    ShowsType: '5', DateStart: new Date(2026, 10, 1), DateEnd: new Date(2026, 10, 8),
    StockID: 7, ProdOrService: { value: 0 }, KpiType: { value: 2 },
    ProductIds: [{ value: 11 }, { value: 12 }], MemberID: { value: 99 }, Pi: 3, Ps: 15
  },
  GlobalConfig: { Admin: {} }
})
vm.runInContext(requestSource.slice(requestSource.indexOf('export const BrowserHelpers'))
  .replace('export const', 'const'), context)
vm.runInContext(ui.slice(ui.indexOf('const advancedFilterDefaults ='),
  ui.indexOf('const advancedSummaryColumns =')), context)
vm.runInContext(ui.slice(ui.indexOf('  const getAdvancedSalesParams ='),
  ui.indexOf('  const getListSalarys =')), context)
const getParams = config => vm.runInContext(`getAdvancedSalesParams(${JSON.stringify(config)})`, context)
for (const total of [0, 40, 1499, 1500, 2300]) {
  const params = getParams({ Total: total })
  assert.equal(params.Pi, 1)
  assert.equal(params.Ps, Math.max(1500, total))
  assert.equal(params.prodType, 0)
  assert.equal(params.kpiType, 2)
  assert.equal(params.prodids, '11,12')
  assert.equal(params.mids, 99)
  assert.equal(params.stockid, 7)
  assert.equal(params.from, '2026-11-01')
  assert.equal(params.to, '2026-11-08 23:59:59')
}
amountExport = 500
context.GlobalConfig.Admin.AmountExport = 500
assert.equal(getParams({ Total: 2300 }).Ps, 500)
for (const value of [0, 1, 2, 3, 4]) {
  context.filters.ProdOrService = { value }
  assert.equal(getParams().prodType, value)
}
context.filters.ProdOrService = null
assert.equal(getParams().prodType, '')
assert.equal(getParams().Pi, 3)
assert.equal(getParams().Ps, 15)
amountExport = undefined
delete context.GlobalConfig.Admin.AmountExport
Object.assign(context, {
  PageTotal: 40,
  PermissionHelpers: { ExportExcel: options => { exportOptions = options } },
  reportsApi: { getAdvancedSales: async params => { apiParams = params; return { data: { result: input } } } },
  setLoadingExport: value => { loading = value }
})
const exportBranch = ui.match(/    if \(filters.ShowsType === '5'\) \{[\s\S]*?\n    \}/g)
vm.runInContext(`(async () => {${exportBranch.find(branch => branch.includes('PermissionHelpers.ExportExcel'))}})()`, context)
assert.equal(exportOptions.UrlName, '/nhan-vien/doanh-so-nang-cao')
exportOptions.FuncStart()
assert.equal(loading, true)
exportOptions.FuncApi().then(() => {
  assert.equal(apiParams.Pi, 1)
  assert.equal(apiParams.Ps, 1500)
  assert.equal(apiParams.prodids, '11,12')
  exportOptions.FuncEnd()
  assert.equal(loading, false)
  console.log('AdvancedStaffSales: export request, both tables, zero KPI, totals and layout pass')
}).catch(error => { console.error(error); process.exitCode = 1 })
