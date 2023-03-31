/* eslint-disable react-hooks/rules-of-hooks */
// 函数名的意思是协调子节点

import { REACT_ELEMENT_TYPE } from './ReactSymbols';
import { createFiberFromElement, createWorkInProgress } from './ReactFiber';
import { Deletion, Placement } from './ReactFiberFlags';

// DOM diff的三个原则
// 只对同级元素进行比较，不同层级不对比
// 不同的类型对应不同的元素
// 可以通过key来标识同一个元素

// 多节点diff有三轮遍历
// 第一轮
// 如果key不同则直接结束本轮循环
// newChildren或oldFiber遍历完，结束本轮循环
// key相同而type不同，标记老的oldFiber为删除，继续循环
// key相同type也相同，则可以直接复用老oldFiber节点，继续循环

// 第二轮
// newChildren遍历完而oldFiber还有，遍历剩下所有的oldFiber标记为删除，diff结束
// oldFiber遍历完了。而newChildren还有，将剩下的newChildren标记为删除，diff结束
// newChildren和oldFiber都同时遍历完成，diff结束
// newChildren和oldFiber都没有完成，则进行节点移动的逻辑

// 第三轮
// 处理节点移动的情况

// shouldTrackSideEffects是否需要跟踪副作用
function childReconciler(shouldTrackSideEffects) {
  // 因为老的子fiber在新的虚拟DOM树不存在了，则标记为删除
  function deleteChild(returnFiber, childToDelete) {
    // 如果不需要跟踪副作用，即初次渲染，则直接返回
    if (!shouldTrackSideEffects) {
      return;
    }
    // 把自己这个副作用添加到父effectList中
    // 删除类型的副作用一般放在父fiber副作用链表的前面，在进行DOM操作的时候先执行删除操作
    const lastEffect = returnFiber.lastEffect;
    if (lastEffect) {
      lastEffect.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      // 父fiber节点effectList是空
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    // 清空下一个副作用指向
    childToDelete.nextEffect = null;
    // 标记为删除
    childToDelete.flags = Deletion;
  }
  function deleteRemainingChildren(returnFiber, childToDelete) {
    while (childToDelete) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  function useFiber(oldFiber, pendingProps) {
    let clone = createWorkInProgress(oldFiber, pendingProps);
    // clone.index = 0;// 此fiber挂载的索引清空，这个我们现在还没用到
    clone.sibling = null; // 清空弟弟
    return clone;
  }
  /**
   * 协调单节点
   * returnFiber 新的父fiber
   * currentFirstChild 第一个旧fiber
   * element 新的要渲染的虚拟DOM是一个原生DOM节点
   * */
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // 获取新的虚拟DOM的key
    let key = element.key;
    // 获取第一个老的fiber节点
    let child = currentFirstChild;
    while (child) {
      // 老fiber的key和新的虚拟DOM的可以相同
      if (child.key === key) {
        // 老的fiber的type和新的虚拟DOM的type是否相同
        if (child.type === element.type) {
          // 准备复用child老fiber节点，删除剩下的其他fiber
          deleteRemainingChildren(returnFiber, child.sibling);
          // 下面这一步是复用，在复用老fiber的时候，会传递新的虚拟DOM属性对象到新fiber的pendingProps上
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // 已经匹配上key了，但是type不同，则删除包括当前的老fiber在内的所有的后续的老fiber
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        // 如果不相同说明当前这个老fiber不是对应于新的虚拟DOM节点
        // 把此老fiber标记为删除，并且继续匹配弟弟
        deleteChild(returnFiber, child);
      }
      // 继续匹配弟弟们
      child = child.sibling;
    }
    // 根据虚拟DOM创建fiber，这一步也是跟上面的deleteRemainingChildren是衔接的
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }
  function placeSingleChild(newFiber) {
    // 如果当前需要跟踪副作用，并且当前这个新的fiber它的替身不存在
    // 有老fiber的时候shouldTrackSideEffects就是true，没有的时候就是false
    if (shouldTrackSideEffects && !newFiber.alternate) {
      // 给这个新fiber添加一个副作用，表示在未来提交阶段的DOM操作中会向真实DOM树中添加此节点
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild) {
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    return created;
  }
  function updateElement(returnFiber, oldFiber, newChild) {
    if (oldFiber) {
      if (oldFiber.type === newChild.type) {
        const existing = useFiber(oldFiber, newChild.props);
        existing.return = returnFiber;

        return existing;
      }
    }
    // 如果没有老fiber，那么就创建
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;

    return created;
  }
  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber ? oldFiber.key : null;
    // 如果新的虚拟DOM的key和老fiber的key一样
    if (newChild.key === key) {
      // key都一样说明是同一个元素
      return updateElement(returnFiber, oldFiber, newChild);
    } else {
      // 如果key不一样，直接返回null
      return null;
    }
  }

  function placeChild(newFiber, newIdx) {
    newFiber.index = newIdx;
    if (!shouldTrackSideEffects) {
      return;
    }
    const current = newFiber.alternate;
    // 如果有current说明是更新，是复用老节点的更新，不会添加Placement
    if (current) {
      // TODO
    } else {
      newFiber.flags = Placement;
    }
  }
  // 如果新的虚拟DOM是一个数组的话，也就是说有多个儿子的话
  // returnFiber ul
  // currentFirstChild null
  // newChild [liA,liB,liC]
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    // 将要返回的第一个新fiber
    let resultingFirstChild = null;
    // 上一个新fiber
    let previousNewFiber = null;
    // 第一个老fiber
    let oldFiber = currentFirstChild;
    // 下一个老fiber
    let nextOldFiber = null;
    // 新的虚拟DOM的索引
    let newIdx = 0;
    // 处理更新的情况，老fiber和新fiber都存在，就是需要更新
    for (; oldFiber && newIdx < newChildren.length; newIdx++) {
      // 先缓存下一个老fiber
      nextOldFiber = oldFiber.sibling;
      // 试图复用老fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
      // 如果key不一样，直接跳出第一轮循环
      if (!newFiber) {
        break;
      }
      // 老的fiber存在，但是新的fiber并没有复用老fiber
      if (oldFiber && !newFiber.alternate) {
        deleteChild(returnFiber, oldFiber);
      }
      // 核心是给当前的newFiber添加一个副作用flags
      placeChild(newFiber, newIdx);
      if (!previousNewFiber) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }
    // 如果没有老fiber，就循环虚拟DOM数组，为每个虚拟DOM创建新的fiber
    if (!oldFiber) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]); // liA
        placeChild(newFiber, newIdx);
        if (!previousNewFiber) {
          resultingFirstChild = newFiber; //resultingFirstChild=>liA
        } else {
          previousNewFiber.sibling = newFiber; //liA.sibling => liB
        }
        previousNewFiber = newFiber; //previousNewFiber=>liA,第二次循环previousNewFiber=>liB
      }
      // return resultingFirstChild;
    }
    return resultingFirstChild;
  }
  // returnFiber 新的父fiber
  // currentFirstChild 老的第一个子fiber
  // newChild 新的虚拟dom
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    // 判断newChild是不是一个对象，如果是的话，说明新的虚拟DOM只有一个React元素节点
    const isObject = typeof newChild === 'object' && newChild;
    // 如果是对象的话，说明虚拟DOM是单节点
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
        default:
          break;
      }
    }
    // 处理子节点为多节点
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
