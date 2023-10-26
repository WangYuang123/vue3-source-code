import { hasChanged, isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOperations, TriggerOpTypes } from "./operations";
import { reactive } from "./reactivity";

// vue源码 基本都是高阶函数，做了类似的柯里化的功能

export function ref(value) {
  // value是一个普通类型
  // 将普通类型变成一个对象， value可以是对象，但是一般情况下对象用reactive更合理
  return createRef(value, false);
}

export function shallowRef(value) {
  return createRef(value, true);
}

// ref和reactive的区别 reactive内部用的是proxy ref内部使用的是defineProperty

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow);
}

const convert = (val) => (isObject(val) ? reactive(val) : val);

// bate版本之前的版本ref就是个对象，由于对象不方便扩展，改成了类
class RefImpl {
  public _value; // 表示声明了一个_value属性 但是没有赋值
  public _v_isRef = true; // 产生的实例会被添加 _v_isRef 表示是一个ref属性
  constructor(public rawValue, public shallow) {
    // 参数中前面增加修饰符，表示此属性放到了实例上
    // defineProperty 取值和赋值有一个公共操作的值
    // 如果是深度 需要把里面的都变成响应式的 这里的ref会调用reactive
    this._value = shallow ? rawValue : convert(rawValue);
  }

  // 类的属性访问器
  // 取值去value 会代理到_value
  get value() {
    track(this, TrackOperations.GET, "value");
    return this._value;
  }

  set value(newValue) {
    // 判断新值和老值是否有变化
    if (hasChanged(newValue, this.rawValue)) {
      this.rawValue = newValue; // 如果有变化，新值会变成老值
      this._value = this.shallow ? newValue : convert(newValue);
    }
    trigger(this, TriggerOpTypes.SET, "value", newValue);
  }
}

class ObjectRefImpl {
  public _v_isRef = true; // 产生的实例会被添加 _v_isRef 表示是一个ref属性
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

/**
 * const state = {name: 'yanQi'}
 * const name = toRef(state, 'name')
 * 将某一个key对应的值 转化为ref
 * 对象本身是响应式的，代理就是响应式的
 */

// 可以把对象的值转换成ref类型， 相当于代理
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}
