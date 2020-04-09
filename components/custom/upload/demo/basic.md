---
order: 0
title:
  zh-CN: 上传组件
---

## zh-CN

支持图片、视频预览，并支持缩放、幻灯片、旋转的预览效果。

```jsx
import { Custom } from 'antd';

function Example() {
	const action = "https://www.mocky.io/v2/5cc8019d300000980a055e76"
	const onChange = ({ fileList, file, status }) => {
        console.log({ fileList, file, status })
    }
    return (
        <div>
            <Custom.Upload action={action} onChange={onChange}/>
        </div>
    )
}

ReactDOM.render(<Example />, mountNode);
```
