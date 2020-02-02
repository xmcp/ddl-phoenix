import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, Icon, Checkbox} from 'antd';

import {close_modal_if_success} from './modal_common';

import {dflt} from '../functions';
import {do_update_settings, close_modal} from '../state/actions';

export function ModalSettings(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state) => state.local.modal);
    const settings=useSelector((state) => state.user.settings);

    const [no_hover, set_no_hover]=useState(false);
    const [hide_ignored, set_hide_ignored]=useState(false);

    useEffect(() => {
        set_no_hover(dflt(settings.no_hover, false));
        set_hide_ignored(dflt(settings.hide_ignored, false));
    }, [modal, settings.no_hover]);

    if(modal.type!=='settings') return (<Modal visible={false} />);

    function do_post() {
        dispatch(do_update_settings({
            no_hover: no_hover,
            hide_ignored: hide_ignored,
        }))
            .then(close_modal_if_success(dispatch));
    }

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="setting" /> 设置</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div className="settings-items">
                <p><Checkbox checked={no_hover} onChange={(e) => set_no_hover(e.target.checked)}>
                    用点击替代鼠标悬浮效果
                </Checkbox></p>
                <p><Checkbox checked={hide_ignored} onChange={(e) => set_hide_ignored(e.target.checked)}>
                    不显示任务的“忽略”按钮
                </Checkbox></p>
            </div>
        </Modal>
    );
}