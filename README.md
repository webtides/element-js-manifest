# element-js-manifests

Generates a `web-types.json` file to provide (JetBrains) IDEs with metadata about Web Components built with `@webtides/element-js`.
For more info on the schema see: https://github.com/JetBrains/web-types

## How to use

#### Installation

install `element-js-manifests`

```sh
npm install --save @webtides/element-js-manifests
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
