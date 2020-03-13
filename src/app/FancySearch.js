import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Popover} from 'antd';

import {set_fancy_search} from '../state/actions';
import {forceCheck} from 'react-lazyload';

import './FancySearch.less';
import {SearchOutlined, QuestionCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {FancySearchHelp} from '../logic/fancy_search_core';

export function FancySearchCtrl(props) {
    const term=useSelector((state)=>state.local.fancy_search_term);
    const modal_visible=useSelector((state)=>state.local.modal.visible);
    const dispatch=useDispatch();

    const container_elem=useRef(null);
    const input_elem=useRef(null);

    useEffect(()=>{
        forceCheck(); // otherwise some zones may be invisible

        if(modal_visible) // no fancy search when modal is shown
            return;

        function on_keypress(e) {
            let k=e.key.toLowerCase();
            //console.log(k);

            // if we are in ctrl-input itself
            if(e.target===input_elem.current) {
                if(k==='enter' && term!==null) { // press enter to release focus
                    e.preventDefault();
                    input_elem.current.blur();
                }
            }

            // skip if we are in other inputs
            if(['input', 'textarea'].indexOf(e.target.tagName.toLowerCase())!==-1)
                return;

            if(e.ctrlKey || e.altKey || e.metaKey)
                return;

            if(k==='backspace' && term) {
                e.preventDefault();
                dispatch(set_fancy_search('backspace'));
            } else if(k==='escape' && term!==null) {
                e.preventDefault();
                dispatch(set_fancy_search('set',null));
            } else if(/^[a-z0-9]$/.test(k)) {
                e.preventDefault();
                dispatch(set_fancy_search('append',k));
            }
        }

        document.addEventListener('keydown',on_keypress,{passive: false, capture: true});
        return ()=>{
            document.removeEventListener('keydown',on_keypress,{passive: false, capture: true});
        }
    },[term,modal_visible]);

    useEffect(()=>{
        if(input_elem.current) {
            input_elem.current.focus();
        }
    },[term]);

    if(term===null)
        return null;

    function handle_input(e) {
        dispatch(set_fancy_search('set',e.target.value));
    }

    return (
        <div className="fancy-search-ctrl">
            <div className="width-container" ref={container_elem}>
                <span style={{float: 'right'}}>
                    {!!term &&
                        <Popover
                            title="快速筛选" content={<FancySearchHelp />} trigger="click"
                            placement="topRight" getPopupContainer={()=>container_elem.current}
                        >
                            <span style={{cursor: 'pointer'}}>
                                &nbsp;<QuestionCircleOutlined />&nbsp;
                            </span>
                        </Popover>
                    }
                    <span style={{cursor: 'pointer'}} onClick={()=>dispatch(set_fancy_search('set',null))}>
                        &nbsp;<CloseCircleOutlined />&nbsp;
                    </span>
                </span>
                &nbsp;<SearchOutlined /> &nbsp;
                <input
                    value={term} onChange={handle_input} ref={input_elem} placeholder="筛选课程或类别"
                    onBlur={()=>{if(term==='') dispatch(set_fancy_search('set',null))}}
                />
            </div>
        </div>
    );
}