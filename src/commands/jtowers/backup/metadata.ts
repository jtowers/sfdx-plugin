import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { MetadataRetriever } from '../../../lib/metadataRetriever';
import * as fs from "fs";
import * as moment from "moment";
import  * as path from "path";


// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@jtowers/sfdx-plugin', 'metadataBackup');

export default class Backup extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx jtowers:backup:metadata --targetusername myOrg@example.com --retrievetargetdir backups --wait 10`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    retrievetargetdir: flags.directory({ char: 'r', description: messages.getMessage('retrieveTargetDirFlagDescription'), required: true }),
    targetmetadatatypes: flags.string({ char: 't', description: messages.getMessage('targetMetadataTypesFlagDescription'), multiple: true }),
    excludedmetadatatypes: flags.string({ char: 'e', description: messages.getMessage('excludedMetadataTypesFlagDescription'), multiple: true })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const directory = this.flags.retrievetargetdir;
    let targetTypes: string[] = this.flags.targetmetadatatypes;
    const excludedTypes: string[] = this.flags.excludedmetadatatypes;

    const conn = this.org.getConnection();
    const apiVersion = this.flags.apiVersion || conn.getApiVersion();

   
  let retriever : MetadataRetriever = new MetadataRetriever(conn, apiVersion);
  this.ux.startSpinner("Retrieving backup from server");
  let zipFile = await retriever.performBackup(targetTypes, excludedTypes);
  this.ux.stopSpinner("Backup retrieved");
  if(zipFile){
    if(!fs.existsSync(directory)){
     await fs.mkdirSync(directory);
    }
    let name = `backup_${this.org.getUsername()}_${moment().format('YYYY-MM-DDTX')}`;
    let fileName = path.join(directory, `${name}.zip`);

    fs.writeFileSync(fileName, Buffer.from(zipFile, 'base64'), {flag: 'wx'});
  }
    return {retrievedTypes : retriever.targetTypes};
  }

}
