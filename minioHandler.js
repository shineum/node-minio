require('dotenv').config();
const fs = require('fs');
const stream = require('stream');
const { v4: uuidv4 } = require('uuid');
const Minio = require('minio');
const minioCfg = {
    endPoint: process.env.MINIO_HOST,
    port: Number.parseInt( process.env.MINIO_PORT || '9000' ),
    useSSL: ( process.env.MINIO_USE_SSL === 'true' ),
    accessKey: process.env.MIOIO_ACCESS_KEY,
    secretKey: process.env.MIOIO_SECRET_KEY
}
const minioClient = new Minio.Client(minioCfg);
const bucketInfo = 's3-info';
const bucketData = 's3-data';

// minio create buckets
exports.initBuckets = async () => {
    console.log(`Creating Bucket: ${bucketInfo}`);
    await minioClient.makeBucket(bucketInfo).catch((e) => {
      console.log(
        `Error while creating bucket '${bucketInfo}': ${e.message}`
       );
    });
  
    console.log(`Creating Bucket: ${bucketData}`);
    await minioClient.makeBucket(bucketData).catch((e) => {
      console.log(
        `Error while creating bucket '${bucketData}': ${e.message}`
       );
    });
  };