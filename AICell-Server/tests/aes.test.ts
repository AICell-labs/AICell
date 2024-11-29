import aes from "../src/encryption/aes";
import assert from 'assert';

describe('aes', async () => {
  it('test_1',async () => {
    let orginalMsg = "https://github.com/test/asdf"
    let encryptedMsg = aes.encrypt(orginalMsg);
    let decryptedMsg = aes.decrypt(encryptedMsg);
    console.log('originalMsg:', orginalMsg);
    console.log(`encryptedMsg: ${encryptedMsg}, length: ${encryptedMsg.length}`);
    console.log('decryptedMsg:', decryptedMsg);
  })

  it('test_2',async () => {
    let orginalMsg = "https://test-restful-services/openai/getLimitTokens"
    let encryptedMsg = aes.encrypt(orginalMsg);
    let decryptedMsg = aes.decrypt(encryptedMsg);
    console.log('originalMsg:', orginalMsg);
    console.log(`encryptedMsg: ${encryptedMsg}, length: ${encryptedMsg.length}`);
    console.log('decryptedMsg:', decryptedMsg);
  })
})