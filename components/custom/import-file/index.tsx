// @ts-nocheck
import React, { useState } from 'react'
import { Modal, Button } from '../../index'
import UpLoadFile from '../upload/upload-file'
/**
 * @param {object} props -
 * @param {string} props.action - 上传接口地址
 * @param {string} props.name - 上传参数名
 * **/
export default function ImportData(props) {
    const [visible, setVisible] = useState(false)
    const importData = () => {
        setVisible(true)
    }
    const handleOk = () => { 
        setVisible(false)
    }
    const handleCancel = () => { 
        setVisible(false)
    }
    return (
        <>
            <Button onClick={importData}>导入</Button>
            <Modal
                visible={visible}
                title="导入excel"
                onOk={handleOk}
                onCancel={handleCancel}
                destroyOnClose
                wrapClassName="import-data-modal"
                footer={null}
            >
                <UpLoadFile action={props.action} name={props.name}/>
            </Modal>
        </>
    )
}
