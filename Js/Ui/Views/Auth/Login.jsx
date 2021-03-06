import React from 'react';
import Webiny from 'webiny';
import logoOrange from 'Webiny/Ui/Assets/images/logo_orange.png';
import styles from './styles/Login.css';

class Login extends Webiny.Ui.View {

    onSubmit(model, form) {
        form.setState({error: null});
        form.showLoading();
        return Webiny.Auth.getApiEndpoint().post('login', model, {_fields: Webiny.Auth.getUserFields()}).then(apiResponse => {
            form.hideLoading();
            if (apiResponse.isError()) {
                return form.handleApiError(apiResponse);
            }

            const data = apiResponse.getData();
            if (!Webiny.Auth.isAuthorized(data.user)) {
                return form.setState({error: 'Some of your input isn\'t quite right.'});
            }

            Webiny.Cookies.set(Webiny.Auth.getCookieName(), data.authToken, {expires: 30, path: '/'});
            Webiny.Model.set('User', data.user);

            if (this.props.onSuccess) {
                this.props.onSuccess();
            } else {
                Webiny.Router.goToRoute(Webiny.Router.getDefaultRoute());
            }
        });
    }
}

Login.defaultProps = {
    overlay: false,
    renderer() {
        const {Form, Input, Password, Button} = this.props;

        return (
            <sign-in-form class={this.classSet('sign-in', (this.props.overlay && 'overlay'))}>
                <Form onSubmit={(model, form) => this.onSubmit(model, form)}>
                    {(model, form) => (
                        <div className="container">
                            <div className="sign-in-holder">
                                <div className="form-signin">
                                    <Form.Loader/>
                                    <a href="#" className="logo">
                                        <img src={logoOrange} width="180" height="58"/>
                                    </a>

                                    <h2 className="form-signin-heading"><span/>Sign in to your Account</h2>

                                    <div className="clear"/>
                                    <Form.Error/>

                                    <div className="clear"/>
                                    <Input
                                        name="username"
                                        placeholder="Enter email"
                                        label="Email address"
                                        validate="required,email"
                                        onEnter={form.submit}
                                        autoFocus={true}/>

                                    <Password
                                        name="password"
                                        placeholder="Password"
                                        label="Password"
                                        validate="required"
                                        onEnter={form.submit}/>

                                    <div className="form-footer">
                                        <Button
                                            type="primary"
                                            style={{float: 'right'}}
                                            size="large"
                                            onClick={form.submit}
                                            icon="icon-next"
                                            className={styles.btnLogin}>
                                            <span>Submit</span>
                                        </Button>
                                    </div>
                                </div>

                                <p className="copyright">powered by</p>
                                <a href="https://www.webiny.com/" className="site">www.webiny.com</a>
                            </div>
                        </div>
                    )}
                </Form>
            </sign-in-form>
        );
    }
};

export default Webiny.createComponent(Login, {modules: ['Form', 'Input', 'Password', 'Button']});