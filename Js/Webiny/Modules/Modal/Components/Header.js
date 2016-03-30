import Webiny from 'Webiny';

class Header extends Webiny.Ui.Component {
    render() {
        return (
            <div className="modal-header">
                <h4>{this.props.title}</h4>
                <button onClick={this.props.onClose} type="button" className="close md-close" data-dismiss="modal">×</button>
            </div>
        );
    }
}

export default Header;