const HomePage: React.FC = () => {
  import { Provider } from 'react-redux'
  import { store } from '../store'

  
  return (
    <Provider store={store}> 
      <div>
      </div>
    </Provider>
  )
}

export default HomePage