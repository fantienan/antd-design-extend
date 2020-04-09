---
category: Components
type: 扩展
title: Custom.Form
subtitle: 表单
---

基于antd design form组件封装，支持antd From、antd Form.Item的所有api，一下只对区别于antd的api做出说明。

## 何时使用

需要呈现一个表单时使用。

## API

通用属性：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| scope | 输出formInstance | object |  |  |
| cascade | 人工表单级联菜单分组及层级关系[#cascade](#cascade)（表单项有级联菜单 则必须传，不传则没有级联查询效果） | array[] |  |  |

人工表单（开发人员布局的表单）：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| --- | --- | --- | --- | --- |


动态表单（根据后端返回的表单数据动态生成的表单）：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| data | 组件数据，符合组件数据格式 | object[] |  |  |
| data[] | FormItem api | object |  |  |
| originalData | 组件数据，后端返回的数据，需要转换成组件数据格式[#originalData[]](#originalData) | object[] |  |  |
| action | 上传接口地址 | string |  |  |
| getList | select、selectStree、checkBox、radio获取list,必须返回Promise[#getList](#getList) | ({ originalObject, site, name }) => Promise | () => new Promise() |  |
| column | 一行渲染的表单项个数 | number | 2 |  |

## FormInstance api

| 属性 | 说明 | 类型 
| --- | --- | --- |
| setFieldsList | jquery风格设置select、selectStree、checkBox、radio获取list方法 |  |

## FormItem

| 属性 | 说明 | 类型 
| --- | --- | --- |
| name | 字段名，支持数组，与antd Form.Item保持一致 | array |
| type | 表单项类型[#type](#type) | string |
| list | select、selectStree、checkBox、radio的list | object[] |
| maximum | 上传组件最大数量 | string |
| action | 上传接口地址 | string |

#### originalData

```jsx
/**
 * @param {string} S_CONTROLTYPE - 是必须存在的字段
 * @param {string} S_FIELDALIASNAME - label
 * @param {string} S_FIELDNAME - name 字段名称
 * 
 * **/
{
    S_CONTROLTYPE: '{"type":"SELECT","rules":["required","float"],"label":"编码"}',
    S_FIELDALIASNAME: '编码',
    S_FIELDNAME: 'C_ZQCODE_CODE'
}

```

#### cascade

```jsx
// 二维数组 第一维度：级联分组；第二维度：级联层级
const cascade = [["province", "city", "county", "village", "hamlet"]]
```

#### type

```
INPUT - 输入框
INPUT_PASSWORD - 密码
INPUT_NUMBER - 数字调节器
TEXT_AREA - 多行文本框
DATE_PICKER - 日期
RANGE_PICKER - 单选组
CHECKBOX_GROUP - 复选组
SELECT - 下拉框
SELECT_TREE - 下拉树
UPLOAD - 上传
UPLOAD_FILE - 上传文件
```

#### getList 

```jsx
/**
 *  @param {object} originalObject - 接口数据
 *  @param {number} site - 级联层级
 *  @param {string} name - 字段名
 * **/
function getList({ originalObject, site, name } = {}) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({data: []})
        }, 1000)
    })
}
```