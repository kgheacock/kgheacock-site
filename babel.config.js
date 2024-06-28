module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ],
    plugins: ["@babel/plugin-syntax-import-meta"],
    ignore: [
      'src/**/*.json', // Ignore JSON files
      'src/**/*.css',  // Ignore CSS files
      'src/**/*.ejs',  // Ignore EJS files
    ],
  };