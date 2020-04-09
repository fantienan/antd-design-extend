## 基于ant-design扩展组件
ant-design 的二次封装组件库，扩展功能与ant-design无感知引用

#### 安装
```
npm install --save antd-design-extend
```
或者
```
yarn add antd-design-extend
```

#### 用法
```jsx
import React from 'react'
import ReactDOM from  'react-dom'
import { Custom } from 'antd-design-extend'

const { Form } = Custom

function Example() {
  const store = React.useRef({})
  const rules = [{ required: true, message: '请输入姓名!' }]
  return <Form scope={store.current} >
    <Form.Item name="name" label="姓名" type='INPUT' rules={rules} />
    <Form.Item name="textArea" label="备注" type='TEXT_AREA' />
  </Form>
}

ReactDOM.render(<Example />, mountNode);

```
