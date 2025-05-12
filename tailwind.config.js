/** @type {import('tailwindcss').Config} */
      module.exports = {
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}"
        ],
        theme: {
          extend: {
            colors: {
              primary: {
                50:  '#f5fafc',
                100: '#e4f1f9',
                500: '#1e40af'
              }
            }
          }
        },
        plugins: []
      }