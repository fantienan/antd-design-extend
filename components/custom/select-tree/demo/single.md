---
order: 1
title:
  zh-CN: 单选下拉树
---

## zh-CN

onChange属性可以获取树的变化。

```jsx
import { Custom } from 'antd'
import io from '../io';

function Example() {
	const store = React.useRef({ list: [] })
	const loadList = () => new Promise(async resolve => {
		const params = {
			data: {
				"tableName": "FL_SYS_ZQSJZD",
				"queryFilter": {
					"whereString": "1=1",
					"addCaptionField": false
				}
			}
		}
		const { data } = await io.getEntityList(params).fetch()
		store.current.list = data
		resolve({ data })
	})
	const onChange = ({selectedList, list}) => {
		console.log(selectedList)
	}

	return <div>
		<Custom.SelectTree onChange={onChange} getList={loadList} list={store.current.list} />
	</div>
}

ReactDOM.render(<Example />, mountNode);
```
