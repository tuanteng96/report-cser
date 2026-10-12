const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const source = fs.readFileSync(`${__dirname}/index.js`, 'utf8')
const context = { window: { top: {
  Info: { Stocks: [{ ID: 1, Title: 'Cơ sở A' }] },
  moment: value => ({ format: pattern => `${value}:${pattern}` })
} } }
vm.createContext(context)
vm.runInContext(source.slice(source.indexOf('const TON_DICH_VU = ('),
  source.indexOf('function exportMemberList(')) + '\nthis.exportInventory = TON_DICH_VU', context)

const member = { ID: 10, FullName: 'Khách A', MobilePhone: '0901234567' }
const item = {
  MemberInfo: JSON.stringify(member), SenderID: 10, SenderName: 'Tên người mua',
  StockID: '1', NgayMua: '2026-10-01', NgayHetHan: '2026-10-31',
  MaDonHang: '001', MaDichVu: '002', Ten_dich_vu: 'Dịch vụ A',
  Tong_buoi: 8, Da_su_dung: 3, Tong_tien: 1000, CostTotal: 625,
  Da_Thanh_toan: 800, tien_mat: 400, ck: 300, qt: 100, Vi: 50, The_tien: 50, Cong_no: 100
}
const result = JSON.parse(JSON.stringify(context.exportInventory({
  Items: [item, { ...item, MemberInfo: { ...member, ID: 20 } },
    { ...item, MemberInfo: null, Da_su_dung: null }],
  tong_so_buoi: 24, da_su_dung: 6, so_buoi_con: 18, tong_so_tien: 1000
})))
const [header, owner, recipient, missingMember, total] = result.Response
const ui = fs.readFileSync(`${__dirname}/../src/features/Reports/pages/RP-Services/pages/InventoryService/InventoryService.js`, 'utf8')
const columns = ui.slice(ui.indexOf('  const columns = useMemo('), ui.indexOf('  const OpenModalMobile'))
  .replace(/^\s*\/\/.*$/gm, '')
const titles = [...columns.matchAll(/title: '([^']+)'/g)].map(match => match[1].toUpperCase())
assert.deepEqual(header.filter(title => !title.startsWith('TT ')), titles)
assert.equal(result.TotalColumn, 23)
assert.equal(result.TotalRow, 5)
result.Response.forEach(row => assert.equal(row.length, header.length))
assert.deepEqual(owner.slice(1, 7), [10, 'Khách A', '0901234567', 'Cơ sở A',
  '2026-10-01:DD-MM-YYYY', '2026-10-31:DD-MM-YYYY'])
assert.deepEqual(owner.slice(11), [8, 3, 5, 1000, 625, 800, 400, 300, 100, 50, 50, 100])
assert.deepEqual(recipient.slice(14), ['', 625, '', '', '', '', '', '', ''])
assert.deepEqual(missingMember.slice(1, 4), ['', '', ''])
assert.deepEqual(missingMember.slice(11, 14), [8, 0, 8])
assert.deepEqual(total.slice(11, 15), [24, 6, 18, 1000])
assert.ok(total.slice(15).every(value => value === ''))
console.log('InventoryService: Excel columns, customer data, payment visibility and totals match the report')
