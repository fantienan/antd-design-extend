// @ts-nocheck
import * as React from 'react';
import PropTypes from 'prop-types';
import { List as VirtualizedList, AutoSizer } from 'react-virtualized';
import { Checkbox, Tooltip } from '../../index';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames'
import * as _ from 'lodash';
import NoData from '../no-data';
import { stringify, isArray } from '../utils/tools';
import { LIST_HEIGHT, LIST_ROW_HEIGHT, DEFAULT_NAME_KEY, DEFAULT_VALUE_KEY, WIDTH } from '../utils';
import './styles.less';

function DefaultPrefix(props) {
	return <div className='prefix-box'>
		<Checkbox {...props} />
	</div>
}

function DefaultSuffix(props) {
	const cls = classNames({
		"suffix-box": true,
		"checked-suffix": props.checked,
	})
	return <div className={cls}>
		<CheckOutlined />
	</div>
}

/**
 * @param {object} props
 * @param {number} props.index - 索引
 * @param {function} props.cacheItemState - 同步选中状态
 * @param {object} props.item - 当前行的数据
 * **/
class Row extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			item: props.item,
			checked: props.item.checked,
			disabled: props.item.disabled
		}
	}

	// UNSAFE_componentWillReceiveProps(nextProps, preProps) {
	// 	this.setState({
	// 		item: nextProps.item,
	// 		checked: nextProps.item.checked,
	// 		disabled: nextProps.item.disabled
	// 	})
	// }

	static getDerivedStateFromProps(nextProps, prevState) {
		return {
			item: nextProps.item,
			checked: nextProps.item.checked,
			disabled: nextProps.item.disabled
		}
	}

	clickHandle = (e) => {
		if (this.state.disabled) return
		const checked = !this.state.checked
		this.setState({
			checked
		})
		this.props.cacheItemState(this.props.index, checked)
	}

	render() {
		const {
			style,
			nameKey,
			needPrefix,
			needSuffix,
			prefix: Prefix,
			suffix: Suffix,
		} = this.props;
		const { item, disabled, checked } = this.state;
		const cls = classNames({
			row: true,
			disabled
		})
		return (
			<div className={cls} style={style} onClick={this.clickHandle}>
				{
					needPrefix ?
						<Prefix
							item={item}
							disabled={disabled}
							checked={checked}
						/> : null
				}
				<Tooltip
					placement="topLeft"
					title={<div>{item[nameKey]}</div>}
				>
					<div className="row-title">{item[nameKey]}</div>
				</Tooltip>
				{
					needSuffix ?
						<Suffix
							item={item}
							disabled={disabled}
							checked={checked}
						/> : null
				}
			</div>
		)
	}
}

class List extends React.Component {
	static defaultProps = {
		list: [],
		listHeight: LIST_HEIGHT, // 容器高度
		listRowHeight: LIST_ROW_HEIGHT, // 行高
		overscanRowCount: 10,// 预加载上下容器外部的行数
		scrollToIndex: -1, // 快速定位
		showScrollingPlaceholder: false, // 是否显示滚动加载中
		useDynamicRowHeight: false, // 动态设置行高
		callback: () => { },
		valueKey: DEFAULT_VALUE_KEY,
		nameKey: DEFAULT_NAME_KEY,
		needPrefix: true,// 是否需要前缀
		needSuffix: false,// 是否需要后缀
		prefix: DefaultPrefix,// 前缀
		suffix: DefaultSuffix,// 后缀
		width: WIDTH
	}
	static propTypes = {
		list: PropTypes.array,
		listHeight: PropTypes.number,
		listRowHeight: PropTypes.number,
		overscanRowCount: PropTypes.number,
		scrollToIndex: PropTypes.number,
		showScrollingPlaceholder: PropTypes.bool,
		useDynamicRowHeight: PropTypes.bool,
		callback: PropTypes.func,
		needPrefix: PropTypes.bool,
		needSuffix: PropTypes.bool,
		prefix: PropTypes.func,
		suffix: PropTypes.func,
		valueKey: PropTypes.string,
		nameKey: PropTypes.string,
		width: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		]),
	}
	constructor(props) {
		super(props);
		this.state = {
			...props,
			rowCount: props.list.length,
		};
		List.cacheList = [...props.list];
		this.ref = React.createRef()
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		const state = {
			scrollToIndex: nextProps.scrollToIndex
		}
		if (
			isArray(nextProps.list) &&
			((!prevState.list.length && nextProps.list.length) || // 赋值
				(prevState.list.length && !nextProps.list.length)) // 清空
		) {
			state.list = nextProps.list
			state.rowCount = nextProps.list.length
			List.cacheList = nextProps.list
		}
		return state
	}

	cacheItemState = (index, checked) => {
		List.cacheList[index].checked = checked;
		const targetItem = { ...List.cacheList[index] }

		this.props.callback({
			selectedList: this.state.list.filter(v => v.checked),
			targetItem
		})
	}

	noRowsRenderer = () => {
		const { width, listHeight } = this.state
		return <div style={{ width, height: listHeight }}>
			<NoData />
		</div>;
	}

	getRowHeight = () => {
		return 100
	}

	rowRenderer = ({ index, isScrolling, key, style }) => {
		const {
			showScrollingPlaceholder,
			useDynamicRowHeight,
			valueKey,
			nameKey,
			needPrefix,
			needSuffix,
			prefix,
			suffix,
		} = this.state;
		const item = List.cacheList[index]
		return (
			<Row
				key={key}
				style={style}
				needPrefix={needPrefix}
				needSuffix={needSuffix}
				prefix={prefix}
				suffix={suffix}
				index={index}
				item={item}
				valueKey={valueKey}
				nameKey={nameKey}
				cacheItemState={this.cacheItemState}
			/>
		);
	}

	/**
	 * 同步状态
	 * cancelValue取消选中的操作
	 * selectedList重新初始化选中状态
	 * **/
	synchronousState = (selectedList = [], cancelValue) => {
		let list = stringify(this.state.list);
		let num = 0;
		const { valueKey } = this.props;
		for (let i = 0; i < list.length; i++) {
			if (cancelValue && list[i][valueKey] == cancelValue.key) {
				list[i].checked = false
				break;
			} else if (selectedList.length) {
				const checked = !!selectedList.find(v => v[valueKey] == list[i][valueKey])
				list[i].checked = checked;
				checked && (num += 1);
				if (num == selectedList.length) {
					break;
				}
			} else if (!cancelValue) {
				list[i].checked = false
			}
		}
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
		const list = this.synchronousState(selectedList, cancelValue)
		List.cacheList = list;
		this.setState({
			overscanRowCount, list
		})
	}

	render() {
		const {
			list,
			listHeight,
			listRowHeight,
			overscanRowCount,
			rowCount,
			scrollToIndex,
			showScrollingPlaceholder,
			useDynamicRowHeight,
			width
		} = this.state;
		return (
			<div className="virtualized-list-container" style={{ width }} onClick={e => e.stopPropagation()}>
				<AutoSizer disableHeight>
					{({ width }) => (
						<VirtualizedList
							ref={this.ref}
							className='react-virtualized-list'
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

export default List 