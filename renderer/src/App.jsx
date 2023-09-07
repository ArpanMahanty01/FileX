import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import SendFile from './pages/SendFiles';
import ReceiveFile from './pages/ReceiveFiles';
import FindDevices from './pages/FindDevices';
import { styled } from 'styled-components';

function App() {
  return (
    <div>
      <header>
        <nav>
          <Navbar />
        </nav>
      </header>
      <Main>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/send" element={<SendFile />} />
          <Route path="/send/find-devices" element={<FindDevices />} />
          <Route path="/receive" element={<ReceiveFile />} />
        </Routes>
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
  justify-content: center;
`

export default App;
