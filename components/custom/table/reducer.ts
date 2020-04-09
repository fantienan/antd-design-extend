// @ts-nocheck
import utils from './utils';
import { isObject, isUndefined } from '../utils/tools';

export function initialState(state) {
	if (!isObject(state)) {
		throw 'state must be object';
	}
	return state
};

export const changeLoading = data => ({
	type: 'loading',
	data
})
export const changeDataSource = data => ({
	type: 'dataSource',
	data
})
export const changePagination = data => ({
	type: 'pagination',
	data
})
export const changePaging = data => ({
	type: 'paging',
	data
})
export const changeSelect = data => ({
	type: 'select',
	data
})

export function reducer(state, { type, data }) {
	switch (type) {
		case 'loading':
			return {
				...state,
				loading: data || false
			}
		// 改变数据源
		case 'dataSource':
			return {
				...state,
				dataSource: utils.createTableDataSource(data)
			}
		// 改变分页
		case 'pagination':
			return {
				...state,
				pagination: {
					...state.pagination,
					...data
				}
			}
		// 翻页
		case 'paging':
			return {
				...state,
				dataSource: utils.createTableDataSource(data.dataSource),
				pagination: {
					...state.pagination,
					...{
						pageSize: data.pagination.pageSize,
						current: data.pagination.pageIndex,
						total: data.pagination.rowCount
					}
				},
				loading: data.loading || false
			}
		case 'select':
			return {
				...state,
				...data
			}
		case 'selectedRowKeys':
			break;
		case 'selectedRows':
			break;
		default:
			throw '没有匹配到action.type';
	}
}