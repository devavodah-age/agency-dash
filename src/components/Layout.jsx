import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, Plug } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/integrations', icon: Plug, label: 'Integrações' },
]

const SEGMENTS = [
  { d: 'M 8,148 L 60,8',    len: 150, delay: 0.0 },
  { d: 'M 60,8 L 112,148',  len: 150, delay: 0.9 },
  { d: 'M 28,105 L 60,28',  len:  90, delay: 1.8 },
  { d: 'M 60,28 L 90,105',  len:  90, delay: 2.5 },
  { d: 'M 138,8 L 185,148', len: 150, delay: 3.4 },
  { d: 'M 185,148 L 232,8', len: 150, delay: 4.3 },
  { d: 'M 158,8 L 185,95',  len:  98, delay: 5.2 },
  { d: 'M 185,95 L 212,8',  len:  98, delay: 5.9 },
]

function SidebarLogo() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div key={tick} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg viewBox="0 0 240 160" width="130" height="88" fill="none">
        <defs>
          <filter id="glow-sb">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow2-sb">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {SEGMENTS.map((s, i) => (
          <g key={i}>
            <path d={s.d} stroke="rgba(255,255,255,0.15)" strokeWidth="6"
              strokeLinecap="round" filter="url(#glow2-sb)"
              style={{ strokeDasharray: s.len, strokeDashoffset: s.len,
                animation: `.9s ease forwards draw-sb`, animationDelay: `${s.delay}s` }}/>
            <path d={s.d} stroke="white" strokeWidth="2" strokeLinecap="round"
              filter="url(#glow-sb)"
              style={{ strokeDasharray: s.len, strokeDashoffset: s.len,
                animation: `.9s ease forwards draw-sb`, animationDelay: `${s.delay}s` }}/>
          </g>
        ))}
        <style>{`@keyframes draw-sb { to { stroke-dashoffset: 0; } }`}</style>
      </svg>
      <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'5px',
        color:'rgba(255,255,255,0.6)', textTransform:'uppercase',
        opacity:0, animation:'fadein-sb 1s ease forwards', animationDelay:'7s' }}>
        AGENCIA AVODAH
      </p>
      <style>{`
        @keyframes fadein-sb {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="w-60 flex flex-col border-r border-surface-border bg-surface-card">
        <div className="flex items-center justify-center py-6 border-b border-surface-border">
          <SidebarLogo />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-brand-dim hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-surface-border">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-brand-dim text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-brand-dim hover:text-white hover:bg-surface-hover transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
