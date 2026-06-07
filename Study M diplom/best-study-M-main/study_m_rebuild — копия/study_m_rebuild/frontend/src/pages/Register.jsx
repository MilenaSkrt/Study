import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    if (form.password !== form.confirm) {
      setMessage('Пароли не совпадают');
      return;
    }
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Ошибка регистрации');
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card register" onSubmit={handleSubmit}>
        <div className="auth-icon">🧪</div>
        <h1>Регистрация</h1>
        <p>Создайте новый аккаунт</p>
        <label>Имя пользователя</label>
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Пароль</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label>Подтверждение пароля</label>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        {message && <div className="form-error">{message}</div>}
        <button className="btn block">Зарегистрироваться</button>
        <p className="auth-switch">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </main>
  );
}
