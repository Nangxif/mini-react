/**
 * 初始化更新队列
 * 所有的fiber都会把等待更新的内容放在更新队列中
 * */

export function initializeUpdateQueue(fiber) {
  // 更新队列其实就是一个环状列表
  const updateQueue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = updateQueue;
}

// 我们先写一个方法，叫创建更新，其实就只是返回一个空对象
export function createUpdate() {
  return {};
}

// 向当前的fiber的更新队列中添加一个更新
export function enqueueUpdate(fiber, update) {
  let updateQueue = fiber.updateQueue;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  //  如果pending为null，那么说明没有任何更新
  if (!pending) {
    // 那么自己的next就指向自己
    update.next = update;
  } else {
    // update2的时候就走这里了
    // update2.next = update1.next;
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
}

// 这里只是举个例子，引入更新队列这个概念，跟react没有任何关系
// 这里只是讲更新队列是怎样保存这个数据的
// fiber上等待更新的东西应该放到更新队列里面去，这个更新的队列是一个链表
// 这个只是保存fiber更新的一个数据结构
// let fiber = { baseState: { number: 0 } };
// initializeUpdateQueue(fiber);
// const update1 = createUpdate();
// update1.payload = { number: 1 }; // update1 => {payload: { number: 1 }}
// // 把update1添加到更新队列链表里
// enqueueUpdate(fiber, update1);

// const update2 = createUpdate();
// update2.payload = { number: 2 };
// // 把update1添加到更新队列链表里
// enqueueUpdate(fiber, update2);
