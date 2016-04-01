import Webiny from 'Webiny';
import CheckboxGroup from './CheckboxGroup';

class CheckboxGroupContainer extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: {}
        };

        this.lastUsedSource = null;

        this.bindMethods('prepareOptions,renderOptions');
    }

    componentDidMount() {
        super.componentDidMount();
        this.prepareOptions(this.props);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps();
        this.prepareOptions(props);
    }

    prepareOptions(props) {
        const options = {};

        if (props.options) {
            // Possible scenarios: function, object with key:value pairs
            if (_.isFunction(props.options)) {
                if (props.options === this.lastUsedSource) {
                    return;
                }
                this.lastUsedSource = props.options;

                return Q(props.options()).then(options => {
                    const valueAttr = options.valueAttr || props.valueAttr;
                    const textAttr = options.textAttr || props.textAttr;

                    if (_.isPlainObject(options)) {
                        options = options.data;
                    }
                    
                    this.setState({options: this.renderOptions(options, valueAttr, textAttr)});
                });
            } else {
                return this.setState({options: props.options});
            }
        }

        if (props.api) {
            const sourceFingerprint = props.api + JSON.stringify(props.apiParams || {});
            if (this.lastUsedSource === sourceFingerprint) {
                return;
            }

            this.lastUsedSource = sourceFingerprint;
            return new Webiny.Api.Entity(props.api).crudList(props.apiParams || {}).then(apiResponse => {
                const options = this.renderOptions(apiResponse.getData().list, props.valueAttr, props.textAttr);
                this.setState({options});
            });
        }

        if (props.children) {
            React.Children.map(props.children, child => {
                if(child.type === 'checkbox'){
                    options[child.props.value] = child.props.children;
                }
            });
            return this.setState({options});
        }

    }

    renderOptions(data, valueAttr, textAttr) {
        const options = {};
        _.each(data, option => {
            options[option[valueAttr || 'id']] = option[textAttr];
        });

        return options;
    }

    render() {
        return (
            <CheckboxGroup {...this.props} options={this.state.options}/>
        );
    }
}

export default CheckboxGroupContainer;