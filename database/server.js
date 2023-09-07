require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
const mime = require('mime');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.DATABASE_PORT || 8080;
const DATABASE_IP = process.env.DATABASE_IP;

app.use(cors());
app.use(express.json());
app.get('/getFiles/:id', (req, res) => {
  console.log('request received');
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
      res.setHeader('Content-Type', mimeType);

      const dataStream = fs.createReadStream(filePath);
      dataStream.pipe(res);
    } else {
      res.status(404).send('file not found');
    }
  } catch (err) {
    console.error('Error reading or sending file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/download/:id', (req, res) => {
  const Path = req.query.path;
  console.log('download request received', Path);
  res.download(Path, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('file sent to download successfully');
    }
  });
});

const uploadstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `uploads/${req.params.id}/${req.query.db_path}`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: uploadstorage });

app.post('/upload/:id', upload.single('file'), (req, res) => {
  console.log('upload request recieved on database');
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded:');
});

app.post('/generate-link/:id', (req, res) => {
  console.log('request for link recieved');
  console.log(req.body);
  const data = req.body;
  const filePath = path.join(__dirname, 'uploads', data.user, '.X');
  console.log('filepath', filePath);
  const newData = {
    _id: uuidv4(),
    filePath: data.sharePath,
    allowed_clients: req.allowed_clients,
  };
  console.log(newData);

  fs.readFile(filePath, 'utf-8', (readError, data) => {
    if (readError) {
      if (readError.code === 'ENOENT') {
        data = '[]';
      } else {
        console.error('Error reading the file:', readError);
        return;
      }
    }

    let jsonArray = JSON.parse(data);

    jsonArray.push(newData);

    const updatedDataString = JSON.stringify(jsonArray, null, 2);

    fs.writeFile(filePath, updatedDataString, 'utf-8', (writeError) => {
      if (writeError) {
        console.error('Error writing the file:', writeError);
      } else {
        console.log('New data added to the JSON file successfully.');
        const link = `http://${DATABASE_IP}:${process.env.DATABASE_PORT}/share/${req.body.user}/${newData._id}`;
        console.log(link);
        res.json(link);
      }
    });
  });
});

app.post('/share/:user/:id', (req, res) => {
  const client = req.body;
  console.log(client);
  const user = req.params.user;
  const id = req.params.id;
  const filePath = path.join(__dirname, 'uploads', user, '.X');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading the JSON file:', err);
      return;
    }

    const dataArray = JSON.parse(data);
    const matchingObject = dataArray.find((obj) => obj._id === id);
    if (matchingObject) {
      const filePath = matchingObject.filePath;
      if (!matchingObject.allowed_clients) {
        //respond positively
        console.log('request accepted');
        fs.readdir(filePath, (err, files) => {
          if (err) {
            console.log('Error reading directory', err);
          }
          try {
            const contents = fs.readdirSync(filePath);
            const result = [];

            contents.forEach((item) => {
              const itemPath = path.join(filePath, item);
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
            console.error('Error listing directory contents', error);
            res.status(500).send([]);
          }
        });
      } else if (matchingObject.allowed_clients.includes(client)) {
        //!!!!!!!!!!!!!!!!!respond positively
        console.log('request accepted');
      } else {
        console.log('unauthorized');
        res.status(500).send([]);
      }
    } else {
      res.status(500).send([]);
      console.log('No matching object found.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`database active at ${PORT}`);
});
