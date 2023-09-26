// 打包packages目录下的所有包

const fs = require("fs");
const execa = require("execa"); // 开启子进程打包，最终还是使用rollup打包

const targets = fs.readdirSync("packages").filter((f) => {
  if (fs.statSync(`packages/${f}`).isDirectory()) {
    return true;
  } else {
    return false;
  }
});

// 对我们的目标依次打包，并行打包

async function build(target) {
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`, "--bundleConfigAsCjs"], { stdio: "inherit" });
}

function runParallel(targets, iteratorFn) {
  const res = [];
  for (const item of targets) {
    const p = iteratorFn(item);
    res.push(p);
  }
  return Promise.all(res);
}

runParallel(targets, build);
