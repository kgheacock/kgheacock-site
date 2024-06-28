import React from 'react';
const BlogPost = ({ title, content, links }) => (
  <div>
    <h1>{title}</h1>
    <p>{content}</p>
    <ul>
      {links.map((link, index) => (
        <li key={index}>
          <a href={`/blog/${link.destination}`}>{link.text}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default BlogPost;