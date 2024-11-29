declare class BNBGreenfield {
  bucketName: string;
  logoFoldName: string;
  cellFoldName: string;
  
  listBucketsByIds(bucketIds: any): Promise<any>;
  listObjectsByIds(ids: any): Promise<any>;

  createBucket(bucketName: string): Promise<any>;
  createFold(bucketName: string, fileName: string): Promise<any>;
  createObject(bucketName: string, fileName: string, fileBuffer: Buffer, fileType: string, foldName?: string)
}

declare const bnbGreenfield: BNBGreenfield
export = bnbGreenfield


