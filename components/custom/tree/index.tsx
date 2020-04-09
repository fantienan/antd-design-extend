// @ts-nocheck
import * as React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import { Checkbox } from '../../index';
import {
	FolderOutlined,
	FolderOpenOutlined,
	LoadingOutlined,
	MoreOutlined,
} from '@ant-design/icons';
import * as _ from 'lodash';
import { debounce, stringify, isArray, isUndefined } from '../utils/tools';
import { LIST_HEIGHT, LIST_ROW_HEIGHT, DEFAULT_NAME_KEY, DEFAULT_VALUE_KEY } from '../utils';
import { utils } from '../form'
import './styles.less';

const WIDTH = 20; // 前缀、后缀的宽度
const CHECKED = 'checked'; // 选中
const CANCEL_CHECKED = 'cancelChecked'; // 取消选中

function DefaultPrefix({ state = {}, isLeaf, id } = {}) {
	const { isOpen } = state;
	return isLeaf === false ?
		<div className="prefix-icon-box">
			{
				isOpen ? <FolderOpenOutlined /> : <FolderOutlined />
			}
		</div> : null
}

function DeafultLoading() {
	return <div className="prefix-icon-box">
		<LoadingOutlined />
	</div>
}

// 前缀
function RowPrefix(props, ref) {
	const rPRef = React.useRef();
	const { prefix: Prefix, item, paddingLeft: p } = props;
	const [loading, setLoading] = React.useState((item.state || {}).loading);
	const [open, setOpen] = React.useState();
	const tier = (item.path || '').split('-').filter(_ => _).length || 1;
	const paddingLeft = p * (tier - 1);
	const width = paddingLeft + WIDTH;
	// 区分loading，渲染content
	const renderContent = () => {
		if (loading) {
			return <DeafultLoading />
		}
		// 空文件夹
		const config = { ...item }
		if (item.isLeaf && (item.children || []).length == 0) {
			config.state = {
				...config.state,
				isOpen: open
			}
		}
		return <Prefix {...config} />
	}

	React.useImperativeHandle(ref, () => ({
		setLoading,
		setOpen, // 处理空文件夹打开、关闭
	}))

	React.useEffect(() => {
		setLoading(false)
	}, [])

	return (
		<div
			style={{ paddingLeft, width }}
			className="virtualized-tree-node-prefix"
			ref={rPRef}
			onClick={props.clickHandle}
		>
			{renderContent()}
		</div>
	)
}
const EnhanceRowPrefix = React.forwardRef(RowPrefix)

function DefaultSuffix(item) {
	return <div className="suffix-icon-box" style={{ width: WIDTH }}>
		<MoreOutlined />
	</div>
}

// 后缀
function RowSuffix(props) {
	const { suffix: Suffix, callback, item } = props
	return (
		<div
			className="virtualized-tree-node-suffix"
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			<Suffix {...item} />
		</div>
	)
}

function DefaultMiddle({ state = {} }) {
	const { checkDisabled, checked } = state
	return <div className="middle-checkbox">
		<Checkbox
			checked={checked}
			disabled={checkDisabled}
		/>
	</div>
}
class RowMiddle extends React.Component {
	constructor(props) {
		super(props);
		this.timer = null;
		this.state = {
			item: props.item,
		}
	}

	// UNSAFE_componentWillReceiveProps(nextProps, preProps) {
	// 	this.setState({
	// 		item: nextProps.item
	// 	})
	// }

	static getDerivedStateFromProps(nextProps, prevState) {
		return {
			item: nextProps.item
		}
	}

	onClick = (e) => {
		e.stopPropagation();
		const checked = e.target.checked
		window.clearTimeout(this.timer)
		this.timer = setTimeout(() => {
			this.check(checked)
			// 同步选中状态
			this.props.checkHandle(checked);
		}, 300)
	}

	check = checked => {
		const item = this.state.item;
		item.checked = checked;
		item.state = {
			...item.state,
			checked
		};
		this.setState({
			item
		});
	}

	render() {
		const { middle: Middle } = this.props
		const { item } = this.state;
		return (
			<div className="middle-prefix" onClick={this.onClick}>
				<Middle {...item} />
			</div>
		)
	}
}

