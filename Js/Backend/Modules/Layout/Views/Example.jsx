import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class Example extends Webiny.Ui.View {

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            domains: [],
            model: {
                email: 'pavel@webiny.com',
                name: '',
                brand: 'webiny'
            }
        };

        this.bindMethods('loadCms,submit');
        this.actions = Webiny.Apps.Core.Backend.Layout.Actions;
    }

    componentDidMount() {
        this.watch('Core.Layout', (data) => {
            this.setState(data);
        });

        if (!Webiny.Model.exists('Core.Layout'.split('.'))) {
            this.actions.loadData('Pavel');
        }
    }

    loadCms() {
        this.actions.loadCms().then(() => {
            Webiny.Router.reloadRoute();
        });
    }

    submit(model) {
        _.merge(this.state.model, model);
        this.setState(this.state, () => {
            console.log("NEW PARENT STATE", this.state.model);
        });
    }

    render() {
        return (
            <div>
                <p>My name is "{this.state.name || 'Unknown'}" and my email is "{this.state.model.email}"</p>
                <ul>
                    {this.state.domains.map((item, i) => <li key={i}>{item}</li>)}
                </ul>

                <Ui.Panel.Panel>
                    <Ui.Panel.Header title="Webiny Form"/>
                    <Ui.Panel.Body>
                        <Ui.Tabs.Tabs ui="tabs">
                            <Ui.Tabs.Tab label="First tab">
                                <Ui.Form layout={false} ui="myForm" title="Webiny Form" data={this.state.model} onSubmit={this.submit}
                                         linkedForms="mySecondForm,myThirdForm" onReset={this.signal('tabs:selectTab', 0)} onInvalid={this.signal('tabs:selectTab', 0)}>
                                    <fields>
                                        <Ui.Grid.Row>
                                            <Ui.Grid.Col all={12}>
                                                <Ui.Input label="Email" placeholder="Enter anything" name="email"
                                                          validate="required,email"/>
                                            </Ui.Grid.Col>
                                        </Ui.Grid.Row>
                                    </fields>
                                </Ui.Form>
                            </Ui.Tabs.Tab>
                            <Ui.Tabs.Tab label="Second tab">
                                <Ui.Form layout={false} ui="mySecondForm" data={this.state.model} onInvalid={this.signal('tabs:selectTab', 1)}>
                                    <fields>
                                        <Ui.Grid.Row>
                                            <Ui.Grid.Col all={12}>
                                                <Ui.Input label="Name" placeholder="Enter anything" name="name" validate="required"/>
                                            </Ui.Grid.Col>
                                        </Ui.Grid.Row>
                                    </fields>
                                </Ui.Form>
                            </Ui.Tabs.Tab>
                            <Ui.Tabs.Tab label="Third tab">
                                <Ui.Form layout={false} ui="myThirdForm" data={this.state.model} onInvalid={this.signal('tabs:selectTab', 2)}>
                                    <fields>
                                        <Ui.Grid.Row>
                                            <Ui.Grid.Col all={12}>
                                                <Ui.Input label="Brand" placeholder="Enter anything" name="brand" validate="required"/>
                                            </Ui.Grid.Col>
                                        </Ui.Grid.Row>
                                    </fields>
                                </Ui.Form>
                            </Ui.Tabs.Tab>
                        </Ui.Tabs.Tabs>
                    </Ui.Panel.Body>
                    <Ui.Panel.Footer className="text-right">
                        <Ui.Button type="default" onClick={this.signal('myForm:cancel')} label="Cancel"/>
                        <Ui.Button type="secondary" onClick={this.signal('myForm:reset')} label="Reset"/>
                        <Ui.Button type="primary" onClick={this.signal('myForm:submit')} label="Submit"/>
                    </Ui.Panel.Footer>
                </Ui.Panel.Panel>
            </div>
        );
    }
}

export default Example;