import React from 'react';
import Button from '@mui/material/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';


const BackButton = props => {
    const navigate = useNavigate();

    const handleClick = () => {
       navigate(-1);
    };

    return (
        <Button 
            startIcon={<ArrowBack />}
            color="primary"
            onClick={handleClick}
        >
            {props.children}
        </Button>
    );
}

export default BackButton;