function Row(props) {
	const {
		styles,
		index,
		list,
		item,
		prefix,
		suffix,
		middle,
		nameKey,
		needPrefix,
		needSuffix,
		needMiddle,
		paddingLeft,
		suffixCallback,
		middleCallback,
		asyncUpdateData,
		asyncLoadData
	} = props;
	let timer = null;
	const rowPrefixRef = React.useRef();
	const middleRef = React.useRef();
	// 展开父节点时，为展开的子节点插入其子节点
	const patch = (children, result = []) => {
		for (let i = 0; i < children.length; i++) {
			// 当前子节点
			const targetNode = children[i];
			result.push(targetNode)
			// 下一个子节点
			const siblingNode = children[i + 1] || { path: '' };

			// 1.是展开的子节点 
			// 2.下一个兄弟节点不是当前子节点的子节点
			// 3.为展开状态的子节点插入其子节点
			const pattern = new RegExp(`^${targetNode.path || ''}`)
			if (
				(targetNode.state || {}).isOpen &&
				!pattern.test(siblingNode.path) &&
				(targetNode.children || []).length
			) {
				patch(targetNode.children, result)
			}
		}
		return result
	}
	// 防抖
	const clickHandle = debounce(async ({ list }) => {
		let {
			state = {},
			children = [],
			path,
			isLeaf = true
		} = list[index];
		// 叶子节点的处理待扩展
		if (isLeaf) {
			return
		}

		// 不是叶子节点并且children.length === 0
		// 异步加载数据
		if (children.length === 0 && isLeaf == false && asyncLoadData) {
			// 同步状态
			list[index].state = {
				...state,
				loading: true
			};
			asyncUpdateData({ list });
			// 切换loading图标
			rowPrefixRef.current.setLoading(true);
			const { data } = await asyncLoadData();
			// 赋值
			list[index].children = children = data;
			// 同步当前loading
			asyncUpdateData({ list });

			if (rowPrefixRef.current) {
				rowPrefixRef.current.setLoading(false);
			} else {
				// 处理 loading状态的Row滑出(卸载)、滑入(挂载)
			}
		}
		const isOpen = !state.isOpen;
		// 展开、收起
		list[index].state = {
			...list[index].state,
			isOpen,
			loading: false
		}

		if (children.length) {
			const front = list.slice(0, index + 1);
			let back = list.slice(index + 1);
			// 展开 插入数据
			if (isOpen) {

				const patchData = patch(children)
				list = [...front, ...patchData, ...back]
			} else {
				// 收起 删除数据
				// 向后找没找到就说明后面都是其子节点
				let num = back.length;
				const pattern = new RegExp(`^${path}`);
				for (let i = 0; i < back.length; i++) {
					if (!pattern.test(back[i].path || '')) {
						num = i;
						break;
					}
				}

				back.splice(0, num)
				list = [...front, ...back]
			}
		} else if (isLeaf === false) {
			// 空文件夹的打开、关闭
			rowPrefixRef.current.setOpen(isOpen)
		}

		asyncUpdateData({ list })
		// 不深拷贝list，保持引用地址相同，可以记住子级的状态（打开、选中...）
	}, 300, { list/* : stringify(list) */ })

	const createItem = (v) => {
		const copy = stringify(v);
		delete copy.children;
		return v
	}

	/**
	 * 批量更新选中状态(全选、取消全选)
	 * 并返回选中状态的节点
	 * @param {object[]} data - 树
	 * @param {bool} checked - 当前节点的选中状态
	 * @param {array} result - 当前节点其被选中的子孙节点的信息
	 * 
	 * @true result 当前节点其被选中的子孙节点的信息
	 * **/
	const patchCheckState = (data, checked, result) => {
		data.forEach(v => {
			v.state = {
				...v.state,
				checked
			}
			// 获取子节点
			isArray(result) && result.push(createItem(v));
			if ((v.children || []).length) {
				patchCheckState(v.children, checked, result);
			}
		})
		return result
	}


	const checkHandle = (checked) => {
		const { isLeaf, children = [], state = {}, path } = list[index];
		// 不需要中缀时
		if (!needMiddle) {
			checked = true;
		} else if (isUndefined(checked)) {
			checked = !state.checked;
			middleRef.current.check(checked);
		}
		let reload = false;
		list[index].state = {
			...state,
			checked
		};
		// 选中的节点信息
		let data = [createItem(list[index])];

		// 当前不是叶子节点 并且 有子节点就更新节点选中状态
		if (!isLeaf && children) {
			// 并且当前节点是打开的状态 需要更新整棵树
			reload = state.isOpen
			/**
			 * 更新子节点数据中的选中状态
			 * 	1.当前节点的children中都要更新checked的状态
			 * 	2.当前节点是打开的节点，其子节点是与其平级的
			 * 以上两种情况都要同步节点状态
			 * **/
			// 获取选中节点的信息
			data = [
				...data,
				...patchCheckState( // 1
					children,
					checked,
					[]
				)
			];
			// 2
			if (state.isOpen) {
				const pattern = new RegExp(`^${path}`)
				// 遍历平级的子节点更新节点状态
				for (let i = index; i < list.length; i++) {
					if (pattern.test(list[i].path)) {
						list[i].state = {
							...list[i].state,
							checked
						}
						if ((list[i].children || []).length) {
							patchCheckState(list[i].children, checked)
						}
					} else {
						break;
					}
				}
			}
		}
		asyncUpdateData({
			list,
			type: 'check',
			target: list[index],
			explain: {
				type: checked ? CHECKED : CANCEL_CHECKED, // 选中、取消选中,
				data
			}
		}, reload)
	}

	return (
		<div
			className='virtualized-tree-node'
			style={styles}
		>
			{
				needPrefix ? <EnhanceRowPrefix
					ref={rowPrefixRef}
					prefix={prefix}
					item={item}
					clickHandle={clickHandle}
					paddingLeft={paddingLeft}
				/> : null
			}
			<div className="virtualized-tree-node-middle" onClick={() => checkHandle()}>
				{
					needMiddle ? <RowMiddle
						ref={middleRef}
						middle={middle}
						item={item}
						checkHandle={checkHandle}
						callback={middleCallback}
					/> : null
				}
				<div className="middle-title">
					{item[nameKey]}
				</div>
			</div>
			{
				needSuffix ? <RowSuffix
					suffix={suffix}
					item={item}
					callback={suffixCallback}
				/> : null
			}
		</div>
	)
}


