import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link className="logo" to="/">Study M</Link>

      <nav className="nav-menu">
        {user && <NavLink to="/dashboard">Кабинет</NavLink>}
        {user && <NavLink to="/theory">Теория</NavLink>}
        {user && <NavLink to="/tasks">Обучение</NavLink>}
        {user && <NavLink to="/compiler">Попробуй сам</NavLink>}
        {user?.role?.name === 'teacher' && <NavLink to="/teacher">Преподавателю</NavLink>}
        {user?.role?.name === 'admin' && <NavLink to="/admin/users">Пользователи</NavLink>}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span>{user.full_name}</span>
            <button className="btn ghost" onClick={logout}>Выйти</button>
          </>
        ) : (
          <Link className="btn" to="/login">Войти</Link>
        )}
      </div>
    </header>
  );
}