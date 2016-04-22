import Field from './../Field';

class FileSizeField extends Field {

}

FileSizeField.defaultProps = {
    renderer() {
        return (
            <td className={this.getTdClasses()}>{filesize(_.get(this.props.data, this.props.name))}</td>
        );
    }
};

export default FileSizeField;