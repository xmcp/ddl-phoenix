import moment from 'moment';

export const TIMEZONE='+08:00';

export function scope_name(scope) {
    return {
        zone: '课程',
        project: '类别',
        task: '任务',
    }[scope]||scope||'';
}

export function next_scope(scope) {
    return {
        zone: 'project',
        project: 'task'
    }[scope]||null;
}

export function prev_scope(scope) {
    return {
        project: 'zone',
        task: 'project'
    }[scope]||null;
}

export function completeness_name(ctype) {
    return {
        done: '完成',
        ignored: '搁置',
        highlight: '旗标',
        todo: '待办',
        placeholder: '占位'
    }[ctype]||ctype||'';
}

export function colortype(task) {
    if(task.completeness==='todo')
        return task.status==='placeholder' ? 'placeholder' : 'todo';
    else
        return task.completeness;
}

export function moment_to_day(m) {
    return m.utcOffset(TIMEZONE).hour(0).minute(0).second(0).millisecond(0);
}

export function days_to(m,ref) {
    return Math.round(moment.duration(m.diff(ref)).asDays());
}

export function friendly_date(ts,use_rel=true) {
    let date=moment_to_day(moment.unix(ts));
    let today=moment_to_day(moment());
    let days_to_due=days_to(date,today);

    let ret='';

    if(use_rel && -7<=days_to_due && days_to_due<=7) { // rel format
        ret+={
            '-7': '7天前',
            '-6': '6天前',
            '-5': '5天前',
            '-4': '4天前',
            '-3': '3天前',
            '-2': '2天前',
            '-1': '昨天',
            0: '今天',
            1: '明天',
            2: '2天后',
            3: '3天后',
            4: '4天后',
            5: '5天后',
            6: '6天后',
            7: '7天后',
        }[days_to_due];
    } else { // abs format
        if(date.year()===today.year())
            ret+='';
        else if(date.year()===today.year()+1)
            ret+='明年';
        else if(date.year()===today.year()-1)
            ret+='去年';
        else
            ret+=date.year()+'年';
        ret+=(date.month()+1)+'月';
        ret+=date.date()+'日';
    }

    ret+=' (周'+('日一二三四五六日'.charAt(date.day()))+')';

    return ret;
}

export function dflt(val,default_value) {
    return val===undefined? default_value: val;
}