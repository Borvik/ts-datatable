## [Unreleased]

## [1.2.3] - 2020-02-18
### Changed
- Updated to use CommonJS version of `@borvik/use-querystate` and `@borvik/querystring`.

## [1.2.2] - 2020-02-17
### Changed
- Use newer version of `@borvik/use-dialog`

## [1.2.1] - 2020-02-16
### Fixed
- Filters were not being parsed from querystring due to update to `@borvik/use-querystate` and `@borvik/querystring`.

## [1.2.0] - 2020-02-16
### Changed
- Moved internal query parsing to separate libraries `@borvik/use-querystate` and `@borvik/querystring`
- Updated custom hooks that provide setters to have a consistent setter

## [1.1.9] - 2020-02-05
### Fixed
- Embedded `@borvik/use-dialog` to prevent usage errors - fixes #40

## [1.1.8] - 2020-02-04
### Fixed
- SSR issue with `window` issue (storage)

## [1.1.6] - 2020-02-04
### Fixed
- SSR issue with `window` issue #41 (querystring)

## [1.1.5] - 2020-02-04
### Changed
- Moved internal dialog definition to separate library `@borvik/use-dialog`
- Hide columns from column-picker that are fixed and are not allowed to have their visibility toggled or are not sortable (groupable).

## [1.1.4] - 2020-01-07
### Added
- Export of `ColumnContext` for easier component overriding
- Standalone filters, you can know define a columns to filter on, without actually defining a possibly visible column
- This changelog

## [1.1.0] - 2020-01-05
- Initial public release