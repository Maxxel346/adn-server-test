const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());




const mainModule = require('./modules/mainModule.js');

app.use(mainModule);

// app.use(express.static(path.join(__dirname, 'pages')));

// const Server = http.createServer(app);


const port = 8888;
var hostname = '';



app.listen(port, hostname, () => {
    console.log(`Server berjalan pada http://${hostname}:${port}/`);
})

