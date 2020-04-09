---
order: 1
title:
  zh-CN: 上传文件组件
---

## zh-CN


```jsx
import { Custom } from 'antd';

function Example() {
	const action = "https://www.mocky.io/v2/5cc8019d300000980a055e76"
	const onChange = ({ fileList, file, status }) => {
        console.log({ fileList, file, status })
    }
    return (
        <div>
            <Custom.UploadFile action={action} onChange={onChange}/>
        </div>
    )
}

ReactDOM.render(<Example />, mountNode);
```
