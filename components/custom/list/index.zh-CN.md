---
category: Components
type: 扩展
title: Custom.List
subtitle: 虚拟列表
---

通用列表。

## 何时使用

最基础的列表展示，可承载文字、列表、图片、段落，常用于后台数据展示页面。

## API

### List

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| list | 数据 | object[][（`list[]`）](#list[]) | [] |  |
| listHeight | 容器高度 | number | 200 |  |
| listRowHeight | 行高 | number | 30 |  |
| overscanRowCount | 预加载上下容器外部的行数 | number | 10 |  |
| scrollToIndex | 快速定位 | number | -1 |  |
| showScrollingPlaceholder | 是否显示滚动加载中 | bool | false |  |
| useDynamicRowHeight | 动态设置行高 | bool | false |  |
| callback | 回调 | func | () =>{} |  |
| valueKey | value key | string | 'value' |  |
| nameKey | name key | string | 'label' |  |
| needPrefix | 是否需要前缀 | bool | true |  |
| needSuffix | 是否需要后缀 | bool | false |  |
| prefix | 前缀 | func | [`ReactElement`](#prefix) |  |
| suffix | 后缀 | func | [`ReactElement`](#suffix) |  |
| width | 容器宽度 | number | 200 |  |

#### list[]

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| lable | title | string |
| value | 值 | `string|number` |
| checked | 选中状态 | bool |
| disabled | 禁用状态 | bool |

#### prefix

```jsx
function DefaultPrefix(props) {
	return <div className='prefix-box'>
		<Checkbox {...props} />
	</div>
}
```

#### suffix

```jsx
function DefaultSuffix(props) {
	const style = props.checked ? { color: '#1890ff' } : {}
	return <div className="suffix-box" style={style}>
		<Icon type="check" />
	</div>
}
```