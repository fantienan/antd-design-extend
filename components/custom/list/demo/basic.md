---
order: 0
title:
  zh-CN: 虚拟列表
---

## zh-CN

基础列表。

```jsx
import { Custom } from 'antd'

const mock = Array.from(new Array(10000), (_, index) => ({
    label: `Item ${index}`,
    value: index,
    checked:true,
    disabled:true
}));

ReactDOM.render(<Custom.List list={mock} width="100%"/>, mountNode);
```
