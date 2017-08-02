import Webiny from 'webiny';
import Views from './Views/Views';

class Module extends Webiny.App.Module {
    init() {
        this.name = 'I18N';
        const Menu = Webiny.Ui.Menu;

        this.registerMenus(
            new Menu('I18N', [
                new Menu('Languages', 'I18N.Languages.List'),
                new Menu('Translations', 'I18N.Translations.List'),
            ], 'icon-tools').setRole('webiny-i18n-manager')
        );

        this.registerRoutes(
            new Webiny.Route('I18N.Translations.List', '/i18n/translations', Views.TranslationsList, 'I18N - List Translations'),
            new Webiny.Route('I18N.Languages.List', '/i18n/languages', Views.LanguagesList, 'I18N - List Languages')
        );
    }
}

export default Module;