/* eslint-disable */
import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;
const Table = Ui.List.Table;

import MyForm from './MyForm';

class Form extends Webiny.Ui.View {

}

Form.defaultProps = {
    renderer() {
        const containerProps = {
            api: '/entities/core/users',
            fields: 'id,firstName,lastName,email,userGroups,settings,enabled,avatar,gallery',
            title: 'Users form',
            connectToRouter: true,
            onSubmitSuccess: () => {
                Webiny.Router.goToRoute('Users.List');
            },
            onCancel: () => {
                Webiny.Router.goToRoute('Users.List');
            }
        };

        const deleteConfirmProps = {
            ui: 'deleteConfirm',
            title: 'You need you to confirm this action',
            message: 'Do you really want to delete this record?',
            confirm: 'Yes, very!',
            cancel: 'Nope',
            onConfirm: modal => {
                const model = this.ui('myForm').getData();
                console.log(model);
                modal.hide();
            }
        };

        return (
            <Webiny.Builder.View name="core-users-form">
                <Ui.Form.ApiContainer ui="myForm" {...containerProps}>
                    <Ui.Grid.Col all={12}>
                        <Ui.Panel.Panel>
                            <Ui.Modal.Confirmation {...deleteConfirmProps}/>
                            <Ui.Button type="primary" label="Delete user" align="right" onClick={this.ui('deleteConfirm:show')}/>
                            <Ui.Panel.Header title="Users Form"/>
                            <Ui.Panel.Body>
                                <Ui.Tabs.Tabs ui="tabs">
                                    <Ui.Tabs.Tab label="General">
                                        <MyForm layout={false}/>
                                    </Ui.Tabs.Tab>
                                    <Ui.Tabs.Tab label="Files" onClick={this.ui('files:loadData')}>
                                        <Ui.Form.Form layout={false}>
                                            <fields>
                                                <Ui.Files.Avatar
                                                    name="avatar"
                                                    cropper={{
                                                        title: 'Crop your avatar',
                                                        config: {
                                                            aspectRatio: 1,
                                                            autoCropArea: 1,
                                                            guides: false,
                                                            strict: true,
                                                            width: 400,
                                                            height: 400,
                                                            cropBoxResizable: false
                                                        }}}/>
                                                <Ui.Files.Gallery
                                                    defaultBody={{ref: Webiny.Router.getParams('id')}}
                                                    name="gallery"
                                                    newCropper={{
                                                         title: 'Crop your new image',
                                                         action: 'Upload image',
                                                         config: {
                                                             closeOnClick: false,
                                                             autoCropArea: 0.7,
                                                             guides: false,
                                                             strict: true,
                                                             mouseWheelZoom: false,
                                                             touchDragZoom: false
                                                         }
                                                         }}
                                                    editCropper={{
                                                         title: 'Edit your image',
                                                         action: 'Save changes',
                                                         config: {
                                                             closeOnClick: true,
                                                             autoCropArea: 1,
                                                             guides: false,
                                                             strict: true,
                                                             mouseWheelZoom: false,
                                                             touchDragZoom: false
                                                         }
                                                     }}/>
                                            </fields>
                                        </Ui.Form.Form>

                                        <h2>Files list</h2>
                                        <Ui.List.ApiContainer ui="files" autoLoad={false} api="/entities/core/files"
                                                              fields="id,name,type,size" perPage={3}>
                                            <Table.Table>
                                                <Table.Row>
                                                    <Table.Field name="name" align="left" label="Name"/>
                                                    <Table.Field name="type" align="left" label="Type" sort="type"/>
                                                    <Table.FileSizeField name="size" label="Size"/>
                                                </Table.Row>
                                            </Table.Table>
                                            <Ui.List.Pagination size="small"/>
                                        </Ui.List.ApiContainer>
                                    </Ui.Tabs.Tab>
                                </Ui.Tabs.Tabs>
                            </Ui.Panel.Body>
                            <Ui.Panel.Footer className="text-right">
                                <Ui.Button type="default" onClick={this.ui('myForm:cancel')} label="Cancel"/>
                                <Ui.Button type="primary" onClick={this.ui('myForm:submit')} label="Submit"/>
                            </Ui.Panel.Footer>
                        </Ui.Panel.Panel>
                    </Ui.Grid.Col>
                </Ui.Form.ApiContainer>
            </Webiny.Builder.View>
        );
    }
};

export default Form;
