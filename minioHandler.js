require('dotenv').config();
const fs = require('fs');
const stream = require('stream');
const { v4: uuidv4 } = require('uuid');
const Minio = require('minio');
const minioCfg = {
    endPoint: process.env.MINIO_HOST,
    port: Number.parseInt( process.env.MINIO_PORT || '9000' ),
    useSSL: ( process.env.MINIO_USE_SSL === 'true' ),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
}
const minioClient = new Minio.Client(minioCfg);
const mBucketInfo = 's3-info';
const mBucketData = 's3-data';

let loadBucketData = (pBucketKey, pFileObjectKey) => {
  return new Promise(async (pResolved, pRejected) => {
    if (!pFileObjectKey) pResolved();
    try {
      let tDataBufferArr = [];
      let tDataReceived = 0;
      const tObj = await minioClient.getObject(pBucketKey, pFileObjectKey);
      tObj.on("data", (tChunk) => { tDataBufferArr.push(tChunk); tDataReceived += tChunk.length; });
      tObj.on("end", () => {
        let tBuffer = Buffer.alloc(tDataReceived);
        let tDataCopied = 0;
        tDataBufferArr.forEach((tSrcBuf)=>{
          tSrcBuf.copy(tBuffer, tDataCopied);
          tDataCopied += tSrcBuf.length;
        });
        pResolved(tBuffer);
      });
    } catch (e) {
      pResolved();
    }  
  });
};

let loadInfoData = (pFileObjectKey) => {
  return loadBucketData(mBucketInfo, pFileObjectKey).then((pRet) => {
    if (pRet) {
      return JSON.parse(pRet.toString());
    } else {
      return { RET_MSG: 'invalid data' };
    }
  });
};

// minio create buckets
exports.initBuckets = async () => {
    console.log(`Creating Bucket: ${mBucketInfo}`);
    await minioClient.makeBucket(mBucketInfo).catch((e) => {
      console.log(
        `Error while creating bucket '${mBucketInfo}': ${e.message}`
       );
    });
    console.log(`Creating Bucket: ${mBucketData}`);
    await minioClient.makeBucket(mBucketData).catch((e) => {
      console.log(
        `Error while creating bucket '${mBucketData}': ${e.message}`
       );
    });
};

exports.uploadFile = async (req, res, next) => {  
  if (!req.files || !req.files.file) {
    res.json({RET_MSG: 'invalid request'});
    return;
  }

  const tFileId = uuidv4();
  const tFileObj = req.files.file;
  let tInfoObj = {id: tFileId};
  ['name', 'size', 'mimetype', 'md5'].forEach( (tKey) => {
    tInfoObj[tKey] = tFileObj[tKey];
  } );
  // tInfoObj.author = '';
  // tInfoObj.owner = '';
  tInfoObj.createdOn = Date.now();

  const tFileObjectKey = tFileId;
  const tFileData = tFileObj.data;
  await minioClient
      .putObject(mBucketData, tFileObjectKey, tFileData)
      .catch((e) => {
        console.log("Error while creating object from file data: ", e);
        throw e;
      });
  await minioClient
      .putObject(mBucketInfo, tFileObjectKey, JSON.stringify(tInfoObj))
      .catch((e) => {
        console.log("Error while creating object from file data: ", e);
        throw e;
      });  
  res.json({id: tFileObjectKey});
};

exports.downloadFile = async (req, res, next) => {
  let tFileObjectKey = req.params.fileId;
  loadInfoData(tFileObjectKey)
  .then( async (pRet) => {
    console.log(pRet);
    if (!pRet.name) throw new Error('invalid info');

    res.set('Content-disposition', 'attachment; filename=' + pRet.name);
    res.set('Content-Type', pRet.mimetype);

    let tStream = new stream.PassThrough();
    tStream.pipe(res);

    const tObj = await minioClient.getObject(mBucketData, tFileObjectKey);
    tObj.on('data', pChunk => {
      tStream.write(pChunk);
    });
    tObj.on('abort', () => {
      throw new Error('transfer error');
    });
    tObj.on('end', () => {
      tStream.end();
    });
  })
  .catch( pErr => {
    res.json({RET_MSG: pErr});
  });
};

exports.deleteFile = async (req, res, next) => {
  const tFileObjectKey = req.params.fileId;
  await minioClient.removeObject(mBucketData, tFileObjectKey)
      .catch((e) => {
        console.log("Error while deleting object - info: " + tFileObjectKey, e);
        throw e;
      });
  await minioClient.removeObject(mBucketInfo, tFileObjectKey)
      .catch((e) => {
        console.log("Error while deleting object - data: " + tFileObjectKey, e);
        throw e;
      });
  res.json({id: tFileObjectKey});
};

exports.getFileInfoList = async (req, res, next) => {
  let tPromises = [];
  const tObjs = minioClient.listObjects(mBucketInfo);
  tObjs.on('data', (pObj) => { tPromises.push( loadInfoData(pObj.name).then((pRet) => { pRet.id = pObj.name; return pRet; }) ); });
  tObjs.on('error', (pErr) => { res.json({ RET_MSG: pErr }); });
  tObjs.on("end", () => {    
    Promise.all(tPromises)
    .then((pRet) => {
      res.json(pRet.filter(pItem => pItem.name));
    })
    .catch((pErr) => {
      res.json({ RET_MSG: pErr });
    });
  });
};

exports.getFileInfo = async (req, res, next) => {
  let tFileObjectKey = req.params.fileId;
  loadInfoData(tFileObjectKey).then((pRet) => res.json(pRet));
};