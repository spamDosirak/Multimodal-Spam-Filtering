
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import FirstPage from './component/page/FirstPage';
import TestPage from './component/page/TestPage';

function App() {
  return (
    <BrowserRouter>
          <Routes>
            <Route index element={<FirstPage/>}/>
            <Route  path="first"  element={<FirstPage/>}/>
            <Route path="test" element={<TestPage/>}/>
          </Routes>
    </BrowserRouter>
  );
}

export default App;
