---
order: 7
title:
  zh-CN: 上传组件
  en-US: Type
---

## zh-CN

上传组件在表单中的使用方法。

```jsx
import { Custom } from 'antd'

const { Form } = Custom

function Example() {
  const store = React.useRef({})
  return <div>
    <Form scope={store.current} >
      <Form.Item
        name="img"
        label="图片"
        type='UPLOAD'
        action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
        maximum={2}
      />
    </Form>
  </div>
}
ReactDOM.render(<Example/>, mountNode);
```
