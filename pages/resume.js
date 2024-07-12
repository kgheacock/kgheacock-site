// pages/index.js
import styles from './Resume.module.css';
import Head from 'next/head';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Resume Preview</title>
        <meta name="description" content="Preview and download resume" />
      </Head>

      <main className={styles.main}>
        <div className={styles.iframeContainer}>
          <iframe 
            src="/KHResume.pdf" 
            className={styles.pdfPreview}
            title="Resume Preview"
          />
        </div>

        <a 
          href="/KHResume.pdf" 
          download="KHResume.pdf"
          className={styles.downloadButton}
        >
          Download Resume
        </a>
      </main>
    </div>
  );
}