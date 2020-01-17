import React from 'react';

import './ClickableText.less';

export function ClickableText(props) {
    return (
        <span className={'clickable-text '+(props.className||'')} onClick={props.onClick}>
            {props.children}
        </span>
    );
}