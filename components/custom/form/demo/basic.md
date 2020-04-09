---
order: 0
title:
  zh-CN: 基础表单
  en-US: Type
---

## zh-CN

一个基础的表单。

```jsx
import { Custom } from 'antd'

const { Form } = Custom

function Example() {
  const store = {}
  const rules = [{ required: true, message: '请输入姓名!' }]
  return <Form scope={store} >
    <Form.Item name="name" label="姓名" type='INPUT' rules={rules} />
    <Form.Item name="textArea" label="备注" type='TEXT_AREA' />
  </Form>
}

ReactDOM.render(<Example />, mountNode);
```
