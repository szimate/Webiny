const _ = require('lodash');

class i18nPlugin {
    constructor() {
        this.i18n = {};
    }

    apply(compiler) {
        const outputName = 'i18n.json';

        compiler.plugin('emit', (compilation, compileCallback) => {
            const content = {
                app: compiler.options.name,
                files: Object.values(this.i18n)
            };

            const json = JSON.stringify(content, null, 4);

            compilation.assets[outputName] = {
                source: () => json,
                size: () => json.length
            };

            compileCallback();
        });
    }

    getTarget() {
        return this.i18n;
    }

    getLoader() {
        return {
            loader: 'i18n-loader',
            options: {
                /**
                 * @param file Contains path and key
                 * @param occurrence Contains placeholder with additional data (eg. 'key')
                 */
                addText: (file, occurrence) => {
                    const path = file.path.split('/Apps/').pop();

                    // If we don't have object with texts already, we create a new one.
                    if (!this.i18n[path]) {
                        this.i18n[path] = {path, key: file.key, texts: []}
                    }

                    if (!_.find(this.i18n[path].texts, {placeholder: occurrence.placeholder})) {
                        this.i18n[path].texts.push(occurrence);
                    }

                    // TODO: Ovaj sort na kraju napravit
                    // this.i18n[path].texts = _.sortBy(this.i18n[path].texts, ['placeholder']);
                }
            }
        };
    }
}

module.exports = i18nPlugin;