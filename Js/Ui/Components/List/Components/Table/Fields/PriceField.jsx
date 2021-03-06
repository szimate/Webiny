import React from 'react';
import _ from 'lodash';
import Webiny from 'webiny';

class PriceField extends Webiny.Ui.Component {

}

PriceField.defaultProps = {
    renderer() {
        const value = _.get(this.props.data, this.props.name);
        const {List, accounting, ...props} = this.props;

        return (
            <List.Table.Field {..._.omit(props, ['renderer'])}>
                {() => value ? accounting.formatMoney(value) : this.props.default}
            </List.Table.Field>
        );
    }
};

export default Webiny.createComponent(PriceField, {
    modules: ['List', {accounting: 'Webiny/Vendors/Accounting'}],
    tableField: true
});