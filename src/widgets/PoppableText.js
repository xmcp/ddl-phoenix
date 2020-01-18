import React, {useState, useRef, useEffect} from 'react';
import {Dropdown, Menu, message} from 'antd';
import PropTypes from 'prop-types';

const STABLIZE_THRESHOLD_MS=100;

export function PoppableText(props) {
    const [dropdown_visible,set_dropdown_visible]=useState(false);

    function menu_onclick({key}) {
        props.menu[parseInt(key)].onClick();
        set_dropdown_visible(false);
    }

    let menu_elem=(
        <Menu onClick={menu_onclick}>
            {props.menu.map((m,idx)=>(
                <Menu.Item key={idx}>
                    {m.children}
                </Menu.Item>
            ))}
        </Menu>
    );

    let last_touch_end_ts=useRef(-STABLIZE_THRESHOLD_MS);
    function on_click(_) {
        if((+new Date())-last_touch_end_ts.current>=STABLIZE_THRESHOLD_MS) {
            if(props.menu.length) {
                props.menu[0].onClick();
                set_dropdown_visible(false);
            }
        }
    }
    function on_touch_end(e) {
        if(e.cancelable) {
            if(!dropdown_visible)
                last_touch_end_ts.current=(+new Date());
        }
    }

    let last_vis_change_ts=useRef(-STABLIZE_THRESHOLD_MS);
    function on_vis_change(v) {
        let ts=(+new Date());
        if(ts-last_vis_change_ts.current>=STABLIZE_THRESHOLD_MS) {
            last_vis_change_ts.current=ts;
            set_dropdown_visible(v);
        }
    }

    return (
        <Dropdown overlay={menu_elem} trigger={['hover','click']} mouseEnterDelay={0} mouseLeaveDelay={0.1}
                  visible={dropdown_visible} onVisibleChange={on_vis_change}>
            <span className={'clickable-text '+(props.className||'')} onTouchEnd={on_touch_end} onClick={on_click}>
                {props.children}
            </span>
        </Dropdown>
    );
}
PoppableText.propTypes={
    menu: PropTypes.arrayOf(PropTypes.shape({
        children: PropTypes.node,
        onClick: PropTypes.func,
    })).isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
};