export function effect(fn, options: any = {}) {
  // 需要让这个effect变成响应式的，做到数据变化重新执行

  const effect = createReactiveEffect(fn, options);

  if (!options.lazy) {
    effect(); // 默认会执行一次
  }

  return effect;
}

let uid = 0;
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    fn() // 函数执行时会取值，会走get方法
  };

  effect.id = uid++; // 制作一个effect标识，用于区分effect
  effect._isEffect = true; // 用于标识这个是响应式effect
  effect.raw = fn; // 保留对应的原函数
  effect.options = options // 用户属性

  return effect;
}


export function track(target, key) {

}