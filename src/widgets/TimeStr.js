import React from 'react';
import TimeAgo from 'react-timeago';
import chineseStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const chinese_format=buildFormatter(chineseStrings);

export function TimeStr(props) {
    if(!props.time)
        return '从未';
    else
        return (
            <TimeAgo date={props.time} formatter={chinese_format} />
        );
}