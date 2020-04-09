---
order: 1
title:
  zh-CN: 人工表单
  en-US: Type
---

## zh-CN

支持开发人员自定义布局的表单。

```jsx
import { Custom } from 'antd'
import schema from 'async-validator-extend'

const { Form } = Custom

ReactDOM.render(
  <div>
    <Form className="fixed-form">
		<table>
			<tbody>
				<tr >
					<td className="title">姓名</td>
					<td>
						<Form.Item
							name="name"
							type='INPUT'
						/>
					</td>
				</tr>
				<tr>
					<td className="title">密码</td>
					<td>
						<Form.Item
							name="pwd"
							type='INPUT_PASSWORD'
						/>
					</td>
				</tr>
				<tr>
					<td className="title">年龄</td>
					<td>
						<Form.Item
							name="age"
							type='INPUT_NUMBER'
							min={0}
							max={10}
							value={1}
						/>
					</td>
				</tr>
				<tr>
					<td className="title">邮箱</td>
					<td>
						<Form.Item
							name="email"
							rules={schema.custom.rules.email()}
							type='INPUT'
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</Form>
  </div>,
  mountNode,
);
```
