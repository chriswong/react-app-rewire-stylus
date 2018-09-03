/**
 * @file Rewire Stylus
 * @author  chris<wfsr@foxmail.com>
 */

const {
  getLoader,
  loaderNameMatches
} = require('react-app-rewired');

function createRewireStylus(stylusLoaderOptions = {}) {
    return function (config, env) {
        const stylusExtension = /\.styl$/;

        const fileLoader = getLoader(
            config.module.rules,
            rule => loaderNameMatches(rule, 'file-loader')
        );
        fileLoader.exclude.push(stylusExtension);

        const cssRules = getLoader(
            config.module.rules,
            rule => String(rule.test) === String(/\.css$/)
        );

        let stylusRules;
        if (env === 'production') {
            stylusRules = {
                test: stylusExtension,
                loader: [
                    // TODO: originally this part is wrapper in extract-text-webpack-plugin
                    //       which we cannot do, so some things like relative publicPath
                    //       will not work.
                    //       https://github.com/timarney/react-app-rewired/issues/33
                    ...cssRules.loader,
                    {loader: 'stylus-loader', options: stylusLoaderOptions}
                ]
            };
        }
        else {
            stylusRules = {
                test: stylusExtension,
                use: [
                    ...cssRules.use,
                    {loader: 'stylus-loader', options: stylusLoaderOptions}
                ]
            };
        }

        const oneOfRule = config.module.rules.find(rule => rule.oneOf !== undefined);
        if (oneOfRule) {
            oneOfRule.oneOf.unshift(stylusRules);
        }
        else {
            // Fallback to previous behaviour of adding to the end of the rules list.
            config.module.rules.push(stylusRules);
        }

        return config;
    };
}

const rewireStylus = createRewireStylus();

rewireStylus.withLoaderOptions = createRewireStylus;

module.exports = rewireStylus;
