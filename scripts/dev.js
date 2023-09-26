// 打包packages目录下的所有包

const fs = require("fs");
const execa = require("execa"); // 开启子进程打包，最终还是使用rollup打包

const target = 'reactivity'

async function build(target) {
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`, "--bundleConfigAsCjs"], { stdio: "inherit" });
}


build(target)