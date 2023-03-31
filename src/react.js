import { REACT_ELEMENT_TYPE } from './ReactSymbols';

// 这个对象表示config传进来的这些键值不要放在props上
const RESOLVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};
/**
 * 创建虚拟DOM
 * type 元素的类型
 * config 配置对象
 * children 第一个儿子，如果有多个儿子的话会依次放在后面
 * */
function createElement(type, config, children) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;
  if (config) {
    if (config.key) {
      key = config.key;
    }
    if (config.ref) {
      ref = config.ref;
    }
    for (propName in config) {
      if (!RESOLVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }
  //   儿子的长度
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = new Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE, //类型是一个React元素
    type,
    ref,
    key,
    props,
  };
}

const React = {
  createElement,
};
export default React;


/**
 * 一个更新流程
 * render 开始把元素渲染到容器里
 * updateContainer 更新根容器
 * scheduleUpdateOnFiber 开始在根fiber上调度更新
 * performSyncWorkOnRoot 在根上执行同步工作
 * renderRootSync 渲染当前的根
 * workLoopSync 执行工作循环
 * performUnitOfWork 执行单个工作单元
 * beginWork 开始单个工作单元
 * updateHostRoot 渲染root根容器
 * */ 

/**
 * fiber
 * 什么是fiber
 * 1.为了让渲染的过程可以中断，我们可以把整个渲染任务分成若干个task（工作单元），每个工作单元就是一个fiber
 * 2.每个虚拟DOM节点内部表示为一个fiber对象
 * 3.render阶段会根据虚拟DOM以深度优先的方式构建fiber树
 * */ 

/**
 * let element ={
 *      type: 'div',
 *      key: 'A',
 *      props: {
 *          style,
 *          children: [
 *              'A文本',
 *              {type: 'div', key: 'B1', props: { style, children: 'B1文本'}},
 *              {type: 'div', key: 'B2', props: { style, children: 'B2文本'}}
 *          ]
 *      }
 * }
 * 
 * 
 * 每个DOM节点在fiber树中基本都会对应一个fiber对象
 * 
 * 渲染的时候会先构建一个fiber树，然后根据这fiber树去创建这个dom树
 * 
 * 在react源码中，如果一个节点子有一个子节点，并且此子节点是一个文本节点，那么不会为这个节点创建fiber节点，这是一个优化
 * 
 * */ 

/**
 * 1.开始遍历一个fiber节点之后
 * 2.如果有儿子，开始处理儿子
 * 3.如果没有儿子，自己就结束了，开始处理弟弟
 * 4.如果没有弟弟，父亲就结束了，说明自己就是最小的儿子，开始处理叔叔
 * 5.如果没有叔叔，那么找他爷爷
 * */ 