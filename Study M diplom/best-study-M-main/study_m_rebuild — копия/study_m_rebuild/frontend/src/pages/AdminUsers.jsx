import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    const { data } = await api.get('/users');
    setUsers(data);
  }

  useEffect(() => { loadUsers(); }, []);

  return (
    <main className="page">
      <h1>👥 Управление пользователями</h1>
      <section className="card">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>ФИО</th><th>Email</th><th>Роль</th><th>Группа</th><th>Статус</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role?.name}</td>
                <td>{user.group?.name || '—'}</td>
                <td><span className="badge success">{user.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
