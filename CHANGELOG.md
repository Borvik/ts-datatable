## [Unreleased]

## [1.6.9]
### Fixed
- Removed some console.logs

## [1.6.8]
### Fixed
- Quick editor and row selector render performance improvements

## [1.6.7] - 2022-08-02
### Fixed
- Bugfix for fixed headers - fixing borders for premdr, mdr, and row-selector headers

## [1.6.6] - 2022-08-01
### Added
- Fixed headers! Can disable this by turning off the prop.

## [1.6.5] - 2022-08-01
### Added
- Added `visibleColumns` to the `data` function so queries _could_ take advantage of visible columns and potentially optimize them (depends on new `passColumnsToQuery` property to opt-in to the feature).
- Added `originalData` to `onSaveQuickEdit` event parameters.

### Fixed
- Updated peerDependencies to allow newer versions of `react`, `react-dom`, and `react-router-dom`.

## [1.6.4] - 2022-07-28
### Fixed
- Initial load should not trigger scrollIntoView - only pagination changes (thanks @AlexWaller100)

## [1.6.3] - 2022-05-21
### Updated
- Update `use-dialog` library to avoid dialogs submitting other forms accidentally.

## [1.6.2] - 2022-01-24
### Fixed
- Fixed issue with displaying meta (subfields)

## [1.6.1] - 2022-01-24
### Fixed
- Fixed issue with displaying meta in filter bar

## [1.6.0] - 2022-01-24
### Added
- Added "meta" capabilities to column choice

### Fixed
- Fixed issue with filter editor column selector generating react errors due to missing key in array rendering (#48)
- Fixed issue with filter default values for multi-valued operators (#43)
- Fixed issue with detail row colspan not using the same number of columns as the main row (due to preMdrColumn)

### Changed
- Switched from `yarn` to `npm` - yarn wasn't handling dependency like `"@types/react": "*"` appropriately.
- Updated packages to clear dependabot alerts

## [1.5.1] - 2022-01-24
### Added
- Editor Options provides a way to pass extra options down to a custom editor.  Courtesy BlairCurrey

## [1.5.0] - 2022-01-10
### Added
- Perma-edit modes enabling always on cell editors with save on change or save button capability
- Table Footers (though still based on column)
- Save/Restore functions for saving/loading the filter state

## [1.4.3] - 2021-11-05
### Fixed
- Fixed cell `className` when `getTableCellProps` not supplied.

## [1.4.2] - 2021-10-14
### Added
- Expose a `clearSelection` function via a ref handle. (originally released in a 1.4.0 - but subsequently lost)

## [1.4.1] - 2021-10-07
### Added
- Ability to specify a default filter (thanks to the update to the underlying querystring libraries)
- Passed current row down to custom row checkbox selectors so input/label `id` properties can be uniquely set
- Defineable pre-mdr column that is 100% always first (even before MDR row expander)

## [1.3.4] - 2021-09-17
### Added
- @BlairCurrey Added `getTableRowProps` and `getTableCellProps` to customize row/cell styles.

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