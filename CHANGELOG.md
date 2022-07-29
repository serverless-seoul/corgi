## [4.2.1](https://github.com/serverless-seoul/corgi/compare/v4.2.0...v4.2.1) (2022-07-29)


### Bug Fixes

* **exceptionhandler:** cleanup exception handling typings ([66ed6c6](https://github.com/serverless-seoul/corgi/commit/66ed6c64538f6062fb12200b8902b1044e38a1c8))

# [4.2.0](https://github.com/serverless-seoul/corgi/compare/v4.1.3...v4.2.0) (2021-05-14)


### Bug Fixes

* fix broken build ([34c86b6](https://github.com/serverless-seoul/corgi/commit/34c86b68c69892f56e661f894bf0bcfd1a410429))


### Features

* **builtins:** expose error message of StandardError ([6f3d6f2](https://github.com/serverless-seoul/corgi/commit/6f3d6f26d8d4e7a4474ddcb34c92d8a3956ab151))

## [4.1.3](https://github.com/serverless-seoul/corgi/compare/v4.1.2...v4.1.3) (2020-11-22)


### Bug Fixes

* **openapi:** add missing optional body parameter support ([d7df907](https://github.com/serverless-seoul/corgi/commit/d7df907f409983a7194000e90a95d33685b62c79))

## [4.1.2](https://github.com/serverless-seoul/corgi/compare/v4.1.1...v4.1.2) (2020-11-12)


### Bug Fixes

* **package:** republish ([4eb5803](https://github.com/serverless-seoul/corgi/commit/4eb5803254bb53109e3d8fff5875ce92b84776c6))

## [4.1.1](https://github.com/serverless-seoul/corgi/compare/v4.1.0...v4.1.1) (2020-11-11)


### Bug Fixes

* **parameter:** make object type coercion to last resort to respect its schema ([3974639](https://github.com/serverless-seoul/corgi/commit/3974639bf0552908072d74305a9ec77ada8a8a31))

# [4.1.0](https://github.com/serverless-seoul/corgi/compare/v4.0.1...v4.1.0) (2020-11-04)


### Features

* **typebox:** apply typebox changes ([afa64fa](https://github.com/serverless-seoul/corgi/commit/afa64fa5f9596e3982a80714f11eb4e9bf4a8446))

## [4.0.1](https://github.com/serverless-seoul/corgi/compare/v4.0.0...v4.0.1) (2020-11-04)


### Bug Fixes

* **parameter:** add missing allOf macro ([7310131](https://github.com/serverless-seoul/corgi/commit/73101311956cddd2138ad54d2089bea241cc9b50))
* **parameter:** cast query parameter as object to support object schema type ([e1f43e5](https://github.com/serverless-seoul/corgi/commit/e1f43e5bb20c0d2c46bc246909dd47528470d6dd))

# [4.0.0](https://github.com/serverless-seoul/corgi/compare/v3.2.1...v4.0.0) (2020-09-29)


### Bug Fixes

* **parameter:** stripping out unknown parameter should work with oneOf (union) type ([7f6a5d9](https://github.com/serverless-seoul/corgi/commit/7f6a5d95df1950bb6573d49079fa4d7f3b1ca1f7))
* **typing:** use more strict types ([51aebb6](https://github.com/serverless-seoul/corgi/commit/51aebb6cd6d9a2809914e68e52a9729b4c056f8b))
* add missing optional parameter type inference ([96714b5](https://github.com/serverless-seoul/corgi/commit/96714b58252d492ec0706efb35e56c73beb67cca))


### Features

* **openapi:** add schema reference merging ([f817e42](https://github.com/serverless-seoul/corgi/commit/f817e42ddec4f54628b04f62c139b4b62ad39c8d))
* support automatic parameter type inference by using typebox ([598ad14](https://github.com/serverless-seoul/corgi/commit/598ad1475dcf382841b4f97189dc9b4b0a14ee7b))


### BREAKING CHANGES

* This change requires TypeScript 4 and Node.js 12

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
