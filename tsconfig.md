```js
// https://www.tslang.cn/docs/handbook/compiler-options.html
{
  "compilerOptions": { // 编译选项
    "baseUrl": "./", // 解析非相对模块名的基准目录。查看 模块解析文档了解详情。
    "paths": { // 模块名到基于 baseUrl的路径映射的列表。查看 模块解析文档了解详情。
      "antd": ["components/index.tsx"],
      "antd/es/*": ["components/*"]
    },
    "strictNullChecks": true, // 严格模式对undefined、null的检查
    "moduleResolution": "node", // 决定如何处理模块
    "esModuleInterop": true,
    "experimentalDecorators": true, // 启用实验性的ES装饰器
    "jsx": "preserve", // 在ts中支持jsx语法
    "noUnusedParameters": true, // 若有未使用的参数则抛错。
    "noUnusedLocals": true, // 若有未使用的局部变量则抛错
    "noImplicitAny": true, // 在表达式和声明上有隐含的 any类型时报错。
    "target": "es6", // 指定ECMAScript目标版本
    "lib": ["dom", "es2017"], // 编译过程中需要引入的库文件的列表。
    "skipLibCheck": true, // 忽略所有的声明文件（ *.d.ts）的类型检查。
    "allowJs": true, // 允许编译javascript文件。
    "checkJs": true // 在 .js文件中报告错误。与 --allowJs配合使用。
    "noEmit": true
  },
  "exclude": ["node_modules", "lib", "es"] // 排除
}

```
