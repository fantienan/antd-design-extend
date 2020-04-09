// @ts-nocheck
import * as React from 'react'
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import './style.less'
const ASC = 'asc', DES = 'des';
const style = {
    color: '#1890ff'
}
const transSort = {
    'undefined': ASC,
    [ASC]: DES,
    [DES]: undefined
}
function Extension(props, ref) {
    const [sort, setSort] = React.useState()
    React.useImperativeHandle(ref, () => ({
        setSort: () => {
            setSort(transSort[`${sort}`])
            props.store.sorts[props.title] = {
                sort: transSort[`${sort}`],
                ...props.store.allCacheList[props.title]
            }
            props.callback(Object.values(props.store.sorts).map(v => ({
                sort: v.sort,
                originalData: v.originalData
            })))
        }
    }))
    return (
        <div className="extension">
            <div className="sort">
                <CaretUpOutlined style={sort == ASC ? style : {}} />
                <CaretDownOutlined style={sort == DES ? style : {}} />
            </div>
        </div>
    )
}

export default React.forwardRef(Extension)
