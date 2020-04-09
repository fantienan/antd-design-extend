// @ts-nocheck
import * as React from 'react';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Button, message } from '../../../index';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { handleDownload } from '../utils'

/**
 * @param {object} props
 * @param {string} props.name - 发给后台的参数名
 * @param {string} props.action - 接口地址
 * @param {func} props.onChange - 父级回调
 * @param {number} props.maximum - 最多文件数量
 * @param {object} props.fileList - 文件列表
 * **/
function UpLoadFile(props) {
  const {
    name,
    maximum,
    onChange,
    action,
    disabled
  } = props;
  const [fileList, setFileList] = React.useState([]);
  const [, forceUpdate] = React.useState(0);
  const handleChange = ({ fileList, file }) => {
    if (file.status == 'removed') {
      setFileList(_.differenceBy(fileList, [file], 'uid'))
      onChange({ fileList, file, status: file.status });
      return
    }
    const lastIndex = fileList.length - 1;
    if (file.status === 'done') {
      message.success(`${file.name} file uploaded successfully`);
      onChange({ fileList, file, status: file.status })
    } else if (file.status === 'error') {
      message.error(`${file.name} file upload failed.`);
    }
    update(fileList)
  };

  // 上传时更新视图
  const update = fileList => {
    setFileList(fileList);
    forceUpdate(uuidv4);
  }

  React.useEffect(() => {
    const { fileList: newFileList = [] } = props;
    newFileList.length && setFileList(newFileList);
  }, [props.fileList])

  return (
    <Upload
      fileList={fileList}
      action={action}
      name={name}
      showUploadList={{ showDownloadIcon: true }}
      onChange={handleChange}
      onDownload={handleDownload}
    >
      {
        !disabled ? <Button><PlusOutlined /> 上传</Button> : null
      }
    </Upload>
  )
}


UpLoadFile.defaultProps = {
  maximum: 8,
  listType: 'picture-card',
  onChange: () => { },
  name: 'file'
}

UpLoadFile.propTypes = {
  name: PropTypes.string,
  action: PropTypes.string,
  onChange: PropTypes.func,
  maximum: PropTypes.number,
  fileList: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool
}

export default UpLoadFile