@jtowers/sfdx-plugin
====================

Plugin for Salesforce CLI by jtowers

[![Version](https://img.shields.io/npm/v/@jtowers/sfdx-plugin.svg)](https://npmjs.org/package/@jtowers/sfdx-plugin)

## Installation into the Salesforce CLI

Install the plugin into your Salesforce CLI using this command:

```sh-session
$ npm install -g @jtowers/sfdx-plugin
```

You can check a successful installation with `sfdx plugins`. Updates are applied when executing `sfdx plugins:update`.

## Commands

- [sfdx jtowers:metadata:backup](#sfdx-jtowersmetadatabackup)

## sfdx jtowers:metadata:backup
Retrieves some or all metadata from the target org and zips it in the provided location

```
USAGE
  $ sfdx jtowers:backup:metadata -r <directory> [-t <string>] [-e <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -e, --excludedmetadatatypes=excludedmetadatatypes                                 types of metadata to exclude from backup
  -r, --retrievetargetdir=retrievetargetdir                                         (required) directory to save backed up metadata to
  -t, --targetmetadatatypes=targetmetadatatypes                                     types of metadata to retrieve for backup
  -u, --targetusername=targetusername                                               username or alias for the target org; overrides default target org
  --apiversion=apiversion                                                           override the api version used for api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx jtowers:backup:metadata --targetusername myOrg@example.com --retrievetargetdir backups 
  Retrieving backup from server... Backup retrieved

  $ sfdx jtowers:backup:metadata --targetusername myOrg@example.com --retrievetargetdir backups -t ApexClass ApexTrigger
  Retrieving backup from server... Backup retrieved
```
