import { extend, isObject } from "@vue/shared";
import { readonly, reactive } from "./reactivity";
import { track } from "./effect";
// 实现new Proxy(target, handler)
/**
 * 是不是仅读的，仅读的属性set时会报异常
 * 是不是深度的
 */

/**
 * 拦截获取
 * @param isReadonly
 * @param isShallow
 */
function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);

    if (!isReadonly) {
      // 收集依赖，数据变化更新视图
      console.log('执行effect方法时会取值，收集对应的依赖')
      track()
    }

    if (isShallow) {
      return res;
    }

    // vue3取值时才会代理，是懒代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

/**
 * 拦截设置
 * @param shallow
 */
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    return result;
  };
}

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const readonlyObj = {
  set: (target, key) => {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
  },
};
const set = createSetter();
const shallowSet = createGetter(true);

export const mutableHandlers = {
  get,
  set,
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};

export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);

export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
