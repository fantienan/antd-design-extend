// @ts-nocheck
import Form from './Form';
import FormItem from './FormItemWrapper';
import { utils } from './utils'

Form.Item = FormItem;
Form.utils = utils;

export { FormItem, utils}
export default Form;