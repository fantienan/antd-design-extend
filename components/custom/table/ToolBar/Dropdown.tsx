// @ts-nocheck
import * as React from 'react'
import { Dropdown, Checkbox, Menu } from '../../../index'
import { v4 as uuidv4 } from 'uuid';
import { reducer, changeColumns, update, formatColumns } from './reducer'
export default function (props) {
    let timer;
    const [state, dispatch] = React.useReducer(reducer, {
        columns: formatColumns(props.columns),
        visible: false
    })
    const { columns, visible } = state
    const onVisibleChange = visible => {
        dispatch(update({
            columns: visible ? formatColumns(props.askFor()) : columns,
            visible
        }))
    }
    const onChange = (v, i, e) => {
        columns[i].checked = e.target.checked
        dispatch(changeColumns(columns))
        props.showHidden(i, e.target.checked)
    }
    const overlay = (<Menu>
        {columns.map((v, i) =>
            <Menu.Item key={v.index}>
                <Checkbox
                    onChange={e => onChange(v, i, e)}
                    checked={v.checked}
                >
                    {v.title}
                </Checkbox>
            </Menu.Item>
        )}
    </Menu>)
    return (
        <Dropdown
            trigger="click"
            visible={visible}
            overlay={overlay}
            onVisibleChange={onVisibleChange}
        >
            {props.children}
        </Dropdown>
    )
}
