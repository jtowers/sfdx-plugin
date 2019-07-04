import { Connection,  DescribeMetadataResult, ListMetadataQuery, FileProperties, RetrieveRequest} from "jsforce";
import { PackageFormatter } from "./packageFormatter";
import * as fs from 'fs';
export class MetadataRetriever {
    private _conn : Connection;
    private _apiVersion: string;
    private _orgMetadata : DescribeMetadataResult;
    private _maxListQueries : number = 3;
    private _targetTypes;
    get targetTypes()  {
      return this._targetTypes;
    }
    constructor(conn : Connection, apiVersion : string) {
        this._conn = conn;
        this._apiVersion = apiVersion;
    }


    public async performBackup(targetTypes: string[], excludedTypes : string[], fileName : string) : Promise<void>
    {
     
        this._targetTypes = await this.retrieveMetadataTypes(targetTypes, excludedTypes);
        let orgMetadata : FileProperties[] = await this.listOrgMetadata(this._targetTypes);
        let packageFormatter : PackageFormatter = new PackageFormatter(orgMetadata, this._apiVersion);
        let retrieveRequest : RetrieveRequest = packageFormatter.createPackageObject();
        let retrieveresult = this._conn.metadata.retrieve(retrieveRequest, null);
        // @ts-ignore
        retrieveresult.stream().pipe(fs.createWriteStream(fileName));
    }

    public async retrieveMetadataTypes(targetTypes : string[], excludedTypes : string[]) : Promise<string[]>
    {
        if(!targetTypes || targetTypes.length == 0)
        {
          
            targetTypes = await this.getAllTypes(excludedTypes);
        }

        return targetTypes;
    }

    public async listOrgMetadata(targetTypes : string[]) : Promise<FileProperties[]>
    {
     
        await this.getOrgMetadata();
        let folderMetadata : FileProperties[] = await this.retrieveFolderTypes(targetTypes);
        let metadataQueryPromises = [];
        let listQueries: ListMetadataQuery[] = [];
        targetTypes.forEach((element, elementIndex) => {
            let elementDescribe = this._orgMetadata.metadataObjects.find(describeInfo => {
              return describeInfo.xmlName == element;
            });
      
            if (elementDescribe.inFolder) {
              let folderName = elementDescribe.xmlName == 'EmailTemplate' ? 'EmailFolder' : elementDescribe.xmlName + 'Folder';
              let folderProperties: FileProperties[] = folderMetadata.filter(describe => describe.type == folderName);
              folderProperties.forEach((folderProperty, folderIndex) => {
                listQueries.push({
                  type: element,
                  folder: folderProperty.fullName
                });
                
              });
            } else {
              let listQuery: ListMetadataQuery = {
                type: element
              }
              listQueries.push(listQuery);
            }
      
          });
          let currentBatch = [];
          listQueries.forEach((element, index) => {
              currentBatch.push(element);
            
            if(currentBatch.length == this._maxListQueries || index == listQueries.length - 1){
              metadataQueryPromises.push(this._conn.metadata.list(currentBatch, this._apiVersion));
              currentBatch = [];
            }
          });
          let orgMetadata: FileProperties[] = [];
          await Promise.all(metadataQueryPromises).then(function(values){
            values.forEach(metadata => {
              orgMetadata = orgMetadata.concat(metadata);
            })
          });
          return orgMetadata;
    }


    public async retrieveFolderTypes(targetTypes : string[])
    {
        let folderQueries: ListMetadataQuery[] = [];
        let folderQueryPromises = [];

        targetTypes.forEach((element, index) => {
            let elementDescribe = this._orgMetadata.metadataObjects.find(describeInfo => {
              return describeInfo.xmlName == element;
            });

            
      
            if (elementDescribe.inFolder) {
              folderQueries.push(
                {
                  type: elementDescribe.xmlName == 'EmailTemplate' ? 'EmailFolder' : elementDescribe.xmlName + 'Folder'
                }
              );
            }
      
            if (folderQueries.length == this._maxListQueries || (index == targetTypes.length - 1) && folderQueries.length > 0) {
              folderQueryPromises.push(this._conn.metadata.list(folderQueries, this._apiVersion));
              folderQueries = [];
            }
      
          });

          let folderMetadata: FileProperties[] = [];

          await Promise.all(folderQueryPromises).then(function (values) {
            values.forEach(metadata => {
              folderMetadata = folderMetadata.concat(metadata);
            })
          });
          return folderMetadata;
    }

    public async getAllTypes(excludedTypes : string[]) : Promise<string[]>
    {
        let targetTypes : string[] = [];
        await this.getOrgMetadata();
        this._orgMetadata.metadataObjects.forEach(describe => {
            if (!excludedTypes || excludedTypes.indexOf(describe.xmlName) == -1){
              targetTypes.push(describe.xmlName);
            }
             
          });
          return targetTypes;
    }
    
    private async getOrgMetadata() : Promise<DescribeMetadataResult>
    {
        if(typeof this._orgMetadata == 'undefined'){
            this._orgMetadata =  await this._conn.metadata.describe(this._apiVersion);
        }
        return this._orgMetadata;
    }
}