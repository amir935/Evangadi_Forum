import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { createQuestion } from '../../services/questions/question.service.js';
import styles from './PostQuestion.module.css';

const initialFormData = { title: '', content: '' };
const initialFieldErrors = { title: '', content: '' };

function validateField(name, value) {
  const cleanValue = value.trim();

  if (name === 'title') {
    if (!cleanValue) return 'Question title is required.';
    if (cleanValue.length < 5) {
      return 'Question title must be at least 5 characters.';
    }
    if (cleanValue.length > 255) {
      return 'Question title must be no more than 255 characters.';
    }
  }

  if (name === 'content') {
    if (!cleanValue) return 'Question content is required.';
    if (cleanValue.length < 10) {
      return 'Question content must be at least 10 characters.';
    }
  }

  return '';
}

export default function PostQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedQuestion, setPostedQuestion] = useState(null);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({
      ...current,
      [name]: validateField(name, value),
    }));
    setSubmitError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const title = formData.title.trim();
    const content = formData.content.trim();
    const errors = {
      title: validateField('title', title),
      content: validateField('content', content),
    };

    setFieldErrors(errors);
    if (errors.title || errors.content) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const question = await createQuestion({ title, content });
      setPostedQuestion(question);
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAnother = () => {
    setFormData(initialFormData);
    setFieldErrors(initialFieldErrors);
    setSubmitError('');
    setPostedQuestion(null);
  };

  return (
    <section className={styles.postQuestion}>
      <div className={styles.postQuestion__intro}>
        <p className={styles.postQuestion__eyebrow}>Ask the cohort</p>
        <h1 className={styles.postQuestion__title}>Publish to the forum</h1>
        <p className={styles.postQuestion__description}>
          Public threads help the whole cohort. Write as if a classmate will
          debug your issue tomorrow. They only know what you put on the page.
        </p>
      </div>

      {postedQuestion ? (
        <div className={styles.postQuestion__success} role='status'>
          <div className={styles.postQuestion__successIcon}>
            <CheckCircle2 size={44} aria-hidden='true' />
          </div>
          <h2 className={styles.postQuestion__successTitle}>Thread published</h2>
          <p className={styles.postQuestion__successDescription}>
            Your post is published and available to the forum. Share it with
            your study group or continue the discussion with your peers.
          </p>
          <div className={styles.postQuestion__successActions}>
            <button
              className={styles.postQuestion__backButton}
              type='button'
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            <button
              className={styles.postQuestion__submit}
              type='button'
              onClick={() =>
                navigate(`/questions/${postedQuestion.questionHash}`)
              }
            >
              View Question
            </button>
            <button
              className={styles.postQuestion__anotherButton}
              type='button'
              onClick={handleAskAnother}
            >
              Ask Another
            </button>
          </div>
        </div>
      ) : (
        <form
          className={styles.postQuestion__form}
          onSubmit={handleSubmit}
          noValidate
        >
          <label className={styles.postQuestion__label} htmlFor='question-title'>
            Title
            <span className={styles.postQuestion__hint} id='question-title-hint'>
              Summarize your question in one sentence.
            </span>
            <input
              id='question-title'
              className={`${styles.postQuestion__input} ${fieldErrors.title ? styles['postQuestion__input--invalid'] : ''
                }`}
              name='title'
              type='text'
              value={formData.title}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={
                fieldErrors.title
                  ? 'question-title-hint question-title-error'
                  : 'question-title-hint'
              }
              minLength={5}
              maxLength={255}
              required
              disabled={isSubmitting}
              placeholder='For example: How do I connect React to Express?'
            />
            {fieldErrors.title && (
              <span
                className={styles.postQuestion__fieldError}
                id='question-title-error'
                role='alert'
              >
                {fieldErrors.title}
              </span>
            )}
            <span className={styles.postQuestion__count}>
              {formData.title.length}/255
            </span>
          </label>

          <label className={styles.postQuestion__label} htmlFor='question-content'>
            Details
            <span className={styles.postQuestion__hint} id='question-content-hint'>
              Share what you tried, what happened, and any useful error messages.
            </span>
            <textarea
              id='question-content'
              className={`${styles.postQuestion__textarea} ${fieldErrors.content
                ? styles['postQuestion__textarea--invalid']
                : ''
                }`}
              name='content'
              value={formData.content}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.content)}
              aria-describedby={
                fieldErrors.content
                  ? 'question-content-hint question-content-error'
                  : 'question-content-hint'
              }
              minLength={10}
              required
              disabled={isSubmitting}
              rows={9}
              placeholder='Add the background and steps needed to understand your question...'
            />
            {fieldErrors.content && (
              <span
                className={styles.postQuestion__fieldError}
                id='question-content-error'
                role='alert'
              >
                {fieldErrors.content}
              </span>
            )}
            <span className={styles.postQuestion__count}>
              {formData.content.length} characters
            </span>
          </label>

          {submitError && (
            <p className={styles.postQuestion__error} role='alert'>
              {submitError}
            </p>
          )}

          <div className={styles.postQuestion__actions}>
            <button
              className={styles.postQuestion__submit}
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post question'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
