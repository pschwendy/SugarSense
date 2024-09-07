import React from 'react';
import './css/DexButton.css';

interface DexButtonProps {
    className?: string,
    goto?: string,
    children: JSX.Element | JSX.Element[] | string
}

const DexButton = ({ className, goto, children }: DexButtonProps): JSX.Element => {
    if (goto == null) {
        return (
            <button className={'dex-btn ' + className}>
                {children}
                <button></button>
                <a href="babymayor.html"></a>
            </button>
            
        );
    } else {
        return (
            <a href={goto}>
                <button className={'dex-btn ' + className}>
                    {children}
                </button>
            </a>
        );
    }
};

export default DexButton;