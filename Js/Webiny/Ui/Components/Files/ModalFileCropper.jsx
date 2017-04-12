import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;
import FileCropper from './Base/FileCropper';

class ModalFileCropper extends FileCropper {

    constructor(props) {
        super(props);
        this.bindMethods('show,hide');
    }

    componentDidMount() {
        super.componentDidMount();
        if (!this.props.image) {
            return this.hide();
        }

        this.show();
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate();
        if (!prevProps.image && this.props.image) {
            return this.show();
        }

        if (prevProps.image && !this.props.image) {
            return this.hide();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps.image, this.props.image) || !_.isEqual(nextState, this.state);
    }

    applyCropping() {
        const model = this.getImage();
        this.hide().then(() => {
            this.props.onCrop(model);
        });
    }

    hide() {
        return this.refs.dialog.hide();
    }

    show() {
        return this.refs.dialog.show();
    }
}

ModalFileCropper.defaultProps = _.merge({}, FileCropper.defaultProps, {
    config: {},
    title: 'Crop image',
    action: 'Apply cropping',
    closeOnClick: false,
    onCrop: _.noop,
    onShown: _.noop,
    onHidden: _.noop,
    renderer() {
        const props = this.props;

        const modalProps = {
            onShown: () => {
                // Execute callback first
                props.onShown();
                // Initialize cropper plugin
                setTimeout(this.initCropper);
            },
            onHide: () => {
                this.destroyCropper();
            },
            onHidden: () => {
                props.onHidden();
            },
            closeOnClick: props.config.closeOnClick || props.closeOnClick,
            className: ''
        };

        return (
            <Ui.Modal.Dialog ref="dialog" {...modalProps}>
                <Ui.Modal.Header title={props.title}/>
                <Ui.Modal.Body>
                    {props.children}
                    <div className="col-xs-12 no-padding">
                        <img
                            className="img-cropper"
                            width="100%"
                            src={props.image && props.image.src + this.getCacheBust()}
                            style={{maxWidth: '100%'}}/>
                    </div>
                    <div className="clearfix"></div>
                    Cropped image size: <strong>{this.state.width}x{this.state.height}</strong>
                </Ui.Modal.Body>
                <Ui.Modal.Footer>
                    <Ui.Button type="primary" className="pull-right ml5" onClick={this.applyCropping}>{props.action}</Ui.Button>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );
    }
});

export default ModalFileCropper;