export function scope_name(scope) {
    return {
        zone: '课程',
        project: '项目',
        task: '任务',
    }[scope]||scope||'';
}

export function next_scope(scope) {
    return {
        zone: 'project',
        project: 'task'
    }[scope]||scope;
}

export function completeness_name(compl) {
    return {
        done: '已完成',
        ignored: '忽略',
        highlight: '高亮',
        todo: '待办',
    }[compl]||compl||'';
}

export function colortype(task) { // return [bg,fg,border]
    if(task.status==='placeholder') return 'placeholder';
    else return task.completeness;
}
export function colorize(colortype) {
    if(colortype==='placeholder') return ['hsl(0,0%,99%)','hsl(0,0%,30%)','hsl(0,0%,50%)'];
    else if(colortype==='done') return ['hsl(110,70%,97%)','hsl(110,20%,50%)','hsl(110,30%,70%)'];
    else if(colortype==='ignored') return ['hsl(0,0%,97%)','hsl(0,0%,50%)','hsl(0,0%,80%)'];
    else if(colortype==='highlight') return ['hsl(60,100%,50%)','hsl(60,70%,15%)','hsl(60,100%,40%)'];
    else if(colortype==='todo') return ['hsl(210,90%,50%)','white','hsl(210,100%,70%)'];
    else return [null,null,null];
}