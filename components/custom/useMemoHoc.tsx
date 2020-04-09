// @ts-nocheck
import * as React from 'react';
import { isFunction } from './utils/tools';
// HOC 
export default Component => (props = {}) => {
    const deps = Object.keys(props).reduce((acc, key) => {
        if (!isFunction(props[key])) {
            acc.push(props[key])
        }
        return acc
    }, [])
    return <>{
        React.useMemo(() => <Component {...props} />, deps)
    }</>
};




















