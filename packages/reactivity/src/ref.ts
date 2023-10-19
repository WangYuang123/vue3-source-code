export function ref(value) {
  // value是一个普通类型
  // 将普通类型变成一个对象， value可以是对象，但是一般情况下对象用reactive更合理
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value, true);
}

// ref和reactive的区别 reactive内部用的是proxy ref内部使用的是defineProperty

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow);
}

class RefImpl {
  public _value; // 表示声明了一个_value属性 但是没有赋值
  constructor(public rawValue, public shallow) { // 参数中前面增加修饰符，表示此属性放到了实例上

  }
}

// vue源码 基本都是高阶函数，做了类似的柯里化的功能