// 带扩展的功能有：单选、多选
export default class Tree extends React.Component {
	static format = argus => utils.formatTreeList(argus)
	// 默认属性
	static defaultProps = {
		list: [],
		listHeight: LIST_HEIGHT,
		listRowHeight: LIST_ROW_HEIGHT,
		scrollToIndex: -1,
		overscanRowCount: 10,
		useDynamicRowHeight: false,
		showScrollingPlaceholder: false,

		diffValue: 0,
		paddingLeft: 20,
		valueKey: DEFAULT_VALUE_KEY,
		nameKey: DEFAULT_NAME_KEY,
		needPrefix: true,
		needSuffix: false,
		needMiddle: true,
		showCheckbox: false,
		prefix: DefaultPrefix,
		suffix: DefaultSuffix,
		middle: DefaultMiddle,
		calculateTheHeightWhenResize: false,
	};

	static propTypes = {
		scrollToIndex: PropTypes.number, // 快速定位
		listRowHeight: PropTypes.number, // 列表行高
		list: PropTypes.array, // 数据源
		overscanRowCount: PropTypes.number, // 预加载
		useDynamicRowHeight: PropTypes.bool, // 使用动态行高度
		listHeight: PropTypes.number,   // 列表高，决定呈现多少行
		showScrollingPlaceholder: PropTypes.bool, // 是否显示正在滚动的状态

		// 自定义属性
		prefix: PropTypes.func, // 前缀
		suffix: PropTypes.func, // 后缀
		middle: PropTypes.func, // 渲染checkbox
		callback: PropTypes.func, // 回调
		needPrefix: PropTypes.bool, // 时候需要前缀
		needSuffix: PropTypes.bool, // 时候需要后缀
		needMiddle: PropTypes.bool, // 时候需要后缀
		nameKey: PropTypes.string, // name key
		valueKey: PropTypes.string, // value key
		diffValue: PropTypes.number, // window resize 计算高时减掉的值
		showCheckbox: PropTypes.bool, // 是否展示chkecbox
		paddingLeft: PropTypes.number, // 每一层级相差的宽度
		asyncLoadData: PropTypes.func, // 异步加载节点数据
		calculateTheHeightWhenResize: PropTypes.bool, // 是否需要在window.resize时计算树的高度
	};
	constructor(props) {
		super(props);
		this.state = {
			...props,
			rowCount: props.list.length,
		};
		if (props.list[0].I_ID) {
			this.state.list = Tree.format({data: props.list})
		}
		this.listRef = React.createRef();
		this.cacheSelectedList = []
	}


	componentDidMount() {
		this.props.calculateTheHeightWhenResize && window.addEventListener('resize', this.handleResize)
	}

	componentWillUnmount() {
		this.props.calculateTheHeightWhenResize && window.removeEventListener('resize', this.handleResize)
	}

	handleResize = () => {
		this.setState({
			listHeight: window.innerHeight - this.state.diffValue
		})
	}

	getRowHeight = () => {
		return 100
	}

	noRowsRenderer = () => {
		return <div className='no-data'>No rows</div>;
	}

	createObject = arr => arr.reduce((acc, cur) => {
		acc[cur[this.props.valueKey]] = cur
		return acc
	}, {})

