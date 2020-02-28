import React from 'react';
import PropTypes from 'prop-types';

import {
    SmallDashOutlined,
    CheckSquareOutlined,
    StopOutlined,
    FlagOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

export function IconForColorType(props) {
    let Widget={
        placeholder: SmallDashOutlined,
        done: CheckSquareOutlined,
        ignored: StopOutlined,
        highlight: FlagOutlined,
        todo: ClockCircleOutlined,
    }[props.type];
    return (
        <Widget className={props.className}/>
    )
}
IconForColorType.propTypes={
    type: PropTypes.oneOf(['placeholder','done','ignored','highlight','todo']).isRequired
};