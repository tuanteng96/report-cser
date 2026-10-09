const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const source = fs.readFileSync(`${__dirname}/index.js`, 'utf8')
const context = {
  window: { top: { moment: () => ({ format: () => '09/10/2026' }) } }
}
vm.createContext(context)
vm.runInContext(
  source.slice(source.indexOf('function exportDebt('), source.indexOf('function exportDebt2(')),
  context
)

const data = {
  Items: [{
    Member: { FullName: 'Khách A', Phone: '0901234567' },
    TongNo: 1500,
    ListOrders: [
      { Id: 1, TongNo: 1200, ListDebt: [
        { ConNo: 100, Staffs: [{ FullName: 'Nhân viên A' }] },
        { ConNo: 200 }
      ] },
      { Id: 2, TongNo: 300, ListDebt: [{ ConNo: 50 }] },
      { Id: 3, TongNo: 0, ListDebt: [{ ConNo: 99 }] }
    ]
  }]
}

for (const mode of [1, 3]) {
  const result = JSON.parse(JSON.stringify(context.exportDebt(data, mode)))
  const [header, ...rows] = result.newExport
  const orderDebt = header.indexOf('TỔNG SỐ TIỀN NỢ')
  assert.deepEqual(rows.map(row => row[orderDebt]), [1200, 0, 300, 0])
  assert.deepEqual(rows.map(row => row[3]), [1500, 0, 0, 0])
  assert.deepEqual(rows.map(row => row[11]), [100, 200, 50, 99])
  assert.deepEqual(result.arr, [4])
  assert.deepEqual(result.arr1, [2, 1, 1])
  if (mode === 3) assert.equal(rows[0][header.indexOf('NHÂN VIÊN')], 'Nhân viên A')
}
console.log('exportDebt: order totals match the report in modes 1 and 3')
