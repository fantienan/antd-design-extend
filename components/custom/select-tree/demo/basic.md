---
order: 0
title:
  zh-CN: 多选下拉树
---

## zh-CN

需要注意的是list必须要传，并且改变它不能有副作用，这样才能保证数据流的闭环。

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

	return <div>
		<Custom.SelectTree getList={loadList} needMiddle list={store.current.list} />
	</div>
}

ReactDOM.render(<Example />, mountNode);
```
