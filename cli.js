#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import commandLineArgs from 'command-line-args';
import chokidar from 'chokidar';
import debounce from 'debounce';
import globby from 'globby';

const cwd = process.cwd();

const generateManifests = debounce((globs) => {
    console.log('Generating component metadata for', globs);
    execSync(`node ${cwd}/node_modules/@webtides/element-js-manifests/node_modules/.bin/cem analyze --globs ${globs.join(' ')} --config ${cwd}/node_modules/@webtides/element-js-manifests/custom-elements-manifest.config.mjs`, { stdio: 'inherit' });

    const customElementsManifestJSON = readFileSync('custom-elements.json', {encoding: 'utf-8'});
    const customElementsManifest = JSON.parse(customElementsManifestJSON);

    const webTypes = {
        "$schema": "node_modules/@webtides/element-js-manifests/schema/web-types.json",
        "name": "@webtides/element-js",
        "framework": "element-js",
        "version": "0.4.2",
        "description-markup": "markdown",
        "default-icon": "icons/angular2.svg",
        "framework-config": {
            "enable-when": {
                "node-packages": [
                    "@webtides/element-js"
                ]
            }
        },
        "contributions": {
            "html": {
                "elements": [
                    {
                        "name": "flex",
                        "description": "The `<flex>` layout ...",
                        "exclusive-contributions": [
                            "/html/attributes"
                        ],
                        "attributes": [
                            {
                                "description": "The way to flex",
                                "name": "direction",
                                "priority": "highest",
                                "value": {
                                    "kind": "plain",
                                    "type": "enum"
                                },
                                "values": [
                                    {
                                        "name": "row"
                                    },
                                    {
                                        "name": "col"
                                    }
                                ]
                            },
                            {
                                "description": "",
                                "name": "align",
                                "value": {
                                    "kind": "plain",
                                    "type": "enum"
                                },
                                "values": [
                                    {
                                        "name": "start"
                                    },
                                    {
                                        "name": "center"
                                    },
                                    {
                                        "name": "end"
                                    }
                                ]
                            },
                            {
                                "description": "",
                                "name": "justify",
                                "value": {
                                    "kind": "plain",
                                    "type": "enum"
                                },
                                "values": [
                                    {
                                        "name": "start"
                                    },
                                    {
                                        "name": "between"
                                    },
                                    {
                                        "name": "around"
                                    },
                                    {
                                        "name": "end"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }

    for (const module of customElementsManifest.modules) {
        const defaultExport = module.exports[0];
        const declaration = module.declarations[0];
        const attributes = declaration.attributes?.map(attribute => ({
            description: '',
            name: attribute.name,
        }));

        const element = {
            "name": module.path.split('/').pop().replace('.js', ''),
            "description": declaration.description,
            "exclusive-contributions": [
                "/html/attributes"
            ],
            "attributes": [
                ...attributes || [],
                {
                    "description": "Finally we can have the class attribute back!",
                    "name": "class"
                }
            ],
            "source": {
                "module": module.path,
                "symbol": "default",
            }
        }
        //"symbol": defaultExport.declaration.name,

        webTypes.contributions.html.elements.push(element);
    }

    writeFileSync('web-types.json', JSON.stringify(webTypes, null, 4), {encoding: 'utf-8'});
});

function watch(globs) {
    // Initialize watcher.
    const watcher = chokidar.watch(globs, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
    });

    watcher
        .on('add', () => generateManifests)
        .on('change', () => generateManifests)
        .on('unlink', () => generateManifests);
}

const optionDefinitions = [
    { name: 'src', type: String, multiple: true },
    { name: 'watch', type: Boolean },
]


const options = commandLineArgs(optionDefinitions)
const paths = await globby([...options.src]);
console.log('options', options);
console.log('paths', paths);
console.log('process.cwd()', process.cwd());

if (options.watch) {
    watch(options.src);
} else {
    generateManifests(options.src);
}
