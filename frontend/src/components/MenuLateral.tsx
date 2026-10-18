import { NavLink } from 'react-router-dom'
import './MenuLateral.css'

const ITENS_MENU = [
  { caminho: '/dashboard', rotulo: 'Dashboard' },
  { caminho: '/doadores', rotulo: 'Doadores' },
  { caminho: '/doacoes', rotulo: 'Registrar doação' },
  { caminho: '/estoque', rotulo: 'Estoque' },
  { caminho: '/solicitacoes', rotulo: 'Solicitações' },
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
                {item.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default MenuLateral