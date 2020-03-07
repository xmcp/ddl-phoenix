import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Popover} from 'antd';

import {set_fancy_search} from '../state/actions';
import {forceCheck} from 'react-lazyload';

import './FancySearch.less';
import {SearchOutlined, QuestionCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {FancySearchHelp} from '../logic/fancy_search_core';

const KEY_THROTTLE_MS=100;

export function FancySearchCtrl(props) {
    const term=useSelector((state)=>state.local.fancy_search_term);
    const modal_visible=useSelector((state)=>state.local.modal.visible);
    const dispatch=useDispatch();
    const [ime_chger,set_ime_chger]=useState(0);

    const container_elem=useRef(null);
    const input_elem=useRef(null);

    const last_key_event=useRef({ts: -KEY_THROTTLE_MS, key: null});

    useEffect(()=>{
        forceCheck();

        if(modal_visible) // no fancy search when modal is shown
            return;

        function on_keypress(e) {
            let k=e.key.toLowerCase();
            //console.log(k);

            // skip if we are in other inputs
            if(e.target!==input_elem.current && ['input', 'textarea'].indexOf(e.target.tagName.toLowerCase())!==-1)
                return;

            if(e.ctrlKey || e.altKey || e.metaKey)
                return;

            // duplicated key in ios ime scenario
            if(last_key_event.current.key===k && (+new Date()-last_key_event.current.ts)<KEY_THROTTLE_MS)
                return;

            last_key_event.current.key=k;
            last_key_event.current.ts=(+new Date());

            if(k==='backspace' && term) {
                e.preventDefault();
                dispatch(set_fancy_search('backspace'));
            } else if(k==='escape' && term!==null) {
                e.preventDefault();
                dispatch(set_fancy_search('set',null));
            } else if(k==='enter' && term!==null) {
                e.preventDefault();
                if(input_elem.current)
                    input_elem.current.blur();
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

    function handle_ime_input(e) {
        let k=e.nativeEvent.data;
        if(/^[a-z0-9]$/.test(k)) {
            // duplicated key in ios ime scenario
            if(last_key_event.current.key===k && (+new Date()-last_key_event.current.ts)<KEY_THROTTLE_MS)
                return;

            last_key_event.current.key=k;
            last_key_event.current.ts=(+new Date());

            //console.log('fancy search ime input',k);

            dispatch(set_fancy_search('append',k));
            set_ime_chger(1-ime_chger);
        }
    }

    useEffect(()=>{
        if(input_elem.current) {
            input_elem.current.focus();
        }
    },[term,ime_chger]);

    if(term===null)
        return null;

    return (
        <div className="fancy-search-ctrl">
            <div className="width-container" ref={container_elem}>
                <span style={{float: 'right'}}>
                    {!!term &&
                        <Popover
                            title="快速筛选" content={<FancySearchHelp />} trigger="click"
                            placement="bottomRight" getPopupContainer={()=>container_elem.current}
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
                    value={term} key={ime_chger} onChange={handle_ime_input} ref={input_elem} placeholder="筛选课程或类别"
                    onBlur={()=>{if(term==='') dispatch(set_fancy_search('set',null))}}
                />
            </div>
        </div>
    );
}