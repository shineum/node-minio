var express = require('express');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const port = 3000

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static('build'));

app.post('/upload', async (req, res, next) => {
    res.json({});
});

app.get('/upload/:fileId', async (req, res, next) => {
    res.json({});
});

app.delete('/upload/:fileId', async (req, res, next) => {
    res.json({});
});

app.get('/fileInfo/:fileId', async (req, res, next) => {
    res.json({});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
