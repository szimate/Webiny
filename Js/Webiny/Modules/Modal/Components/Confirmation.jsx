import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class Confirmation extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.data = [];
        this.bindMethods('renderContent,onCancel,onConfirm');
    }

    show() {
        this.setState({time: new Date().getTime()});
        super.show();
    }

    onCancel() {
        if (_.isFunction(this.props.onCancel)) {
            return this.props.onCancel(this);
        }
        return this.hide();
    }

    onConfirm() {
        if (_.isFunction(this.props.onConfirm)) {
            const data = _.clone(this.data);
            data.push(this);
            this.props.onConfirm(...data);
        }

        if (this.props.autoHide) {
            this.hide();
        }
    }

    renderContent() {
        let content = this.props.message;
        if (!content) {
            content = this.props.children;
        }

        if (_.isFunction(content)) {
            content = content();
        }
        return content;
    }

    setData(...data) {
        this.data = data;
        return this;
    }
}

Confirmation.defaultProps = {
    title: 'Confirmation dialog',
    confirm: 'Yes',
    cancel: 'No',
    onConfirm: _.noop,
    onCancel: null,
    autoHide: true,
    renderer() {
        return (
            <Ui.Modal.Dialog ref="dialog" modalContainerTag="confirmation-modal" className="alert-modal">
                <Ui.Modal.Body>
                    <div className="text-center">
                        <h4>{this.props.title}</h4>

                        <p>{this.renderContent()}</p>
                    </div>
                </Ui.Modal.Body>
                <Ui.Modal.Footer>
                    <Ui.Button type="default" label={this.props.cancel} onClick={this.onCancel}/>
                    <Ui.Button type="primary" label={this.props.confirm} onClick={this.onConfirm}/>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );
    }
};

export default Confirmation;