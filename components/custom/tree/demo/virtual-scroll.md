---
order: 0
title: 
  zh-CN: 虚拟滚动
  en-US: Virtual scroll
---

## zh-CN

大数据树组件。

```jsx
import { Custom } from 'antd'

function Example() {
  const createMock = () => {
    let data = []
    Array.from(new Array(1000), (_, i) => {
      const id = i + 1
      let obj = {
        C_ZQNAME: `item-${i}`,
        C_ZQCODE: `item-${i}`,
        I_PARID: 0,
        I_ID: id
      }
      if (i%2) {
        obj = {
          ...obj,
          I_PARID: id - 1
        }
      }
      data.push(obj)
    })
    return data
  } 
  return <div style={{height: 300}}>
    <Custom.Tree
      list={createMock()}
      listHeight={300}
    />
  </div>
}

ReactDOM.render(<Example />, mountNode);
```
