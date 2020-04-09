---
order: 5
title:
  zh-CN: 单/复选组件
  en-US: Type
---

## zh-CN

单选组、复选组的使用方法。

```jsx
import { Custom, Button } from 'antd'

const { Form } = Custom
const mockCheckList = [
  {
    "I_ID": 100026,
    "C_DESCRIBE": "生物",
    "I_ISEDIT": 1,
    "C_CODE": "6",
    "C_DOMAINNAME": "KM",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 6,
    "I_PARID": 2
  },
  {
    "I_ID": 100025,
    "C_DESCRIBE": "化学",
    "I_ISEDIT": 1,
    "C_CODE": "5",
    "C_DOMAINNAME": "KM",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 5,
    "I_PARID": 2
  },
  {
    "I_ID": 100024,
    "C_DESCRIBE": "物理",
    "I_ISEDIT": 1,
    "C_CODE": "4",
    "C_DOMAINNAME": "KM",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 4,
    "I_PARID": 2
  }
]
const mockRadioList = [
  {
    "I_ID": 100011, // 角色主键
    "C_DESCRIBE": "男",
    "I_ISEDIT": 1,
    "C_CODE": "1",
    "C_DOMAINNAME": "XB",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 1,
    "I_PARID": 1
  },
  {
    "I_ID": 100012,
    "C_DESCRIBE": "女",
    "I_ISEDIT": 1,
    "C_CODE": "2",
    "C_DOMAINNAME": "XB",
    "I_JB": 2,
    "I_ISUSED": 1,
    "I_BH": 2,
    "I_PARID": 1
  }
]
function Example() {
  const store = React.useRef({})
  const setFieldsList = () => {
    store.current.form.setFieldsList({
      sex: mockRadioList
    })
  }
  return <div>
    <Button onClick={setFieldsList}>setFieldsList</Button>
    <Form scope={store.current}>
      <Form.Item
          name="subject"
          label="科目"
          type='CHECKBOX_GROUP'
          list={mockCheckList}
        />
        <Form.Item
          name="sex"
          label="性别"
          type='RADIO_GROUP'
        />
    </Form>
  </div>
}
ReactDOM.render(<Example />, mountNode);
```
