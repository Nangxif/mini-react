import { createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';
import { Deletion, Placement, Update } from './ReactFiberFlags';
import {
  commitPlacement,
  commitWork,
  commitDeletion,
} from './ReactFiberCommitWork';

// 当前正在更新的根，基本不变
let workInProgressRoot = null;
// 当前正在更新的fiber节点
let workInProgress = null;
//不管如何更新，不管谁来更新，都会调度到这个方法里面
export function scheduleUpdateOnFiber(fiber) {
  // 为什么会有这一步呢？因为fiber树可能很大，更新可能发生在任一层
  // 所以不管在那一层开始更新，都会网上捣，一直找到根fiber节点
  const fiberRoot = markUpdateLaneFromFiberToRoot(fiber);
  // 在根上执行同步工作
  performSyncWorkOnRoot(fiberRoot);
}

// 根据老的fiber树和更新对象创建新的fiber树，然后根据新的fiber树更新真实DOM
function performSyncWorkOnRoot(fiberRoot) {
  // react和vue不一样，react不论在哪里发生更新，都会从根节点开始调度更新
  // 到了这一步，整个fiber树就初始到一段落了
  // 接下来要开始创建workInProgress
  workInProgressRoot = fiberRoot;
  // 接下去就是双缓存的结构,workInProgressRoot.current指根节点的fiber节点
  workInProgress = createWorkInProgress(workInProgressRoot.current);
  /**
   * 下一步需要
   * 1.根据虚拟DOM创建新的fiber树
   * 2.把新的fiber树的内容同步到真实DOM中
   * */
  // 开启工作循环，自上而下地构建fiber树，构建副作用链
  workLoopSync();
  // 提交，修改DOM
  commitRoot();
}

function commitRoot() {
  // 指向新构建的fiber树的根
  const finishedWork = workInProgressRoot.current.alternate;
  workInProgressRoot.finishedWork = finishedWork;
  commitMutationEffects(workInProgressRoot);
}
function getFlags(flags) {
  switch (flags) {
    case Placement:
      return '插入';
    case Update:
      return '更新';
    case Deletion:
      return '删除';
    default:
      break;
  }
}
function commitMutationEffects(root) {
  const finishedWork = root.finishedWork;
  let nextEffect = finishedWork.firstEffect;
  let effectsList = '';
  while (nextEffect) {
    effectsList += `(${getFlags(nextEffect.flags)}#${nextEffect.type}#${
      nextEffect.key
    })`;
    const flags = nextEffect.flags;
    let current = nextEffect.alternate;
    if (flags === Placement) {
      commitPlacement(nextEffect);
    } else if (flags === Update) {
      commitWork(current, nextEffect);
    } else if (flags === Deletion) {
      commitDeletion(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
  effectsList += 'null';
  console.log(effectsList);
  // 当所有的副作用都执行完之后，workInProgress树就正式变成current树
  root.current = finishedWork;
}

// 开启工作循环，自上而下地构建fiber树
function workLoopSync() {
  while (workInProgress) {
    performUnitOfWork(workInProgress);
  }
}

// 执行单个工作单元
// workInProgress 要处理的fiber
// 有儿子优先处理儿子，没有儿子就处理弟弟，那一个fiber节点什么时候算处理完成呢（completeWork）
// 一个fiber没有子节点，那自己这个fiber就算处理完成了，当一个父fiber的子fiber都完成了，那么这个父fiber也算完成了
function performUnitOfWork(unitOfWork) {
  // 获取当前正在构建的fiber的替身
  // 此时这个unitOfWork算是正在构建的还没渲染到页面的上的fiber树
  const current = unitOfWork.alternate;
  // 开始构建当前fiber的子fiber链表，它会返回下一个要处理的fiber，一般都是unitOfWork的大儿子
  // div#title这个fiber它的返回值是一个null，因此会走下面的else
  let next = beginWork(current, unitOfWork);
  // 在beginWork后，需要把新属性同步到老属性上
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  // 当前的fiber还有子节点
  if (next) {
    // 此时会重新进入workLoopSync循环
    workInProgress = next;
  } else {
    // 如果当前的fiber没有子fiber，那么当前的fiber就算完成了
    completeUnitOfWork(unitOfWork);
  }
}

// 完成一个fiber节点
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    completeWork(current, completedWork);
    // 执行完completeWork这一步，fiber节点上就一定有stateNode了
    // 收集当前fiber的副作用，到fiber上
    collectEffectList(returnFiber, completedWork);
    // 当自己这个fiber完成之后，如何寻找下一个要构建的fiber
    const siblingFiber = completedWork.sibling;
    if (siblingFiber) {
      // 如果有弟弟，就开始构建弟弟，处理弟弟beginWork
      workInProgress = siblingFiber;
      return;
    }
    // 如果没有弟弟了，说明是最后一个儿子了，父亲也就可以完成了
    // 这个循环到最后的时候returnFiber就是null，也就是根fiber的父亲
    completedWork = returnFiber;
    // 没有下面这一步的话就死循环了，不停地修改当前正在处理的fiber，最后workInProgress=null就可以退出workLoopSync了
    workInProgress = completedWork;
  } while (workInProgress);
}

/**
 * 1.为了避免遍历fiber树寻找有副作用的fiber节点，所以有了effectList
 * 2.在fiber树构建过程中，每当一个fiber节点的flags字段不为NoFlags时，代表需要执行副作用，就把该fiber节点添加到effectList中
 * 3.effectList是一个单向链表，firstEffect代表链表中的第一个fiber节点，lastEffect代表链表中的最后一个fiber节点
 * 4.fiber树的构建是深度优先的，也就是向下构建子级fiber节点，子级节点构建完成后，再向上构建父级fiber节点，所以effectList中总是子级fiber节点在前面
 * 5.fiber节点构建完成的操作执行在completeUnitOfWork方法，在这个方法里，不仅会对节点完成构建，也会将有flags的fiber节点添加到effectList
 * */
function collectEffectList(returnFiber, completedWork) {
  // 根fiber没有父亲，直接结束
  if (!returnFiber) return;
  if (!returnFiber.firstEffect) {
    // 如果父亲没有链，那么就让父亲的firstEffect指向completedWork的firstEffect
    returnFiber.firstEffect = completedWork.firstEffect;
  }
  if (completedWork.lastEffect) {
    // 如果completedWork有链表尾
    if (returnFiber.lastEffect) {
      // 并且returnFiber也有链表尾
      // 把completedWork身上的effectList挂载到父亲链表的尾部
      returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
    }
    returnFiber.lastEffect = completedWork.lastEffect;
  }

  const flags = completedWork.flags;
  // 如果此完成的fiber有副作用，那么就需要添加到我们的effectList里
  if (flags) {
    // 如果flags>0说明有副作用
    if (returnFiber.lastEffect) {
      // 如果父fiber有lasetEffect的话，说明父fiber上已经有effect链表了
      returnFiber.lastEffect.nextEffect = completedWork;
    } else {
      returnFiber.firstEffect = completedWork;
    }
    returnFiber.lastEffect = completedWork;
  }
}

function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent) {
    node = parent;
    parent = parent.return;
  }
  // node其实肯定是fiber树的根节点，其实就是hostRootFiber，而且.statNode就是div#root
  return node.stateNode;
}

/**
 * let rootFiber = {key: "rootFiber"};
 * let fiberA = {key: "A", flags: Placement};
 * let fiberB = {key: "B", flags: Placement};
 * let fiberC = {key: "C", flags: Placement};
 * 层级是
 *       rootFiber
 *           A
 *       B       C
 *
 * 最先完成的节点是B，因此returnFiber是A，completedWork是A
 * collectEffectList(fiberA, fiberB);
 * B会把自己的effect给A，因此第一次completeA的firstEffect会指向B，lastEffect也会指向B
 *
 * 下一步是C完成了，因此returnFiber是A，completedWork是C
 * collectEffectList(fiberA, fiberC);
 * C会把自己的effect给A，我们会把C放在B的后面，也就是A的firstEffect指向B，B的nextEffect指向C，A的lastEffect指向C
 *
 * C完成了之后，A就完成了，因此父fiber是rootFiber，完成的fiber是A
 * collectEffectList(rootFiber, fiberA);
 * */

// commit阶段不能中断，因为是要渲染到页面上了
// render阶段可以中断
// effectList是单链表
