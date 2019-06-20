import { FileProperties, RetrieveRequest } from "jsforce";

export class PackageFormatter {
    orgMetadata : FileProperties[];
    manifest;

    constructor(orgMetadata : FileProperties[], version: string) {
       this.orgMetadata = orgMetadata;
       this.manifest = {
        apiVersion : version,
        singlePackage :true,
           unpackaged : {
               types : [

               ],
               
           }
       }
    }

    public createPackageObject() : RetrieveRequest {
        this.orgMetadata.forEach(fileProperty => {
            if(fileProperty)
            {
                this.addMemberToNode(fileProperty.type, fileProperty.fullName);
            }
            
        });
        return this.manifest;
    }

    addMemberToNode(typeName : string, memberName: string){
        let typeNode = this.getTypeNodeByType(typeName);
        typeNode.members.push(memberName);
    }

    getTypeNodeByType(typeName : string)
    {
        let typeNode = this.manifest.unpackaged.types.find(node => {
            return node.name == typeName;
        });
        if(typeof typeNode == 'undefined')
        {
            typeNode = {
                name: typeName,
                members: []
            }
            this.manifest.unpackaged.types.push(typeNode);
        }

        return typeNode;
    }
}