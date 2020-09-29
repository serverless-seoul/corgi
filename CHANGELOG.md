# [4.0.0-beta.2](https://github.com/serverless-seoul/corgi/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-09-25)


### Bug Fixes

* **parameter:** stripping out unknown parameter should work with oneOf (union) type ([7f6a5d9](https://github.com/serverless-seoul/corgi/commit/7f6a5d95df1950bb6573d49079fa4d7f3b1ca1f7))

# [4.0.0-beta.1](https://github.com/serverless-seoul/corgi/compare/v3.2.1-beta.1...v4.0.0-beta.1) (2020-09-25)


### Bug Fixes

* **typing:** use more strict types ([51aebb6](https://github.com/serverless-seoul/corgi/commit/51aebb6cd6d9a2809914e68e52a9729b4c056f8b))
* add missing optional parameter type inference ([96714b5](https://github.com/serverless-seoul/corgi/commit/96714b58252d492ec0706efb35e56c73beb67cca))


### Features

* **openapi:** add schema reference merging ([f817e42](https://github.com/serverless-seoul/corgi/commit/f817e42ddec4f54628b04f62c139b4b62ad39c8d))
* support automatic parameter type inference by using typebox ([598ad14](https://github.com/serverless-seoul/corgi/commit/598ad1475dcf382841b4f97189dc9b4b0a14ee7b))


### BREAKING CHANGES

* This change requires TypeScript 4 and Node.js 12

## [3.2.1](https://github.com/serverless-seoul/corgi/compare/v3.2.0...v3.2.1) (2020-09-25)


### Bug Fixes

* fix failing build due to path-to-regexp changes ([c5d695b](https://github.com/serverless-seoul/corgi/commit/c5d695b210c0c5a1a023fd42df31f5f22cf8f423))
* **router:** apply path-to-regexp changes ([7af9e52](https://github.com/serverless-seoul/corgi/commit/7af9e52bf9462bcf9b7a52e345aee21ae3821763))
