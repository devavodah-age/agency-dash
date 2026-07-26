import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ClientAuthProvider, useClientAuth } from './contexts/ClientAuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Integrations from './pages/Integrations'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import DataDeletion from './pages/DataDeletion'
import Layout from './components/Layout'
import ClientLogin from './pages/client/Login'
import ClientRegister from './pages/client/Register'
import ClientDashboard from './pages/client/Dashboard'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function ClientPrivateRoute({ children }) {
  const { clientUser, loading } = useClientAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )
  return clientUser ? children : <Navigate to="/client/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <Routes>
          {/* Agency routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="integrations" element={<Integrations />} />
          </Route>

          {/* Client portal routes */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/dashboard" element={<ClientPrivateRoute><ClientDashboard /></ClientPrivateRoute>} />
        </Routes>
      </ClientAuthProvider>
    </AuthProvider>
  )
}
