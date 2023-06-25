# Introduction

MPEG Parser module with an example console app.

## Commands

`npm run build` to build the example app.

`npm run test` to run the unit tests.

`npm run start <file path>` to start the example app and validate the specified file.

# mpegParser

Contains the functions for parsing and validating individual packets in an mpeg file.

Exports:

**getStartPoints**: Locates all potential sync bytes within the provided stream, and returns an array of indexes.

**parseFile**: Reads the provided stream and validates each chunk (packet).

# console

Example app that uses mpegParser. Handles the creation of streams from the file, and writes validation results to the console.

_Note: Ended up containing too much validation logic and need refactoring._

# main

The entry point that invokes console app.
