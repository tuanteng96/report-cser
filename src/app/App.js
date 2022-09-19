import { Provider } from 'react-redux'
import AuthInit from 'src/features/Auth/AuthInit'
import ScrollToTop from 'src/layout/_core/ScrollToTop'
import RouterPage from './RouterPage'

function App({ store, persistor }) {
  return (
    <Provider store={store}>
      <AuthInit>
        <ScrollToTop>
          <RouterPage />
        </ScrollToTop>
      </AuthInit>
    </Provider>
  )
}

export default App
