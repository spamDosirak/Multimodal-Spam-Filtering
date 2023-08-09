
import styled from "styled-components";

import React, { useState } from 'react';

import { useNavigate , Link } from "react-router-dom";
import "./Sidebar.css";


export default function Sidebar(props){

    const menus = [
        {name : "TEXT" , path : "/"},
        {name : "IMAGE" , path : "/image"},
        {name : "VOCIE" , path : "/voice"}
    ]

    return(

        <div className = "sidebar">
            <div className = "sidebarWrapper">
                <div className = "sidebarMenu">
                    <h3 className = "sidebarTitle"> SPAM-FILTERING
                        <ul className = "sidebarList">
                            {menus.map((menu,index) => {
                                return (
                                    <Link to ={menu.path} key = {index} style={{ textDecoration: "none" }}>
                                        <li className = "sidebarListItem" >{menu.name}</li>
                                    </Link>
                                )
                            })}            
                            {/* <li className = "sidebarListItem">IMAGE</li>
                            <li className = "sidebarListItem">VOICE</li>    */}
                            <li className = "sidebarListItemEnd">ABOUT US</li>        
                        </ul>
                    </h3>                            
                </div>
            </div>
        </div>
    );
}