import React from 'react';
import styled from "styled-components";
import  './css/VoiceButton.css';

import { useNavigate } from "react-router-dom";


export default function VoiceButton(props) {
    const navigate = useNavigate();
    const { label, styleClass, onClick, disabled} = props;
    return (
        //<div class="button_container">
            //<p class="description">A simple pure CSS hover effect</p>
            <button class="voice_btn"
            onClick={()=> {
                navigate("./test");
            }}><span>  Voice  </span></button>
        //</div>
    );
}
