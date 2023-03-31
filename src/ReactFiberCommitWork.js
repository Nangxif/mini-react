import { appendChild, insertBefore, removeChild } from './ReactDOMHostConfig';
import { HostComponent, HostRoot } from './ReactWorkTags';
import { updateProperties } from './ReactDOMComponent';
import { Placement } from './ReactFiberFlags';

function getParentStateNode(fiber) {
  let parent = fiber.return;
  do {
    if (parent.tag === HostComponent) {
      return parent.stateNode;
    } else if (parent.tag === HostRoot) {
      return parent.stateNode.containerInfo;
    } else {
      // 什么情况下既不是原生也不是根节点呢？比如函数组件和类组件
      parent = parent.return;
    }
  } while (parent);
}

// 插入节点
export function commitPlacement(nextEffect) {
  let stateNode = nextEffect.stateNode;
  // let parentStateNode = nextEffect.return.stateNode.containerInfo;
  let parentStateNode = getParentStateNode(nextEffect);
  let before = getHostSibling(nextEffect);
  if (before) {
    insertBefore(parentStateNode, stateNode, before);
  } else {
    appendChild(parentStateNode, stateNode);
  }
}

// 当前fiber后面一个离他最近的真实DOM节点
function getHostSibling(fiber) {
  let node = fiber.sibling;
  while (node) {
    // 找他的弟弟们，找到最近的一个，不是插入的节点
    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
    node = node.sibling;
  }
  return null;
}

// 提交DOM更新操作
export function commitWork(current, finishedWork) {
  const updatePayload = finishedWork.updateQueue;
  finishedWork.updateQueue = null;
  if (updatePayload) {
    updateProperties(finishedWork.stateNode, updatePayload);
  }
}

export function commitDeletion(fiber) {
  if (!fiber) return;
  let parentStateNode = getParentStateNode(fiber);
  removeChild(parentStateNode, fiber.stateNode);
}
