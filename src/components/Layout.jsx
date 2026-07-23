import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Plug, LogOut, Bell, Search } from 'lucide-react'
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

const ACCENT = '#a78bfa'

function SidebarLogo() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div key={tick} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
      <svg viewBox="0 0 240 160" width="40" height="27" fill="none">
        <defs>
          <filter id="g1"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="g2"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {SEGMENTS.map((s, i) => (
          <g key={i}>
            <path d={s.d} stroke="rgba(167,139,250,0.2)" strokeWidth="6" strokeLinecap="round" filter="url(#g2)"
              style={{ strokeDasharray:s.len, strokeDashoffset:s.len, animation:`.9s ease forwards draw-l`, animationDelay:`${s.delay}s` }}/>
            <path d={s.d} stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" filter="url(#g1)"
              style={{ strokeDasharray:s.len, strokeDashoffset:s.len, animation:`.9s ease forwards draw-l`, animationDelay:`${s.delay}s` }}/>
          </g>
        ))}
        <style>{`@keyframes draw-l { to { stroke-dashoffset: 0; } }`}</style>
      </svg>
      <div>
        <p style={{ fontSize:'13px', fontWeight:800, color:'#fff', letterSpacing:'2px', textTransform:'uppercase', lineHeight:1 }}>Avodah</p>
        <p style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginTop:'2px' }}>Agency Dashboard</p>
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
      <aside style={{
        width:'220px', display:'flex', flexDirection:'column',
        background:'#111', borderRight:'1px solid #1e1e1e',
        flexShrink:0
      }}>
        {/* Logo */}
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid #1e1e1e' }}>
          <SidebarLogo />
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:'11px',
                padding:'10px 12px', borderRadius:'8px',
                fontSize:'13px', fontWeight: isActive ? 600 : 400,
                textDecoration:'none', transition:'all .15s',
                background: isActive ? 'rgba(167,139,250,0.08)' : 'transparent',
                color: isActive ? ACCENT : 'rgba(255,255,255,0.45)',
                borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
              })}>
              <Icon size={15}/>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid #1e1e1e' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', marginBottom:'4px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background: ACCENT,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'11px', fontWeight:800, color:'#fff', flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ fontSize:'12px', fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%',
              padding:'8px 10px', borderRadius:'8px', background:'transparent', border:'none',
              cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.3)', transition:'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#fff'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
            <LogOut size={13}/> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Top header */}
        <header style={{
          height:'56px', background:'#111', borderBottom:'1px solid #1e1e1e',
          display:'flex', alignItems:'center', padding:'0 24px', gap:'12px', flexShrink:0
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#0d0d0d',
            border:'1px solid #1e1e1e', borderRadius:'8px', padding:'7px 14px', flex:1, maxWidth:'320px' }}>
            <Search size={13} style={{ color:'rgba(255,255,255,0.25)', flexShrink:0 }}/>
            <input placeholder="Buscar..." style={{ background:'transparent', border:'none', outline:'none',
              fontSize:'13px', color:'rgba(255,255,255,0.5)', width:'100%' }}/>
          </div>
          <div style={{ flex:1 }}/>
          <button style={{ background:'transparent', border:'1px solid #1e1e1e', borderRadius:'8px',
            padding:'7px', cursor:'pointer', display:'flex', alignItems:'center', color:'rgba(255,255,255,0.4)' }}>
            <Bell size={15}/>
          </button>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:ACCENT,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px',
            fontWeight:800, color:'#fff', cursor:'pointer' }}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
