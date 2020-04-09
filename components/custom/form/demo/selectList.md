---
order: 3
title:
  zh-CN: 下拉组件
  en-US: Type
---

## zh-CN

下拉组件异步获取数据及同步获取数据的使用方法。

```jsx
import { Custom } from 'antd'

const { Form } = Custom
const mockSelectList = [
  {
    "C_ZQNAME": "北京朝阳园林绿化局",
    "I_ID": 1,
    "I_ZQJB": 1,
    "I_ISEDIT": 1,
    "C_ZQCODE": "010000",
    "I_JB": 1,
    "I_ISUSED": 1,
    "I_BH": 1,
    "I_PARID": 0
  },
  {
    "C_ZQNAME": "北京锐观察信息咨询有限公司",
    "I_ID": 2,
    "I_ZQJB": 1,
    "I_ISEDIT": 1,
    "C_ZQCODE": "020000",
    "I_JB": 1,
    "I_ISUSED": 1,
    "I_BH": 2,
    "I_PARID": 0
  },
  {
    "C_ZQNAME": "一队",
    "I_ID": 3,
    "I_ZQJB": 2,
    "I_ISEDIT": 1,
    "C_ZQCODE": "010100",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 3,
    "I_PARID": 1
  }
]
const getList = ({ originalObject, site, name } = {}) => new Promise(resolve => {
  setTimeout(() =>{
    resolve({data: mockSelectList})
  }, 1000)
})
ReactDOM.render(
  <div>
    <Form getList={getList}>
      <Form.Item 
        name="code" 
        label="编号" 
        type='SELECT' 
        list={mockSelectList}
      />
      <Form.Item 
        name="number" 
        label="编号" 
        type='SELECT'
      />
    </Form>
  </div>,
  mountNode,
);
```
