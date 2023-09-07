require('dotenv').config({ path: './../env' });
const cors = require('cors');
const express = require('express');
const app = express();
const dgram = require('dgram');
const fs = require('fs');
const os = require('os');
const Path = require('path')
const { uniqueNamesGenerator, adjectives, colors, names } = require('unique-names-generator');
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
          const recieverInfo = JSON.parse(message);
          activeReceivers.push(recieverInfo);
          s.emit('activeReceiver', recieverInfo);
          console.log(
            `Received response from ${recieverInfo.username} (${recieverInfo.ip})`
          );
          //   clearInterval(broadcastInterval);
        } catch (error) {
          console.error('error parsing message', error);
        }
      });
    });
  });

  s.on('selectedReciever', (recieverDetails) => {
    fetch(`http://${recieverDetails.ip}:8000/reciever/acceptReq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderName: username,
        senderIP: privateIp,
        path: recieverDetails.path,
        recieverIP: recieverDetails.recieverIP,
      }),
    });
  });

  s.on('getActive', () => {
    const socket = dgram.createSocket('udp4');
    socket.on('message', (message, remote) => {
      try {
        const senderInfo = JSON.parse(message);
        console.log(`Received broadcast from sender (${senderInfo.ip})`);

        const response = JSON.stringify(recieverInfo);
        socket.send(response, remote.port, remote.address);
      } catch {
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

  s.on('selectedSender', (senderDetails) => {
    fetch(`http://${senderDetails.senderIP}:8000/sender/accepted`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderName: username,
        senderIP: senderDetails.senderIP,
        path: senderDetails.filePath,
        recieverIP: privateIp,
      }),
    });
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

  s.on('init',()=>{
    const homeDirectory = os.homedir();
    const hiddenFilePath = Path.join(homeDirectory, '.X');
    fs.access(hiddenFilePath,fs.constants.F_OK,(err)=>{
      if(err){
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, names] });
        const lineToAdd = randomName;
        fs.writeFileSync(hiddenFilePath, lineToAdd, 'utf8');
        console.log(`.X created with the name: ${lineToAdd}`);
        s.emit('user',randomName);
      }
      fs.readFile(hiddenFilePath,'utf8',(err,data)=>{
        if(err){
          console.error("Error reading the hidden file",err)
        }else{
          s.emit('user',data)
        }
      })
    })
  })
});

app.post('/reciever/acceptReq', (req, res) => {
  const details = req.body;
  io.on('connectoin', (s) => {
    s.emit('senderReq', details);
  });
});

app.post('/sender/accepted', (req, res) => {
  const details = req.body;
  console.log(details);
  const formData = new FormData();
  const filePath = details.path;
  console.log(`${details.recieverIP} accepted the offer`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    formData.append('file', data);

    fetch(`http://${details.recieverIP}/reciever/upload`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});

app.post('/reciever/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded successfully.');
});

server.listen(8000, () => {
  console.log('listening on :8000');
});
