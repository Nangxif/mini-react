import { HostComponent } from './ReactWorkTags';
import {
  appendChild,
  createInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from './ReactDOMHostConfig';
import { Update } from './ReactFiberFlags';

export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent:
      // 在新的fiber构建完成的时候，收集更新并且标识更新副作用
      if (current && workInProgress.stateNode) {
        updateHostComponent(
          current,
          workInProgress,
          workInProgress.tag,
          newProps
        );
      } else {
        // 创建真实的DOM节点
        const type = workInProgress.type; // div p span
        //   const instance = document.createElement(type);
        // 不能这么写，因为react是跨平台的
        //   beginWork只是画图纸，还没创建真实DOM，但是completeWork就是创建真实DOM
        const instance = createInstance(type, newProps);
        appendAllChildren(instance, workInProgress);
        // 让此fiber的真实DOM属性指向instance
        workInProgress.stateNode = instance;
        // 给真实DOM添加属性 包括如果独生子是字符串或数字的情况
        finalizeInitialChildren(instance, type, newProps);
      }

      break;
    default:
      break;
  }
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node) {
    if (node.tag === HostComponent) {
      // 把大儿子的真实DOM节点添加到父真实DOM上
      appendChild(parent, node.stateNode);
    }
    node = node.sibling;
  }
}

function updateHostComponent(current, workInProgress, tag, newProps) {
  //  老fiber上的老属性
  let oldProps = current.memoizedProps;
  // 可复用的真实的DOM节点
  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(instance, tag, oldProps, newProps);
  /**
   * 虽然都是更新队列，但是根fiber和原生组件fiber里面放的东西不太一样
   * 根fiber rootFiber updateQueue上面是一个环状链表 update {payload:element}
   * 原生组件fiber HostComponent updateQueue = updatePayload 是一个数组
   * */
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    workInProgress.flags |= Update;
  }
}
