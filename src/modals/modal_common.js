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
            <p>分享给他人：</p>
            <ul>
                <li>在 “编辑类别” 对话框中勾选 “分享给其他用户”。</li>
                <li>保存后，在类别的下拉菜单中点击 “复制分享ID” 并发送给别人。</li>
                <li><b style={{color: 'red'}}>如果你取消勾选 “分享给其他用户”，分享ID将失效，但已经导入的用户仍能继续使用。</b></li>
                <li><b style={{color: 'red'}}>如果你取消分享后删除这个类别，已经导入的用户仍能继续使用，但没有人能编辑。</b></li>
            </ul>
            <p>导入他人的分享：</p>
            <ul>
                <li>在 “添加类别” 对话框中输入分享ID。</li>
                <li>你将看到对方分享的内容，你可以标记自己的完成状态，但不能进行其他编辑。</li>
                <li>如果你删除这个类别，将不会影响到别人。</li>
            </ul>
        </div>
    );
}