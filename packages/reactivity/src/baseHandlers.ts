import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared";
import { readonly, reactive } from "./reactivity";
import { track, trigger } from "./effect";
import { TrackOperations, TriggerOpTypes } from "./operations";
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
      console.log("执行effect方法时会取值，收集对应的依赖");
      track(target, TrackOperations.GET, key);
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
    const oldValue = target[key]; // 获取老值
    let hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    if (!hadKey) {
      // 新增
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOpTypes.SET, key, value, oldValue);
    }

    const result = Reflect.set(target, key, value, receiver);
    // 区分新增还是 修改， vue2数组无法监控更改索引，无法监控数组的长度

    // 当数据更新时，通知对应属性的effect重新执行
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
