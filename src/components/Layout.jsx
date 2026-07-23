import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Plug, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/integrations', icon: Plug, label: 'Integrações' },
]

const ACCENT = '#a78bfa'

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
    <div key={tick} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
      <svg viewBox="0 0 240 160" width="44" height="29" fill="none">
        <defs>
          <filter id="g1"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="g2"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {SEGMENTS.map((s, i) => (
          <g key={i}>
            <path d={s.d} stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" filter="url(#g2)"
              style={{ strokeDasharray:s.len, strokeDashoffset:s.len, animation:`.9s ease forwards draw-l`, animationDelay:`${s.delay}s` }}/>
            <path d={s.d} stroke="white" strokeWidth="2.5" strokeLinecap="round" filter="url(#g1)"
              style={{ strokeDasharray:s.len, strokeDashoffset:s.len, animation:`.9s ease forwards draw-l`, animationDelay:`${s.delay}s` }}/>
          </g>
        ))}
        <style>{`@keyframes draw-l { to { stroke-dashoffset: 0; } }`}</style>
      </svg>
      <div>
        <p style={{ fontSize:'14px', fontWeight:800, color:'#fff', letterSpacing:'3px', textTransform:'uppercase', lineHeight:1 }}>AVODAH</p>
        <p style={{ fontSize:'9px', color:'rgba(255,255,255,0.25)', letterSpacing:'1px', marginTop:'3px', textTransform:'uppercase' }}>Agency Dashboard</p>
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'AV'

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0d0d0d', overflow:'hidden' }}>

      {/* Sidebar */}
      <aside className="sidebar" style={{
        width:'230px', display:'flex', flexDirection:'column',
        background:'#111', borderRight:'1px solid #1a1a1a', flexShrink:0
      }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid #1a1a1a' }}>
          <SidebarLogo />
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:'12px',
                padding:'11px 14px', borderRadius:'8px',
                fontSize:'13px', fontWeight: isActive ? 600 : 400,
                textDecoration:'none', transition:'all .15s',
                background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                color: isActive ? ACCENT : 'rgba(255,255,255,0.4)',
                borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
              })}>
              <Icon size={15}/>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', marginBottom:'2px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:ACCENT, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, color:'#fff' }}>
              {initials}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ fontSize:'12px', fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%',
              padding:'9px 12px', borderRadius:'8px', background:'transparent', border:'none',
              cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.25)', transition:'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#fff'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>
            <LogOut size={13}/> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:'auto', background:'#0d0d0d', paddingBottom:'70px' }} className="dash-content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              textDecoration:'none', color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.35)',
              fontSize:'10px', fontWeight: isActive ? 600 : 400,
            })}>
            <Icon size={18}/>
            {label}
          </NavLink>
        ))}
        <button onClick={handleLogout} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
          background:'transparent', border:'none', cursor:'pointer',
          color:'rgba(255,255,255,0.35)', fontSize:'10px'
        }}>
          <LogOut size={18}/>
          Sair
        </button>
      </nav>
    </div>
  )
}
