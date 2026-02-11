import harnessConfig from '@harnessio/ui/tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [harnessConfig],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@harnessio/ui/dist/**/*.js',
  ],
}
