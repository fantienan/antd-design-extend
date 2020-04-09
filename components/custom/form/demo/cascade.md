---
order: 6
title:
  zh-CN: 级联菜单组件
  en-US: Type
---

## zh-CN

级联菜单在代在表单中的使用方法。

```jsx
import { Custom } from 'antd'
import schema from 'async-validator-extend'
import io from '../io'

const { Form } = Custom

function Example() {
  const store = React.useRef({})
  const group = ["SHENG", "SHI", "XIAN", "XAING"]
  // 二维数组 第一维度：级联分组；第二维度：级联层级;
  // cascade[] - 对应Form.Item的name属性
  const cascade = [group]
  const rules = schema.custom.rules.required()
  const createCascadeParam = site => ({
    data: {
      "tableName":"FL_SYS_ZQSJZD",
      "queryFilter":{
        "whereString":`I_JB=${site}`,
      }
    }
  })
  function getList({ originalObject, site, name } = {}) {
    const param = createCascadeParam(site)
    return io.getEntityList(param).fetch()
  }
  return <div>
    <Form 
      scope={store.current} 
      cascade={cascade} // 表单项有级联菜单 则必须传，不传则没有级联查询效果  
      getList={getList}
    >
      <Form.Item
        name={group[0]}
        label="省"
        type='SELECT'
        rules={rules}
      />
      <Form.Item
        name={group[1]}
        label="市"
        type='SELECT'
        rules={rules}
      />
      <Form.Item
        name={group[2]}
        label="县"
        type='SELECT'
        rules={rules}
      />
      <Form.Item
        name={group[3]}
        label="乡"
        type='SELECT'
        rules={rules}
      />
    </Form>
  </div>
}
ReactDOM.render(<Example/>, mountNode);
```
