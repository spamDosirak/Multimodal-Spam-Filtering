
import styled from "styled-components";

import React, { useState } from 'react';
import ImageBox from "../ui/ImageBox";
import VoiceBox from "../ui/VoiceBox";
import TextBox from "../ui/TextBox";
import { useNavigate } from "react-router-dom";


const Wrapper = styled.div`
    padding: 0 ;
    width: calc(100% - 50px);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

`;
const AppContainer = styled.div`
    &,
    & * {
        box-sizing: border-box;
    }
`;
const Buttons = styled.div`

    padding: 2rem;
    border: 1px solid white;
    
`
const Main = styled.div`
    width: 100%;
    height : 80vh;
    float: left;
    padding: 15px;
    border: 1px solid white;
    
`;

export default function TestPage(props){

    const navigate = useNavigate();

    const [t, setT] = useState(true);
    const [i, setI] = useState();
    const [v, setV] = useState();


    return(
        <div>
        <header>
            <button 
                onClick={ () => navigate("../")}
            >home</button>
        </header>
        <Wrapper>
        <AppContainer>
            <Buttons
                sx ={{
                height : "300px",

                }}
            >
                <button 
                    onClick={ () => setT(true) & setI(false) & setV(false)}
        
                >TEXT</button>
                <button
                    onClick={ () => setT(false) & setI(true) & setV(false)}
                >IMAGE</button>
                <button
                    onClick={ () => setT(false) & setI(false) & setV(true)}
                >VOICE</button>
            </Buttons>
            <Main>
                {t == true? <TextBox/> : null}
                {i == true? <ImageBox/> : null}
                {v == true? <VoiceBox/> : null}
            </Main>
            </AppContainer>
            </Wrapper>
            </div>
    );
}