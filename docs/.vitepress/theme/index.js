import DefaultTheme from 'vitepress/theme'
// import RunCode from 'vitepress-plugin-code-run'
import CommonTitle from './comps/CommonTitle.vue'
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // app.component('RunCode', RunCode)
    app.component('CommonTitle', CommonTitle);
  }
}
