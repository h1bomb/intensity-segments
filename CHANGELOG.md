# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2024-01-08

### Changed
- Made segments property public for better testing accessibility
- Enhanced error messages in validation methods
- Added comprehensive test coverage for parameter validation

## [1.0.2] - 2024-01-08

### Changed
- Moved type definitions to separate `types.ts` file for better code organization
- Standardized code comments and documentation
- Improved code maintainability and reusability

### Fixed
- All test cases now passing
- Improved error handling and type validation

## [1.0.1] - 2024-03-12

### Added
- Chinese documentation (README.zh-CN.md) with language switch support
- MIT License file and badge
- Comprehensive documentation in both English and Chinese

### Fixed
- GitHub Actions CI workflow configuration
- Codecov integration and token setup
- Node.js versions updated to 20.x and 22.x in CI workflow

## [1.0.0] - 2024-03-12

### Added
- Initial implementation of IntensitySegments
- Core functionality for managing intensity segments over a timeline
- Support for adding and setting intensity values
- Automatic handling of overlapping segments
- GitHub Actions workflow for continuous integration
- Code coverage reporting with Codecov
- Comprehensive documentation and examples

### Changed
- Cleaned up index.ts to export library interface
- Optimized segment handling and zero value processing
- Improved code organization and structure

[1.0.3]: https://github.com/h1bomb/intensity-segments/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/h1bomb/intensity-segments/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/h1bomb/intensity-segments/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/h1bomb/intensity-segments/releases/tag/v1.0.0
