import { useState, useEffect } from 'react'
import API from '../api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' })
  const [success, setSuccess] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users')
      setUsers(res.data)
    } catch {
      setError('Error al cargar usuarios')
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (email) => {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return
    try {
      await API.delete(`/auth/users/${email}`)
      setSuccess('Usuario eliminado')
      fetchUsers()
    } catch {
      setError('Error al eliminar')
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auth/register', form)
      setSuccess('Usuario creado correctamente')
      setForm({ username: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear usuario')
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de usuarios</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.card}>
        <h3>Crear usuario</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} name="username" placeholder="Nombre" value={form.username} onChange={handleChange} required />
          <input style={styles.input} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <select style={styles.input} name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.button} type="submit">Crear</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Usuarios registrados</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email}>
                <td style={styles.td}>{u.username}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(u.email)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#333', marginBottom: '1.5rem' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  form: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  input: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem', flex: '1 1 180px' },
  button: { padding: '0.6rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ddd', color: '#555' },
  td: { padding: '0.75rem', borderBottom: '1px solid #eee' },
  error: { color: 'red', marginBottom: '1rem' },
  success: { color: 'green', marginBottom: '1rem' }
}