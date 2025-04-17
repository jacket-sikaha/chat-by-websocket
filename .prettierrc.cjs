// .prettierrc.js
module.exports = {
  plugins: [
    'prettier-plugin-organize-imports', // 去掉无用依赖/参数的格式化插件
    'prettier-plugin-tailwindcss' // 自动排序twcss的 className
  ],
  printWidth: 100, //一行的字符数，如果超过会进行换行，默认为80
  tabWidth: 2, // 一个 tab 代表几个空格数，默认为 2 个
  useTabs: false, //是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
  singleQuote: true, // 字符串是否使用单引号，默认为 false，使用双引号
  semi: true, // 行尾是否使用分号，默认为true
  trailingComma: 'none', // 是否使用尾逗号
  htmlWhitespaceSensitivity: 'strict', // HTML空白敏感度
  bracketSpacing: true, // 对象大括号直接是否有空格，默认为 true，效果：{ a: 1 }
  proseWrap: 'never' // 换行设置
};
