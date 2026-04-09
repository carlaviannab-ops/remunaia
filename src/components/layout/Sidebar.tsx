import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard',       label: 'Dashboard',        icon: '📊' },
  { to: '/simulacao/nova',  label: 'Nova Simulação',   icon: '➕' },
  { to: '/historico',       label: 'Histórico',        icon: '📋' },
  { to: '/planos',          label: 'Planos',           icon: '💳' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <span className="text-xl font-bold text-primary-700">RemunaIA</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
