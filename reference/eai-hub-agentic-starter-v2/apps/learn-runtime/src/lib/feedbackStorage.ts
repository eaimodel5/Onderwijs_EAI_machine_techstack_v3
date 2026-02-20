
const FEEDBACK_STORAGE_KEY = 'evai-message-feedback';

// Load feedback from localStorage
export const loadFeedback = (): Record<string, 'like' | 'dislike' | null> => {
  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load feedback from localStorage", e);
    return {};
  }
};

// Save feedback to localStorage
export const saveFeedback = (feedbackStore: Record<string, 'like' | 'dislike' | null>) => {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackStore));
  } catch (e) {
    console.error("Failed to save feedback to localStorage", e);
  }
};
