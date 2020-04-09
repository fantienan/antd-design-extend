// @ts-nocheck
import schema from 'async-validator-extend';
import {
    DEFAULT_NAME_KEY,
    DEFAULT_VALUE_KEY,
    DEFAULT_NAME_VALUE,
    DEFAULT_VALUE_VALUE,
    placeholder
} from '../utils';
import { isObject, isArray, stringify, isJSON, isString } from '../utils/tools';
import { TYPE_MAP } from './config';

const compatible = data => isObject(data.originalObjects) ? data.originalObjects : data;
// 展开数据
const spread = data => ({
    ...data.originalObjects || data,
    ...data.currentObjects || data
})

// 下拉框list格式化
const formatSeletList = ({
    data = [],
    nameValue = 'I_ID',
    valueValue = 'C_ZQNAME',
} = {}) => (data || []).reduce((acc, cur) => {
    const item = compatible(cur)
    acc.push({
        value: item[nameValue],
        label: item[valueValue]
    })
    return acc;
}, [/* placeholder */]);

/**
 * 
 * @return [
 *  { label: 1, value: 2, disabled: false, checked: true }
 * ]
 * **/
const formatOptions = ({
    data,
    nameValue = 'C_DESCRIBE',
    valueValue = 'I_ID',
}) => (data || []).reduce((acc, cur) => {
    const item = compatible(cur)
    acc.push({
        label: item[nameValue],
        value: item[valueValue],
        disabled: item.disabled,
        checked: item.checked
    })
    return acc
}, [])

const patch = (children, level, selectedList, result = []) => {
    for (let i = 0; i < children.length; i++) {
        const { value, state } = children[i];
        const checked = !!selectedList.find(v => (isObject(v) ? v.value : v) == value);
        result.push(children[i]);
        children[i].state = {
            ...state,
            checked
        }
        if (children[i].children && level > 0) {
            children[i].state = {
                ...children[i].state,
                isOpen: true
            }
            patch(children[i].children, level - 1, selectedList, result)
        }
    }
    return result;
}
/**
 * 一维数组转树
 * @param {object[]} data - 一维数组
 * @param {string} nameKey - name key
 * @param {string} valueKey - value key
 * @param {number} level - 默认展开几层
 * @param {number} selectedList - 选中的值
 * 
 * @example
 *  treeList[] = {
 *      id: 1, // 唯一标识
 *      path: '-1-', // 层级
 *      isLeaf: false, // 是否是叶子节点
 *      children:[], // 子节点
 *      state: {
 *          isOpen: false, // 节点是否展开
 *          nodeDisabled: true, // 禁用节点
 *          checkDisabled: true, // 禁用节点选择框
 *          checked: true, // 选中状态
 *      }
 *  }
 *  
 * **/
const formatTreeList = ({
    data,
    nameKey = TYPE_MAP.SELECT_TREE.nameKey,
    valueKey = TYPE_MAP.SELECT_TREE.valueKey,
    level = 1,
    selectedList = []
}) => {
    if (!isArray(data)) {
        console.error('data 必须是数组');
        return data
    }
    data = stringify(data);
    let rootNode = {},
        childNode = {},
        result = [];
    for (let i = 0; i < data.length; i++) {
        const isOpen = i == 0;
        const {
            [valueKey]: value,
            [nameKey]: label,
            I_ID: id,
            I_PARID: pId,
        } = spread(data[i]);
        const path = (rootNode[pId] || childNode[pId] || {}).path;
        const checked = !!selectedList.find(v => (isObject(v) ? v.value : v) == value);
        const item = {
            id: value,
            // pId,
            originalData: spread(data[i]),
            value,
            label,
            path: `${path ? path + '-' + id : id}`,
            isLeaf: true,
            state: {
                checked
            },
        }
        if (!pId) {
            rootNode[`${id}`] = item;
            result.push(item)
        } else {
            childNode[`${id}`] = item;
            if (rootNode[pId]) {
                if (!rootNode[pId].children) {
                    rootNode[pId].children = []
                }
                rootNode[pId].isLeaf = false;
                rootNode[pId].children.push(childNode[id]);
            }
            if (childNode[pId]) {
                if (!childNode[pId].children) {
                    childNode[pId].children = []
                }
                childNode[pId].isLeaf = false;
                childNode[pId].children.push(childNode[id]);
            }
        }
    }
    rootNode = childNode = null;
    result = stringify(result);
    // 展开几层节点
    result = level ? patch(result, level, selectedList, []) : result;
    return result
}

/**
 * 转换成组件的数据格式
 * @param {object[]} data - 数据 
 * @param {fun} callback - 回调
 * **/
export const formatFormData = ({ data = [] }) => {
    const result = [];
    // 级联菜单
    let cascade;
    for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const obj = compatible(item)
        const {
            S_FIELDNAME: name,            // 字段名称
            I_FIELDID,              // 字段ID
            S_FIELDALIASNAME: label,
            S_READONLY,             // 是否只读， 是：只读；否读写
            S_CANSHOW,              // 是否显示
            S_CONTROLTYPE,
            S_RELATIONGROUP,    // 级联分组
            I_RELATIONINDEX    // 级联层级
        } = obj;
        if (S_CANSHOW === '否') {
            continue;
        }
        /**S_CONTROLTYPE参数说明
         * S_CONTROLTYPE = {
         *  rules: [ // 参考 async-validator-extend 的 rules
         *      "required","email","float","url",
         *      "integer","rangeLength","maxLength",
         *      "minLength","rangeChar","date",
         *      "english","englishAndNumber","chinese","idCards"
         *  ]
         * }
         * **/
        const controlType = isJSON(S_CONTROLTYPE) ? JSON.parse(S_CONTROLTYPE) : { type: 'INPUT', name, label };
        controlType.name = name;
        if (controlType.rules) {
            const { rules } = schema.custom;
            controlType.rules = controlType.rules.reduce((acc, ruleName) => {
                rules[ruleName] && acc.push(...rules[ruleName]())
                return acc
            }, [])
        }
        const disabled = S_READONLY === '是' ? true : false;
        const rules = createValidatorRules(obj);
        const config = { disabled, rules, label };
        result.push({
            ...config,
            ...controlType,
            originalObject: obj
        })
        // 收集级联菜单信息
        if (S_RELATIONGROUP && I_RELATIONINDEX) {
            !cascade && (cascade = {})
            cascade[S_RELATIONGROUP] = {
                ...cascade[S_RELATIONGROUP],
                [I_RELATIONINDEX]: {
                    site: I_RELATIONINDEX,
                    name
                }
            }
        }
    }
    return { cascade, data: result }
}

// 创建校验规则
const createValidatorRules = argus => {
    const {
        S_ALLOWNULL, // 是否可以为空， 是：可以为空；否：不可以为空
        I_DECIMALDIGITS, // 小数位长度
        I_MAXLEN,
        S_CONTROLTYPE
    } = argus;
    const rules = [];
    if (S_ALLOWNULL == '否') {
        rules.push(...schema.custom.rules.required())
    }
    return rules
}
/**
 * @param {array[]} arr - 二维数组，第一维度为级联分组
 * @param {string[]} arr[] - 第二维度为这一组级联的菜单，顺序为级联层级
 * @param {string} arr[][] - 唯一id 
 * **/
const getCascade = arr => {
    return arr.reduce((acc, cur, i) => {
        acc[i + 1] = cur.reduce((acc, name, i) => {
            const site = i + 1
            acc[site] = { name, site }
            return acc
        }, {})
        return acc
    }, {})
}
export const utils = {
    formatSeletList,
    formatOptions,
    formatTreeList,
    formatFormData,
    getCascade
}