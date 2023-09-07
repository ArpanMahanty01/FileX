require('dotenv').config({ path: './../env' });
const cors = require('cors');
const express = require('express');
const app = express();
const dgram = require('dgram');
const fs = require('fs');
const os = require('os');
const Path = require('path');
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  names,
} = require('unique-names-generator');
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const { getPrivateIP, getUserName } = require('./utils/utils');

const username = getUserName();
const privateIp = getPrivateIP();

const uploadDirectory = '~/FileX/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const Info = {
  ip: getPrivateIP(),
  username: getUserName(),
};

app.use(express.json());

app.get('/', (req, res) => {
  res.send('server running');
});

io.on('connection', (s) => {
  s.on('findUser', () => {
    const socket = dgram.createSocket('udp4');
    const broadcastPort = 41234;
    const message = JSON.stringify(Info);
    let activeReceivers = [];

    socket.bind(() => {
      socket.setBroadcast(true);

      const sendBroadCastMessage = () => {
        socket.send(
          message,
          0,
          message.length,
          broadcastPort,
          '10.21.7.255',
          (err) => {
            if (err) {
              console.error('Error sending message:', err);
            } else {
              console.log('Broadcast message sent successfully.');
            }
          }
        );
      };
      // setInterval(sendBroadCastMessage, 5000);

      sendBroadCastMessage();
      socket.on('message', (message, remote) => {
        try {
          const receiverInfo = JSON.parse(message);
          activeReceivers.push(receiverInfo);
          s.emit('activeReceiver', receiverInfo);
          console.log(
            `Received response from ${receiverInfo.username} (${receiverInfo.ip})`
          );
          //   clearInterval(broadcastInterval);
        } catch (error) {
          console.error('error parsing message', error);
        }
      });
    });
  });

  s.on('selectedReceiver', (receiverDetails) => {
    fetch(`http://${receiverDetails.ip}:8000/receiver/acceptReq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderName: username,
        senderIP: privateIp,
        path: receiverDetails.path,
        receiverIP: receiverDetails.receiverIP,
        receiverName: receiverDetails.username,
        write: receiverDetails.write,
      }),
    });
  });

  s.on('getActive', () => {
    const socket = dgram.createSocket('udp4');
    const receiverInfo = {
      username: username,
      ip: privateIp,
    };
    socket.on('message', (message, remote) => {
      try {
        const senderInfo = JSON.parse(message);
        console.log(`Received broadcast from sender (${senderInfo.ip})`);
        const response = JSON.stringify(receiverInfo);
        socket.send(response, remote.port, remote.address);
      } catch (error) {
        console.error('error parsing', error);
      }
    });
    socket.on('listening', () => {
      const address = socket.address();
      console.log(
        `Listening for messages on ${address.address}:${address.port}`
      );
    });

    socket.bind(41234);
  });

  s.on('selectedSender', async (senderDetails) => {
    console.log(senderDetails);
    try {
      const response = await fetch(
        `http://${senderDetails.senderIP}:8000/sender/accepted`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(senderDetails),
        }
      );
      if (response.ok) {
        const contentDispositionHeader = response.headers.get(
          'content-disposition'
        );
        let filename = 'downloadedFile.txt';
        if (contentDispositionHeader) {
          const matches = contentDispositionHeader.match(/filename="(.+)"/);
          if (matches) {
            filename = matches[1];
          }
        }
        const fileStream = fs.createWriteStream('~/Downloads/');
        response.body.pipe(fileStream);
        fileStream.on('finish', () => {
          console.log(`File ${filename} downloaded successfully.`);
        });
      } else {
        console.error('error downloading file');
      }
    } catch (error) {
      console.log(error);
    }
  });

  s.on('generate-link', (details) => {
    const filePath = details.path;
    const formdata = new FormData();
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      formdata.append('file', data);
      fetch(`http://10.21.4.73:8080/upload`, {
        method: 'POST',
        body: formdata,
        headers: formdata.getHeaders(),
      }).then((response) => {
        s.emit('link', {
          link: `http://10.21.4.73:8080/download/${response.filename}`,
        });
      });
    });
  });

  s.on('init', () => {
    const homeDirectory = os.homedir();
    const hiddenFilePath = Path.join(homeDirectory, '.X');
    fs.access(hiddenFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        const randomName = uniqueNamesGenerator({
          dictionaries: [adjectives, colors, names],
        });
        const lineToAdd = randomName;
        fs.writeFileSync(hiddenFilePath, lineToAdd, 'utf8');
        console.log(`.X created with the name: ${lineToAdd}`);
        s.emit('user', randomName);
      }
      fs.readFile(hiddenFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the hidden file', err);
        } else {
          s.emit('user', data);
        }
      });
    });
  });

  s.on('get-user', () => {
    const homeDirectory = os.homedir();
    const hiddenFilePath = Path.join(homeDirectory, '.X');
    fs.readFile(hiddenFilePath, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const buffer = Buffer.from(data, 'utf-8');
      const str = buffer.toString('utf-8');
      console.log(str);
      s.emit('user',str)
    });
  });

  s.on('upload', async (data) => {
    console.log('upload request to socket io', data);
    try {
      const fileStream = fs.createReadStream(data.local_path);
      const formData = new FormData();
      formData.append('file', fileStream);
      const response = await fetch(
        `http:localhost:8080/upload/${data.user}?db_path=${data.db_path}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('File uploaded successfully');
    } catch (err) {
      console.error(err);
    }
  });

  app.post('/receiver/acceptReq', (req, res) => {
    const details = req.body;
    s.emit('senderReq', details);
  });

  app.post('/sender/accepted', (req, res) => {
    const details = req.body;
    console.log(details);
    const formData = new FormData();
    const filePath = details.path;
    console.log(`${details.receiverIP} accepted the offer`);
    // fs.readFile(filePath, (err, data) => {
    //   if (err) {
    //     console.error('Error reading file:', err);
    //     return;
    //   }
    //   formData.append('file', data);

    //   fetch(`http://${details.recieverIP}/reciever/upload`, {
    //     method: 'POST',
    //     body: formData,
    //     headers: formData.getHeaders(),
    //   })
    //     .then((response) => response.text())
    //     .then((result) => {
    //       console.log(result);
    //     })
    //     .catch((error) => {
    //       console.error('Error:', error);
    //     });
    // });
    res.sendFile(filePath);
  });

  app.post('/receiver/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
  });
});

server.listen(8000, () => {
  console.log('listening on :8000');
});
