import React from 'react'
import ReactDOM from 'react-dom/client'
import Startup from './Startup'
import './styles.css'
import './viewport.css'
import './components/quiet-index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Startup />
  </React.StrictMode>,
)
