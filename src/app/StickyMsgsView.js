import React from 'react';
import {useSelector} from 'react-redux';
import {Alert} from 'antd';

export function StickyMsgsView(props) {
    let msgs=useSelector((state)=>state.backend ? state.backend.sticky_msgs : []);

    return (
        msgs.map(([cat,text],idx)=>(
            <Alert key={idx} type={cat==='message' ? 'info' : cat} message={text} showIcon={true} style={{marginBottom: '1em'}} />
        ))
    );
}