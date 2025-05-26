/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cultivo: {
          DEFAULT: '#16A34A',
          50: '#DCFCE7',
          100: '#BBF7D0',
          500: '#16A34A',
          600: '#059669',
          700: '#047857',
        },
        lima: {
          DEFAULT: '#A3E635',
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
        },
        neutral: {
          light: '#FFFFFF',
          dark: '#F3F4F6',
        },
        texto: {
          principal: '#1F2937',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'titulo': ['20px', { fontWeight: '600' }],
        'subtitulo': ['16px', { fontWeight: '500' }],
        'cuerpo': ['14px', { fontWeight: '400' }],
      },
      borderRadius: {
        'custom': '12px',
      },
      boxShadow: {
        'suave': '0 2px 4px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '120': '30rem',
        '140': '35rem',
        '160': '40rem',
        '180': '45rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        '98': '0.98',
      }
    },
  },
  plugins: [],
} 