import Webiny from 'Webiny';
import SearchInput from './SearchInput';

class SearchContainer extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: [],
            loading: false,
            selected: false
        };

        this.selectedId = null;
        this.delay = null;

        this.bindMethods(
            'setInitialData',
            'loadOptions'
        );

        Webiny.Mixins.ApiComponent.extend(this);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);
        let id = props.valueLink.value;
        if (id && _.isPlainObject(id)) {
            id = id.id;
        }
        if (id !== this.selectedId) {
            this.setInitialData(props);
        }

        if (!id) {
            this.selectedId = null;
            this.setState({
                options: [],
                selected: false,
                search: ''
            });
        }
    }

    componentWillMount() {
        super.componentWillMount();
        this.setInitialData(this.props);
    }

    setInitialData(props) {
        let value = props.valueLink.value;
        if (value) {
            if (_.isPlainObject(value)) {
                value = value[this.props.valueAttr];
            }

            // If we only got an ID...
            this.selectedId = value;
            this.api.execute(this.httpMethod, value).then(apiResponse => {
                this.setState({selected: apiResponse.getData()});
            });
        } else {
            this.selectedId = null;
        }
    }

    loadOptions(query) {
        this.setState({search: query});
        clearTimeout(this.delay);

        this.delay = setTimeout(() => {
            if (_.isEmpty(this.state.search)) {
                return;
            }

            this.setState({loading: true});
            this.api.setQuery({_searchQuery: this.state.search}).execute().then(apiResponse => {
                const data = apiResponse.getData();
                this.setState({options: _.get(data, 'list', data), loading: false});
            });
        }, 500);
    }

    render() {
        const props = _.omit(this.props, ['key', 'ref']);
        _.assign(props, {
            loading: this.state.loading,
            options: this.state.options,
            onSearch: this.loadOptions,
            selected: this.state.selected,
            onSelect: item => {
                this.selectedId = item[props.valueAttr];
                this.setState({options: [], selected: item});
                this.props.onSelect(item);
            }
        });
        return <SearchInput {...props}/>;
    }

}

SearchContainer.defaultProps = {
    searchOperator: 'or',
    valueAttr: 'id',
    textAttr: 'name',
    onSelect: _.noop,
    onReset: _.noop,
    placeholder: 'Type to search'
};

export default SearchContainer;
