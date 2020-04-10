// @ts-nocheck
import * as React from 'react';
import { Upload, message } from '../../index';
import { PlusOutlined } from '@ant-design/icons';
import Viewer from 'viewerjs-extend';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { stringify } from '../utils/tools';
import { handleDownload } from './utils';
import 'viewerjs-extend/dist/viewer.css';
import './style/index.less';

const VIEWER_CONTAINER_CLS = "rc-viewer-extend-container";
const VIEWER_ITEM_CLS = "rc-viewer-item";
const IS_IMAGE_REGEXP = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/;
const VIEWER_CONTAINER_SELECTOR = '.ant-upload-list.ant-upload-list-picture-card';
const THUMBNAIL_SELECTOR = '.ant-upload-list-item-thumbnail .anticon.anticon-file';
const windowURL = window.URL || window.webkitURL;
let targetItemVideo = null;

/**
 * @param {object} props
 * @param {string} props.action - 接口地址
 * @param {object} props.fileList - 文件列表
 * @param {number} props.maximum - 最多文件数量
 * @param {string} props.listType - 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card
 * @param {func} props.onChange - 父级回调
 * @param {string} props.name - 发到后台的文件参数名
 * **/

function EnhancedUpload(props) {
  const {
    action,
    maximum,
    listType,
    onChange,
    name,
    disabled
  } = props;

  const [fileList, setFileList] = React.useState([]);
  const [, forceUpdate] = React.useState(0);

  const handlePreview = async file => {
    const container = document.querySelector(VIEWER_CONTAINER_SELECTOR);
    var viewer = new Viewer(container, {
      movable: false,
      customHandle: ({ data }) => {
        if (targetItemVideo) {
          targetItemVideo.style = data.cssText;
        }
      },
      hidden: () => {
        viewer.destroy();
        targetItemVideo = null;
      },
      viewed: (argus) => {
        const alt = argus.detail.originalImage.alt || "";
        if (!IS_IMAGE_REGEXP.test(alt)) {
          const { image, index } = argus.detail
          const parentNode = image.parentElement;
          const video = document.createElement('video');
          video.src = fileList[index].preview || fileList[index].url;
          video.controls = 'controls';
          video.style = image.style.cssText;
          video.className += " viewer-move viewer-transition";
          targetItemVideo = video;
          parentNode.appendChild(video)
        } else {
          targetItemVideo = null;
        }
      }
    });
    viewer.show();
  };

  const handleChange = async ({ fileList, event, file }) => {

    if (file.status == 'removed') {
      setFileList(_.differenceBy(fileList, [file], 'uid'))
      onChange({ fileList, file, status: file.status });
      return
    }
    const lastIndex = fileList.length - 1;
    delete fileList[lastIndex].response;
    delete fileList[lastIndex].xhr;
    if (file.status == 'done') {
      // 现在只支持video的自定义缩略图
      // 带扩展为支持其他类型文件的缩略图
      if (file.type.includes('video/')) {
        // 生成视频缩略图
        await videoThumbnail(fileList, file);
        // 升级到4.0后 thumbUrl 视频缩略图不显示
        // 暂时这样解决
        createThumbnail(fileList, file)
      }
      onChange({ fileList, file, status: file.status })
      message.success(`${file.name} file uploaded successfully`);
    } else if (file.status === 'error') {
      message.error(`${file.name} file upload failed.`);
    }
    update(fileList)
  };

  const createThumbnail = (fileList, file) => {
    setTimeout(() => {
      const actionFile = document.querySelectorAll(THUMBNAIL_SELECTOR);
      if (actionFile.length) {
        for (let i = 0; i < actionFile.length; i++) {
          const parent = actionFile[i].parentElement;
          const href = parent.getAttribute('href');
          const alt = parent.nextSibling.getAttribute('title')
          const { video } = file
          actionFile[i].remove();
          parent.appendChild(video)
        }
      }
    }, 32)
  }

  // 上传时更新视图
  const update = fileList => {
    setFileList(fileList);
    forceUpdate(uuidv4);
  }

  const videoTransImg = video => new Promise(resolve => {
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL('image/png')
      resolve(src)
    }, 300)
  })

  // 视频截图
  function videoThumbnail(fileList, file) {
    const videoURL = windowURL.createObjectURL(file.originFileObj);
    const video = document.createElement('video');
    video.src = videoURL;
    fileList.forEach(v => {
      if (v.uid === file.uid) {
        v.thumbUrl = "_";
        v.preview = videoURL;
      }
    });
    // 升级到4.0后 thumbUrl 视频缩略图不显示
    // 暂时这样解决
    setTimeout(async () => {
      const actionFile = document.querySelectorAll(THUMBNAIL_SELECTOR);
      if (actionFile.length) {
        for (let i = 0; i < actionFile.length; i++) {
          const parent = actionFile[i].parentElement;
          const alt = parent.nextSibling.getAttribute('title')
          const img = document.createElement('img');
          actionFile[i].remove();
          parent.appendChild(video)
          img.src = await videoTransImg(video);
          img.className = 'ant-upload-list-item-image';
          img.alt = alt;
          video.remove();
          parent.appendChild(img)
        }
      }
    }, 17)
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  React.useEffect(() => {
    const { fileList: newFileList = [] } = props;
    newFileList.length && setFileList(newFileList)
  }, [props.fileList])

  return (
    <Upload
      className="custom-upload"
      name={name}
      action={action}
      listType={listType}
      fileList={fileList}
      showUploadList={{ showDownloadIcon: true }}
      onPreview={handlePreview}
      onChange={handleChange}
      onDownload={handleDownload}
    >
      {fileList.length >= maximum || disabled ? null : uploadButton}
    </Upload>
  );
}

EnhancedUpload.defaultProps = {
  maximum: 8,
  listType: 'picture-card',
  onChange: () => { },
  name: 'file'
}

EnhancedUpload.propTypes = {
  action: PropTypes.string,
  fileList: PropTypes.arrayOf(PropTypes.object),
  maximum: PropTypes.number,
  listType: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
}

export default EnhancedUpload