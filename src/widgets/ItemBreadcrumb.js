import React from 'react';
import {useSelector} from 'react-redux';
import {Icon} from 'antd';
import PropTypes from 'prop-types';

import './ItemBreadcrumb.less';

export function ItemBreadcrumb(props) {
    let got=useSelector((state)=>{
        if(props.scope==='zone') return [
            state.zone[props.id].name
        ];
        else if(props.scope==='project') return [
            state.zone[state.project[props.id].parent_id].name,
            state.project[props.id].name
        ];
        else if(props.scope==='task') return [
            state.zone[state.project[state.task[props.id].parent_id].parent_id].name,
            state.project[state.task[props.id].parent_id].name,
            state.task[props.id].name
        ];
        else return [];
    });

    let result=props.suffix!==undefined ? got.concat([props.suffix]) : got;

    return (
        <span>
            {result.map((item,idx)=>(
                <span key={idx} className="item-breadcrumb-item">
                    {item}{idx!==result.length-1 &&
                        <span className="item-breadcrumb-symbol"><Icon type="right" /></span>
                    }
                </span>
            ))}
        </span>
    );
}
ItemBreadcrumb.propTypes={
    scope: PropTypes.oneOf(['zone','project','task',null]),
    id: PropTypes.number,
    suffix: PropTypes.node,
};
