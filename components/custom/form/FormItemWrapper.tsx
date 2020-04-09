// @ts-nocheck
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Consumer } from './context';
import FormItem from './FormItem';
import { isArray } from '../utils/tools';

function FormItemWrapper(props, ref) {
    const [, forceUpdate] = useState(0)
    const { name, type } = props;
    const formItemRef = useRef();
    // 判断是否是级联菜单
    // 并生成config 
    const createCascadeConfig = (ctx) => {
        const { I_RELATIONINDEX, S_RELATIONGROUP } = props.originalObject || {}
        if (I_RELATIONINDEX && S_RELATIONGROUP) {
            return {
                ...ctx.cascade[S_RELATIONGROUP][I_RELATIONINDEX],
                cascades: ctx.cascade[S_RELATIONGROUP]
            }
        } else if (!ctx.isDynamic) { // 人工表单
            let result;
            Object.keys(ctx.cascade).forEach(key => {
                Object.keys(ctx.cascade[key]).forEach(k => {
                    if (ctx.cascade[key][k].name == props.name) {
                        result = {
                            ...ctx.cascade[key][k],
                            cascades: ctx.cascade[key]
                        }
                    }
                })
            })
            return result
        }
    }
    useImperativeHandle(ref, () => ({
        forceUpdate: () => forceUpdate(uuidv4())
    }))
    return <Consumer>
        {ctx => {
            const { cascade, refs, isDynamic, ...other } = ctx;
            // 收集表单项的实例
            ctx.refs[props.name] = formItemRef;
            let c = createCascadeConfig(ctx);
            c = {
                ref: formItemRef,
                ...other,
                ...props,
                ...c,
            };
            return <FormItem {...c} />
        }}
    </Consumer>
}

export default forwardRef(FormItemWrapper)