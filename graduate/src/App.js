
import { BrowserRouter, Routes, Route ,Link, HashRouter} from 'react-router-dom';
import React ,{Component  } from 'react';
import styled from "styled-components";
import logo from './logo.svg';
import './App.css';

import MainPage from './com/page/MainPage';


import TextBox from './com/page/TextPage/TextPage';
import Sidebar from './com/sidebar/Sidebar';



function App() {

    return (
      <MainPage/>
    );
}

export default App;
