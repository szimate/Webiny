import _ from 'lodash';
import Webiny from 'webiny';
import Acl from './Modules/Acl';
import I18N from './Modules/I18N';
import Layout from './Modules/Layout';
import Logger from './Modules/Logger';
import './Components';

class Backend extends Webiny.App {
    constructor() {
        super('Webiny.Backend');
        this.modules = [
            new Acl(this),
            new I18N(this),
            new Layout(this),
            new Logger(this)
        ];

        this.beforeRender(() => {
            // Load other backend apps
            const api = new Webiny.Api.Endpoint('/services/webiny/apps');
            return api.get('/backend').then(res => {
                let apps = Promise.resolve();
                _.forIn(res.getData(), config => {
                    apps = apps.then(() => Webiny.includeApp(config.name, config).then(app => {
                        if (config.name === Webiny.Config.auth) {
                            Webiny.Auth = app.getAuth();
                        }
                        app.run();
                    }));
                });
                return apps;
            });
        });
    }
}

Webiny.registerApp(new Backend());