// @ts-nocheck
import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef, useReducer } from 'react';
import { Form, Tooltip } from '../../index';
import PropTypes from 'prop-types';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { TYPE_MAP, FORM_ITEM_PROPS, EVENT_TYPES_CLEAR, EVENT_TYPES_EDIT } from './config';
import Empty from './Empty';
import { utils } from './utils';
import { MODES } from '../utils';
import { isString, isArray, isFunction, isUndefined, isNull } from '../utils/tools'
import './styles/formItemStyles.less';

/**
 * @param {object} props
 * @param {string} props.className - class name
 * @param {string|array} props.name - 字段名，支持数组，不能重复
 * @param {object|[]} props.rules - 校验规则
 * @param {string} props.type - 表单项组件类型
 * @param {object[]} props.list - 数据
 * @param {string} props.mode - 设置 Select 的模式为多选或标签	multiple | tags
 * @param {string} props.maximum - 上传组件最大数量
 * @param {string} props.listType - 上传列表的内建样式
 * @param {object} props.emitter - 广播事件，一般只有级联菜单用
 * @param {object} props.site - 级联菜单优先级
 * @param {object} props.isLast - 级联菜单是否是最后一个
 * @param {object} props.group - 级联分组
 * @param {object} props.cascades - 这一组的所有级联菜单
 * @param {object} props.getList - 级联菜单优获取list
 * @param {object} props.action - 接口地址
 * @param {object} props.originalObject - 接口数据
 * **/
