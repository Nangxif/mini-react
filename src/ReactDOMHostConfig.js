// 凡是操作原生DOM的，都会放到这个文件里面

import {
  createElement,
  diffProperites,
  setInitialProperties,
} from './ReactDOMComponent';

// 如果儿子只是一个数字或者字符串，就设置它的文本内容就行，不需要创建子fiber节点
export function shouldSetTextContent(type, pendingProps) {
  return (
    typeof pendingProps.children === 'string' ||
    typeof pendingProps.children === 'number'
  );
}

export function createInstance(type, props) {
  return createElement(type);
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}
export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperites(domElement, type, oldProps, newProps);
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}

export function insertBefore(parentInstance, child, before) {
  parentInstance.insertBefore(child, before);
}
