import { HostRoot, HostComponent } from './ReactWorkTags';
import { reconcileChildFibers, mountChildFibers } from './ReactChildFiber';
import { shouldSetTextContent } from './ReactDOMHostConfig';

// 创建当前fiber的子fiber
export function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress);
    }
    case HostComponent: {
      return updateHostComponent(current, workInProgress);
    }
    default:
      break;
  }
}

// 更新或者说挂载根节点
// 我们依据什么构建fiber树呢？虚拟DOM
// current 老fiber
// workInProgress 构建中的新fiber
function updateHostRoot(current, workInProgress) {
  const updateQueue = workInProgress.updateQueue;
  //获取我们要渲染的虚拟DOM<div key="title"></div>
  const nextChildren = updateQueue.shared.pending.payload.element;
  // domdiff就在这里开始处理，就是老的儿子和新的儿子进行对比
  // 处理子节点，根据老fiber和新的虚拟DOM进行对比，创建新的fiber树
  reconcileChildren(current, workInProgress, nextChildren);
  //  不管怎么更新，最后都是返回第一个子fiber
  return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {
  // 获取 此原生组件的类型 span key
  const type = workInProgress.type;
  // 新属性
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  // 在react中，如果一个原生组件，它只有一个儿子，并且这个儿子是一个字符串的话，有一个优化
  // 这个优化就是不会对此儿子创建一个fiber节点，而是把它当成一个属性来处理
  let isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  // 处理子节点，根据老fiber和新的虚拟DOM进行对比，创建新的fiber树
  reconcileChildren(current, workInProgress, nextChildren);
  // 返回第一个子fiber
  return workInProgress.child;
}

export function reconcileChildren(current, workInProgress, nextChildren) {
  if (current) {
    // 如果current有值，说明这是一个类似于更新的操作
    // reconcile协调更新的意思
    // 进行比较新老内容，得到差异进行更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  } else {
    // 初次渲染，不需要比较，全新的
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  }
}
