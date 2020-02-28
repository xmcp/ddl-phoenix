import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

import './ItemBreadcrumb.less';
import {RightOutlined} from '@ant-design/icons';

export function ItemBreadcrumb(props) {
    let got=useSelector((state)=>{
        try {
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
        } catch(e) {
            console.error('item breadcrumb key error');
            console.trace(e);
            return ['???'];
        }
    });

    let result=props.suffix!==undefined ? got.concat([props.suffix]) : got;

    return (
        <span>
            {result.map((item,idx)=>(
                <span key={idx} className="item-breadcrumb-item">
                    {(idx!==result.length-1 || !props.hide_last) &&
                        item
                    }
                    {idx!==result.length-1 &&
                        <span className="item-breadcrumb-symbol"><RightOutlined /></span>
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
    hide_last: PropTypes.bool,
};
