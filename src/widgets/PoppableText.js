import React from 'react';
import {Dropdown, Menu} from 'antd';
import PropTypes from 'prop-types';

import {ClickableText} from './ClickableText';

export function PoppableText(props) {
    function menu_onclick({key}) {
        props.menu[parseInt(key)].onClick();
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

    return (
        <Dropdown overlay={menu_elem} trigger={['hover']} mouseEnterDelay={0} mouseLeaveDelay={0.1}>
            <span className="clickable-text" onClick={()=>props.menu[0].onClick()}>
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
    children: PropTypes.node
};