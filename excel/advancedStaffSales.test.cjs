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
    done()
  }
})
const exportCase = source.slice(source.indexOf("    case '/nhan-vien/doanh-so-nang-cao':"),
  source.indexOf("    case '/nhan-vien/doanh-so':"))
vm.runInContext(`switch ('/nhan-vien/doanh-so-nang-cao') {${exportCase}}`, context)
assert.equal(writes.length, 2)
assert.ok(writes[1].row > writes[0].row + writes[0].rows.length)
assert.ok(numericFormats.every(([, alignment]) => alignment === 0))
assert.equal(hidden, true)

let exportOptions, apiParams, loading
Object.assign(context, {
  filters: { ShowsType: '5' }, PageTotal: 40,
  getAdvancedSalesParams: config => { assert.equal(config.Total, 40); return { Pi: 1, Ps: 1500, prodids: '11,12' } },
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
