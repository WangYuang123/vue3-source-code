export function effect(fn, options: any = {}) {
  // 需要让这个effect变成响应式的，做到数据变化重新执行

  const effect = createReactiveEffect(fn, options);

  if (!options.lazy) {
    effect(); // 默认会执行一次
  }

  return effect;
}

let uid = 0;
let activeEffect; // 存储当前的effect
const effectStack = []; // 保证当前的effect是正确的
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(activeEffect)) {
      // 保证effect没有加入到stack中
      try {
        effectStack.push(effect);
        activeEffect = effect;
        return fn(); // 函数执行时会取值，会走get方法
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };

  effect.id = uid++; // 制作一个effect标识，用于区分effect
  effect._isEffect = true; // 用于标识这个是响应式effect
  effect.raw = fn; // 保留对应的原函数
  effect.options = options; // 用户属性

  return effect;
}

const targetWeakMap = new WeakMap();
// 让对象中的属性和当前对应的 effect关联起来
export function track(target, type, key) {
  // activeEffect 可以拿到当前的effect

  if (activeEffect === undefined) {
    // 此属性不用收集依赖，因为不在effect中使用
    return;
  }

  // 处理target
  let depsMap = targetWeakMap.get(target);
  if (!depsMap) {
    targetWeakMap.set(target, (depsMap = new Map()));
  }

  // 处理key
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }

  console.log(targetWeakMap)
}

/**
 * {name: 'yanQi', age: 37} => name => [effect effect]
 * weakMap key => {name: 'yanQi', age: 37} value(map) => {name => set}
 */

/**
 * effect(() => {
 *  state.xxx+++
 * })
 */

/**
 * 函数调用是一个栈型结构
 * effect(() => {
 *  state.name // effect1 [1]
 *  effect(() => { [1, 2]
 *    state.aeg // effect2
 *  })
 *  state.address // effect1 [1]
 * })
 */
