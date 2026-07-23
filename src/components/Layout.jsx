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
      <svg viewBox="0 0 240 160" width="120" height="80" fill="none">
        <defs>
          <filter id="glow-sb">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {SEGMENTS.map((s, i) => (
          <path key={i} d={s.d} stroke="#111" strokeWidth="2.5" strokeLinecap="round"
            filter="url(#glow-sb)"
            style={{ strokeDasharray: s.len, strokeDashoffset: s.len,
              animation: `.9s ease forwards draw-sb`, animationDelay: `${s.delay}s` }}/>
        ))}
        <style>{`@keyframes draw-sb { to { stroke-dashoffset: 0; } }`}</style>
      </svg>
      <p style={{ fontSize:'8px', fontWeight:800, letterSpacing:'5px',
        color:'rgba(0,0,0,0.4)', textTransform:'uppercase',
        opacity:0, animation:'fadein-sb 1s ease forwards', animationDelay:'7s' }}>
        AGENCIA AVODAH
      </p>
      <style>{`
        @keyframes fadein-sb {
          from { opacity:0; transform:translateY(3px); }
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
    <div style={{ display:'flex', minHeight:'100vh', background:'#060606' }}>
      {/* Sidebar branca */}
      <aside style={{
        width: '220px', display:'flex', flexDirection:'column',
        background: '#ffffff', borderRight: '1px solid #e5e5e5',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding:'28px 20px 20px', borderBottom:'1px solid #ebebeb' }}>
          <SidebarLogo />
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:'4px' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 12px', borderRadius:'8px',
                fontSize:'13px', fontWeight: isActive ? 700 : 500,
                textDecoration:'none', transition:'all .15s',
                background: isActive ? '#111' : 'transparent',
                color: isActive ? '#fff' : '#555',
              })}
            >
              <Icon size={15}/>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'16px 12px', borderTop:'1px solid #ebebeb' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize:'11px', color:'#999', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:'2px' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={{
            display:'flex', alignItems:'center', gap:'8px',
            width:'100%', padding:'9px 12px', borderRadius:'8px',
            background:'transparent', border:'none', cursor:'pointer',
            fontSize:'13px', color:'#999', transition:'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='#f5f5f5'; e.currentTarget.style.color='#111' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#999' }}>
            <LogOut size={14}/>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo dark */}
      <main style={{ flex:1, overflowY:'auto', background:'#060606' }}>
        <Outlet />
      </main>
    </div>
  )
}
