import React from "react";
import styled from "styled-components";
import Fade from "react-reveal/Fade"; // Import react-reveal(Fade)

//import "~slick-carousel/slick/slick.css"; 
//import "~slick-carousel/slick/slick-theme.css";

//npm install react-reveal --save

//npm install react-slick --save

//react-awesome-reveal
//https://velog.io/@rlawogks2468/React-%EC%97%90%EC%84%9C-%EC%95%A0%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0ft.-react-awesome-reveal

const IntroBlock = styled.div`
    text-align: center;
    
    margin: 0.5vw;
    width: 80vw;
    height : 85vh;
    background : none;
    border : 1px solid black;
    margin-bottom: 135px;
    @media (max-width: 768px) {
        padding: 25px;
    }

    h1 {
        margin: 0;
        font-weight: 300;
        font-size: 100px;
        @media (max-width: 768px) {
            font-size: 30px;
        }
    }
    h3 {
        font-weight: 200;
        font-size:30px;
    }
`;

export default function InfoPage(props) {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
 
      };

    return (
    <div
        
        style={{
            //alignItems : "center",
            textAlign: "center",
            // justifyContent : "center",
            //display : "flex",
            fontSize: "1vw",
            margin: "0.5vw",
            width: "80vw",
            
            background : "grey",
        }}
    >
        <div>
            
            <Fade bottom>

                <IntroBlock>
                    색깔이랑 border 이런거는 그냥 레이아웃 확인하려고 아무거나 해놓은거라서 바꿔도 됩니다 이쁘게 바꿔주세요 {"><"}
                    <h1 >
                        Is it  <br />
                        <strong>Ham</strong> or <strong>Spam</strong>  <br />
                        ?
                    </h1>
                    <h3>
                        우리 Spam Dosirak은  <br />
                        보이스 피싱과 스팸 메일의 증가하는 추세에 따라 <br />
                        스팸 여부를 판별하고 2차 피해의 방지를 목표로 합니다.
                    </h3>
                </IntroBlock>
                <IntroBlock>
                    <h1>
                        <strong>SVM</strong>  <br />
                        and <br />
                        <strong>NB</strong>
                    </h1>
                    <h3>
                        우리는 스팸을 판별하기 위해  <br />
                        Naive Bayes 와 Support Vector Machine<br />
                        두 가지 기법을 사용합니다.
                    </h3>
                </IntroBlock>
                <IntroBlock>
                    <h1>
                        <strong>Graphs</strong>
                    </h1>
                    <h3>
                        왜 스팸으로 분류 되었는지 <br />
                        혹은 왜 햄으로 분류 되었는지 <br />
                        그래프로 한 눈에 확인하세요.
                    </h3>
                </IntroBlock>
            </Fade>
           
        </div>
        </div>
    );
}

