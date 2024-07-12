// pages/api/resume.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.resolve('.', 'public/KHResume.pdf');
  const fileStream = fs.createReadStream(filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="KHResume.pdf"');

  fileStream.pipe(res);
}