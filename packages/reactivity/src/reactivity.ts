import { isObject } from "@vue/shared";

const mutableHandlers = {};
const shallowReactiveHandlers = {};
const readonlyHandlers = {};
const shallowReadonlyHandlers = {};

export function reactive(target) {
  return createReactiveObj(target, false, mutableHandlers);
}

export function shallowReactive(target) {
  return createReactiveObj(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObj(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObj(target, true, shallowReadonlyHandlers);
}

/**
 * 是不是仅读，是不是深度 柯里化
 * new Proxy()最核心的需要拦截数据的读取和修改  get，set
 */
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
export function createReactiveObj(target, isReadonly, baseHandlers) {
  // 如果目标不是对象，就不拦截，reactive只拦截对象类型
  if (!isObject(target)) {
    return target;
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap;

  // 如果被代理，就不用再次被代理 
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;

  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);

  return proxy;
}
