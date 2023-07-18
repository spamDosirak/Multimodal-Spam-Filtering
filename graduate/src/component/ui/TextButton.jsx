import React from 'react';
import styled from "styled-components";
import  './css/TextButton.css';

import { useNavigate } from "react-router-dom";


export default function TextButton(props) {
    const { label, styleClass, onClick, disabled} = props;
    const navigate = useNavigate();

    return (
        //<div class="button_container">
            //<p class="description">A simple pure CSS hover effect</p>
            <button class="text_btn" 
            onClick={()=> {
                navigate("./test");
            }}><span>  TEXT  </span></button>
        //</div>
    );
}

//https://reactjsexample.com/3d-animated-react-button-component-with-progress-bar/