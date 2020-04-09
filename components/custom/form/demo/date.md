---
order: 4
title:
  zh-CN: 日期组件
  en-US: Type
---

## zh-CN

日期组件的使用方法。

```jsx
import { Custom } from 'antd'

const { Form } = Custom
const initialValues = {
  date: '2019-01-01'
}
ReactDOM.render(
  <div>
    <Form initialValues={initialValues}>
      <Form.Item
        name="date"
        type="DATE_PICKER"
        lable="日期"
      />
      <Form.Item
        name="range"
        type="RANGE_PICKER"
        lable="日期范围"
        format=""
      />
    </Form>
  </div>,
  mountNode,
);
```
