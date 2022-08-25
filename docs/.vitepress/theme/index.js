import DefaultTheme from 'vitepress/theme'
// import RunCode from 'vitepress-plugin-code-run'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // app.component('RunCode', RunCode)
  }
}
