import React from 'react';

import './ClickableText.less';

export function ClickableText(props) {
    return (
        <span className="clickable-text" onClick={props.onClick}>
            {props.children}
        </span>
    );
}