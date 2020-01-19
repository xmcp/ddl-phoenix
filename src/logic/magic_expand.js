import React from 'react';

export function MagicExpandHelp(props) {
    return (
        <div>
            <p>可以输入这样的内容：</p>
            <ul>
                <li><code>Week [1-16]</code></li>
                <li><code>第[八-十五]章习题</code></li>
                <li><code>练习[3 5 10 14]</code></li>
                <li><code>[Data Bomb Proxy] Lab</code></li>
            </ul>
            <p>它们将会自动展开为多行（最多{MAX_EXPANSION_COUNT}行）。</p>
        </div>
    )
}

const MAX_EXPANSION_COUNT=50;
const BRACKET_PATTERN=/(\[[^\]]+])/;
const CHI_PATTERN=/^(?:([一二三四五六七八九])?十([一二三四五六七八九])?|([一二三四五六七八九零]))$/;
const NUM_PATTERN=/^\d{1,2}$/;
const CHINUM={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'零':0};
const NUMCHI=['零','一','二','三','四','五','六','七','八','九'];

function chi2num(c) {
    let r=CHI_PATTERN.exec(c);
    if(!r) return null;

    let [__,p1,p2,psingle,..._]=r;
    if(psingle)
        return CHINUM[psingle];
    else
        return 10*CHINUM[p1||'一']+CHINUM[p2||'零'];
}
function num2chi(n) {
    if(0<=n && n<10)
        return NUMCHI[n];
    else if(n>=10 && n<100) {
        let p1=Math.floor(n/10), p2=n%10;
        return (p1===1 ? '' : NUMCHI[p1])+'十'+(p2===0 ? '' : NUMCHI[p2]);
    } else
        return null;
}

function range(a,b) {
    let res=[],x,y,d;
    if(a<=b) {
        x=a; y=b+1; d=1;
    } else {
        x=a; y=b-1; d=-1;
    }
    for(let i=x;i!==y;i+=d)
        res.push(i);
    return res;
}

function parse_seg(s) {
    if(s.charAt(0)!=='[' || s.charAt(s.length-1)!==']')
        return [s];
    else {
        s=s.substr(1,s.length-2);
        let splited,ret=[];

        // [a b c]

        splited=s.split(/ /);
        if(splited.length>1)
            return splited;

        // [from-to]

        splited=s.split('-');
        if(splited.length!==2)
            return [s];
        let [sfrom,sto]=splited;

        if(NUM_PATTERN.test(sfrom) && NUM_PATTERN.test(sto)) {
            let from=parseInt(sfrom), to=parseInt(sto);
            return range(from,to).map((n)=>n+'');
        } else if(CHI_PATTERN.test(sfrom) && CHI_PATTERN.test(sto)) {
            let from=chi2num(sfrom), to=chi2num(sto);
            return range(from,to).map(num2chi);
        } else
            return [s];
    }
}

const ExpansionCountExceededException=Symbol('expansion count exceeded exception');

function expand_list(li,start_idx,prefix) { // -> list of str
    if(start_idx>=li.length) return [prefix];

    let ret=[];
    parse_seg(li[start_idx]).forEach((s)=>{
        ret=ret.concat(expand_list(li,start_idx+1,prefix+s));
        if(ret.length>MAX_EXPANSION_COUNT)
            throw ExpansionCountExceededException;
    });
    return ret;
}

export function magic_expand(pattern) {
    try {
        return expand_list(pattern.split(BRACKET_PATTERN),0,'').join('\n');
    } catch(e) {
        if(e===ExpansionCountExceededException)
            return [pattern];
        else
            throw e;
    }
}