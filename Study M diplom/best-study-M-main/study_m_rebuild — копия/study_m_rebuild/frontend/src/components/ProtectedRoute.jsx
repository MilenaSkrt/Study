import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page"><div className="card">Загрузка...</div></div>;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.name;
  if (roles && !roles.includes(role)) {
    return <div className="page"><div className="card error-card">Недостаточно прав доступа</div></div>;
  }

  return children;
}
