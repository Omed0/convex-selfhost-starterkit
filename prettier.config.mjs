const config = {
  endOfLine: 'lf',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-tailwindcss'],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  tailwindFunctions: ['cva', 'cn'],
  tailwindStylesheet: './src/app/globals.css',
  trailingComma: 'es5',
};

export default config;
