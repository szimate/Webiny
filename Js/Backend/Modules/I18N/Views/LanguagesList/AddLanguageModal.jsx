import React from 'react';
import _ from 'lodash';
import Webiny from 'webiny';

class AddLanguageModal extends Webiny.Ui.ModalComponent {
    renderDialog() {
        const {Button, Modal, Link, Grid, Form, Select} = this.props;

        return (
            <Modal.Dialog>
                <Form
                    fields="locale,label"
                    api="/entities/webiny/i18n-languages"
                    onSuccessMessage={this.props.onSuccessMessage}
                    onSubmitSuccess={apiResponse => this.hide().then(() => this.props.onSubmitSuccess(apiResponse))}>
                    {(model, form) => (
                        <Modal.Content>
                            <Modal.Header title="Add language"/>
                            <Modal.Body>
                                <Grid.Row>
                                    <Grid.Col all={12}>
                                        <Form.Error/>
                                        <Form.Loader/>
                                        <Select
                                            description={this.i18n(`Languages already added are not shown.`)}
                                            placeholder={this.i18n('Select language to add...')}
                                            name="locale"
                                            validate="required"
                                            api="/entities/webiny/i18n-languages"
                                            url="/locales/available"/>
                                    </Grid.Col>
                                </Grid.Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button label="Cancel" onClick={this.hide}/>
                                <Button type="primary" label="Add" onClick={form.submit}/>
                            </Modal.Footer>
                        </Modal.Content>
                    )}
                </Form>
                )}
            </Modal.Dialog>
        );
    }
}

AddLanguageModal.defaultProps = _.assign({}, Webiny.Ui.ModalComponent.defaultProps, {
    onSubmitSuccess: _.noop,
    onSuccessMessage: _.noop
});

export default Webiny.createComponent(AddLanguageModal, {
    modules: ['Button', 'Modal', 'Link', 'Grid', 'Form', 'Select']
});