import { encodeToHexString } from "@bnb-chain/greenfield-js-sdk";
import bnbGreenfield from "../src/storage/bnbGreenfield";
import fs from "fs";

describe("bnbGreenfield", async () => {
  it("static_data", async () => {
    console.log(bnbGreenfield.bucketName);
    console.log(bnbGreenfield.logoFoldName);
    console.log(bnbGreenfield.cellFoldName);
  });

  it("listObjectsByIds", async () => {
    const objectId = "459850";
    let res = await bnbGreenfield.listObjectsByIds([objectId]);
    console.log(res[0].Value.ObjectInfo);
  });

  it("createBucket", async () => {
    const bucketName = "ai-cell-test-bucket";
    let res = await bnbGreenfield.createBucket(bucketName);
    console.log(res);
  });

  it("createFold", async () => {
    const bucketName = "ai-cell-test-bucket";
    const foldName = "fold-cell";
    let res = await bnbGreenfield.createFold(bucketName, foldName);
    console.log(res);
  });

  it("createObject_json", async () => {
    const fileName = "test_18.json";
    const metadata = {
      owner: "0xde51312CdF679e042B41dC8dd5F00984d0f5bbE2",
      requestAuthorUrl: "https://github.com/tdergouzi",
      requestPlatform: "github",
      requestPlatformUrl: "https://github.com",
      requestType: "GET",
      requestHeaders: {
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      requestParams: {
        paramA: "testAAA",
        paramB: "testBBB",
        paramC: "testCCC",
      },
      price: "0.001",
      tokenAddress: "0xEcF600B841D0734F301B8Cc7e6e3c93772638851",
    };
    let res = await bnbGreenfield.createObject(
      bnbGreenfield.bucketName,
      fileName,
      Buffer.from(JSON.stringify(metadata)),
      "json",
      "test-object"
    );
    console.log(res);
  });

  it("createObject_png", async () => {
    const fileName = "nft_v1_image.png";
    let fileBuffer = await fs.readFileSync(
      __dirname + "/../src/data/nft_image.png"
    );
    let res = await bnbGreenfield.createObject(
      bnbGreenfield.bucketName,
      fileName,
      fileBuffer,
      "image/png",
      bnbGreenfield.logoFoldName
    );
    console.log(res);
  });

  it("createObject_nft", async () => {
    const fileName = "cell_image.png";
    let fileBuffer = await fs.readFileSync(
      __dirname + "/../src/data/nft_image.png"
    );
    let res = await bnbGreenfield.createObject(
      bnbGreenfield.bucketName,
      fileName,
      fileBuffer,
      "image/png",
      bnbGreenfield.cellFoldName
    );
    console.log(res);
  });

  it("createObject_bug_0", async () => {
    const fileName = "0x8e54756cbf0a6bc315ab2c9c71e5b43a178bae3fb0f25f288ca356e7f5774013.json";
    const log = {
      user: "0xef6191a5c8e983da45dac2a787d49fe3f2b6d54e",
      cellAddress: "0x89411D88d5235AD86D80892EC6545563F0dEd9C5",
      txhash:
        "0x7e54756cbf0a6bc315ab2c9c71e5b43a178bae3fb0f25f288ca356e7f5774013",
    };
    let res = await bnbGreenfield.createObject(
      bnbGreenfield.bucketName,
      fileName,
      Buffer.from(JSON.stringify(log)),
      "json",
      "0x89411D88d5235AD86D80892EC6545563F0dEd9C5"
    );
    console.log(res);
  });
});
