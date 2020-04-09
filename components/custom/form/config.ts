// @ts-nocheck
import { Input, InputNumber, DatePicker, Checkbox, Radio } from '../../index';
import { AsyncComponent } from '../AsyncComponent'
import SelectTree from '../select-tree';
import Select from './Select';
import Upload from '../upload';
import UploadFile from '../upload/upload-file';
import { utils } from './utils';

// 类型与组件的映射关系以及format list的方法
export const TYPE_MAP = {
    INPUT: { // 输入框
        component: Input,
    },
    INPUT_PASSWORD: { // 密码
        component: Input.Password
    },
    INPUT_NUMBER: { // 数字调节器
        component: InputNumber
    },
    TEXT_AREA: { // 多行文本框
        component: Input.TextArea,
        display: 'block',
    },
    DATE_PICKER: { // 日期
        component: DatePicker
    },
    RANGE_PICKER: { // 日期范围
        component: DatePicker.RangePicker,
    },
    CHECKBOX_GROUP: { // 复选组
        component: Checkbox.Group,
        format: utils.formatOptions,
        nameKey: 'C_DESCRIBE',
        valueKey: 'I_ID',
        display: 'block', // 独占一行
    },
    RADIO_GROUP: { // 单选组
        component: Radio.Group,
        format: utils.formatOptions,
        nameKey: 'C_DESCRIBE',
        valueKey: 'I_ID',
    },
    SELECT: { // 下拉框
        component: Select,
        format: utils.formatSeletList,
        nameKey: 'C_ZQNAME',
        valueKey: 'I_ID',
    },
    SELECT_TREE: { // 下拉树
        component:  AsyncComponent(() => import("../select-tree")),
        format: utils.formatTreeList,
        nameKey: 'C_ZQNAME',
        valueKey: 'C_ZQCODE',
    },
    UPLOAD: { // 上传
        component: Upload,
        display: 'block', // 独占一行
    },
    UPLOAD_FILE: { // 上传文件
        component: UploadFile
    },
}

// 自定义事件 操作类型
export const EVENT_TYPES_CLEAR = 'clear';
export const EVENT_TYPES_EDIT = 'edit';

// Form.Item props map
export const FORM_ITEM_PROPS = ["colon", "dependencies", "extra", "getValueFromEvent", "hasFeedback", "help", "htmlFor", "noStyle", "label", "labelAlign", "labelCol", "name", "normalize", "required", "rules", "shouldUpdate", "trigger", "validateFirst", "validateStatus", "validateTrigger", "valuePropName", "wrapperCol"]