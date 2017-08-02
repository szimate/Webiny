import Webiny from 'webiny';
import Views from './Views/Views';

class Module extends Webiny.App.Module {
    init() {
        this.name = 'I18N';
        const Menu = Webiny.Ui.Menu;

        this.registerMenus(
            new Menu('I18N', [
                new Menu('Locales', 'I18N.Locales.List'),
                new Menu('Texts', 'I18N.Texts.List'),
            ], 'icon-tools').setRole('webiny-i18n-manager')
        );

        this.registerRoutes(
            new Webiny.Route('I18N.Texts.List', '/i18n/texts', Views.TextsList, 'I18N - List Texts'),
            new Webiny.Route('I18N.Locales.List', '/i18n/locales', Views.LocalesList, 'I18N - List Locales')
        );
    }
}

export default Module;