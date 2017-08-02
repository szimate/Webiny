import _ from 'lodash';
import Webiny from 'webiny';
import React from 'react';
import moment from 'moment';
import accounting from 'accounting';
import I18N from './I18N';

/**
 * This is responsible for replacing given text with given values
 * It will automatically detect if it needs to return a string or JSX based on given variables
 * (if all variables are strings, then final output will also be returned as string)
 * @param text
 * @param values
 * @returns {*}
 */
function replaceVariables(text, values) {
    if (_.isEmpty(values)) {
        return text;
    }

    // Let's first check if we need to return pure string or JSX
    let stringOutput = true;
    _.each(values, value => {
        if (!_.isString(value) && !_.isNumber(value)) {
            stringOutput = false;
            return false;
        }
    });

    const parts = text.split(/(\{.*?\})/);

    if (stringOutput) {
        let output = '';
        parts.forEach(part => {
            output += _.startsWith(part, '{') ? values[_.trim(part, '{}')] : part;
        });
        return output;
    }

    // Let's create a JSX output
    return parts.map((part, index) => {
        if (_.startsWith(part, '{')) {
            return <webiny-i18n-part key={index}>{values[_.trim(part, '{}')]}</webiny-i18n-part>;
        }
        return <webiny-i18n-part key={index}>{part}</webiny-i18n-part>;
    });
}

class i18n {
    constructor() {
        this.language = '';
        this.api = null;
        this.cacheKey = null;

        /**
         * All registered modifiers. We already have built-in modifiers 'count', 'case' and 'if'.
         * @type {Array}
         */
        this.modifiers = {
            count: (variable, ...parameters) => {

            },
            if: (variable, value, output1, output2) => {
                if (variable === value) {
                    return output1;
                }
                return output2;
            }
        };

        // Initial parser for parsing modifiers is already built-in.
        this.parsers = [
            (output, key, placeholder) => {
                return output;
            }
        ];

        this.translations = {};
        this.component = I18N;

        const translate = (key, text, variables) => {
            return this.translate(key, text, variables);
        };

        Object.getOwnPropertyNames(i18n.prototype).map(method => {
            if (method !== 'constructor') {
                translate[method] = this[method].bind(this);
            }
        });

        return translate;
    }

    translate(key, text, variables) {
        let output = this.getTranslation(key) || text;
        output = replaceVariables(output, variables);
        this.parsers.forEach(parser => {
            output = parser(output, key, text, variables);
        });
        return output;
    }

    setComponent(component) {
        this.component = component;
    }

    /**
     * Used for rendering text in DOM
     * @param key
     * @param label
     * @param variables
     * @param options
     * @returns {XML}
     */
    render(key, label, variables, options) {
        return React.createElement(this.component, {placeholder: label, translationKey: key, variables, options});
    }

    // Following methods are plain-simple for now - let's make them smarter in the near future
    price(value, currency = '£', precision = 2) {
        const currencySymbols = {gbp: '£', usd: '$', eur: '€'}; // Plain simple for now
        return accounting.formatMoney(value, _.get(currencySymbols, currency, currency), precision);
    }

    number(value, decimals = 0) {
        return accounting.formatNumber(value, decimals);
    }

    date(value, format = 'DD/MMM/YY') {
        return moment(value).format(format);
    }

    time(value, format = 'HH:mm') {
        return moment(value).format(format);
    }

    datetime(value, format = 'DD/MMM/YY HH:mm') {
        return moment(value).format(format);
    }

    getTranslation(key) {
        return this.translations[key] || '';
    }

    setTranslation(key, translation) {
        this.translations[key] = translation;
        return this;
    }

    /**
     * Returns all fetched translations.
     * @returns {*|{}}
     */
    getTranslations() {
        return this.translations;
    }

    /**
     * Returns true if given key has a translation for currently selected language.
     * @param key
     */
    hasTranslation(key) {
        return _.get(this.translations, key);
    }

    /**
     * Sets the API endpoint for fetching translations.
     * @param api
     * @returns {i18n}
     */
    setApiEndpoint(api) {
        this.api = api;
        return this;
    }

    /**
     * Returns currently set language.
     * @returns {string|string|*}
     */
    getLanguage() {
        return this.language;
    }

    /**
     * TODO: rename in dayjob
     * Registers a new parser, which will be called on each translation.
     * @param callback
     * @returns {i18n}
     */
    registerParser(callback) {
        this.parsers.push(callback);
        return this;
    }

    /**
     * Un-registers all parsers.
     * @returns {i18n}
     */
    unregisterParsers() {
        this.parsers = [];
        return this;
    }

    setCacheKey(cacheKey) {
        this.cacheKey = cacheKey;
        return this;
    }

    initialize(language = 'en_GB') {
        this.language = language;
        // TODO: Set moment / accounting language settings here

        // If we have the same cache key, that means we have latest translations - we can safely read from local storage.
        if (this.cacheKey === parseInt(Webiny.LocalStorage.get('Webiny.i18n.cacheKey'))) {
            this.translations = JSON.parse(Webiny.LocalStorage.get('Webiny.i18n.translations'));
            return Promise.resolve();
        }

        // If we have a different cache key (or no cache key at all), we must fetch translations from server
        return this.api.setQuery({language: this.language}).execute().then(apiResponse => {
            Webiny.LocalStorage.set('Webiny.i18n.language', this.language);
            Webiny.LocalStorage.set('Webiny.i18n.cacheKey', apiResponse.getData('cacheKey', null));
            Webiny.LocalStorage.set('Webiny.i18n.translations', JSON.stringify(apiResponse.getData('translations')));
            this.translations = _.assign(this.translations, apiResponse.getData('translations'));
            return apiResponse;
        });
    }

    toText(element) {
        if (_.isString(element) || _.isNumber(element)) {
            return element;
        }

        if (Webiny.elementHasFlag(element, 'i18n')) {
            const props = element.props;
            return this.translate(props.translationKey, props.placeholder, props.variables, props.options);
        }

        return '';
    }
}

export default new i18n;