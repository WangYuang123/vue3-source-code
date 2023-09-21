// rollup配置

const path = require("path");

// 根据环境变量中的target属性 获取对应模块中的 package.json
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);

// 永远针对的是某个模块
const resolve = (p) => path.resolve(packageDir, p);

const pkg = require(resolve('package.json'))

