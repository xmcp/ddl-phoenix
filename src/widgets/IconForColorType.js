import {Icon} from 'antd';
import React from 'react';

export function IconForColorType(props) {
    return (
        <Icon type={{
            placeholder: 'small-dash',
            done: 'check-square',
            ignored: 'stop',
            highlight: 'flag',
            todo: 'clock-circle',
        }[props.type]} className={props.className}/>
    )
}