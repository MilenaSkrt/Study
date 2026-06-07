import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { theorySections } from '../data/theoryContent.js';

export default function TeacherPanel() {
  const [modules, setModules] = useState([]);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [progressError, setProgressError] = useState('');

  const theoryCount = theorySections.reduce((sum, section) => sum + section.topics.length, 0);

  async function loadModules() {
    const { data } = await api.get('/modules');
    setModules(data);
  }

  async function loadStudentsProgress() {
    setProgressError('');
    try {
      const { data } = await api.get('/progress/students', {
        params: { total_sections: theoryCount },
      });
      setStudentsProgress(data);
    } catch (err) {
      setProgressError(err.response?.data?.detail || 'Не удалось загрузить прогресс студентов');
    }
  }

  useEffect(() => {
    loadModules();
    loadStudentsProgress();
  }, []);

  async function createModule(event) {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/modules', form);
      setForm({ title: '', description: '' });
      setMessage('Модуль создан');
      await loadModules();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Ошибка создания модуля');
    }
  }

  return (
    <main className="page teacher-page">
      <section className="card">
        <h1>🧑‍🏫 Панель преподавателя</h1>
        <form onSubmit={createModule} className="stack-form">
          <label>Название модуля</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>Описание</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn">Создать модуль</button>
          {message && <div className="hint-box">{message}</div>}
        </form>
      </section>

      <section className="card">
        <div className="teacher-section-header">
          <div>
            <p className="eyebrow">Контроль обучения</p>
            <h2>Прогресс студентов</h2>
          </div>
          <button className="btn ghost" type="button" onClick={loadStudentsProgress}>
            Обновить
          </button>
        </div>

        {progressError && <div className="hint-box">{progressError}</div>}

        <div className="teacher-progress-table-wrap">
          <table className="teacher-progress-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Email</th>
                <th>Группа</th>
                <th>Прогресс</th>
                <th>Тем изучено</th>
              </tr>
            </thead>
            <tbody>
              {studentsProgress.map((student) => (
                <tr key={student.user_id}>
                  <td>{student.full_name}</td>
                  <td>{student.email}</td>
                  <td>{student.group_name || '—'}</td>
                  <td>
                    <div className="teacher-progress-cell">
                      <strong>{student.percent}%</strong>
                      <div className="teacher-progress-track">
                        <span style={{ width: `${student.percent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>{student.completed_sections} из {student.total_sections}</td>
                </tr>
              ))}

              {studentsProgress.length === 0 && !progressError && (
                <tr>
                  <td colSpan="5">Студентов пока нет.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Текущие модули</h2>
        <div className="vertical-list">
          {modules.map((module) => (
            <article className="card" key={module.id}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
