module.exports = {

    /**
     * When matching code for usage of i18n, it's possible to have three types (ordered by most used):
     * 1) this.i18n('Some text')
     * 2) this.i18n('Some text and a {variable}', {variable: 'Variable Value'})
     * 3) this.i18n('Some text and a {variable}', {variable: 'Variable Value'}, {key: 'App.CustomKey', xyz: 'asd'})
     * 4) same as above, except instead of this.i18n, we have Webiny.i18n, which has a 'key' as a first parameter, so total of 4 parameters here.
     *
     * So these are the method definitions:
     *
     * this.i18n(placeholder, variables, options)
     * Webiny.i18n(key, placeholder, variables, options)
     *
     * Parsing is hard because user can type anything as a placeholder, delimiters could be ', ` or ", and inside the text developer
     * could've used an escaped version of the same character too. We could also have a combination of strings, like 'string1' + `string2`,
     * which adds another level of complexity to the whole feature.
     */
    methods(source) {
        let match;
        const occurrences = [];

        // With a simple regex, we first find all this.i18n usages in given source.
        const regex = {
            basic: /this\.i18n\(['`"]/gmi,
            options: {
                basic: /^,.*,[ ]*(\{.*\})\)/,
                params: {
                    key: /key:([ `'"a-zA-Z0-9.]*)/ // Custom keys can only have letters, numbers and a dot.
                }
            }
        };

        while ((match = regex.basic.exec(source))) {
            occurrences.push(match.index);
        }

        // Parsing this.i18n usages is hard. We must analyze each use thoroughly, one by one.
        return occurrences.map(index => {
            // Now let's get the full string, we must look forward until we reach the closing ')'.
            const placeholder = {part: null, parts: []};

            for (let i = index + 10; i < source.length; i++) {
                if (!placeholder.part) {
                    // We don't have a part that we are working on.
                    // Did we then reach the end of placeholder ? If the next non-whitespace character is ',' or ')', we are done with matching
                    // the placeholder, otherwise we continue matching the rest. We only care about the rest if third parameter was set, as
                    // it may be an object that has 'key' field in it, which forces a custom key for the text.
                    const firstCharacterAfterLastlyProcessedPlaceholderPart = source.substr(i).trimLeft().charAt(0);

                    if ([',', ')'].includes(firstCharacterAfterLastlyProcessedPlaceholderPart)) {
                        const output = {placeholder: placeholder.parts.join('')};

                        if (firstCharacterAfterLastlyProcessedPlaceholderPart === ')') {
                            // This means no additional parameters were sent. We can immediately return the placeholder.
                            return output;
                        }

                        // This means we have additional parameters set. Let's see if we have custom key defined.
                        // We try to match the last JSON with all possible options.
                        const options = regex.options.basic.exec(source.substr(i));
                        if (options) {
                            // OK, we received an object as the third parameter. We are doing parsing of the last JSON here.
                            // Currently we only check if 'key' was set and assign it to the output. If more relevant options emerge,
                            // this is the place to add parsing of them. Also, if this becomes complicated, extract this part into
                            // a separate function for better readability.

                            // List of matched options
                            const matched = {
                                key: regex.options.params.key.exec(options[1])
                                // Some day more options could be here.
                                // anotherOption: regex.options.params.anotherOption.exec(options[1])
                            };

                            if (matched.key) {
                                output.key = matched.key[1]
                            }
                        }
                        return output;
                    }

                    // If we have a delimiter, then let's assign a new part and process it fully with the following iterations.
                    if (['`', `'`, `"`].includes(source[i])) {
                        placeholder.part = {delimiter: source[i], start: i}
                    }
                    continue;
                }


                // We must recognize the last closing ', " or `. The following examines three things:
                // 1) Is current character a delimiter
                // 2) Is it not-escaped - we just check the previous character, it must not be '\'
                if (source[i] !== placeholder.part.delimiter) {
                    continue;
                }

                if (source[i - 1] === `\\`) {
                    continue;
                }

                // Okay, now we are at the end of the part, so let's add it to the parts.
                placeholder.parts.push(source.substr(placeholder.part.start + 1, i - placeholder.part.start - 1));
                placeholder.part = null;
            }
        });
    },

    /**
     * About 'key':
     * It's a i18n key that is used to prefix each label in the file. If developer set it in the file explicitly, we use that, otherwise
     * default one, which is based on current file path. Can be overridden by passing the third 'options' parameter when calling i18n
     * method (we check that in parseCode method).
     */
    key(source, file) {
        const regex = /this\.i18n\.key\s{0,}=\s{0,}['|"|`]([a-zA-Z0-9\.-_:]+)['|"|`]/gm;
        return regex.exec(source) || file.split('Apps/').pop().replace('/Js/', '/').replace(/\.jsx?/, '').replace(/\//g, '.');
    }
};