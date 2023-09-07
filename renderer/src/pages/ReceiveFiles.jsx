import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { io } from 'socket.io-client';
import FileViewer from 'react-file-viewer';

function ReceiveFile() {
  const [active, setActive] = useState(false);
  const [activeReq, setActiveReq] = useState([]);
  const [link, setLink] = useState('');
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDownload = async (file) => {
    console.log('file', file);
    try {
      const response = await fetch(
        `http://localhost:8080/download/${user}?path=${file.path}&filename=${file.filename}`,
        {
          method: 'GET',
        }
      );
      if (response.status === 200) {
        console.log('File download initiated.', response);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = file.filename;
        downloadLink.click();
      } else {
        console.error('Error initiating file download.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRecieve = async () => {
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });
    socket.emit('get-user');
    socket.on('user', (str) => {
      console.log(str);
      setUser(str);
    });
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: user,
      })
        .then((res) => {
          console.log(res.body);
          return res.json();
        })
        .then((data) => {
          console.log(data);
          setFiles(data);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const socket = io('ws://localhost:8000', {
      withCredentials: false,
    });

    socket.on('senderReq', (details) => {
      setActiveReq((prev) => [...prev, details]);
    });
  }, []);

  const socket = io('ws://localhost:8000', {
    withCredentials: false,
  });
  socket.on('senderReq', (details) => {
    console.log('details');
    setActiveReq((prev) => [...prev, details]);
  });

  const handleSelectedSender = (sender) => {
    const socket = io('ws://localhost:8000', {
      withCredentials: true,
    });

    socket.emit('selectedSender', sender);
  };

  const handleFileClick=(file)=>{
    if(file.type!=='directory'){
      setSelectedFile(file.type);
      console.log(file);
      // fetch(
      //   // `http://localhost:8080/serveFile/${user}?path=${currentPath}&filename=${file.filename}`
      // )
      //   .then((response) => {
      //     if (response.ok) {
      //       return response.blob();
      //     } else {
      //       throw new Error('data not found');
      //     }
      //   })
      //   .then((blob) => {
      //     const url = URL.createObjectURL(blob);
      //     setFileContent(url);
      //   })
      //   .catch((err) => console.log(err));
    }
  }

  const handleActive = () => {
    setActive(!active);
    const socket = io('ws://localhost:8000', {
      withCredentials: true,
    });
    socket.emit('getActive');
  };

  return (
    <Container>
      <ActiveButton active={active} onClick={handleActive}>
        {active ? 'Active' : 'Inactive'}
      </ActiveButton>
      <div>
        {activeReq.map((element) => (
          <button
            onClick={() => {
              handleSelectedSender(element);
            }}
          >
            {element.senderName}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button onClick={handleRecieve}>recieve</button>
      <FileExplorer>
      {fileContent && (
          <FileViewer fileType={selectedFile} filePath={fileContent} />
        )}
        {files.map((file) => (
          <>
            <Files
              type={file.type}
              onClick={() => {
                handleFileClick(file);
              }}
            >
              <div>{file.filename}</div>
            </Files>
            <Download onClick={() => handleDownload(file)}>Download</Download>
          </>
        ))}
      </FileExplorer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  margin-top: 100px;
`;

const ActiveButton = styled.button`
  background-color: ${(props) => (props.active ? 'green' : 'red')};
  height: 20px;
  width: 150px;
  margin-bottom: 20px;
`;

const Files = styled.li`
  display: flex;
  justify-content: space-between;
  border-top: 2px solid gray;
  border-bottom: 2px solid gray;
  padding: 5px;
  width: 80%;
  & div {
    color: ${(props) => (props.type === 'directory' ? 'green' : 'gray')};
    &:hover {
      color: ${(props) => (props.type === 'directory' ? '#00ff00' : 'white')};
      cursor: pointer;
    }
  }
`;

const FileExplorer = styled.ul`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  align-items: center;
`;

const Download = styled.button`
  &:hover {
    background-color: #00ff00;
    color: black;
    cursor: pointer;
  }
`;

export default ReceiveFile;
