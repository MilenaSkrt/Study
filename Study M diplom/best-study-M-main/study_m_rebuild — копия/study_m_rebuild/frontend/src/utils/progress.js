import api from '../api/client.js';

const PROGRESS_KEY_PREFIX = 'study_m_theory_progress';

function getProgressKey(user) {
  const userKey = user?.id || user?.email;
  return userKey ? `${PROGRESS_KEY_PREFIX}_${userKey}` : PROGRESS_KEY_PREFIX;
}

function readLocalProgress(user) {
  const raw = localStorage.getItem(getProgressKey(user));

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalProgress(topicId, user) {
  const progress = readLocalProgress(user);

  if (!progress.includes(topicId)) {
    progress.push(topicId);
    localStorage.setItem(getProgressKey(user), JSON.stringify(progress));
  }

  return progress;
}

export function getTheoryProgress(user) {
  return readLocalProgress(user);
}

export async function fetchTheoryProgress(user, totalSections = 0) {
  try {
    const { data } = await api.get('/progress/me', {
      params: { total_sections: totalSections },
    });

    const completed = data.completed_section_ids || [];
    localStorage.setItem(getProgressKey(user), JSON.stringify(completed));
    return completed;
  } catch {
    return readLocalProgress(user);
  }
}

export async function markTheoryCompleted(topicId, user) {
  const localProgress = saveLocalProgress(topicId, user);

  try {
    const { data } = await api.post('/progress/me/complete', { section_id: topicId });
    return data;
  } catch {
    return { section_id: topicId, is_completed: true, offline: true, completed_section_ids: localProgress };
  }
}