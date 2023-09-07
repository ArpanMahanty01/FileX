import React, { useEffect, useState } from 'react';
import {styled} from 'styled-components';
import { io } from 'socket.io-client';
import Breadcrumbs from '../components/Breadcrumbs';
import FileViewer from 'react-file-viewer';

const Home = () => {
  const [user,setUser] = useState('');
  const [files,setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [selectedFile,setSelectedFile] = useState(null);
  const [path,setPath] = useState('') 

  const setHome = ()=>{
    setCurrentPath('');
  }

  useEffect(()=>{
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });
    socket.emit('init');
    socket.on('user',(name)=>{
      setUser(name);
      console.log(name);
    });
  })
  useEffect(()=>{
    fetch(`http://localhost:8080/getFiles/${user}?path=${currentPath}`,{
      method:'GET'
    })
    .then((res)=>{
      console.log(res.body);
      return res.json();
    })
    .then((data)=>{
      console.log(data);
      setFiles(data);
    })
  },[currentPath,user]);

  const handleFileClick = (file)=>{
    if(file.type==='directory'){
      const newPath = `${currentPath}/${file.filename}`;
      console.log(newPath);
      setCurrentPath(newPath);
    }else{
      setSelectedFile(file.type);
      fetch(`http://localhost:8080/serveFile/${user}?path=${currentPath}&filename=${file.filename}`)
      .then((response)=>{
        if(response.ok){
          return response.blob();
        }else{
          throw new Error('Image not found');
        }
      })
      .then((blob)=>{
        const url = URL.createObjectURL(blob);
        setFileContent(url)
      })
      .catch((err)=>console.log(err))

    }
  };

  const handleUpload = ()=>{
    window.ipcRenderer.send('open-file-dialog');

    window.ipcRenderer.on('file-dialog-result', (e, data) => {
      setPath(data.filePath);
    });

    
  }

  const handleDownload=async(file)=>{
    console.log("file",file)
    try{
      const response = await fetch(`http://localhost:8080/download/${user}?path=${file.path}&filename=${file.filename}`,{
        method:'GET'
      })
      if (response.status === 200) {
        console.log('File download initiated.');
      } else {
        console.error('Error initiating file download.');
      }
    }catch(error){
      console.log(error)
    }
  }

  return (
    <Container>
      <Heading>
        Welcome to File<Span>X</Span>
        <Username>{user}</Username>
      </Heading>
      <Nav>
      <Breadcrumbs path={currentPath} onBreadcrumbClick={setCurrentPath} setHome={setHome}/>
      <Buttons>
      <Upload onClick={handleUpload}>upload</Upload>
      <Share>share</Share>
      </Buttons>
      </Nav>
      <FileExplorer>
        {fileContent && (
          <FileViewer
            fileType={selectedFile}
            filePath={fileContent}
          />
        )}
       {
        files.map((file)=>(
          <>
          <Files key={file.path} type={file.type} onClick={()=>{handleFileClick(file)}}>
           <div>{file.filename}</div>
          </Files>
           <Download onClick={()=>handleDownload(file)}>Download</Download>
          </>
        ))
       }
      </FileExplorer>
    </Container>
  );
};

const Heading = styled.h1`
text-align:center;
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
  justify-content: space-around;
  align-items: center;
`

const Span = styled.span`
  color: #00ff00;
`;

const FileExplorer =styled.ul`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  align-items: center;
`;

const Files = styled.li`
display: flex;
justify-content: space-between;
border-top: 2px solid gray;
border-bottom: 2px solid gray;
padding:5px;
width: 80%;
& div{
  color: ${(props) => (props.type ==='directory' ? 'green' : 'gray')};
  &:hover{
    color: ${(props) => (props.type ==='directory' ? '#00ff00' : 'white')};
    cursor: pointer;
  }
}`;

const Download = styled.button`
  &:hover{
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

`;

const Share = styled.button`
height: 5vh;
`;



export default Home;
