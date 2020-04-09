// @ts-nocheck
export function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export const handleDownload = async file => {
    // 下载图片
    if (file.type.includes('image/')) {
      if (!file.url && !file.preview) {
        file.url = await getBase64(file.originFileObj);
      }
      const { url, type = 'image/png', name } = file;
      const image = new Image();
      // 解决跨域 Canvas 污染问题
      image.setAttribute('crossOrigin', 'anonymous');
      image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);
        const url = canvas.toDataURL(type); // 得到图片的base64编码数据
        const a = document.createElement('a'); // 生成一个a元素
        const event = new MouseEvent('click'); // 创建一个单击事件
        a.download = name; // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
      };
      image.src = url;
    } else if (file.type.includes('video/')) {
      const { url, preview, name } = file;
      // 这是传统的下载方式
      const a = document.createElement('a');
      const event = new MouseEvent('click'); // 创建一个单击事件
      a.href = url || preview;
      a.download = name;
      a.dispatchEvent(event); // 触发a的单击事件
    }
  }