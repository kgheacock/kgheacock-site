// src/index.js
import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import BlogPost from './BlogPost';


const blogPostData = window.__INITIAL_DATA__;
console.log('Hello world')
hydrateRoot(
    document.getElementById('root'),
  <BlogPost {...blogPostData} />,

);