import React from 'react';
import styled from "styled-components";
import  './css/ImageButton.css';

import { useNavigate } from "react-router-dom";


export default function ImageButton(props) {
    const navigate = useNavigate();
    const { label, styleClass, onClick, disabled} = props;
    return (
        //<div class="button_container">
            //<p class="description">A simple pure CSS hover effect</p>
            <button class="image_btn"
            onClick={()=> {
                navigate("./test");
            }}><span>IMAGE</span></button>
        //</div>
    );
}
