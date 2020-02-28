import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, Checkbox} from 'antd';

import {close_modal_if_success} from './modal_common';

import {dflt} from '../functions';
import {do_update_settings, close_modal} from '../state/actions';

import {SettingOutlined} from '@ant-design/icons';

export function ModalSettings(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state) => state.local.modal);
    const settings=useSelector((state) => state.user.settings);

    const [collapse_all_past, set_collapse_all_past]=useState(false);

    useEffect(() => {
        set_collapse_all_past(dflt(settings.collapse_all_past, false));
    }, [modal, settings.collapse_all_past]);

    if(modal.type!=='settings') return (<Modal visible={false} />);

    function do_post() {
        dispatch(do_update_settings({
            collapse_all_past: collapse_all_past,
        }))
            .then(close_modal_if_success(dispatch));
    }

    return (
        <Modal
            visible={modal.visible}
            title={<span><SettingOutlined /> 设置</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div className="settings-items">
                <p>
                    <Checkbox checked={collapse_all_past} onChange={(e) => set_collapse_all_past(e.target.checked)}>
                        折叠全部完成或忽略的任务
                    </Checkbox>
                    <br />
                    <small>默认会展示最后一项完成或忽略的任务，来帮助你了解自己的完成进度</small>
                </p>
            </div>
        </Modal>
    );
}