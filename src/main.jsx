import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,

)


// BrowserRouter -> Permet d'utiliser les routes dans l'application -> englobe tout l'app pour que les routes soient accessibles partout (Navbar, Footer, etc.)