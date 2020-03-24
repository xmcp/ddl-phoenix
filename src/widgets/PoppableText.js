import React, {useState, useRef, useEffect} from 'react';
import {Dropdown, Menu} from 'antd';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';

const STABLIZE_THRESHOLD_MS=100;

export function PoppableText(props) {
    const [dropdown_visible,set_dropdown_visible]=useState(false);
    const is_sorting=useSelector((state)=>state.local.main_list_sorting);

    useEffect(()=>{
        if(is_sorting)
            set_dropdown_visible(false);
    },[is_sorting]);

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

    function on_click(_) {
        if(props.menu.length && dropdown_visible) {
            props.menu[0].onClick();
            set_dropdown_visible(false);
        }
    }

    let last_vis_change_ts=useRef(-STABLIZE_THRESHOLD_MS);
    function on_vis_change(v) {
        let ts=(+new Date());
        if(ts-last_vis_change_ts.current>=STABLIZE_THRESHOLD_MS) {
            last_vis_change_ts.current=ts;
            if(!(v && is_sorting)) // don't show dropdown when sorting
                set_dropdown_visible(v);
        }
    }

    return (
        <Dropdown overlay={menu_elem} trigger={['click']}
                  visible={dropdown_visible} onVisibleChange={on_vis_change}>
            <span className={'clickable-text '+(props.className||'')} onClick={on_click}>
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