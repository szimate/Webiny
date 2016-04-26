import Field from './../Field';

class DateField extends Field {

}

DateField.defaultProps = _.merge({}, Field.defaultProps, {
    format: 'YYYY-MM-DD',
    renderer() {
        return (
            <td className={this.getTdClasses()}>{moment(_.get(this.props.data, this.props.name)).format(this.props.format)}</td>
        );
    }
});

export default DateField;