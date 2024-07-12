import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './Header.module.css';
import { useCsrfToken } from '../hooks/useCSRFToken';

export default function Header({ pageId, initialTitle, initialContent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [error, setError] = useState('');
  const csrfToken = useCsrfToken();
  const router = useRouter();

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialContent) setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/page', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ id: isEditMode ? pageId : undefined, title, content })
      });

      if (response.ok) {
        const redirectUrl = response.url;
        if (redirectUrl) {
          setIsModalOpen(false);
          setTitle('');
          setContent('');
          await router.push(redirectUrl);
        } else {
          console.error('Redirect URL not found in response headers');
          setError('Page saved, but redirect failed. Please try again.');
        }
      } else {
        throw new Error('Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setError('Failed to save page. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        const response = await fetch(`/api/page?id=${pageId}`, {
          method: 'DELETE',
          headers: {
            'CSRF-Token': csrfToken
          }
        });

        if (response.ok) {
          await router.push('/');
        } else {
          throw new Error('Failed to delete page');
        }
      } catch (error) {
        console.error('Error deleting page:', error);
        setError('Failed to delete page. Please try again.');
      }
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setIsEditMode(true);
    setTitle(initialTitle);
    setContent(initialContent);
    setIsModalOpen(true);
  };

  return (
    <header className={styles.header}>
      <h1>My Blog</h1>
      <div>
        <button onClick={openAddModal}>+ Add Page</button>
        {pageId && (
          <>
            <button onClick={openEditModal}>Edit Page</button>
            <button onClick={handleDelete}>Delete Page</button>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{isEditMode ? 'Edit Page' : 'Create New Page'}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className={styles.buttonGroup}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}