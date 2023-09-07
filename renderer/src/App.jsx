import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import SendFile from './pages/SendFiles';
import ReceiveFile from './pages/ReceiveFiles';
import FindDevices from './pages/FindDevices';

function App() {
  return (
    <div>
      <header>
        <nav>
          <Navbar />
        </nav>
      </header>
      <main>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/send" element={<SendFile />} />
          <Route path="/send/find-devices" element={<FindDevices />} />
          <Route path="/receive" element={<ReceiveFile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
