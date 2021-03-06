import React from 'react';
import Webiny from 'webiny';
import Views from './Views/Views';

class Logger extends Webiny.App.Module {

    init() {
        this.name = 'Logger';
        const Menu = Webiny.Ui.Menu;

        this.registerMenus(
            <Menu label="System" role="webiny-logger-manager" icon="icon-tools">
                <Menu label="Error Logger" route="Logger.ListErrors"/>
            </Menu>
        );

        this.registerRoutes(
            new Webiny.Route('Logger.ListErrors', '/logger/list', Views.Main, 'Logger - List Errors')
        );
    }
}

export default Logger;