// @ts-nocheck
import * as React from 'react';
import { Button, Modal, Checkbox } from '../../../index';
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Form from '../../form';
import useMemoHoc from '../../useMemoHoc';
import Dropdown from './Dropdown'
import './toolBar.less';


/**
 * @param {object} props
 * @param {object} props.action - 上传接口地址
 * @param {object} props.scope - form instance func
 * @param {object[]} props.selectedRows - 选中的
 * @param {func} props.getList - 获取下拉数据 return Promise
 * @param {string} props.cancelCls - 取消拖拽句柄
 * @param {func} props.callback -
 * @param {func} props.customTool - 自定义工具栏
 * 
 * **/
function TableToolBar(props = {}) {
  const { action, scope, columns, originalColumns, getList, selectedRows, cancelCls, callback, customTool: CustomTool } = props;
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState([]);
  const store = React.useRef({})
  const { type } = store.current  // 'add', 'edit', 'remove', 'detail'
  const [modal, contextHolder] = Modal.useModal();

  const asyncGetList = () => {
    // 需要获取下拉list的
    data.filter(v => v.type == 'SELECT').map(async v => {
      try {
        const res = await getList(v)
        scope.form.setFieldsList({
          [v.name]: res.data
        })
      } catch (e) {
        console.log(e)
      }
    });
  };

  const disableOper = () => {
    setData(data.map(v => {
      v.disabled = store.current.type == 'detail';
      return v
    }))
  }

  const add = () => {
    store.current.type = 'add'
    disableOper();
    setVisible(true);
    asyncGetList();
  };

  const edit = () => {
    store.current.type = 'edit'
    disableOper();
    setVisible(true);
    asyncGetList();
  };

  const remove = () => {
    store.current.type = 'remove'
    modal.warning({
      title: '你确定要删除它吗！',
      maskClosable: true,
      onOk: handleRemoveOk
    })
  };

  const handleRemoveOk = () => {
    callback({
      type: store.current.type,
      data: {
        selectedRowKeys: scope.table.getSelectedRowKeys(),
        selectedRows: scope.table.getSelectedRows()
      }
    })
  };

  const detail = () => {
    store.current.type = 'detail'
    disableOper();
    setVisible(true);
  };

  const handleOk = () => {
    scope.form.validateFields().then(res => {
      // 校验成功
      setVisible(false);
      callback({ type, data: scope.form.getFieldsValue() })
    }).catch(errorInfo => {
      // 校验失败
    });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const getFooter = () => {
    if (type == 'detail') {
      return [<Button key="back" onClick={handleCancel}>关闭</Button>]
    }
    return [
      <Button key="back" onClick={handleCancel}>取消</Button>,
      <Button key="submit" type="primary" onClick={handleOk}>保存</Button>
    ]
  }

  const getInitialValues = () => type == 'edit' || type == 'detail' ? selectedRows[0] : undefined;

  const exportData = () => {
    const a = document.createElement('a'); 
    a.setAttribute('download', '');// download属性
    a.setAttribute('href', '');// href链接
    a.click()
  }


  return (
    <div className={`table-tool-bar ${cancelCls}`}>
      <Dropdown
        columns={columns}
        showHidden={props.showHidden}
        askFor={props.askFor}
      >
        <Button>显示隐藏列</Button>
      </Dropdown>
      <Button onClick={add}>新增</Button>
      <Button disabled={selectedRows.length != 1} onClick={edit}>修改</Button>
      <Button disabled={selectedRows.length == 0} onClick={remove}>删除</Button>
      <Button disabled={selectedRows.length != 1} onClick={detail}>查看</Button>
      <CustomTool />
      <Modal
        visible={visible}
        title="新增"
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        width="700px"
        wrapClassName="tool-bar-modal"
        footer={getFooter()}
      >
        <Form
          scope={scope}
          className="table-tool-form"
          originalData={props.originalColumns}
          column={2}
          action={action}
          initialValues={getInitialValues()}
        />
      </Modal>
      {contextHolder}
    </div>
  )
}

TableToolBar.defaultProps = {
  scope: {},
  getList: () => new Promise(),
  callback: () => { },
  customTool: () => null,
  selectedRows: []
};

TableToolBar.propTypes = {
  scope: PropTypes.object,
  getList: PropTypes.func,
  callback: PropTypes.func,
  customTool: PropTypes.func,
  selectedRows: PropTypes.arrayOf(PropTypes.object)
};

export default useMemoHoc(TableToolBar);