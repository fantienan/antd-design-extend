---
category: Components
type: 扩展
title: Custom.Tree
subtitle: 树
---

基于react-virtualized开发的虚拟树。

## 何时使用

当要展示大数据量的tree。

## API

通用属性：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| list | 数据源 | object[] |  |  |
| listHeight | 列表高，决定呈现多少行 | number | 200 |  |
| listRowHeight | 列表行高 | number | 30 |  |
| overscanRowCount | 预加载 | number | 10 |  |
| useDynamicRowHeight | 使用动态行高度 | bool | false |  |
| showScrollingPlaceholder | 是否显示正在滚动的状态 | bool | false |  |
| paddingLeft | 梯度，每一层级相差的宽度 | number | 20 |  |
| scrollToIndex | 快速定位 | number |  |  |
| prefix | 前缀 | func |  |  |
| suffix | 后缀 | func |  |  |
| middle | 渲染checkbox | func |  |  |
| callback | 回调 | func |  |  |
| needPrefix | 是否需要前缀 | bool |  |  |
| needSuffix | 是否需要后缀 | bool |  |  |
| needMiddle | 中间展示的内容 | bool |  |  |
| nameKey | name key | string |  |  |
| valueKey | value key | string |  |  |
| diffValue | 计算高度减掉的值 | number |  |  |
| calculateTheHeightWhenResize | 是否需要在window.resize时计算树的高度 | bool |  |  |
| showCheckbox | 是否展示chkecbox | bool |  |  |
| asyncLoadData | 异步加载节点数据 | func |  |  |