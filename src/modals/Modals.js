import React from 'react';

import {ModalAdd} from './ModalAdd';
import {ModalUpdate} from './ModalUpdate';
import {ModalReorder} from './ModalReorder';
import {ModalSettings} from './ModalSettings';

import './Modals.less';

export function Modals(props) {
    return [
        <ModalAdd key="add" />,
        <ModalUpdate key="update" />,
        <ModalReorder key="reorder" />,
        <ModalSettings key="settings" />,
    ];
}