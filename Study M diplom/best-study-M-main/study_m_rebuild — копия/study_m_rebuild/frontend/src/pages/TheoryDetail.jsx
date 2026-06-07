import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { theorySections } from '../data/theoryContent.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { markTheoryCompleted } from '../utils/progress.js';

function findTopic(sectionId) {
  for (const section of theorySections) {
    const topic = section.topics.find((item) => item.id === sectionId);
    if (topic) return { section, topic };
  }
  return null;
}

function normalizeQuiz(quiz = []) {
  return quiz.map((item) => {
    if (typeof item === 'string') {
      return {
        question: item,
        options: [
          'Правильный вариант ответа',
          'Неверный вариант ответа',
          'Другой неверный вариант ответа',
        ],
        correctIndex: 0,
      };
    }

    return item;
  });
}

export default function TheoryDetail() {
  const { sectionId } = useParams();
  const { user } = useAuth();
  const result = findTopic(sectionId);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const quiz = useMemo(() => normalizeQuiz(result?.topic?.quiz || []), [result]);

  if (!result) {
    return (
      <main className="page theory-page">
        <section className="theory-detail-card">
          <h1>Раздел не найден</h1>
          <Link className="btn" to="/theory">Вернуться к теории</Link>
        </section>
      </main>
    );
  }

  const { section, topic } = result;

  const correctCount = quiz.reduce((count, question, index) => {
    return answers[index] === question.correctIndex ? count + 1 : count;
  }, 0);

  function chooseAnswer(questionIndex, optionIndex) {
    if (checked) return;

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  }

  async function handleCheckAnswers() {
    setChecked(true);

    if (correctCount >= 2) {
      await markTheoryCompleted(topic.id, user);
    }
  }

  function resetQuiz() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <main className="page theory-page">
      <Link className="back-link" to="/theory">← Назад к разделам</Link>

      <article className="theory-detail-card">
        <p className="eyebrow">{section.title}</p>
        <h1>{topic.title}</h1>

        {topic.subsections?.map((subsection) => (
          <section className="theory-block" key={subsection.title}>
            <h2>{subsection.title}</h2>

            {subsection.content && <p>{subsection.content}</p>}

            {subsection.formulas?.length > 0 && (
              <div className="formula-list">
                {subsection.formulas.map((formula) => (
                  <div className="formula-chip" key={formula}>
                    {formula}
                  </div>
                ))}
              </div>
            )}

            {subsection.code && (
              <pre className="code-block">
                <code>{subsection.code.trim()}</code>
              </pre>
            )}

            {subsection.items?.length > 0 && (
              <ul className="theory-task-list">
                {subsection.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {quiz.length > 0 && (
          <section className="theory-block quiz-box">
            <h2>Контрольные вопросы</h2>
            <p className="quiz-intro">
              Выберите один правильный вариант ответа для каждого вопроса.
            </p>

            <div className="quiz-choice-list">
              {quiz.map((question, questionIndex) => (
                <div className="quiz-choice-card" key={question.question}>
                  <h3>{questionIndex + 1}. {question.question}</h3>

                  <div className="quiz-options">
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[questionIndex] === optionIndex;
                      const isCorrect = question.correctIndex === optionIndex;
                      const isWrong = checked && selected && !isCorrect;

                      let className = 'quiz-option';
                      if (selected) className += ' selected';
                      if (checked && isCorrect) className += ' correct';
                      if (isWrong) className += ' wrong';

                      return (
                        <button
                          key={option}
                          type="button"
                          className={className}
                          onClick={() => chooseAnswer(questionIndex, optionIndex)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              {!checked ? (
                <button
                  className="btn"
                  onClick={handleCheckAnswers}
                  disabled={Object.keys(answers).length < quiz.length}
                >
                  Проверить ответы
                </button>
              ) : (
                <>
                  <div className="quiz-result">
                    Результат: {correctCount} из {quiz.length}
                  </div>
                  <button className="btn ghost" onClick={resetQuiz}>
                    Пройти ещё раз
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}