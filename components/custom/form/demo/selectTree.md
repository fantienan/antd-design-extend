---
order: 2
title:
  zh-CN: 下拉树组件
  en-US: Type
---

## zh-CN

下拉树组件异步获取数据及同步获取数据的使用方法。

```jsx
import { Custom } from 'antd'

const { Form } = Custom

const mockTreeList = [
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

function Example() {
	const store = React.useRef({})
	// 二维数组 第一维度：级联分组；第二维度：级联层级
	const cascade = [["province", "city", "county", "village", "hamlet"]]
	const initialValues = {
		name: '小明'
	}
	const onValuesChange = (changedValues, allValues) => {
		// ...
	}
	const getList = ({ originalObject, site, name } = {}) => new Promise(resolve => {
		setTimeout(() =>{
			store.current.treeList = mockTreeList
			resolve({data: mockTreeList})
		}, 1000)
	})
	return <div>
		<Form
			scope={store.current}
			onValuesChange={onValuesChange}
			initialValues={initialValues}
			cascade={cascade} // 表单项有级联菜单 则必须传，不传则没有级联查询效果
			getList={getList}
		>
			<Form.Item
				name="admin"
				label="政区"
				type='SELECT_TREE'
			/>
			<Form.Item
				name="area"
				label="地区"
				type='SELECT_TREE'
				list={mockTreeList}
			/>
		</Form>
	</div>
}

ReactDOM.render(<Example />,mountNode,);
```
