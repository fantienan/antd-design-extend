---
order: 0
title:
  zh-CN: 简单的表格
---

## zh-CN

简单的表格。

```jsx
import { Custom, Button, Radio, Switch } from 'antd';
import io from '../io'

function reducer(state, { type, data }) {
  switch (type) {
    case 'selectionType':
      return {
        ...state,
        selectionType: data
      }
    case 'update':
      return {
        ...state,
        columns: data.columns,
        dataSource: data.dataSource,
        pagination: data.pagination
      }
    default:
      throw '没有匹配的action.type'
  }
}

function Example() {
  const store = {};
  const [state, dispatch] = React.useReducer(reducer, {
    selectionType: 'checkbox',
    selectedRowKeys: [],
    columns: [],
    dataSource: [],
    pagination: {}
  })
  const { selectionType, selectedRowKeys, columns, dataSource, pagination } = state;
  const [drag, setDrag] = React.useState(false)
  // 获取下拉数据
  const getList = async argus => {
    const param = {
      data: {
        tableName: "FL_SYS_ZQSJZD",
        queryFilter: {
          whereString: "1=1",
          addCaptionField: false,
          orderByString: "I_ID"
        }
      }
    }
    io.getEntityList.abortAll();
    return await io.getEntityList(param).fetch()
  };

  // 获取table data 及 分页信息
  const getDataSoucre = async ({ pageIndex = 1, pageSize = 20, queryFilter } = {}) => {
    const param = {
      data: {
        pageInfo: {
          pageIndex,
          pageSize
        },
        tableName: "FS_YW_BASE_ORG",
        queryFilter: queryFilter || {}
      }
    }
    io.pageSelect.abortAll();
    return await io.pageSelect(param).fetch();
  }
  const init = async () => {
    // 获取列描述
    const params = {
      data: {
        tableName: "FS_DATA_TABLEMETADATA",
        queryFilter: {
          addCaptionField: false,
          orderByString: "I_FIELDID",
          whereString: "S_TABLEID = 'FS_YW_BASE_ORG'"
        }
      }
    }
    io.getEntityList.abortAll();
    const res = await io.getEntityList(params).fetch();

    const { data: [dataSource, pagination] } = await getDataSoucre();
    dispatch({
      type: 'update',
      data: {
        columns: res.data,
        dataSource: dataSource,
        pagination
      }
    })
  }
  const onChange = (checked) => {
    setDrag(checked)
  }
  const getTreeList = () => new Promise(async resolve => {
    const params = {
      data: {
        "tableName": "FL_SYS_ZQSJZD",
        "queryFilter": {
          "whereString": "1=1",
          "addCaptionField": false
        }
      }
    }
    const { data } = await io.getEntityList(params).fetch()
    store.treeList = data
    resolve({data})
  })
  const changeSelectTree = async argus => {
    const { list, selectedList } = argus
    store.selectedList = selectedList
    if (selectedList.length == 0) {
      store.queryFilter = null
      return
    }
    store.queryFilter = {
      "whereString": `C_ZQCODE = '${selectedList[0].originalData.C_ZQCODE}'`
    }
  }
  const query = async () => {
    const { data: [dataSource, pagination] } = await getDataSoucre({ queryFilter: store.queryFilter })
    dispatch({
      type: 'update',
      data: {
        columns,
        dataSource: dataSource,
        pagination
      }
    })
  }
  const toolCallback = ({ type, data }) => {
    console.log(type, data)
  }
  const sortCallback = argus => {
    console.log(argus)
  }
  React.useEffect(() => {
    init()
  }, [])
  return (
    <div className="table-page">
      <Radio.Group
        onChange={({ target: { value } }) => {
          dispatch({ type: 'selectionType', data: value })
        }}
        value={selectionType}
      >
        <Radio value="checkbox">Checkbox</Radio>
        <Radio value="radio">radio</Radio>
      </Radio.Group>
      <Switch onChange={onChange} />
      <Button onClick={() => console.log(store.table.getSelectedRowKeys())}>获取所有选择的值</Button>
      <Button onClick={() => console.log(store.table.getSelectedRows())}>获取所有选择的行</Button>
      <Button onClick={() => store.table.setSelectedRowKeys()}>清空所有选择</Button>
      查询条件:<Custom.SelectTree
        getList={getTreeList}
        list={store.treeList}
        selectedList={store.selectedList}
        needMiddle={false}
        onChange={changeSelectTree}
      />
      <Button onClick={query} >查询</Button>
      <Custom.Table
        scope={store}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        getDataSoucre={getDataSoucre}
        selectionType={selectionType}
        selectedRowKeys={selectedRowKeys}
        drag={drag}
        tool={true}
        action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
        getList={getList}
        toolCallback={toolCallback}
        sortCallback={sortCallback}
        customTool={() => <Custom.ImportFile
          action="/api/forestarui_v0.4/excel/import.do"
          name="tableName"
        />}
      />
    </div>
  )
}
ReactDOM.render(<Example />, mountNode);
```
