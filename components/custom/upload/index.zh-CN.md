---
category: Components
type: 扩展
title: Custom.Upload
subtitle: 上传组件
---


## 何时使用

上传文件时。

## API

### List

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| name | 发到后台的文件参数名 | string |  |  |
| action | 接口地址 | string |  |  |
| fileList | 文件列表 | object |  |  |
| maximum | 最多文件数量 | number |  |  |
| listType | 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card | string |  |  |
| onChange | 上传回调 | function([param](#param)) |  |  |

#### param

参数详情可参考[upload](/components/upload/)