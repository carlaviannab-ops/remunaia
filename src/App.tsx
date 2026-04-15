import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Termos from './pages/Termos'
import Privacidade from './pages/Privacidade'
import Dashboard from './pages/Dashboard'
import NovaSimulacao from './pages/NovaSimulacao'
import Resultado from './pages/Resultado'
import Historico from './pages/Historico'
import SimulacaoDetalhe from './pages/SimulacaoDetalhe'
import Planos from './pages/Planos'
import Conta from './pages/Conta'
import Admin from './pages/Admin'

// Layout
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'

// Proteção de rotas autenticadas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/',            element: <Landing /> },
  { path: '/login',       element: <Login /> },
  { path: '/cadastro',    element: <Login modo="cadastro" /> },
  { path: '/termos',      element: <Termos /> },
  { path: '/privacidade', element: <Privacidade /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: 'dashboard',                   element: <Dashboard /> },
      { path: 'simulacao/nova',              element: <NovaSimulacao /> },
      { path: 'simulacao/:id/resultado',     element: <Resultado /> },
      { path: 'historico',                   element: <Historico /> },
      { path: 'simulacao/:id',               element: <SimulacaoDetalhe /> },
      { path: 'planos',                      element: <Planos /> },
      { path: 'conta',                       element: <Conta /> },
      { path: 'admin',                       element: <Admin /> },
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
