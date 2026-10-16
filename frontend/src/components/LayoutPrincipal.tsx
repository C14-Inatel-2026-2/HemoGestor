import { Outlet } from 'react-router-dom'
import MenuLateral from './MenuLateral'
import './LayoutPrincipal.css'

function LayoutPrincipal() {
  return (
    <div className="layout-principal">
      <MenuLateral />
      <main className="layout-principal__conteudo">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutPrincipal