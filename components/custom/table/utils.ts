// @ts-nocheck
import { stringify, isFunction } from '../utils/tools';

// 展开数据
const spread = data => ({
    ...data.originalObjects || data,
    ...data.currentObjects || data
})
const width = 120;
const accept = 'card';
function createTableColumns(columns, callback, start = 0) {
    columns = stringify(columns);
    let root = {}, result = { columns: [], allCacheChildrenList: {} };
    // 下标从1开始，过滤掉主键
    for (let i = start; i < columns.length; i++) {
        const {
            S_FIELDALIASNAME: title,
            S_GROUP,
            S_FIELDNAME: dataIndex
        } = spread(columns[i]);
        const item = {
            title,
            dataIndex,
            key: dataIndex,
            originalData: columns[i],
            // ellipsis: true,
            width,
            group: S_GROUP
        };
        isFunction(callback) && callback(item);
        if (!S_GROUP) { 
            root[title] = item;
            root[title].accept = accept
        } else {
            item.accept = S_GROUP
            // 根据S_GROUP合并单元格的树结构
            const [title, ...children] = S_GROUP.split(':') || [];
            !root[title] && (root[title] = {
                title,
                children: [],
                // ellipsis: true,
                width: ((S_GROUP.split(':') || []).length + 1) * width,
                group: S_GROUP,
                accept
            });
            // 缓存所有子元素，便于查找和改变子元素状态
            root[title].cacheChildrenList = {
                ...root[title].cacheChildrenList,
                [item.title]: item
            }
            // 指针指向children，桥
            let pointer = root[title].children;
            for (let i = 0; i < children.length; i++) {
                const v = children[i];
                // 判断表头是否存在
                const targetItem = pointer.find(_ => _.title == v);
                if (targetItem) {
                    // 指针指向它的children
                    pointer = targetItem.children;
                    continue;
                }
                const isLast = i == children.length - 1;
                const obj = {
                    title: v,
                    children: [],
                    // ellipsis: true,
                    width: (children.length - i + 1) * width,
                    group: S_GROUP,
                    accept: S_GROUP.replace(`:${v}`, ''),
                };
                root[title].cacheChildrenList[v] = obj;
                pointer.push(obj);
                pointer = obj.children
            }
            pointer.push(item)
        }
    }
    result = patch(Object.values(root), {}, {})
    return result
};
function patch(arr, obj = {}, allCacheList = {}, leval = 1) {
    for (let i = 0; i < arr.length; i++) {
        arr[i][leval > 1 ? 'targetIndex' : 'index'] = i
        if (arr[i].cacheChildrenList) {
            obj = {
                ...obj,
                ...arr[i].cacheChildrenList
            }
        } else {
            allCacheList[arr[i].title] = arr[i]
        }
        
        if ((arr[i].children || []).length) {
            patch(arr[i].children, obj, allCacheList, leval + 1)
        }
    }
    return { columns: arr, allCacheChildrenList: obj, allCacheList }
}

function createTableDataSource(data) {
    const result = [];
    stringify(data).forEach((v, i) => {
        result.push({
            key: i,
            index: i,
            ...spread(v)
        })
    });
    return result
};

export default {
    createTableColumns,
    createTableDataSource,
    width
}