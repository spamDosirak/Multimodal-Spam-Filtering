import React from 'react';
import { Container } from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import TextButton from '../ui/TextButton';
import ImageButton from '../ui/ImageButton';
import VoiceButton from '../ui/VoiceButton';

import { useNavigate } from "react-router-dom";

export default function FirstPage(props) {

    const navigate = useNavigate();


    return (
        <Container
            //maxWidth='md'
        >
            
            <Box
                sx={{ 
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center', // 세로 중앙정렬
                }}
            >
                
                <Grid container spacing={0}> 
                    
                    <Grid item xs={12} sm={4}>
                        <TextButton
                            label="Text"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}> 
                        <ImageButton
                            label="Image"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <VoiceButton
                            label="Voice"

                        /> 
                    </Grid>

                </Grid>
            </Box>
        </Container>
        
    );

}