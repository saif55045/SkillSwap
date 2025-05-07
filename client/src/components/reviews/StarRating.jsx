import React, { useState } from 'react';
import '../reviews/Reviews.css';

const StarRating = ({ 
    value = 0, 
    onChange, 
    readonly = false, 
    size = 'medium'
}) => {
    const [hoverValue, setHoverValue] = useState(0);
    
    const handleMouseOver = (index) => {
        if (!readonly) {
            setHoverValue(index);
        }
    };
    
    const handleMouseLeave = () => {
        setHoverValue(0);
    };
    
    const handleClick = (index) => {
        if (!readonly && onChange) {
            onChange(index);
        }
    };
    
    // Determine star size class
    const sizeClass = size === 'small' ? 'star-small' : 
                     size === 'large' ? 'star-large' : '';

    return (
        <div 
            className={`star-rating ${readonly ? 'readonly' : ''}`} 
            onMouseLeave={handleMouseLeave}
        >
            {[1, 2, 3, 4, 5].map(index => (
                <span
                    key={index}
                    className={`star ${index <= (hoverValue || value) ? 'filled' : ''} ${sizeClass}`}
                    onMouseOver={() => handleMouseOver(index)}
                    onClick={() => handleClick(index)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;