---
category: Components
cols: 1
type: 扩展
title: Custom.Table
subtitle: 表格
---

基于antd design table封装，扩展了table拖拽和列伸缩的优化。

## 何时使用

需要呈现一个表格时使用。

## API

通用属性：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| scope | 输出TableInstance api 容器 | object |  |  |
| drag | 列是否可拖动、改变大小 | bool |  |  |
| columns | 表格列描述[`columns`](#columns) | object[] |  |  |
| dataSource | 表格数据源 | object[] |  |  |
| pagination | 分页信息[配置项](/components/pagination) | object |  |  |
| selectionType | 多选/单选 | checkbox，radio | checkbox |  |
| selectedRowKeys | 选中行的key集合 | `string[]|number[]` |  |  |
| scroll | 表格是否可滚动，也可以指定滚动区域的宽、高，[配置项](/components/table/#scroll) | object |  |  |
| getDataSoucre | 翻页时获取数据 必须`return Promise`[`getDataSoucre`](#getDataSoucre) | func |  |  |
| rowSelectionChangeCallback | 行选中回调 | func |  |  |
| tool | 是否显示工具栏 | bool |  |  |
| action | 上传接口地址 | string |  |  |
| getList | 获取select、selectTree、checkbox、radio的list 必须`return Promise` | func |  |  |
| toolCallback | 工具栏的回调 | func |  |  |
| sortCallback | 点击列排序按钮回调 | func |  |  |
| customTool | 自定义工具栏 | func |  |  |

#### columns

| 属性 | 说明 | 类型 | 缺省 |
| --- | --- | --- |
| S_FIELDALIASNAME | 表头title | string | true |
| S_FIELDNAME | 字段名称`dataIndex` | string | true |
| S_GROUP | 字符串 | string `例如：信息:个人信息` |  |
| I_RELATIONINDEX | 级联层级 | number |  |

#### getDataSource

```jsx
const getDataSoucre = argus => new Promise(resolve => {
    const param = {
      data: {
        pageInfo: {
          pageIndex,
          pageSize
        },
        tableName: "FS_YW_BASE_ORG",
        queryFilter: queryFilter || {}
      }
    }
    io.pageSelect.abortAll();
    return await io.pageSelect(param).fetch();
})
```
## TableInstance api 

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| getSelectedRowKeys | 获取选中的keys | func |
| getSelectedRows | 获取选中的rows | func |