import React from 'react';
import PropTypes from 'prop-types';

import {
    SmallDashOutlined,
    CheckSquareOutlined,
    HourglassOutlined,
    FlagOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

export function IconForColorType(props) {
    let Widget={
        placeholder: SmallDashOutlined,
        done: CheckSquareOutlined,
        ignored: HourglassOutlined,
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