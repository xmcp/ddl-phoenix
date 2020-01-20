import React from 'react';

import moment from 'moment';
import {moment_to_day} from '../functions';

/*

Representation of date:

key shortcut:
- `q`~`u` for days within 1 week
- `qq`~`uu` for days bewteen 1 week and 2 weeks
- ` ` for next week, again for next 2 week
- `n` for now

numeric input:
- dd for days within 1 month
- mmdd for days within 1 year
- yymmdd

relative nav:
- `j`, `k` to navigate by week
- `h`, `l` to navigate by day

*/

export function QuicktypeHelp(props) {
    return (
        <div>
            <p>支持按以下格式输入日期：</p>
            <ul>
                <li><code>20</code> 表示接下来（本月或下月）的20日</li>
                <li><code>0320</code> 表示接下来（今年或明年）的3月20日</li>
                <li><code>210320</code> 表示2021年3月20日</li>
            </ul>
            <p>支持以下快捷键：</p>
            <ul>
                <li><kbd>Q</kbd>~<kbd>U</kbd> 表示接下来（本周或下周）的星期一至星期日</li>
                <li><kbd>N</kbd> 表示今日</li>
                <li><kbd>Space</kbd> 表示下周的今日</li>
                <li><kbd>BackSpace</kbd> 清除</li>
                <li><kbd>J</kbd>, <kbd>K</kbd> 向下、向上移动一周</li>
                <li><kbd>H</kbd>, <kbd>L</kbd> 向前、向后移动一天</li>
            </ul>
        </div>
    )
}

export function is_quicktype_char(c) {
    return [
        'q','w','e','r','t','y','u',
        'n',' ','backspace','h','j','k',
        'l','1','2','3','4','5','6','7','8','9','0'
    ].indexOf(c.toLowerCase())!==-1;
}

export function init_quicktype(ts) {
    return {
        buffer: '',
        placeholder: '输入或选择日期',
        moment: ts===null ? null : moment_to_day(moment.unix(ts)), // moment or null
        prev_shortcut: '',
    }
}

const WEEKDAY_SHORTCUT={q:1,w:2,e:3,r:4,t:5,y:6,u:0};
const WEEKDAY_NAME='日一二三四五六日';

function proc_key_shortcut(prev_state,ch) {
    let nxt_moment=moment_to_day(moment());
    let nxt_prev_shortcut=ch;

    function done_quicktype(msg) {
        return {
            buffer: '',
            placeholder: msg,
            moment: nxt_moment,
            prev_shortcut: nxt_prev_shortcut,
        };
    }

    if(WEEKDAY_SHORTCUT[ch]!==undefined) { // q to u
        let delta_days=(WEEKDAY_SHORTCUT[ch]-nxt_moment.day()+7)%7;
        if(delta_days===0) delta_days=7;
        if(prev_state.prev_shortcut===ch) {
            delta_days+=7;
            nxt_prev_shortcut='';
        }
        nxt_moment.add(delta_days,'days');
        return done_quicktype((nxt_prev_shortcut===''?'再':'')+'下个星期'+WEEKDAY_NAME[WEEKDAY_SHORTCUT[ch]]);
    } else if(ch===' ') {
        if(prev_state.prev_shortcut===' ') {
            nxt_moment.add(2,'weeks');
            nxt_prev_shortcut='';
            return done_quicktype('两周后');
        } else {
            nxt_moment.add(1,'week');
            return done_quicktype('一周后');
        }
    } else if(ch==='\b') {
        if(prev_state.buffer==='') {
            nxt_moment=null;
            return done_quicktype('清除日期');
        } else
            return null;
    } else if(ch==='j' || ch==='k') {
        nxt_moment=(prev_state.moment||nxt_moment).clone().add(ch==='j'?1:-1,'week');
        return done_quicktype(ch==='j'?'↓ 下一周':'↑ 上一周');
    } else if(ch==='h' || ch==='l') {
        nxt_moment=(prev_state.moment||nxt_moment).clone().add(ch==='l'?1:-1,'day');
        return done_quicktype(ch==='l'?'→ 后一天':'← 前一天');
    } else if(ch==='n') {
        if(prev_state.prev_shortcut==='n') {
            nxt_moment.add(1,'day');
            nxt_prev_shortcut='';
            return done_quicktype('明天');
        } else {
            return done_quicktype('今天');
        }
    } else
        return null;
}

function parse_numeric_date(s) {
    let mom=moment_to_day(moment());
    let len=s.length;
    if(len===0) return null;
    else if(len<=2) { // d or dd
        let d=parseInt(s);
        if(mom.date()>=d) mom.add(1,'month');

        if(d<=0 || d>mom.endOf('month').date()) return null;
        mom.date(d);

        return mom;
    } else if(len<=4) { // mdd or mmdd
        let m=parseInt(s.substr(0,len-2)), d=parseInt(s.substr(len-2,2));
        if(mom.month()+1>m || (mom.month()+1===m && mom.date()>=d)) mom.add(1,'year');

        if(m<=0 || m>12) return null;
        mom.month(m-1);

        if(d<=0 || d>mom.endOf('month').date()) return null;
        mom.date(d);

        return mom;
    } else if(len===6 || len===8) { // yymmdd or yyyymmdd
        let y=parseInt(s.substr(0,len-4)), m=parseInt(s.substr(len-4,2)), d=parseInt(s.substr(len-2,2));

        if(m<=0 || m>12) return null;
        mom.year(y<100 ? (2000+y) : y).month(m-1);

        if(d<=0 || d>mom.endOf('month').date()) return null;
        mom.date(d);

        return mom;
    } else
        return null;
}

export function proc_input(prev_state,ch) {
    console.log('quicktype proc input "'+ch+'"');

    let res=proc_key_shortcut(prev_state,ch);
    if(res!==null) return res;

    // otherwise it is numeric input
    let msg='';
    let nxt_buffer=prev_state.buffer;

    if(ch==='\b')
        nxt_buffer=nxt_buffer.substr(0,nxt_buffer.length-1);
    else if(/^[0-9]$/.test(ch))
        nxt_buffer+=ch;
    else // shouldn't happen
        ;

    return set_numeric_buffer(nxt_buffer);
}

export function set_numeric_buffer(buf) {
    console.log('quicktype set numeric buffer',buf);

    let m=parse_numeric_date(buf);

    return {
        buffer: buf,
        placeholder: m===null ? '输入日期无效' : '输入了日期',
        moment: m,
        prev_shortcut: '',
    }
}

export function set_moment(m) {
    console.log('quicktype set moment',m ? m.format() : m);

    return {
        buffer: '',
        placeholder: '选择了日期',
        moment: m===null ? null : moment_to_day(m),
        prev_shortcut: '',
    }
}