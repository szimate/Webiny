import Webiny from 'Webiny';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';

class FormView extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.bindMethods('parseLayout');
    }

    parseLayout(children) {
        this.headerComponent = null;
        this.bodyComponent = null;
        this.footerComponent = null;
        this.errorComponent = null;

        if (typeof children !== 'object' || children === null) {
            return children;
        }

        const {Form} = this.props;
        // Loop through View elements and detect header/body/footer components
        React.Children.map(children, child => {
            if (Webiny.isElementOfType(child, Header)) {
                this.headerComponent = child;
                return;
            }

            if (Webiny.isElementOfType(child, Body)) {
                // Check if form loader exists in body
                let loader = null;
                React.Children.map(child.props.children, bodyChild => {
                    if (Webiny.isElementOfType(bodyChild, Form.Loader)) {
                        loader = true;
                    }
                });

                if (loader) {
                    // We have our body element
                    this.bodyComponent = child;
                } else {
                    try {
                        // We need to create form loader ourselves
                        const bodyChildren = React.Children.toArray(child.props.children);
                        bodyChildren.push(<Form.Loader key="loader" show={this.props.form.isLoading()}/>);
                        this.bodyComponent = React.cloneElement(child, child.props, bodyChildren);
                    } catch (e) {
                        console.log(e)
                    }
                }
                return;
            }

            if (Webiny.isElementOfType(child, Footer)) {
                this.footerComponent = child;
                return;
            }

            if (Webiny.isElementOfType(child, Form.Error)) {
                this.errorComponent = React.cloneElement(child, _.merge(child.props, {error: this.props.form.getError()}));
            }
        });

        if (!this.errorComponent) {
            try {
                this.errorComponent = <Form.Error error={this.props.form.getError()}/>;
            } catch (e) {
                console.log(e);
            }
        }
    }

    componentWillMount() {
        super.componentWillMount();
        this.parseLayout(this.props.children);
    }

    componentWillUpdate(nextProps, nextState) {
        super.componentWillUpdate(nextProps, nextState);
        this.parseLayout(nextProps.children);
    }
}

FormView.defaultProps = {
    formInject: true,
    renderer() {
        const {Panel} = this.props;
        return (
            <view>
                {this.headerComponent}
                <div className="view-content">
                    {this.errorComponent}
                    <Panel className={'panel--boxed'}>
                        {this.bodyComponent}
                        {this.footerComponent}
                    </Panel>
                </div>
            </view>
        );
    }
};

export default Webiny.createComponent(FormView, {modules: ['Panel', 'Form']});