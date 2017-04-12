import Webiny from 'Webiny';
import styles from '../styles/Modal.css';

class Body extends Webiny.Ui.Component {

}

Body.defaultProps = {
    noPadding: false,
    renderer() {
        return (
            <div className={this.classSet(styles.body, (this.props.noPadding && styles.noPadding), this.props.className)}>
                {this.props.children}
            </div>
        );
    }
};

export default Body;