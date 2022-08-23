# element-js-manifests

Generates a `web-types.json` file to provide (JetBrains) IDEs with metadata about Web Components built with `@webtides/element-js`.

## How to use

#### Installation

install `element-js-manifests`

```sh
npm install --save @webtides/element-js-manifests
```

> IMPORTANT: This library is not yet released to the npm registry. For now please link the module locally by adding it manually to the package.json.

```json
{
    "devDependecies": {
        "@webtides/element-js-manifests": "file:../element-js-manifests"
    }
}
```

#### Use

Add the following task to the scripts' section of your package.json.

```json
{
    "scripts": {
        "manifest": "element-js-manifests --src 'src/**/*.js' --watch"
    }
}
```

Run the command

```sh
npm run manifest
```

Add the generated `web-types.json` field to your package.json

```json
{
    "web-types": "./web-types.json"
}
```

## Contributing & Development

For contributions and development see [contributing docs](.github/CONTRIBUTING.md)

## License

`element-js-manifests` is open-sourced software licensed under the MIT [license](LICENSE).
