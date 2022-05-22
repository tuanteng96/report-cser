import { Provider } from 'react-redux'
import AuthInit from 'src/features/Auth/AuthInit'
import RouterPage from './RouterPage'

function App({ store, persistor }) {
  return (
    <Provider store={store}>
      <AuthInit>
        <RouterPage />
      </AuthInit>
    </Provider>
  )
}

export default App
