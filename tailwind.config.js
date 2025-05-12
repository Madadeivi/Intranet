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
                500: '#3472E5', // Pantone 3005U (hex)
                900: '#353535', // Neutral Black U (hex)
              },
              secondary: {
                500: '#1B3AED', // Pantone Blue 072U (hex)
                600: '#0202AD', // 99-16 U (hex)
              },
              // Puedes agregar más tonos si lo necesitas
            },
            fontFamily: {
              geometria: ['Geometria', 'sans-serif'],
            },
          }
        },
        plugins: []
      }