import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class BaseContainer extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            model: {}
        };

        this.mainForm = null;
        this.formsCount = 0;
        this.linkedForms = [];

        this.bindMethods(
            'registerForm',
            'loadData',
            'getData',
            'setData',
            'onSubmit',
            'onInvalid',
            'onReset',
            'onCancel',
            'getContent',
            'prepareChildren',
            'prepareChild',
            'submit',
            'reset',
            'validate',
            'cancel'
        );
    }

    componentWillMount() {
        super.componentWillMount();
        this.setState({model: _.merge({}, this.props.defaultModel || {})});
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);
        this.formsCount = 0;
    }

    componentWillUpdate(nextProps, nextState) {
        super.componentWillUpdate(nextProps, nextState);
        this.formsCount = 0;
    }

    /* eslint-disable */

    loadData(id = null) {
        throw new Error('Implement loadData method in your form container class!');
    }

    /* eslint-enable */

    /**
     * Get form container data, or data key value
     * @param key
     * @returns {*}
     */
    getData(key = null) {
        const data = _.merge({}, this.state.model, this.mainForm.getData());
        if (key) {
            return _.get(data, key);
        }

        return data;
    }

    setData(data) {
        this.setState({model: data});
        return this;
    }

    submit(e) {
        // This should pass 'submit' signal to the main form
        return this.mainForm.submit(e);
    }

    validate() {
        // This should pass 'validate' signal to the main form
        return this.mainForm.validate();
    }

    reset() {
        // This should pass 'reset' signal to the main form
        return this.mainForm.reset();
    }

    cancel() {
        // This should pass 'cancel' signal to the main form
        return this.mainForm.cancel();
    }

    /* eslint-disable */
    onSubmit(data) {
        throw new Error('Implement onSubmit method in your form container class!');
    }

    /* eslint-enable */

    onInvalid() {
        console.log('Form Container [ON INVALID]');
    }

    onReset() {
        if (this.props.onReset) {
            this.props.onReset();
        }
    }

    onCancel() {
        console.log('Form Container [ON CANCEL]');
        if (_.isString(this.props.onCancel)) {
            Webiny.Router.goToRoute(this.props.onCancel);
        } else if (_.isFunction(this.props.onCancel)) {
            this.props.onCancel();
        }
    }

    prepareChild(child, index) {
        if (typeof child !== 'object' || child === null) {
            return child;
        }

        const props = _.clone(child.props);
        props.key = index;
        // Pass model, container, ui and callbacks to each form you encounter
        if (child.type === Ui.Form.Form || child.type.prototype instanceof Ui.Form.Form) {
            this.formsCount++;

            // Pass relevant props from BaseContainer to Form
            _.each(_.omit(this.props, ['renderer']), (value, name) => {
                if (_.startsWith(name, 'render') || _.startsWith(name, 'option') || _.startsWith(name, 'onChange') || name === 'title') {
                    props[name] = value;
                }
            });

            props.data = _.clone(this.state.model);

            props.container = this;
            if (!props.ui) {
                props.ui = props.name = this.props.ui + '-' + this.formsCount;
            }
            props.title = _.get(props, 'title', this.props.title);

            // These callbacks are only passed to the main form
            // On form submit...
            props.onSubmit = data => {
                // Merge initial Container data with new data received from all forms
                const newData = _.assign({}, this.state.model, data);
                this.setState({model: Webiny.Tools.removeKeys(newData)});

                // If onSubmit was passed through props, execute it. Otherwise proceed with default behaviour.
                if (this.props.onSubmit) {
                    return this.props.onSubmit(newData, this);
                }
                return this.onSubmit(newData);
            };
            props.onReset = this.onReset;
            props.onCancel = this.onCancel;

            // onInvalid callback requires special handling and is passed to ALL linked forms
            // We need to call the invalid callback defined on the form itself + the one passed via props
            const invalidCallback = props.onInvalid;
            props.onInvalid = () => {
                invalidCallback();
                if (this.props.onInvalid) {
                    this.props.onInvalid.call(this);
                } else {
                    this.onInvalid();
                }
            };

            return React.cloneElement(child, props);
        }

        return React.cloneElement(child, props, this.prepareChildren(props.children));
    }

    prepareChildren(children) {
        if (typeof children !== 'object' || children === null) {
            return children;
        }
        return React.Children.map(children, this.prepareChild);
    }

    /**
     * Get ApiContainer content
     * @param params Optional params to pass to content render function
     * @returns {*}
     */
    getContent(...params) {
        const children = this.props.children;
        if (_.isFunction(children)) {
            if (params.length === 0) {
                params = [this, _.clone(this.state.model), this];
            } else {
                params.unshift(this);
                params.push(this);
            }
            return this.prepareChildren(children.call(...params));
        }
        return this.prepareChildren(children);
    }

    registerForm(form) {
        if (!this.mainForm) {
            this.mainForm = form;
            return this;
        }
        this.linkedForms.push(form);
        return this;
    }

    getLinkedForms() {
        return this.linkedForms;
    }
}

BaseContainer.defaultProps = {
    renderer() {
        return (
            <webiny-form-container>{this.getContent()}</webiny-form-container>
        );
    }
};

export default BaseContainer;