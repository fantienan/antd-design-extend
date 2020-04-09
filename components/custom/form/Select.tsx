// @ts-nocheck
import React, { useState, useEffect, useReducer } from 'react'
import { TYPE_MAP } from './config'
import { Select } from '../../index'
/**
 * @param {object} props
 * @param {string} props.name - 唯一id
 * @param {number} props.site - 级联层级
 * @param {number} props.options - select options
 * @param {number|string} props.value - select value
 * @param {object} props.cascades - 这一组的所有级联菜单
 * @param {object} props.originalObject - 接口数据
 * @param {func} props.getList - 异步获取数据
 * @param {string} props.type - 异步获取数据
 * @param {string} props.group - 级联分组
 * 
 * **/
export default class EnhanceSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            loading: false,
            data: props.options || [],
            value: props.value
        }
    }
    // 是否获取数据
    verdict = (name, site, cascades) => {
        if (!site || site == 1 || !cascades[site - 1]) {
            return true
        }
        const prevValue = this.props.form.getFieldValue(cascades[site - 1].name)
        return !!prevValue
    }
    onDropdownVisibleChange = async open => {
        let state = { open }
        const { name, site, cascades, originalObject } = this.props
        // 获取数据
        if (open && !this.state.data.length && this.verdict(name, site, cascades)) {
            this.setState({ loading: true })
            const param = {
                originalObject,
                site,
                name
            }
            const { data } = await this.props.getList(param)
            state = {
                ...state,
                loading: false,
                data: TYPE_MAP[this.props.type].format({ data }),
            }
        }
        this.setState(state)
    }
    render() {
        const { data, open, loading, value } = this.state
        return (
            <Select
                value={value}
                onChange={this.props.onChange}
                options={data}
                open={open}
                loading={loading}
                allowClear={this.props.allowClear}
                disabled={this.props.disabled}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
            />
        )
    }
}