	// 合并选中的节点信息
	mergeSelectedList = ({ data: d, type }) => {
		const data = stringify(d);
		if (type == CHECKED) {
			// 去重
			this.cacheSelectedList = Object.values({
				...this.createObject(this.cacheSelectedList),
				...this.createObject(data)
			});
		} else if (type == CANCEL_CHECKED) {
			_.pullAllBy(this.cacheSelectedList, data, 'value')
		}
	}

	/**
	 * @param {bool} reload - 是否更新整棵树
	 * @param {object} param
	 * @param {string} param.type - 当前操作类型 'check'
	 * @param {object[]} param.selectedList - 当前节点及子节点选中的节点数据
	 * **/
	asyncUpdateData = (param, reload) => {

		const { list, type, target, explain } = param
		const data = {
			list,
			rowCount: list.length,
		}
		if (reload) {
			const { overscanRowCount: newValue } = this.state;
			const { overscanRowCount: originalValue } = this.props;
			const overscanRowCount = newValue == originalValue ? newValue + 1 : newValue - 1
			data.overscanRowCount = overscanRowCount
		}
		this.setState({
			...data
		})
		// 合并选中的节点信息
		explain && this.mergeSelectedList(explain)
		typeof this.props.callback === 'function' && this.props.callback({
			...param,
			selectedList: this.cacheSelectedList
		})
	}
	// key: 要操作的节点id，undefined时 表示全 不选 
	neep = (data, key) => {
		for (let i = 0; i < data.length; i++) {
			if (data[i].id == key || key === undefined) {
				data[i].state = {
					...data[i].state,
					checked: false
				}
				if (data[i].id == key) {
					break;
				}
			}
			if ((data[i].children || []).length) {
				this.neep(data[i].children, key)
			}
		}
		return data
	}

	// 同步状态
	synchronousState = (cancelValue) => {
		if (cancelValue) { // 取消选中时
			_.pullAllBy(this.cacheSelectedList, [{ id: cancelValue.key }], 'id')
		} else {
			this.cacheSelectedList = []
		}
		const list = this.neep(stringify(this.state.list), (cancelValue || {}).key)
		return list
	}

	/**
	 * @param {object[]} selectedList - 所有选中的节点 
	 * @param {object} cancelValue - 取消选中的节点
	 * **/
	reload = ({ selectedList, cancelValue } = {}) => {
		const { overscanRowCount: newValue } = this.state;
		const { overscanRowCount: originalValue } = this.props;
		const overscanRowCount = newValue == originalValue ? newValue + 1 : newValue - 1;
		const list = this.synchronousState(cancelValue)
		this.setState({ overscanRowCount, list })
	}

	suffixCallback = param => { }
	middleCallback = param => { }

	rowRenderer = ({ index, isScrolling, key, style }) => {
		const {
			list,
			nameKey,
			valueKey,
			paddingLeft,
			useDynamicRowHeight,
			showScrollingPlaceholder,
		} = this.state;
		const {
			prefix,
			suffix,
			middle,
			needPrefix,
			needSuffix,
			needMiddle
		} = this.props;
		const item = this.state.list[index]
		return (
			<Row
				key={key}
				item={item}
				list={list}
				index={index}
				styles={style}
				prefix={prefix}
				suffix={suffix}
				middle={middle}
				nameKey={nameKey}
				valueKey={valueKey}
				needPrefix={needPrefix}
				needSuffix={needSuffix}
				needMiddle={needMiddle}
				paddingLeft={paddingLeft}
				asyncUpdateData={this.asyncUpdateData}
				asyncLoadData={this.props.asyncLoadData}
				suffixCallback={(argus) => this.suffixCallback({ index, ...argus })}
				middleCallback={(argus) => this.middleCallback({ index, ...argus })}
			/>
		);
	}

	render() {
		const {
			list,
			rowCount,
			listHeight,
			scrollToIndex,
			listRowHeight,
			overscanRowCount,
			useDynamicRowHeight,
			showScrollingPlaceholder,
		} = this.state;
		return (
			<div className="virtualized-tree-container">
				<AutoSizer >
					{({ width }) => (
						<List
							ref={this.listRef}
							height={listHeight}
							overscanRowCount={overscanRowCount}
							noRowsRenderer={this.noRowsRenderer}
							rowCount={rowCount}
							rowHeight={
								useDynamicRowHeight ? this.getRowHeight() : listRowHeight
							}
							rowRenderer={this.rowRenderer}
							scrollToIndex={scrollToIndex}
							width={width}
						/>
					)}
				</AutoSizer>
			</div>
		)
	}
}