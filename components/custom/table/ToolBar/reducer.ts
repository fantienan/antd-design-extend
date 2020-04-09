// @ts-nocheck
export const formatColumns = data => data.map(v => {
	return {
		title: v.title,
		index: v.index,
		checked: v.isHidden ? false : v.checked == undefined ? true : v.checked,
	}
})

export const changeColumns = data => ({
	type: 'columns',
	data: formatColumns(data)
})

export const update = data => ({
	type: 'update',
	data
})

export function reducer(state, { type, data }) {
	switch (type) {
		case 'columns':
			return {
				...state,
				columns: data
			}
		case 'update':
			return {
				...state,
				columns: data.columns,
				visible: data.visible
			}
		default:
			throw '没有匹配到action.type';
	}
}