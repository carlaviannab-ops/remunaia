import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        {profile?.empresa && <span>{profile.empresa}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">{profile?.nome}</span>
        <button
          onClick={() => navigate('/conta')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Minha Conta
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
