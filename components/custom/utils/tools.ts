// @ts-nocheck
export const isArray = (par) => Object.prototype.toString.call(par) === "[object Array]";
export const isObject = (par) => Object.prototype.toString.call(par) === "[object Object]";
export const isElement = (par) => Object.prototype.toString.call(par).slice(8, 12) === "HTML";
export const isFunction = (par) => Object.prototype.toString.call(par) === "[object Function]" || Object.prototype.toString.call(par) === "[object AsyncFunction]";
export const isString = (par) => Object.prototype.toString.call(par) === "[object String]";
export const isNumber = (par) => Object.prototype.toString.call(par) === "[object Number]";
export const isBoolean = (par) => Object.prototype.toString.call(par) === "[object Boolean]";
export const isUndefined = (data) => Object.prototype.toString.call(data) === "[object Undefined]";
export const isNull = (data) => Object.prototype.toString.call(data) === "[object Null]";
export const stringify = (data) => JSON.parse(JSON.stringify(data));
export const emailReg = (email) => /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/.test(email)

// 定时器不走react合成事件的逻辑，导致event有问题
export const debounce = (fn, num = 800, param = {}) => {
    let timer = null;
    return (...argus) => {
        let e = {};
        const data = [];
        (argus || []).forEach(v => {
            if (typeof v.stopPropagation === 'function') {
                e = { ...v }
            } else {
                data.push(v)
            }
        })
        window.clearTimeout(timer);
        timer = setTimeout((event, data) => {
            typeof fn === 'function' && fn({ ...param, event, data })
            timer = null
        }, num, e, data)
    }
}

// 判断是否是JSON格式字符串
export const isJSON = (str) => {
    if (isString(str)) {
        try {
            const value = JSON.parse(str)
            return isObject(value) || isArray(value)
        } catch (e) {
            return false;
        }
    }
    return false
}
// obj 转 string 样式
export const transStyleObjToStr = obj => {
    if (!isObject(obj)) {
        throw 'argus is must be object';
    }
    
    return Object.keys(obj).reduce((acc, key) => {
        acc += `${key}:${obj[key]};`
        return acc
    }, '');
}
// string 转 obj 样式
export const transStyleStrToObj = str => {
    if (!isString(str)) {
        throw 'argus is must be string';
    }
    return str.split(';').filter(_=>_).reduce((acc, cur) => {
        const [key, value] = cur.split(':')
        acc[key.trim()] = value.trim()
        return acc
    }, {})
}