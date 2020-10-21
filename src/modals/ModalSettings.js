import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, Checkbox, InputNumber, Button} from 'antd';
import fileDownload from 'js-file-download';

import {close_modal_if_success} from './modal_common';

import {dflt} from '../functions';
import {do_update_settings, close_modal} from '../state/actions';

import {SettingOutlined, CloudDownloadOutlined, CloudUploadOutlined} from '@ant-design/icons';

export function ModalSettings(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);
    const settings=useSelector((state)=>state.user.settings);
    const all_state=useSelector((state)=>state);

    const [collapse_all_past, set_collapse_all_past]=useState(false);
    const [todo_max_lines, set_todo_max_lines]=useState(3);

    useEffect(() => {
        set_collapse_all_past(dflt(settings.collapse_all_past, false));
        set_todo_max_lines(dflt(settings.todo_max_lines,5));
    }, [modal, settings.collapse_all_past, settings.todo_max_lines]);

    if(modal.type!=='settings') return (<Modal visible={false} />);

    function do_post() {
        dispatch(do_update_settings({
            collapse_all_past: collapse_all_past,
            todo_max_lines: todo_max_lines,
        }))
            .then(close_modal_if_success(dispatch));
    }

    function do_export_data() {
        let exported=JSON.stringify({...all_state, local: null});
        fileDownload(exported,'all_data.json');
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
                    <Checkbox checked={collapse_all_past} onChange={(e)=>set_collapse_all_past(e.target.checked)}>
                        折叠全部完成或搁置的任务
                    </Checkbox>
                    <br />
                    <small>默认会展示最后一项完成或搁置的任务，来帮助你了解自己的完成进度</small>
                </p>
                <br />
                <p>
                    最多的待办任务数量：
                    <InputNumber value={todo_max_lines} onChange={set_todo_max_lines} min={1} max={99} />
                    <br />
                    <small>在电脑端界面中，超过此数量的待办任务会被折叠</small>
                </p>
                <br />
                <p>
                    <b>个人数据：</b>
                    <Button onClick={do_export_data}>
                        <CloudDownloadOutlined /> 导出
                    </Button>
                    &nbsp;
                    <Button disabled>
                        <CloudUploadOutlined /> 导入（即将上线）
                    </Button>
                </p>
            </div>
        </Modal>
    );
}