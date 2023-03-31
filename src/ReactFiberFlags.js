// 可以给fiber添加一个副作用标识符，表示此fiber对应的DOM节点需要进行何种操作

// 没有动作
export const NoFlags = 0b000000000000000000; //0

// 添加，或者说是创建
export const Placement = 0b000000000000000010; // 2

// 更新
export const Update = 0b000000000000000100; //4

// 移动
export const PlacementAndUpdate = 0b000000000000000110; //6

// 删除
export const Deletion = 0b000000000000001000; //8
