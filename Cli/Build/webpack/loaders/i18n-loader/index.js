'use strict';
const loaderUtils = require("loader-utils");
const _ = require('lodash');
const parser = require('./parser');

// TODO: maknuti ovo u developmentu - bildanje i18n fileova

module.exports = function (source) {
    const options = loaderUtils.getOptions(this);
    if (this.cacheable) {
        this.cacheable();
    }

    const file = {path: this.resourcePath, key: parser.key(source, this.resourcePath)};
    const occurrences = parser.methods(source);

    // This adds entries to the i18n.json file.
    occurrences.forEach(occurrence => options.addText(file, occurrence));

    return source;
};
