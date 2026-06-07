import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Compiler from './pages/Compiler.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Tasks from './pages/Tasks.jsx';
import TeacherPanel from './pages/TeacherPanel.jsx';
import TheoryDetail from './pages/TheoryDetail.jsx';
import TheoryList from './pages/TheoryList.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/theory" element={<ProtectedRoute><TheoryList /></ProtectedRoute>} />
        <Route path="/theory/:sectionId" element={<ProtectedRoute><TheoryDetail /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/compiler" element={<ProtectedRoute><Compiler /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute roles={['teacher', 'admin']}><TeacherPanel /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
