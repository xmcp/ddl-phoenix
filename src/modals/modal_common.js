import React from 'react';

import {close_modal} from '../state/actions';

export function close_modal_if_success(dispatch) {
    return (success) => {
        if(success)
            dispatch(close_modal());
    };
}

export function SharingHelp(props) {
    return (
        <div>
            <p>支持 “私密分享” 和 “公开分享” 两种模式：</p>
            <ul>
                <li>私密分享时，将随机生成分享ID，别人可以在 “添加类别” 文本框中输入此ID。</li>
                <li>公开分享时，可以指定列表名称，允许别人通过名称搜索到此列表。</li>
            </ul>
            <p>分享时的权限：</p>
            <ul>
                <li>分享后，只有你能修改布置状态、截止时间和备注，但每个人的完成情况是独立的。</li>
                <li>如果取消分享，原先的分享ID将失效，但已经导入的用户不受影响。</li>
                <li>如果取消分享后删除这个类别，已经导入的用户不受影响，但没有人能再编辑。</li>
            </ul>
        </div>
    );
}

export function SharedHelp(props) {
    return (
        <div>
            <p>如果你收到了形如 “名称@@代码” 的分享ID，粘贴到文本框中来导入此列表。</p>
            <p>要查看公开分享的列表，可以点击 “搜索” 标签。</p>
        </div>
    )
}