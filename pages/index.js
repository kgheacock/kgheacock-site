// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Home.module.css';
import Header from '../components/Header';
import { getAll } from '../lib/database';

export default function Home({ initialPages }) {
  const [pages, setPages] = useState(initialPages);

  return (
    <div className={styles.container}>
      <Header />
      <h1 className={styles.title}>Welcome to My Blog</h1>
      <div className={styles.pageList}>
        {pages.map((page) => (
          <Link href={`/${page.id}`} key={page.id} className={styles.pageLink}>
            {page.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const pages = await getAll('SELECT id, title FROM pages ORDER BY id DESC LIMIT 10');
    return { props: { initialPages: pages } };
  } catch (err) {
    console.error(err);
    return { props: { initialPages: [] } };
  }
}