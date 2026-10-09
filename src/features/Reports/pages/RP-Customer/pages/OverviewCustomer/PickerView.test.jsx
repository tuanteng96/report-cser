import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PickerView from './PickerView'

const mockMutate = jest.fn()
const mockRefetch = jest.fn()
const mockRow = { ID: 7, GuestCount: 2 }
const mockRights = {
  groups: [
    {
      group: 'Chức năng khác',
      rights: [
        {
          name: 'adminTools',
          subs: [
            { name: 'adminTools_byStock', hasRight: true, IsAllStock: true }
          ]
        }
      ]
    }
  ]
}

jest.mock('react-redux', () => ({
  useSelector: () => ({ rightTree: mockRights, CrStockID: 1 })
}))
jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: mockMutate }),
  useQuery: () => ({ data: { lst: [mockRow] }, refetch: mockRefetch })
}))
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children }) => <div>{children}</div>
  }
}))
jest.mock('src/components/Tables/ReactTableV7', () => ({ columns, data }) => (
  <>
    {columns
      .find(column => column.key === 'GuestCount')
      .cellRenderer({ rowData: data[0] })}
  </>
))

test('guest count edits debounce once and do not submit again on parent renders or server updates', () => {
  jest.useFakeTimers()
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
  const filters = {}
  const view = () => (
    <PickerView filters={filters} refetch={mockRefetch}>
      {({ open }) => <button onClick={open}>Open</button>}
    </PickerView>
  )
  const { rerender, unmount } = render(view())
  fireEvent.click(screen.getByText('Open'))
  act(() => jest.advanceTimersByTime(500))
  expect(mockMutate).not.toHaveBeenCalled()

  fireEvent.change(screen.getByRole('textbox'), { target: { value: '3' } })
  act(() => jest.advanceTimersByTime(300))
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '4' } })
  act(() => jest.advanceTimersByTime(499))
  expect(mockMutate).not.toHaveBeenCalled()
  act(() => jest.advanceTimersByTime(1))
  expect(mockMutate).toHaveBeenCalledTimes(1)
  expect(mockMutate).toHaveBeenCalledWith(
    { CheckInID: 7, Count: 4 },
    expect.any(Object)
  )

  rerender(view())
  act(() => jest.advanceTimersByTime(500))
  expect(mockMutate).toHaveBeenCalledTimes(1)
  mockRow.GuestCount = 6
  rerender(view())
  act(() => jest.advanceTimersByTime(500))
  expect(mockMutate).toHaveBeenCalledTimes(1)

  fireEvent.change(screen.getByRole('textbox'), { target: { value: '5' } })
  unmount()
  act(() => jest.advanceTimersByTime(500))
  expect(mockMutate).toHaveBeenCalledTimes(1)
  root.remove()
  jest.useRealTimers()
})
