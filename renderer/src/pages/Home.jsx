import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { io } from 'socket.io-client';
import Breadcrumbs from '../components/Breadcrumbs';
import FileViewer from 'react-file-viewer';
import ShareModal from '../components/ShareModal';

const Home = () => {
  const [user, setUser] = useState('');
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharePath, setSharePath] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const setHome = () => {
    setCurrentPath('');
  };

  useEffect(() => {
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });
    socket.emit('init');
    socket.on('user', (name) => {
      setUser(name);
      console.log(name);
    });
  });
  useEffect(() => {
    fetch(`http://localhost:8080/getFiles/${user}?path=${currentPath}`, {
      method: 'GET',
    })
      .then((res) => {
        console.log(res.body);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setFiles(data);
      });
  }, [currentPath, user]);

  const handleFileClick = (file) => {
    if (file.type === 'directory') {
      const newPath = `${currentPath}/${file.filename}`;
      console.log(newPath);
      setCurrentPath(newPath);
    } else {
      setSelectedFile(file.type);
      fetch(
        `http://localhost:8080/serveFile/${user}?path=${currentPath}&filename=${file.filename}`
      )
        .then((response) => {
          if (response.ok) {
            return response.blob();
          } else {
            throw new Error('data not found');
          }
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setFileContent(url);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleUpload = (data) => {
    window.ipcRenderer.send('open-file-dialog');

    window.ipcRenderer.on('file-dialog-result', (e, data) => {
      console.log(data);
      const socket = io(`ws://localhost:8000`, {
        withCredentials: true,
      });
      console.log(currentPath);
      console.log({
        user: user,
        db_path: currentPath,
        local_path: data.filePath,
      });
      socket.emit('upload', {
        user: user,
        db_path: currentPath,
        local_path: data.filePath,
      });
    });
  };

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

  const handleShare = (path) => {
    setSharePath(path);
    console.log('share',path)
    setIsModalOpen(true);
  };

  return (
    <Container>
      <Heading>
        Welcome to File<Span>X</Span>
        <Username>{user}</Username>
      </Heading>
      <Nav>
        <Breadcrumbs
          path={currentPath}
          onBreadcrumbClick={setCurrentPath}
          setHome={setHome}
        />
        <Buttons>
          <Upload
            onClick={(currentPath) => handleUpload({ db_path: currentPath })}
          >
            upload
          </Upload>
          <Share onClick={()=>handleShare(currentPath)}>share</Share>
        </Buttons>
      </Nav>
      <FileExplorer>
        {fileContent && (
          <FileViewer fileType={selectedFile} filePath={fileContent} />
        )}
        {files.map((file,index) => (
          <FileContainer>
            <Files
              key={index}
              type={file.type}
              onClick={() => {
                handleFileClick(file);
              }}
            >
              <div>{file.filename}</div>
            </Files>
            <Download onClick={() => handleDownload(file)}>Download</Download>
            <Share onClick={()=>handleShare(file.path)}>Share</Share>
          </FileContainer>
        ))}
      </FileExplorer>
      <ShareModal isOpen={isModalOpen} onRequestClose={closeModal} sharePath={sharePath} user={user}/>
    </Container>
  );
};

const Heading = styled.h1`
  text-align: center;
  margin-bottom: 15px;
`;

const Container = styled.div`
  height: 100vh;
  padding: 1px;
  display: flex;
  flex-direction: column;
  margin-top: 4%;
`;

const Username = styled.div`
  margin-top: 10px;
  font-size: medium;
  color: gray;
`;

const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Span = styled.span`
  color: #00ff00;
`;

const FileExplorer = styled.ul`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
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

const Download = styled.button`
  &:hover {
    background-color: #00ff00;
    color: black;
    cursor: pointer;
  }
`;

const Buttons = styled.div`
  display: flex;
`;

const Upload = styled.button`
  height: 5vh;
  margin-right: 5px;
  padding: 5px;
  &:hover{
    background-color: #00ff00;
    color: black;
  }
`;

const Share = styled.button`
  height: 5vh;
  margin-left: 5px;
  padding: 5px;
  &:hover{
    background-color: blue;
  }
`;

const FileContainer = styled.div`
  width: 100%;
  display: flex;
`

export default Home;
