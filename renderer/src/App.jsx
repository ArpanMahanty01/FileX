import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import SendFile from './pages/SendFiles';
import RecieveFile from './pages/RecieveFiles';
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
          <Route path="/recieve" element={<RecieveFile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
