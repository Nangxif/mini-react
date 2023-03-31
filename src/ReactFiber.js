import { HostComponent, HostRoot } from './ReactWorkTags';
import { NoFlags } from './ReactFiberFlags';

export function createHostRootFiber() {
  // HostRoot就是一个tag
  return createFiber(HostRoot);
}

/**
 * tag fiber的标签 HostRoot指的是根节点，还有一些常见的类型比如HostComponent（指的是div span）
 * pendingProps 等待生效的属性对象
 * key
 * */
function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}
function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.pendingProps = pendingProps;
  this.key = key;
}

/**
 * 根据老fiber创建新fiber
 * current 老fiber
 * pendingProps 等待更新的属性
 * */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (!workInProgress) {
    // 如果当前的fiber树没有alterate，此步骤对应图Snipaste_2023-03-05_14-50-53.png
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 如果有alternate的话
    workInProgress.pendingProps = pendingProps;
  }
  // 最后重置flags，flags就是副作用的标识
  workInProgress.flags = NoFlags;

  workInProgress.child = null;
  workInProgress.sibling = null;
  workInProgress.updateQueue = current.updateQueue;
  // 在dom diff的过程中会给fiber添加副作用
  workInProgress.firstEffect =
    workInProgress.lastEffect =
    workInProgress.nextEffect =
      null;

  return workInProgress;
}

// 根据虚拟DOM元素创建fiber节点
export function createFiberFromElement(element) {
  const { key, type, props } = element;
  let tag;
  // 如果type是一个div span的话，那么就是一个原生的节点
  if (typeof type === 'string') {
    tag = HostComponent; // 标签等于原生组件
  }
  const fiber = createFiber(tag, props, key);
  fiber.type = type;
  return fiber;
}
