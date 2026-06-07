import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { theorySections } from '../data/theoryContent.js';
import { learningCases } from '../data/learningContent.js';
import { fetchTheoryProgress, getTheoryProgress } from '../utils/progress.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [completedTheory, setCompletedTheory] = useState([]);

  const theoryCount = theorySections.reduce((sum, section) => sum + section.topics.length, 0);

  useEffect(() => {
    let isMounted = true;

    setCompletedTheory(getTheoryProgress(user));

    async function loadProgress() {
      const completed = await fetchTheoryProgress(user, theoryCount);
      if (isMounted) setCompletedTheory(completed);
    }

    function handleStorageUpdate() {
      setCompletedTheory(getTheoryProgress(user));
      loadProgress();
    }

    loadProgress();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('focus', handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('focus', handleStorageUpdate);
    };
  }, [user, theoryCount]);

  const completedCount = completedTheory.length;
  const percent = theoryCount > 0 ? Math.round((completedCount / theoryCount) * 100) : 0;

  return (
    <main className="page student-dashboard-page">
      <section className="student-hero-card">
        <div>
          <p className="eyebrow">Кабинет студента</p>
          <h1>Добро пожаловать, {user?.full_name || 'студент'}!</h1>
          <p>
            Здесь отображается прогресс изучения теоретических разделов.
            Тема считается завершённой, если студент правильно ответил минимум на 2 из 3 контрольных вопросов.
          </p>
        </div>

        <div className="student-profile-mini">
          <span>👤</span>
          <strong>{user?.full_name || 'Студент'}</strong>
          <p>Группа: {user?.group?.name || '—'}</p>
          <p>Роль: {user?.role?.name || 'student'}</p>
        </div>
      </section>

      <section className="dashboard-progress-card">
        <div>
          <p className="eyebrow">Прогресс обучения</p>
          <h2>{percent}% завершено</h2>
          <p>Изучено {completedCount} из {theoryCount} теоретических тем.</p>
        </div>

        <div className="dashboard-progress-ring">
          <span>{percent}%</span>
        </div>

        <div className="dashboard-progress-track">
          <div style={{ width: `${percent}%` }} />
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <span>📚</span>
          <strong>{theorySections.length}</strong>
          <p>крупных раздела</p>
        </article>

        <article className="dashboard-stat-card">
          <span>🧩</span>
          <strong>{theoryCount}</strong>
          <p>тем для изучения</p>
        </article>

        <article className="dashboard-stat-card">
          <span>✅</span>
          <strong>{completedCount}</strong>
          <p>тем изучено</p>
        </article>

        <article className="dashboard-stat-card">
          <span>🐍</span>
          <strong>{learningCases.length}</strong>
          <p>практических задач</p>
        </article>
      </section>

      <section className="dashboard-route-card">
        <div>
          <p className="eyebrow">Рекомендуемый маршрут</p>
          <h2>Как проходить обучение</h2>
        </div>

        <div className="route-steps">
          <article>
            <span>1</span>
            <h3>Изучить теорию</h3>
            <p>Прочитать материал, формулы и примеры программной реализации.</p>
          </article>

          <article>
            <span>2</span>
            <h3>Ответить на вопросы</h3>
            <p>Тема засчитывается при результате не менее 2 правильных ответов из 3.</p>
          </article>

          <article>
            <span>3</span>
            <h3>Закрепить практикой</h3>
            <p>Перейти в разделы «Обучение» и «Попробуй сам» для запуска Python-кода.</p>
          </article>
        </div>
      </section>

      <section className="dashboard-actions-grid">
        <Link className="dashboard-action-card" to="/theory">
          <span>📖</span>
          <h2>Теория</h2>
          <p>Изучить разделы и пройти контрольные вопросы.</p>
        </Link>

        <Link className="dashboard-action-card" to="/tasks">
          <span>🧠</span>
          <h2>Обучение</h2>
          <p>Пошаговые разборы задач с формулами и Python-кодом.</p>
        </Link>

        <Link className="dashboard-action-card" to="/compiler">
          <span>⚙️</span>
          <h2>Попробуй сам</h2>
          <p>Редактор Python-кода с готовыми шаблонами численных методов.</p>
        </Link>
      </section>
    </main>
  );
}