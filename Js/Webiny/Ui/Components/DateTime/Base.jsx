import Webiny from 'Webiny';

class Base extends Webiny.Ui.FormComponent {

    constructor(props) {
        super(props);
        this.valueChanged = false;

        this.bindMethods('setValue');
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps['disabledBy']) {
            return true;
        }

        const omit = ['children', 'key', 'ref', 'onChange'];
        const oldProps = _.omit(this.props, omit);
        const newProps = _.omit(nextProps, omit);

        return !_.isEqual(newProps, oldProps) || !_.isEqual(nextState, this.state);
    }

    /**
     * Initialize DateTimePicker
     * @url https://eonasdan.github.io/bootstrap-datetimepicker/
     */
    componentDidMount() {
        super.componentDidMount();
        this.input = $(ReactDOM.findDOMNode(this)).find('input');
        this.input.datetimepicker({
            format: this.props.inputFormat,
            stepping: this.props.stepping,
            keepOpen: false,
            debug: this.props.debug || false,
            minDate: this.props.minDate ? new Date(this.props.minDate) : false,
            viewMode: this.props.viewMode,
            widgetPositioning: {
                horizontal: this.props.positionHorizontal || 'auto',
                vertical: this.props.positionVertical || 'bottom'
            }
        }).on('dp.hide', e => {
            if (this.valueChanged) {
                this.onChange(e.target.value);
            }
            this.valueChanged = false;
        }).on('dp.change', () => {
            this.valueChanged = true;
        });

        this.setValue(this.props.value);
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this.setValue(this.props.value);
    }

    setValue(newValue) {
        this.input.val(newValue);

        if (this.props.minDate) {
            this.input.data('DateTimePicker').minDate(new Date(this.props.minDate));
        }
    }

    onChange(value) {
        this.props.onChange(value, this.validate);
    }
}

Base.defaultProps = _.merge({}, Webiny.Ui.FormComponent.defaultProps, {
    debug: false,
    withTimezone: true,
    renderer() {
        const cssConfig = {
            'form-group': true,
            'error': this.state.isValid === false,
            'success': this.state.isValid === true
        };

        const props = {
            onBlur: this.validate,
            disabled: this.isDisabled(),
            readOnly: this.props.readOnly,
            type: 'text',
            className: this.classSet('form-control', {placeholder: !this.props.value}),
            value: this.props.value || '',
            onChange: _.noop,
            placeholder: this.getPlaceholder()
        };

        return (
            <div className={this.classSet(cssConfig)}>
                {this.renderLabel()}
                <div className="input-group date">
                    <input {...props}/>
                    <span className="input-group-addon cursor">
                        <i className="icon-calendar icon_c"></i>
                    </span>
                </div>
                {this.renderValidationMessage()}
            </div>
        );
    }
});

export default Base;