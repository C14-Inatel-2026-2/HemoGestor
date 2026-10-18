import { Navigate, Route, Routes } from 'react-router-dom'
import LayoutPrincipal from './components/LayoutPrincipal'
import DashboardPage from './pages/DashboardPage'
import DoadoresPage from './pages/DoadoresPage'
import EstoquePage from './pages/EstoquePage'
import RegistrarDoacaoPage from './pages/RegistrarDoacaoPage'
import SolicitacoesPage from './pages/SolicitacoesPage'

function App() {
  return (
    <Routes>
      <Route element={<LayoutPrincipal />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="doadores" element={<DoadoresPage />} />
        <Route path="doacoes" element={<RegistrarDoacaoPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="solicitacoes" element={<SolicitacoesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App