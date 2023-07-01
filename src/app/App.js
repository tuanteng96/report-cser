import { Provider } from 'react-redux'
import AuthInit from 'src/features/Auth/AuthInit'
import ScrollToTop from 'src/layout/_core/ScrollToTop'
import RouterPage from './RouterPage'
import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => {
  return useContext(AppContext)
}

function App({ store, persistor }) {
  const [GGLoading, setGGLoading] = useState(true)

  window.ShowButton = () => {
    setGGLoading(false)
  }

  return (
    <Provider store={store}>
      <AppContext.Provider value={{ GGLoading }}>
        <AuthInit>
          <ScrollToTop>
            <RouterPage />
          </ScrollToTop>
        </AuthInit>
      </AppContext.Provider>
    </Provider>
  )
}

export default App
