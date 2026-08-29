import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base del diseño de la imagen
        brand: {
          dark: '#0B0F19', // Fondo principal
          card: '#111827', // Fondo de tarjetas
          primary: '#6D28D9', // Morado del menú
        }
      }
    },
  },
  plugins: [],
}
export default config
