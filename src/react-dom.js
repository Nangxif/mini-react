import { createFiberRoot } from './ReactFiberRoot';
import { updateContainer } from './ReactFiberReconciler';

function render(element, container) {
  let fiberRoot = container._reactRootContainer;
  if (!fiberRoot) {
    // 第一次container上面肯定没有_reactRootContainer属性
    fiberRoot = container._reactRootContainer = createFiberRoot(container);
  }
  // 更新根容器
  updateContainer(element, fiberRoot);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
