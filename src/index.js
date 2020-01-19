import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {ConfigProvider} from 'antd';

import Root from './logic/Root';

import {reduce} from './state/reducer';
import * as serviceWorker from './serviceWorker';
import moment from 'moment';
import zhCN from 'antd/es/locale/zh_CN';
import 'moment/locale/zh-cn';

import './index.less';

let store=applyMiddleware(thunk)(createStore)(
    reduce,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

moment.locale('zh-cn');

ReactDOM.render(
    <Provider store={store}>
        <ConfigProvider autoInsertSpaceInButton={false} locale={zhCN}>
            <Root />
        </ConfigProvider>
    </Provider>
    ,document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
