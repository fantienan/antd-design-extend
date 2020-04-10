// @ts-nocheck
import * as React from 'react';
import { Form } from '../../index';
import PropTypes from 'prop-types';
import { EventEmitter } from 'events';
import { isObject, isFunction } from '../utils/tools';
import { Provider } from './context';
import FormItem from './FormItemWrapper';
import { utils } from './utils';
import { TYPE_MAP } from './config';
import './style/index.less'

/**
 * @param {object} props
 * @param {object} props.scope - 外部作用域，用来接收formInstance
 * @param {object} props.initialValues - 表单默认值，只有初始化以及重置时生效
 * @param {object} props.className - class name
 * @param {string[]} props.cascade - 人工表单级联菜单
 * 动态表单api - 根据后台返回的数据生成表单
 * @param {object[]} props.data - 组件数据，符合组件数据格式
 * @param {object} props.data[] - FormItem api 格式
 * @example 
 *  props.data = [
 *      {
 *          type: 'INPUT_PASSWORD',
 *          rules: [schema.custom.rules.required()],
 *          name: 'pwd'
 *      }
 * ]
 * @param {object[]} props.originalData - 组件数据，后端返回的数据，需要转换成组件数据格式
 * @param {number} props.column - 一行几列
 * @param {string} props.action - 上传接口地址
 * @param {func} props.getList - 下拉组件获取list
 * **/

function EnhanceForm(props = {}): React.ReactElement {
    const {
        scope,
        children,
        originalData,
        column,
        data,
        className = '',
        action,
        getList,
        cascade,
        ...otherProps
    } = props;

    const store = React.useRef({
        cascade: {}, // 级联菜单分组及层级关系
        refs: {}, // 表单项组件ref
        wrapperRefs: {} // ForemItemWrapper的ref 用来更新级联菜单cascade
    });
    const [, forceUpdate] = React.useState(0)
    const [form] = Form.useForm();
    const cls = (children ? 'ordinary-form ' : 'dynamic-form ') + className;
    // 向外部作用域暴露方法
    scope.form = {
        ...form,
        // 设置list
        setFieldsList: argus => {
            EnhanceForm.checkout(argus, 'object', 'setFieldsList')
            isObject(argus) && Object.keys(argus).forEach(key => {
                const { setFieldList } = (store.current.refs[key] || {}).current || {};
                isFunction(setFieldList) && setFieldList(argus[key])
            })
        },
    };
    // 响应化处理 待优化
    const array = new Array(column).fill(0);
    const resetCascade = cascade => {
        Object.keys(cascade).forEach(key => {
            const emitter = new EventEmitter()
            Object.keys(cascade[key]).forEach((k, index, array) => {
                cascade[key][k].emitter = emitter
                cascade[key][k].isLast = index == array.length - 1
                cascade[key][k].group = key
            })
        })
        store.current.cascade = cascade
    }
    // 数据格式转换
    const renderData = React.useMemo(() => {
        if (data && data.length) {
            return data
        }
        if (originalData && originalData.length) {
            const { cascade, data = [] } = utils.formatFormData({ data: originalData }) || {}
            // 级联菜单
            cascade && resetCascade(cascade)
            return data
        }
        return []
    }, [data, originalData]);
    const createClassName = block => block ? "placeholder" : "ant-row ant-form-item";
    const createItem = (colItem, node) => {
        store.current.wrapperRefs[colItem.name] = React.createRef();
        node.push(<FormItem
            ref={store.current.wrapperRefs[colItem.name]}
            key={colItem.name}
            {...colItem}
        />)
    }
    const createPlaceholder = (node, num) => {
        const isBlock = TYPE_MAP[node[node.length - 1].props.type].display == 'block'
        const className = createClassName(isBlock)
        new Array(num).fill(0).map((_, i) => {
            node.push(<div
                key={num + i}
                className={className}
            />)
        })
    }
    const renderRow = (i) => {
        let pointer;
        const node = [];
        for (let index = 0; index < array.length; index++) {
            const colItem = renderData[i + index];
            if (!colItem) {
                createPlaceholder(node, array.length - index)
                if (node.length == array.length) {
                    break
                }
                continue
            }
            // 这一行的第一个直接push
            if (!index) {
                createItem(colItem, node)
            } else {
                const prevNode = node[node.length - 1]
                const prevIsBlock = TYPE_MAP[prevNode.props.type].display == 'block' // 前一项是都独占一行
                const targetIsBlock = TYPE_MAP[colItem.type].display == 'block' // 自己是否独占一行
                // 前一个独占一行
                if (prevIsBlock || targetIsBlock) {
                    pointer = i + node.length
                    createPlaceholder(node, array.length - index)
                    break
                }
                createItem(colItem, node)
            }
        }
        return { node, pointer }
    }
    const renderer = () => {
        let jsx = [];
        for (let i = 0; i < renderData.length;) {
            const { node, pointer } = renderRow(i);
            jsx.push(<div
                className="row"
                key={renderData[i].name || i}
            >
                {node}
            </div>)
            i = pointer || i + column
        }
        return jsx.filter(_ => _)
    }
    if (!originalData && props.cascade) {
        resetCascade(utils.getCascade(props.cascade))
    }
    return (
        <Provider value={{
            form,
            refs: store.current.refs,
            cascade: store.current.cascade,
            action,
            getList,
            isDynamic: !!originalData
        }} >
            <Form
                className={cls}
                layout="inline"
                form={form}
                {...otherProps}
                scrollToFirstError
            >
                {renderer()}
                {children ? children : null}
            </Form>
        </Provider>
    )
}

EnhanceForm.propTypes = {
    scope: PropTypes.object,
    initialValues: PropTypes.object,
    className: PropTypes.string,
    originalData: PropTypes.arrayOf(PropTypes.object),
    action: PropTypes.string,
    getList: PropTypes.func,
    cascade: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
}

EnhanceForm.defaultProps = {
    scope: {},
    column: 2,
    getList: () => new Promise()
}

EnhanceForm.checkout = (argus, type, name) => {
    const propTypes = {
        argus: PropTypes[type].isRequired
    }
    PropTypes.checkPropTypes(propTypes, { argus }, 'argus', name);
}

export default EnhanceForm;