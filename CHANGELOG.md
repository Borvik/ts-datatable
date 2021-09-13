## [Unreleased]

## [1.3.3] - 2021-09-13
### Fixed
- Updated use-querystate library to latest version to solve issue with query parameters not updating.

## [1.3.2] - 2021-05-19
### Added
- @JacobHaitsma Added new string operator `Case-insensitive Equals`

## [1.3.1] - 2021-03-08
### Changed
- Changed dev/build process to _not_ be based on create-react-app, and _not_ require webpack for release builds. This prevents webpack from obfuscating the function/component names and allows them to be seen in React Developer Tools for applications using this component.

## [1.3.0] - 2021-02-19
### Added
- Added option to _not_ use HTML5 dialogs, and instead use a div styled like a dialog. This should make it easier for the filter editor to have a custom editor that has a custom dropdown appended to the `body` that has a higher z-index than the dialog.

## [1.2.3] - 2021-02-18
### Changed
- Updated to use CommonJS version of `@borvik/use-querystate` and `@borvik/querystring`.

## [1.2.2] - 2021-02-17
### Changed
- Use newer version of `@borvik/use-dialog`

## [1.2.1] - 2021-02-16
### Fixed
- Filters were not being parsed from querystring due to update to `@borvik/use-querystate` and `@borvik/querystring`.

## [1.2.0] - 2021-02-16
### Changed
- Moved internal query parsing to separate libraries `@borvik/use-querystate` and `@borvik/querystring`
- Updated custom hooks that provide setters to have a consistent setter

## [1.1.9] - 2021-02-05
### Fixed
- Embedded `@borvik/use-dialog` to prevent usage errors - fixes #40

## [1.1.8] - 2021-02-04
### Fixed
- SSR issue with `window` issue (storage)

## [1.1.6] - 2021-02-04
### Fixed
- SSR issue with `window` issue #41 (querystring)

## [1.1.5] - 2021-02-04
### Changed
- Moved internal dialog definition to separate library `@borvik/use-dialog`
- Hide columns from column-picker that are fixed and are not allowed to have their visibility toggled or are not sortable (groupable).

## [1.1.4] - 2021-01-07
### Added
- Export of `ColumnContext` for easier component overriding
- Standalone filters, you can know define a columns to filter on, without actually defining a possibly visible column
- This changelog

## [1.1.0] - 2021-01-05
- Initial public release