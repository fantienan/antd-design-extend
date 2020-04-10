
// @ts-nocheck
import ioContext from '../utils/http/io-context';

ioContext.create('selectTree', {
    getEntityList: {
        url: '/api/forestarui_v0.4/form/getEntityList.do',
        method: "POST",
        formData: true
    },
    pageSelect: {
        url: '/api/forestarui_v0.4/form/pageSelect.do',
        method: "POST",
        formData: true
    },
})
export default ioContext.api.selectTree

