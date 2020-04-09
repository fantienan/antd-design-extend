---
order: 1
title:
  zh-CN: 自定义前后缀
---

## zh-CN

自定义前缀、后缀的列表。

```jsx
import { Custom } from 'antd'
import { ReadOutlined, MoreOutlined } from '@ant-design/icons';

const mock = Array.from(new Array(10000), (_, index) => ({
    label: `Item ${index}`,
    value: index
}));
const style = {
  width: 24,
  textAlign: "center"
}
function Example () {
  const prefix = argus => {
    return <div style={style}>
      <ReadOutlined />
    </div>
  }
  const suffix = argus => {
    return <div style={style}>
      <MoreOutlined />
    </div>
  }
  return (
    <Custom.List
      list={mock} 
      needSuffix
      prefix={prefix}
      suffix={suffix}
    />
  )
}

ReactDOM.render(<Example />, mountNode);
```
