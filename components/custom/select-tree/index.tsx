// @ts-nocheck
import * as React from 'react';
import { Select } from '../../index';
import PropTypes from 'prop-types';
import { stringify, debounce, isObject, isFunction } from '../utils/tools';
import Tree from '../tree';
import { LIST_HEIGHT, LIST_ROW_HEIGHT, DEFAULT_NAME_KEY, DEFAULT_VALUE_KEY } from '../utils';
import { TYPE_MAP } from '../form/config';
import NoData from '../no-data';

class SelectTree extends React.Component {
	static defaultProps = {
		list: [],
		showSearch: false,
		selectedList: [],
		allowClear: true,
		listHeight: LIST_HEIGHT,
		listRowHeight: LIST_ROW_HEIGHT,
		nameKey: DEFAULT_NAME_KEY,
		valueKey: DEFAULT_VALUE_KEY,
		onChange: () => { },
		needMiddle: false
	}

	static propTypes = {
		list: PropTypes.array, // 数据
		listHeight: PropTypes.number, // 树组件容器的高度
		showSearch: PropTypes.bool, // 搜索功能
		selectedList: PropTypes.array, // 下拉框中的值
		mode: PropTypes.string, // 设置 Select 的模式为多选(multiple)或标签(tags)
		allowClear: PropTypes.bool, // 是否支持清除
		onChange: PropTypes.func,
		getList: PropTypes.func,
		needMiddle: PropTypes.bool,
	}

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			open: false,
			...SelectTree.initList(props)
		}
		this.state.mode = !props.needMiddle ? undefined : 'multiple';
		this.treeRef = React.createRef();
	}

	UNSAFE_componentWillReceiveProps(nextProps, preProps) {
		if (JSON.stringify(nextProps.selectedList) != JSON.stringify(preProps.selectedList || [])) {
			this.setState({ ...SelectTree.initList(nextProps) })
		}
	}

	// static getDerivedStateFromProps(nextProps, prevState) {
	// 	const result = JSON.stringify(nextProps.selectedList) != JSON.stringify(prevState.selectedList) ?
	// 		SelectTree.initList(nextProps) :
	// 		prevState
	// 	return result
	// }

	// 初始化值和选中状态
	static initList = props => {
		const { selectedList: s, list: l, valueKey, nameKey } = props;
		const selectedList = stringify(s);
		const list = stringify(l);
		if (!selectedList.length) {
			list.forEach(v => v.checked = false)
			return { selectedList, list }
		}
		if (isObject(selectedList[0])) {
			list.length && selectedList.map(v => {
				list.forEach(c => {
					v[valueKey] == c[valueKey] && (c.checked = true)
				})
			})
			return {
				selectedList: SelectTree.formatData(selectedList),
				list
			}
		}
		if (list) {
			for (let i = 0; i < selectedList.length; i++) {
				let label = '';
				for (let j = 0; j < list.length; j++) {
					if (list[j][valueKey] == selectedList[i]) {
						label = list[j][nameKey]
						list[j].checked = true
					}
				}
				selectedList[i] = {
					key: selectedList[i],
					label: <div className="selected-label-box">{label}</div>
				}
			}
			return { selectedList, list }
		}
		return { selectedList, list }
	}

	// 搜索规则
	searchRules = (value = '', searchValue = '') => {
		return value.includes(searchValue)
	}
	// 递归扁平化数据
	patch = (list) => {
		let result = [];
		for (let i = 0; i < list.length; i++) {
			let node = list[i];
			result.push(node)
			if ((node.children || []).length) {
				const flatData = this.flattening(node.children)
				result = [...result, ...flatData]
			}
		}
		return result
	}

	flattening = (children, result = []) => {
		for (let i = 0; i < children.length; i++) {
			result.push(children[i])
			if ((children[i].children || []).length) {
				this.flattening(children[i].children, result)
			}
		}
		return result
	}

	// 搜索有问题 待修复
	onSearch = debounce(({ data }) => {
	}, 500)

	/**
	 * @param {object[]} selectedList - 选中节点的数据集合
	 * @param {string} type - 操作类型 'check'
	 * **/
	treeCallback = ({ type, selectedList, target }) => {
		if (type == 'check') {
			const param = this.state.mode ? selectedList : [target];
			this.props.onChange({selectedList: param, list: this.state.list });
			this.onSelect(param)
		}
	}

	onSelect = (selectedList) => {
		this.setState({
			selectedList: SelectTree.formatData(selectedList)
		})
	}

	static formatData = (selectedList) => selectedList.reduce((acc, cur) => {
		acc.push({
			key: cur.value,
			label: <div className="selected-label-box">{cur.label}</div>,
		})
		return acc
	}, [])

	onDeselect = cancelValue => {
		// 更新树的状态
		this.treeRef.current && this.treeRef.current.reload({ cancelValue })
	}

	// 选中、取消选中时 tree的状态没有同步
	onChange = (selectedList = []) => {
		this.setState({
			selectedList
		})
		// 只用在点击批量删除时
		if (selectedList.length === 0) {
			// 更新树的状态
			this.treeRef.current && this.treeRef.current.reload({ selectedList })
		}
		this.props.onChange({selectedList, list: this.state.list });
	}

	renderDropdown = menu => (
		this.state.list.length ? (
			<div
				// onMouseDown={e => { e.preventDefault() }}
				style={{ height: this.props.listHeight }}
				className="custom-dropdown"
			>
				<Tree
					ref={this.treeRef}
					list={this.state.list}
					calculateTheHeightWhenResize={false}
					listHeight={this.props.listHeight}
					showSearch={this.props.showSearch}
					needPrefix={this.props.needPrefix}
					needSuffix={this.props.needSuffix}
					needMiddle={this.props.needMiddle}
					callback={this.treeCallback}
				/>
			</div>
		) : (
				<NoData />
			)
	) 
	getConfig = () => {
		const { open, loading, list = [] } = this.state;
		const { getList } = this.props;
		return !list.length && isFunction(getList) ? {
			open,
			onDropdownVisibleChange: async open => {
				// 获取数据
				if (!list.length && isFunction(getList) && open) {
					this.setState({ loading: true })
					const { data } = await getList()
					this.setState({
						loading: false,
						list: TYPE_MAP.SELECT_TREE.format({ data })
					})
				}
				this.setState({ open })
			}
		} : {}
	}
	render() {
		const {
			listHeight,
			showSearch,
			allowClear,
			getList
		} = this.props;

		const {
			list,
			selectValue,
			loading,
			selectedList,
			mode
		} = this.state;
		const c = showSearch ? {
			showSearch,
			onSearch: this.onSearch
		} : {};
		return (
			<Select
				{...c}
				{...this.getConfig()}
				maxTagCount={2}
				mode={mode}
				style={{ width: 220 }}
				loading={loading}
				value={selectedList}
				onDeselect={this.onDeselect}
				onChange={this.onChange}
				allowClear={allowClear}
				labelInValue={true}
				dropdownRender={this.renderDropdown}
			/>
		)
	}
}

export default SelectTree