
const Anthropic = require('@anthropic-ai/sdk');
const {openDb} = require('../lib/database');

const anthropic = new Anthropic({
    //apiKey: 'my_api_key', // defaults to process.env["ANTHROPIC_API_KEY"]
  });

async function preprocessArticle(article) {
    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2048,
        system: "You are an AI assistant that preprocesses articles for efficient future comparison. Provide your analysis in JSON format.",
        messages: [
            {role: "user", content: `Preprocess this article for future comparison:
      
      Title: ${article.title}
      Content: ${article.content}
      
      Provide the following:
      1. A list of 5-10 key concepts
      2. A one-sentence summary
      3. A one-paragraph summary
      4. 5-10 semantic tags
      5. A list of 3-5 potential related topics or articles`}
          ],
      });
      console.log(msg.content[0].text);

  const preprocessed = JSON.parse(msg.content[0].text);

  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: preprocessed.oneParagraphSummary,
  });
  const embedding = embeddingResponse.data.data[0].embedding;

  return {
    ...preprocessed,
    embedding
  };
}

/*

async function insertPreprocessedData(db, articleId, preprocessedData) {
  await db.run('BEGIN TRANSACTION');

  try {
    // Insert key concepts
    for (const concept of preprocessedData.keyConcepts) {
      await db.run('INSERT INTO key_concepts (article_id, concept) VALUES (?, ?)', [articleId, concept]);
    }

    // Insert summaries
    await db.run('INSERT OR REPLACE INTO summaries (article_id, one_sentence, one_paragraph) VALUES (?, ?, ?)',
      [articleId, preprocessedData.oneSentenceSummary, preprocessedData.oneParagraphSummary]);

    // Insert semantic tags
    for (const tag of preprocessedData.semanticTags) {
      await db.run('INSERT INTO semantic_tags (article_id, tag) VALUES (?, ?)', [articleId, tag]);
    }

    // Insert related topics
    for (const topic of preprocessedData.potentialRelatedTopics) {
      await db.run('INSERT INTO related_topics (article_id, topic) VALUES (?, ?)', [articleId, topic]);
    }

    // Insert embedding
    await db.run('INSERT OR REPLACE INTO embeddings (article_id, embedding) VALUES (?, ?)',
      [articleId, Buffer.from(new Float32Array(preprocessedData.embedding).buffer)]);

    // Update last_preprocessed timestamp
    await db.run('UPDATE articles SET last_preprocessed = CURRENT_TIMESTAMP WHERE id = ?', [articleId]);

    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}
*/

async function batchPreprocessArticles() {
  const db = await openDb()

  try {
    const articles = await db.all(`
      SELECT id, title, content, updated_at, last_preprocessed
      FROM pages
      WHERE last_preprocessed IS NULL OR last_preprocessed < updated_at
    `);

    console.log(`Found ${articles.length} articles that need preprocessing.`);

    for (const article of articles) {
      console.log(`Preprocessing article ${article.id}: ${article.title}`);
      const preprocessedData = await preprocessArticle(article);
      await insertPreprocessedData(db, article.id, preprocessedData);
      console.log(`Finished preprocessing article ${article.id}`);
    }

    console.log('Batch preprocessing complete.');
  } catch (error) {
    console.error('Error during batch preprocessing:', error);
  } finally {
    await db.close();
  }
}

// Run the batch job
batchPreprocessArticles();