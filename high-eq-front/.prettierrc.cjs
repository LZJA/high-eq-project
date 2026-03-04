// ==================== Prettier 代码格式化配置 ====================
module.exports = {
  $schema: 'https://json.schemastore.org/prettierrc',

  semi: false, // 不加分号，采用 ASI 自动分号插入风格
  tabWidth: 2, // 缩进 2 个空格
  singleQuote: true, // 使用单引号
  printWidth: 120, // 每行最大 120 字符
  trailingComma: 'all', // 所有位置添加尾随逗号，便于 git diff
  useTabs: false, // 使用空格而非 tab 缩进
  endOfLine: 'lf', // 换行符使用 LF（Unix 风格），跨平台一致
  arrowParens: 'always', // 箭头函数参数始终加括号
  bracketSpacing: true, // 对象括号内添加空格
  bracketSameLine: false, // JSX 标签 > 另起一行
  quoteProps: 'consistent', // 对象属性引号保持一致（一个有引号则都有，一个无则都无）
  proseWrap: 'preserve', // 保留文本换行
  htmlWhitespaceSensitivity: 'css', // HTML 空白遵循 CSS display 属性
  vueIndentScriptAndStyle: false, // Vue 中 script 和 style 标签不缩进
  singleAttributePerLine: false, // HTML 属性不强制每行一个
  embeddedLanguageFormatting: 'auto', // 嵌入代码自动格式化

  plugins: ['@trivago/prettier-plugin-sort-imports'], // 导入排序插件

  importOrder: [
    // 导入语句排序规则（按优先级）
    '<THIRD_PARTY_MODULES>', // 第三方库依赖
    '^@/components/.*$', // 组件
    '^@/constants/.*$', // 常量
    '^@/apis/.*$', // API 接口
    '^@/composables/.*$', // 组合式函数
    '^@/stores/.*$', // 状态管理
    '^@/utils/.*$', // 工具函数
    '^@/i18n/.*$', // 国际化
    '^@/assets/.*$', // 静态资源
    '^@/.*$', // 其他别名导入
    '^\\.\\./.*$', // 父目录相对导入
    '^\\./.*$', // 当前目录相对导入
  ],

  importOrderSeparation: false, // 导入组之间不添加空行
  importOrderSortSpecifiers: true, // 同组内按字母顺序排序
}