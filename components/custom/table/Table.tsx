// @ts-nocheck
import * as React from 'react';
import PropTypes from 'prop-types';
import { Table, Spin } from '../../index';
import { ReloadOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { Resizable } from 'react-resizable';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import NoData from '../no-data';
import utils from './utils';
import { isFunction, isUndefined, isString, transStyleObjToStr, transStyleStrToObj } from '../utils/tools';
import { reducer, initialState, changeLoading, changePagination, changePaging, changeSelect, changeDataSource } from './reducer';
import ToolBar from './ToolBar';
import useMemoHoc from '../useMemoHoc';
import DragProvider from './DragProvider'
import Extension from './Extension'
import './style/index.less';


/**
 * @param {object} props 
 * @param {object[]} props.scope - api 容器
 * @param {object[]} props.drag - 是否可拖动、改变大小
 * @param {object[]} props.columns - 表格列描述
 * @param {object[]} props.dataSource - 表格数据源
 * @param {object} props.pagination - 分页信息
 * @param {string} props.selectionType - 多选/单选
 * @param {string[]} props.selectedRowKeys - 选中行的key
 * @param {object} props.scroll - 表格是否可滚动，也可以指定滚动区域的宽、高
 * @param {object} props.getDataSoucre - 翻页时获取数据 必须是Promise
 * @param {func} props.rowSelectionChangeCallback - 行选中回调
 * 工具栏
 * @param {boolean} props.tool - 是否显示工具栏
 * @param {string} props.action - 上传接口地址
 * @param {func} props.getList - 获取下拉数据list的回调 必须return Promise
 * @param {func} props.toolCallback - 工具栏回调
 * @param {func} props.sortCallback - 点击列排序按钮回调
 * @param {func} props.customTool - 自定义工具栏
 * **/
function EnhanceTable(props = {}) {
	const num = 120;
	// 取消拖拽的句柄
	const cancelCls = "cancel";
	const { scope, tool } = props;
	const gridProxyRef = React.useRef();
	/**
	 * store.current.columns - 缓存columns，容错：handleResizeStop中columns为[];
	 * store.cuttent.pagination - 缓存pagination，容错：showTotal中reload里拿不到最新的分页信息
	 * **/
	const store = React.useRef({
		sorts: {}
	});
	const [state, dispatch] = React.useReducer(reducer, initialState({
		uuId: "_" + uuidv4(),
		loading: false,
		selectedRows: [],
		selectedRowKeys: [],
		dataSource: [],
		pagination: {
			hideOnSinglePage: true,
			onChange: paginationOnChange,
			onShowSizeChange: onShowSizeChange,
			showSizeChanger: true,
			showTotal
		},
	}));
	const { uuId, loading, dataSource, pagination, selectedRowKeys, selectedRows } = state;
	const [, forceUpdate] = React.useState(0);
	const [columns, setColumns] = React.useState([]);
	const [selectionType, setSelectionType] = React.useState(props.selectionType);
	const [scroll, setScroll] = React.useState({ y: 200 });
	// 中转
	store.current.cacheDataSource = dataSource;
	// 向外暴露方法
	scope.table = {
		getSelectedRowKeys: () => selectedRowKeys,
		getSelectedRows: () => selectedRows,
		setSelectedRowKeys: (selectedRowKeys = []) => dispatch(changeSelect({
			selectedRows: transform(selectedRowKeys),
			selectedRowKeys
		})),
	};

	const reload = () => {
		const { current, pageSize } = store.current.pagination;
		paginationOnChange(current, pageSize)
	};
	function showTotal(total, range) {
		return <>
			每页显示{range[1] - range[0] + 1}条，共{total}条
			<ReloadOutlined onClick={reload} />
		</>
	};
	const rowSelection = {
		type: selectionType,
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			dispatch(changeSelect({
				selectedRowKeys,
				selectedRows
			}))
			props.rowSelectionChangeCallback(selectedRowKeys, selectedRows)
		},
		getCheckboxProps: record => ({
			name: record.name,
		}),
	};
	const onRowClick = (record, index, event) => {
		const hasItem = selectedRowKeys.filter(v => v == record.key).length;
		let newSelectedRowKeys, newSelectedRows;
		if (hasItem) {
			newSelectedRowKeys = _.difference(selectedRowKeys, [record.key]);
			newSelectedRows = _.pullAllBy(selectedRows, [record], 'key')
		} else if (selectionType == 'checkbox') {
			newSelectedRowKeys = [...selectedRowKeys, record.key].sort((a, b) => a - b)
			newSelectedRows = [...selectedRows, record].sort((a, b) => a.key - b.key)
		} else {
			newSelectedRowKeys = [record.key]
			newSelectedRows = [record]
		}
		dispatch(changeSelect({
			selectedRowKeys: newSelectedRowKeys,
			selectedRows: newSelectedRows,
		}))
		props.rowSelectionChangeCallback(newSelectedRowKeys, newSelectedRows)
	};

	function paginationOnChange(current, pageSize) {
		updatePagination(current, pageSize)
	};

	function onShowSizeChange(current, pageSize) {
		updatePagination(current, pageSize)
	}

	async function updatePagination(current, pageSize) {
		window.clearTimeout(store.current.timer);
		store.current.timer = setTimeout(async () => {
			dispatch(changeLoading(true));
			try {
				const { data } = await props.getDataSoucre({ pageIndex: current, pageSize });
				dispatch(changePaging({
					dataSource: data[0],
					pagination: data[1],
					loading: false
				}))
			} catch (e) {
				console.log(e)
			}
		}, 300)

	}
	// Resizable
	const handleResizeStart = column => (e, { node }) => {
		const { left, width } = node.parentElement.getBoundingClientRect();
		console.log(left, width)
		const div = document.createElement('div');
		div.className = 'grid-proxy';
		div.style.cssText = transStyleObjToStr({
			left: left + 'px',
			width: width + 'px'
		});
		gridProxyRef.current = { div, startScreenX: e.screenX };
		document.body.classList.add('not-select');
		document.body.appendChild(div);
	};

	const handleResize = column => (e, param) => {
		const { node } = param;
		const { div, startScreenX } = gridProxyRef.current;
		const { width, left } = node.parentElement.getBoundingClientRect();
		const { top, height } = document.querySelector(`.${uuId} .ant-table-container`).getBoundingClientRect();
		const style = transStyleStrToObj(div.style.cssText);
		div.style.cssText = transStyleObjToStr({
			...style,
			width: width + e.screenX - startScreenX + 'px',
			height: height + 'px',
			left: left + 'px',
			top: top + 'px'
		})
	};
	const handleResizeStop = column => (e, param) => {
		const { div } = gridProxyRef.current;
		const { columns } = store.current;
		const newWidth = div.getBoundingClientRect().width;
		// children中的column没有index
		if (isUndefined(column.index) && isString(column.group)) {
			const { index } = columns.find(v => v.title == column.group.split(":")[0]) || {};
			columns[index].cacheChildrenList[column.title].width = newWidth
		} else {
			columns[column.index].width = newWidth;
		}
		document.body.classList.remove('not-select');
		div.remove();
		gridProxyRef.current = undefined;
		setColumns(columns);
		forceUpdate(uuidv4())
	}

	const onHeaderCell = column => {
		return {
			width: column.width,
			onResize: handleResize(column),
			onResizeStart: handleResizeStart(column),
			onResizeStop: handleResizeStop(column),
		}
	};
	// 可扩展特殊字符解析，例如换行符
	const renderItem = (text, record, index) => {
		return <div className="ant-table-cell-ellipsis">{text}</div>
	}
	const reorder = (list, startIndex, endIndex) => {
		const [removed] = list.splice(startIndex, 1);
		list.splice(endIndex, 0, removed);
		return list;
	};
	const orderBy = ({ data = columns, path, targetIndex, nextIndex }) => {
		for (let i = 0; i < data.length; i++) {
			if (data[i].title == path[0]) {
				if (path.length > 1) {
					orderBy({ data: data[i].children, path: path.slice(1), targetIndex, nextIndex })
				} else {
					const [removed] = data[i].children.splice(targetIndex, 1);
					data[i].children.splice(nextIndex, 0, removed);
					data[i].children.forEach((v, i) => v.targetIndex = i)
				}
				break;
			}
		}
	}
	// 拖拽改变顺序的回调
	const moveCard = (targetItem, nextItem) => {
		// 移动的是子集单元格
		if (targetItem.isChild) {
			orderBy({
				path: targetItem.type.split(':'),
				targetIndex: targetItem.index,
				nextIndex: nextItem.index
			})
		} else {
			const [removed] = columns.splice(targetItem.index, 1)
			columns.splice(nextItem.index, 0, removed)
			// 同步更新下标
			columns.forEach((v, i) => v.index = i)
		}
		setColumns(columns)
		forceUpdate(uuidv4())
	}
	const sort = ref => () => {
		ref.current.setSort()
	}
	const ResizeableTitle = argus => {
		let { onResize, onResizeStart, onResizeStop, width, ...restProps } = argus;
		const title = argus.children[1];
		let { index, accept } = (columns.find(v => v.title == title) || {});
		let isChild = false;
		restProps.index = index;
		restProps.className && (restProps.className += " custom-th");
		// 单选列、复选列
		if (!isString(title)) {
			return <th {...restProps} />
		}
		// 子级 
		if (!accept) {
			const c = store.current.allCacheChildrenList[title]
			accept = c.accept
			index = c.targetIndex
			isChild = true // 是子集
		}
		const jsx = node => (<th {...restProps} >
			<DragProvider.Item
				index={index}
				accept={accept}
				cancelCls={cancelCls}
				isChild={isChild}
				title={title}
				moveCard={moveCard}
			>
				{node ? node : <div className="ant-table-cell-ellipsis">
					{title}
				</div>}
			</DragProvider.Item>
		</th>)
		if (!width) {
			return jsx()
		}
		const ref = React.createRef()
		restProps.className += " ant-table-column-has-sorters"
		restProps.onClick = sort(ref)
		return (
			<Resizable
				width={width}
				height={0}
				handle={/* resizeHandle =>  */(
					<span
						className={`react-resizable-handle react-resizable-handle-se ${cancelCls}`}
						onClick={e => {
							e.stopPropagation();
						}}
					/>
				)}
				onResize={onResize}
				onResizeStart={onResizeStart}
				onResizeStop={onResizeStop}
				draggableOpts={{ enableUserSelectHack: false }}
			>
				{jsx(<div>
					<div className="ant-table-cell-ellipsis">{title}</div>
					<Extension
						ref={ref}
						store={store.current}
						title={title}
						callback={props.sortCallback}
					/>
				</div>)}
			</Resizable>
		);
	};

	const showHidden = (i, checked) => {
		setColumns(columns.map(v => {
			v.index == i && (v.isHidden = !checked)
			return v
		}))
	}
	// type: 操作 - 'add', 'remove', 'edit'
	const toolCallback = argus => {
		props.toolCallback(argus)
	}
	const renderTable = (
		<>
			<Spin
				wrapperClassName="table-custom-loading"
				spinning={loading}
				delay={500}
			/>
			{
				tool ?
					<ToolBar
						scope={scope}
						selectedRows={selectedRows}
						originalColumns={props.columns}
						columns={columns}
						getList={props.getList}
						action={props.action}
						cancelCls={cancelCls}
						callback={toolCallback}
						showHidden={showHidden}
						askFor={() => columns}
						customTool={props.customTool}
					/> :
					null
			}
			<Table
				className="enhance-table"
				tableLayout='fixed'
				bordered
				size="small"
				dataSource={dataSource}
				columns={columns.filter(v => !v.isHidden)}
				pagination={pagination || false}
				rowSelection={rowSelection}
				scroll={scroll}
				components={{
					header: {
						cell: ResizeableTitle,
					},
				}}
				onRow={(record, index) => ({
					onClick: event => onRowClick(record, index, event),
					className: cancelCls
				})}
			/>
		</>
	)
	const onResizeStop = (e, dir, refToElement, dela, postion) => {
		setScroll({
			...scroll,
			y: refToElement.offsetHeight - refToElement.querySelector('thead').offsetHeight - num
		})
	}
	const render = () => {
		const cls = "enhance-table-container " + uuId;
		if (!columns.length) {
			return null
		}
		let jsx = <div className={cls}>{renderTable}</div>
		if (props.drag) {
			jsx = (
				<Rnd
					className={cls}
					minHeight={500}
					minWidth={800}
					cancel={"." + cancelCls}
					onResizeStop={onResizeStop}
				>
					<div className="inner-packing">
						{renderTable}
					</div>
				</Rnd>
			)
		}
		return <DragProvider>{jsx}</DragProvider>
	}
	React.useEffect(() => {
		if ((!props.dataSource.length && dataSource.length) || props.dataSource.length) {
			dispatch(changeDataSource(
				store.current.cacheDataSource = utils.createTableDataSource(props.dataSource)
			))
		}
	}, [props.dataSource]);

	React.useEffect(() => {
		if (props.columns.length) {
			const { columns, allCacheChildrenList, allCacheList } = utils.createTableColumns(props.columns, item => {
				item.onHeaderCell = onHeaderCell
				item.render = renderItem
			})
			store.current.allCacheChildrenList = allCacheChildrenList
			store.current.allCacheList = allCacheList
			setColumns(columns)
		}
	}, [props.columns]);

	React.useEffect(() => {
		store.current = {
			...store.current,
			columns,
			pagination
		}
	}, [columns, pagination])
	React.useEffect(() => {
		if (Object.values(props.pagination || []).length) {
			const { pageSize, pageIndex: current = 1, rowCount: total } = props.pagination;
			dispatch(changePagination({
				pageSize,
				current,
				total,
			}))
		}
	}, [props.pagination]);

	React.useEffect(() => {
		setSelectionType(props.selectionType);
	}, [props.selectionType]);

	function transform(selectedRowKeys) {
		const result = [];
		for (let i = 0; i < selectedRowKeys.length; i++) {
			const item = store.current.cacheDataSource.filter(v => v.key == selectedRowKeys[i])
			if (item.length) {
				result.push(...item)
			}
			if (result.length == selectedRowKeys.length) {
				break
			}
		}
		return result
	}

	React.useEffect(() => {
		dispatch(changeSelect({
			selectedRowKeys: props.selectedRowKeys,
			selectedRows: transform(props.selectedRowKeys),
		}))
	}, [props.selectedRowKeys]);

	React.useEffect(() => {
		if (props.drag) {
			store.current.dragTimer = setInterval(() => {
				const rootNode = document.querySelector('.enhance-table-container.react-draggable');
				if (rootNode) {
					clearInterval(store.current.dragTimer)
					setScroll({
						...scroll,
						y: rootNode.offsetHeight - rootNode.querySelector('thead').offsetHeight - num
					})
				}
			}, 500)
		}
	}, [props.drag])

	return render();
};

EnhanceTable.defaultProps = {
	scope: {},
	dataSource: [],
	columns: [],
	selectedRowKeys: [],
	selectionType: 'checkbox',
	scroll: { y: 200 },
	getDataSoucre: () => new Promise(),
	getList: () => new Promise(),
	toolCallback: () => { },
	sortCallback: () => { },
	customTool: () => null,
	rowSelectionChangeCallback: () => { },
};

EnhanceTable.propTypes = {
	scope: PropTypes.object,
	columns: PropTypes.arrayOf(PropTypes.object),
	dataSource: PropTypes.arrayOf(PropTypes.object),
	selectionType: PropTypes.oneOf(['checkbox', 'radio']),
	scroll: PropTypes.object,
	getDataSoucre: PropTypes.func,
	pagination: PropTypes.object,
	action: PropTypes.string,
	getList: PropTypes.func,
	toolCallback: PropTypes.func,
	sortCallback: PropTypes.func,
	customTool: PropTypes.func,
	rowSelectionChangeCallback: PropTypes.func,
	drag: PropTypes.bool,
	selectedRowKeys: PropTypes.array,
	tool: PropTypes.bool
};

export default useMemoHoc(EnhanceTable);