import { useRouter } from 'next/router';

import { get } from '../lib/database';
import styles from './[...slug].module.css';
import Header from '../components/Header';
export default function Page({ page, error }) {

  const router = useRouter();

  if (error) {
    router.push('/404');
    return null;
  }

  // If page is null (not found), redirect to 404
  if (!page) {
    router.push('/404');
    return null;
  }

  return (
    <div className={styles.container}>
    <Header pageId={page.id} initialTitle={page.title} initialContent={page.content} />
      <h1 className={styles.title}>{page.title}</h1>
      <div className={styles.content}> 
        <p>{page.content}</p>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const slug = params.slug.join('/');
  try {
    const resp = await get('SELECT * FROM pages WHERE id = ?', [slug]);
    if (!resp) {
      return { notFound: true };
    }
    return { props: { page: resp } };
  } catch (err) {
    console.error(err);
    return { props: { error: err.message } };
  }
}