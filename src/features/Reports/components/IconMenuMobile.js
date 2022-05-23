import React from 'react'
import { useDispatch } from 'react-redux'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { ToggleAside } from 'src/layout/LayoutSlice'

function IconMenuMobile(props) {
  const { width } = useWindowSize()
  const dispatch = useDispatch()

  const openAsideMenu = () => {
    dispatch(ToggleAside(true))
  }

  if (width < 1200) {
    return (
      <button
        type="button"
        className="btn btn-secondary ml-3px p-0 w-40px h-35px"
        onClick={openAsideMenu}
      >
        <i className="fa-solid fa-bars font-size font-size-h4 mt-4px"></i>
      </button>
    )
  }
  return
}

export default IconMenuMobile
