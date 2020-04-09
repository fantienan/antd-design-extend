---
order: 2
title:
  zh-CN: 异步加载数据、快速定位
---

## zh-CN

异步加载数据。

```jsx
import { Custom, Button, InputNumber } from 'antd';

const mock = Array.from(new Array(10000), (_, index) => ({
    label: `Item ${index}`,
    value: index
}));
function Example () {
  const [list, setList] = React.useState([])
  const [scrollToIndex, scrollTo] = React.useState(0)
  
  return <div>
    <Button onClick={() => setList(mock)}>加载数据</Button>
    <span>
      scrollToIndex: <InputNumber onChange={scrollTo}/>
    </span>
    <Custom.List list={list} scrollToIndex={scrollToIndex}/>
  </div>
}

ReactDOM.render(<Example />, mountNode);
```
