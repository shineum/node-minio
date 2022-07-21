var express = require('express');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const minioHandler = require('./minioHandler');

const port = 3000

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static('build'));
app.use(fileupload());

app.post('/upload', async (req, res, next) => {
    minioHandler.uploadFile(req, res, next);
});

app.get('/download/:fileId', async (req, res, next) => {
    minioHandler.downloadFile(req, res, next);
});

app.delete('/delete/:fileId', async (req, res, next) => {
    minioHandler.deleteFile(req, res, next);
});

app.get('/fileInfoList', async (req, res, next) => {
    minioHandler.getFileInfoList(req, res, next);
});

app.get('/fileInfo/:fileId', async (req, res, next) => {
    minioHandler.getFileInfo(req, res, next);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

minioHandler.initBuckets();