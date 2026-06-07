import { Link } from 'react-router-dom';
import { theorySections } from '../data/theoryContent.js';

export default function TheoryList() {
  return (
    <main className="page theory-page">
      <section className="theory-header">
        <p className="eyebrow">Теория</p>
        <h1>Учебные разделы</h1>
        <p>
          Теоретические материалы по численным методам, математическим моделям в физике
          и задачам поиска параметров модели.
        </p>
      </section>

      <section className="theory-sections">
        {theorySections.map((section) => (
          <article className="theory-section-card" key={section.id}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>

            <div className="theory-topic-list">
              {section.topics.map((topic) => (
                <Link key={topic.id} to={`/theory/${topic.id}`} className="theory-topic-link">
                  {topic.title}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}