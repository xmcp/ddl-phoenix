import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Popover} from 'antd';

import {set_fancy_search} from '../state/actions';
import {forceCheck} from 'react-lazyload';

import './FancySearch.less';
import {SearchOutlined, QuestionCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {FancySearchHelp} from '../logic/fancy_search_core';

export function FancySearchCtrl(props) {
    let term=useSelector((state)=>state.local.fancy_search_term);
    let modal_visible=useSelector((state)=>state.local.modal.visible);
    let dispatch=useDispatch();

    let elem=useRef(null);

    useEffect(()=>{
        forceCheck();

        if(modal_visible) // no fancy search when modal is shown
            return;

        function on_keypress(e) {
            let k=e.key.toLowerCase();
            //console.log(k);

            // skip if we are in other inputs
            if(['input', 'textarea'].indexOf(e.target.tagName.toLowerCase())!==-1)
                return;

            if(e.ctrlKey || e.altKey || e.metaKey)
                return;

            if(k==='backspace' && term) {
                e.preventDefault();
                dispatch(set_fancy_search('backspace'));
            } else if(k==='escape' && term) {
                e.preventDefault();
                dispatch(set_fancy_search('set',''));
            } else if(/^[a-z0-9]$/.test(k)) {
                e.preventDefault();
                dispatch(set_fancy_search('append',k));
            }
        }

        document.addEventListener('keydown',on_keypress,{passive: false});
        return ()=>{
            document.removeEventListener('keydown',on_keypress,{passive: false});
        }
    },[term,modal_visible]);

    if(!term)
        return null;

    return (
        <div className="fancy-search-ctrl">
            <div className="width-container" ref={elem}>
                <span style={{float: 'right'}}>
                    <span style={{cursor: 'pointer'}} onClick={()=>dispatch(set_fancy_search('set',''))}>
                        &nbsp;<CloseCircleOutlined />&nbsp;
                    </span>
                    <Popover
                        title="快速筛选" content={<FancySearchHelp />} trigger="click"
                        placement="bottomRight" getPopupContainer={()=>elem.current}
                    >
                        <span style={{cursor: 'pointer'}}>
                            &nbsp;<QuestionCircleOutlined />&nbsp;
                        </span>
                    </Popover>
                </span>
                &nbsp;<SearchOutlined /> &nbsp;
                {term}
            </div>
        </div>
    );
}