function FormItem(props = {}, ref) {
    const propTypes = {
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        className: PropTypes.string,
        rules: PropTypes.arrayOf(PropTypes.object),
        type: PropTypes.string.isRequired,
        mode: PropTypes.oneOf(MODES),
        maximum: PropTypes.number,
        listType: PropTypes.string,
        emitter: PropTypes.object,
        getList: PropTypes.func,
        action: PropTypes.string,
        originalObject: PropTypes.object,
    }
    // 级联菜单
    if (props.site/*  && props.site > 1 */) {
        propTypes.getList = PropTypes.func.isRequired
    }
    PropTypes.checkPropTypes(propTypes, props, 'prop', 'Form');
    const {
        form,
        list,
        mode,
        type,
        onChangeCallback = () => { },
        emitter,
        site,
        isLast,
        group,
        cascades,
        getList = () => { },
        action,
        originalObject,
        ...otherProps
    } = props;
    const [formItemConfig, cmpConfig] = analyze();
    const { format, component: Cmp = Empty } = TYPE_MAP[type];
    const [data, setData] = useState(isFunction(format) && list && format({ data: list }));
    const [, forceUpdate] = useState(0);
    // 获取FormItem 和 Cmp 属性
    function analyze() {
        const { className = '' } = props;
        const c_1 = {
            hasFeedback: !!(props.rules || []).length,
            className: `${className} ${type}`,
            colon: false
        };
        const c_2 = {
            allowClear: true,
        };
        Object.keys(otherProps).forEach(key => {
            FORM_ITEM_PROPS.indexOf(key) > -1 ?
                (c_1[key] = otherProps[key]) :
                (c_2[key] = otherProps[key]);
        })
        return [c_1, c_2]
    }

    const changeHandle = (argus, value, onChange) => {
        let v = argus == -1 ? undefined : argus;
        if (type == 'SELECT_TREE') {
            v = argus.selectedList.map(v => v.value)
            setData(argus.list)
        }
        if (type == 'UPLOAD' || type == 'UPLOAD_FILE') {
            v = argus.fileList
        }
        // 级联菜单 最后一个不派发广播事件
        if (type == 'SELECT' && site && emitter && !isLast) {
            dispatchEvent(isArray(v) ? v : isUndefined(v) || isNull(v) ? [] : [v])
        }
        onChange && onChange(v);
    }

    /**
     * 广播监听事件
     * @param {object} message
     * @param {object} message.site - 发起者的菜单优先级
     * @param {object} message.name - 发起者的name
     * @param {object} message.eventType - 事件类型
     * **/
    async function listener(message = {}) {
        const { eventType } = message
        // 过滤掉自己派发的事件
        // 联动后面的菜单
        if (props.name != message.name) {
            // 清除后面的
            if (eventType == EVENT_TYPES_CLEAR && site > message.site) {
                updateForm();
                setFieldList()
            } else if (eventType == EVENT_TYPES_EDIT && site == message.site + 1) { // 修改下一级菜单
                updateForm();
                const { data } = await getList({ name: props.name, site, originalObject })
                setFieldList(data);
            }
        }
    }

    function updateForm() {
        const v = form.getFieldValue(props.name)
        if (v) {
            form.setFieldsValue({ [props.name]: undefined });
            form.validateFields([props.name])
        }
    }

    // 级联菜单联动
    function dispatchEvent(v = []) {
        const eventType = !v.length ? EVENT_TYPES_CLEAR : EVENT_TYPES_EDIT;
        emitter.emit('cascade', {
            eventType,
            site,
            name: props.name,
            group 
        })
    }

    const destory = () => {
        emitter && emitter.removeListener('cascade', listener)
    }

    const createConfig = value => {
        let c = { value };
        const { format = 'YYYY-MM-DD' } = cmpConfig;
        switch (type) {
            case 'SELECT':
                c = {
                    ...c,
                    options: data,

                    originalObject,
                    getList,
                    name: props.name,
                    type,
                    // 如果是级联菜单，则有一下属性
                    site,
                    group,
                    cascades,
                    form
                }
                break;
            case 'DATE_PICKER':
                if (isString(value)) {
                    c.value = moment(value, format)
                }
                break;
            case 'RANGE_PICKER':
                if (isArray(value)) {
                    c.value = value.map(v => {
                        if (isString(v)) {
                            v = moment(v, format)
                        }
                        return v
                    })
                }
                break;
            case 'CHECKBOX_GROUP':
            case 'RADIO_GROUP':
                c.options = data;
                delete cmpConfig.allowClear;
                break;
            case 'SELECT_TREE':
                c = {
                    ...c, 
                    value: undefined,
                    selectedList: value,
                    list: data,
                    needMiddle: false,
                    mode,
                    getList: () => getList({name: props})
                }
                break;
            case 'UPLOAD':
            case 'UPLOAD_FILE':
                c.fileList = value;
                c.action = action;
                delete c.value
                break;
        }
        return c
    }

    const Renderer = ({ value, onChange }) => {
        const message = form.getFieldError(props.name);
        const c = createConfig(value || cmpConfig.value);
        // 存在同步初始value时
        if (cmpConfig.value && !value) {
            form.setFieldsValue({ [props.name]: cmpConfig.value })
        }
        return (
            <Tooltip
                ref={ref}
                overlayClassName="cmp-tooltip"
                placement="topRight"
                title={<div className="title">{message}</div>}
                getPopupContainer={(triggerNode) => triggerNode}
            >
                <div className="cmp-container" >
                    <Cmp
                        {...cmpConfig}
                        {...c}
                        onChange={e => changeHandle(e, value, onChange)}
                    />
                </div>
            </Tooltip>
        )
    }

    useEffect(() => {
        // 级联菜单 监听广播
        if (type == 'SELECT' && site && emitter) {
            destory();
            emitter.on('cascade', listener);
        }
        return () => {
            destory()
        }
    }, [emitter]);

    function setFieldList(data) {
        setData(data && format({ data }))
    }
    useImperativeHandle(ref, () => ({
        // 设置组件数据
        setFieldList,
        forceUpdate: () => forceUpdate(uuidv4())
    }))
    return (
        <Form.Item {...formItemConfig}>
            <Renderer />
        </Form.Item>
    )
}
export default forwardRef(FormItem)
