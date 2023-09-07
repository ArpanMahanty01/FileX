const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
const Datauri = require('datauri');
const mime = require('mime');

app.use(cors());

app.get('/getFiles/:id', (req, res) => {
  console.log('request recieved');
  const name = req.params.id;
  const filepath = req.query.path;
  const uploadsPath = path.join(__dirname, 'uploads');
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
    }
    if (files.includes(name)) {
      const directoryPath = path.join(uploadsPath, name, filepath);
      try {
        const contents = fs.readdirSync(directoryPath);
        const result = [];

        contents.forEach((item) => {
          const itemPath = path.join(directoryPath, item);
          const isDirectory = fs.statSync(itemPath).isDirectory();
          const fileType = isDirectory
            ? 'directory'
            : path.extname(item).substring(1);

          result.push({
            filename: item,
            type: isDirectory ? 'directory' : fileType,
            path: itemPath,
          });
        });

        res.status(200).send(result);
      } catch (error) {
        console.error('Error listing directory contents:', error);
        res.status(500).send([]);
      }
    } else {
      const directoryPath = path.join(uploadsPath, name);
      fs.mkdir(directoryPath, (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
            console.error('The directory already exists.');
          } else {
            console.error(`Error creating the directory: ${err}`);
          }
        } else {
          console.log('directory created successfully.');
          res.send([]);
        }
      });
    }
  });
});

app.get('/serveFile/:id/', (req, res) => {
  const name = req.params.id;
  const Path = req.query.path;
  const filename = req.query.filename;
  const uploadsPath = path.join(__dirname, 'uploads');
  const filePath = path.join(uploadsPath, name, Path, filename);
  try {
    const mimeType = mime.getType(filePath);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type',mimeType);
  
      const dataStream = fs.createReadStream(filePath);
      dataStream.pipe(res);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (err) {
    console.error('Error reading or sending file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/upload',(req,res)=>{
  
});

app.get('/download/:id',(req,res)=>{
  console.log('download request recieved')
  const Path = req.query.path;
  const filename = req.query.filename;
  res.download(Path,filename);
})

app.listen(8080, () => {
  console.log('database active at 8080');
});
