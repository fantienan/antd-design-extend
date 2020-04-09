---
category: Components
type: 扩展
title: Custom.SelectTree
subtitle: 虚拟下拉树
---


## 何时使用

展示大数据量的下拉树时使用。

## API

### List

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| onChange | 监听树状态的变化 | function({selectedList: object\[]\|number\[],list: object\[]}) |  |  |
| getList | 获取list | () => Promise |  |  |
| needMiddle | 是否显示多选按钮 | bool | false |  |

其他属性可参考[Select](/components/select/)、[TreeDl](/components/tree/)