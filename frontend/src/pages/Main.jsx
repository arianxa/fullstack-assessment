import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import Map from '../components/Map'

export default function Main() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const res = await API.get('/api/buildings/indicators')
        setIndicators(res.data)
      } catch {
        setError('Error al cargar indicadores')
      } finally {
        setLoading(false)
      }
    }
    fetchIndicators()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel principal</h1>
          <p style={styles.subtitle}>Bienvenido, <strong>{user?.username}</strong> · Rol: <span style={styles.role}>{user?.role}</span></p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.usersBtn} onClick={() => navigate('/users')}>Gestionar usuarios</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Indicador: Área media de vivienda</h2>
          {loading && <p>Cargando datos...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {!loading && !error && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Referencia</th>
                  <th style={styles.th}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map(b => (
                  <tr key={b.reference}>
                    <td style={styles.td}>{b.name}</td>
                    <td style={styles.td}>{b.reference}</td>
                    <td style={styles.td}>{b.value ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Mapa de edificios</h2>
          <Map buildings={indicators} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: '#4f46e5', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.5rem' },
  subtitle: { margin: '0.25rem 0 0', opacity: 0.9 },
  role: { background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' },
  headerButtons: { display: 'flex', gap: '1rem' },
  usersBtn: { padding: '0.5rem 1rem', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' },
  content: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  cardTitle: { marginTop: 0, color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ddd', color: '#555' },
  td: { padding: '0.75rem', borderBottom: '1px solid #eee' },
  error: { color: 'red' }
}