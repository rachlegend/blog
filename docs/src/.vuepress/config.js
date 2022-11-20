const { autoResizerProps } = require('element-plus')
const { description } = require('../../package')

module.exports = {
  title: 'Salutonly\'s Digital Garden',
  description: 'salutonly的个人博客',
  base: '/blog/',
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],
  markdown: {
    lineNumbers: false
  },
  theme: 'reco',
  themeConfig: {
    sidebar: 'auto',
    repo: 'https://github.com/salutonly/blog',
    repoLabel: 'Github',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'JavaScript',
        link: '/javascript/',
      },
      {
        text: 'Vue',
        link: '/vue/',
      },
      {
        text: 'Webpack',
        link: '/webpack/'
      },
      {
        text: 'LeetCode',
        link: '/leetcode/',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/salutonly'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '',
            'using-vue',
          ]
        }
      ],
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
