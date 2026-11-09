import { NavLink } from 'react-router-dom'
import './MenuLateral.css'
import {
  IconeDashboard,
  IconeDoacoes,
  IconeDoadores,
  IconeEstoque,
  IconeSolicitacoes,
} from './IconesMenu'

const ITENS_MENU = [
  { caminho: '/dashboard', rotulo: 'Dashboard', icone: IconeDashboard },
  { caminho: '/doadores', rotulo: 'Doadores', icone: IconeDoadores },
  { caminho: '/doacoes', rotulo: 'Doações', icone: IconeDoacoes },
  { caminho: '/estoque', rotulo: 'Estoque', icone: IconeEstoque },
  {
    caminho: '/solicitacoes',
    rotulo: 'Solicitações',
    icone: IconeSolicitacoes,
  },
]

function MenuLateral() {
  return (
    <aside className="menu-lateral">
      <div className="menu-lateral__marca">
        <img src="/favicon.svg" alt="" className="menu-lateral__logo" />
        <span>HemoGestor</span>
      </div>

      <nav aria-label="Menu principal">
        <ul className="menu-lateral__lista">
          {ITENS_MENU.map((item) => (
            <li key={item.caminho}>
              <NavLink to={item.caminho} className="menu-lateral__link">
                <item.icone />
                <span>{item.rotulo}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default MenuLateral