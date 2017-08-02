import React from 'react';
import Webiny from 'webiny';
import AddLanguageModal from './LanguagesList/AddLanguageModal';

class LanguagesList extends Webiny.Ui.View {
    constructor() {
        super();
        this.addLanguageModal = null;
        this.languagesList = null;
    }
}

LanguagesList.defaultProps = {
    renderer: function render() {
        return (
            <Webiny.Ui.LazyLoad modules={['View', 'List', 'Icon', 'Button']}>
                {Ui => (
                    <Ui.View.List>
                        <Ui.View.Header title="I18N - Languages">
                            <Ui.Button type="primary" align="right" onClick={() => this.addLanguageModal.show()}>
                                <Ui.Icon icon="icon-plus-circled"/>
                                Add Language
                            </Ui.Button>
                            <AddLanguageModal
                                ref={ref => this.addLanguageModal = ref}
                                onSuccessMessage={null}
                                onSubmitSuccess={apiResponse => {
                                    this.languagesList.loadData();
                                    Webiny.Growl.success(this.i18n('Language {language} was successfully added!', {
                                        language: <strong>{apiResponse.getData('entity.label')}</strong>
                                    }));
                                }}/>
                        </Ui.View.Header>
                        <Ui.View.Body>
                            <Ui.List
                                connectToRouter
                                api="/entities/webiny/i18n-languages"
                                fields="id,enabled,label,locale"
                                searchFields="id,locale"
                                ref={ref => this.languagesList = ref}>
                                <Ui.List.Table>
                                    <Ui.List.Table.Row>
                                        <Ui.List.Table.Field label="Language">
                                            {row => row.label}
                                        </Ui.List.Table.Field>
                                        <Ui.List.Table.ToggleField name="enabled" label="Status" align="center"/>
                                        <Ui.List.Table.DateField name="createdOn" label="Created On" sort="createdOn"/>
                                        <Ui.List.Table.Actions>
                                            <Ui.List.Table.DeleteAction/>
                                        </Ui.List.Table.Actions>
                                    </Ui.List.Table.Row>
                                    <Ui.List.Table.Footer/>
                                </Ui.List.Table>
                                <Ui.List.Pagination/>
                            </Ui.List>
                        </Ui.View.Body>
                    </Ui.View.List>
                )}
            </Webiny.Ui.LazyLoad>
        );
    }
};

export default LanguagesList;