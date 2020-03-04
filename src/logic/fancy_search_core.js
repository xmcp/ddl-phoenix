import React from 'react';

import dictNotoneOrigin from "./pinyin_dict.min.json";

const dictNotone={};
Object.keys(dictNotoneOrigin).forEach((k)=>{
    let v=dictNotoneOrigin[k];
    for(let i=0;i<v.length;i++) {
        if(!dictNotone[v[i]])
            dictNotone[v[i]] = k;
    }
});

export function FancySearchHelp(props) {
    return (
        <div>
            <p>通过拼音筛选课程和类别。按 ESC 清除筛选。</p>
            <br />
            <p>例如，要想找到 “马原 > MOOC作业”，可以输入：</p>
            <ul>
                <li><code>mayuan</code>（马原）</li>
                <li><code>mooczy</code>（MOOC作业）</li>
                <li><code>mymo</code>（马原MO）</li>
                <li><code>mayzy</code>（马原作业）</li>
            </ul>
        </div>
    );
}

function pinyinify(s) {
    let ret=[];
    for(let i=0;i<s.length;i++)
        if(dictNotone[s[i]]!==undefined)
            ret.push(' '+dictNotone[s[i]]+' ');
        else
            ret.push(s[i]);
    return ret.join('');
}

function chartype(c) {
    return /[a-z]/.test(c) ? 'w' : /[0-9]/.test(c) ? 'd' : 'x';
}

window._seg_store={};
function get_segment(ss) {
    if(window._seg_store[ss]!==undefined)
        return window._seg_store[ss];

    let s=(' '+pinyinify(ss,' ').toLowerCase()+' ').replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ');

    let ret={
        chars: '',
        jumpable: [],
    };
    // assert s[0]===' '
    for(let i=1;i<s.length;i++) {
        if(s[i]===' ') continue;

        ret.chars+=s[i];
        ret.jumpable.push(chartype(s[i])!==chartype(s[i-1]));
    }

    //console.log('calc segment',ss,ret.chars);////

    window._seg_store[ss]=ret;
    return ret;
}

window._search_store={};
export function test_term(s,term) {
    if(window._search_store[s.length+'-'+s+term]!==undefined)
        return window._search_store[s.length+'-'+s+term];

    function memorize(ret) {
        //console.log('test term',s,term,ret);////
        window._search_store[s.length+'-'+s+term]=ret;
        return ret;
    }

    let {chars,jumpable}=get_segment(s);
    let head=0;
    for(let i=0;i<term.length;i++) {
        if(head>=chars.length) return memorize(false);

        let c=term[i];
        // always possible to jump to next char
        if(chars[head]!==c) {
            for(head++;;head++) {
                if(head>=chars.length) return memorize(false);

                if(chars[head]!==c) continue;

                // assert jumpable[0]===true
                let pseg=head;
                while(!jumpable[pseg]) pseg--;

                // jump in the middle of a jumpable segment [pseg..]
                let len=head-pseg+1;
                if(chars.substr(pseg,len)===term.substr(i-len+1,len)) // ok
                    break;
                // otherwise keep searching
            }
        }
        head++;
    }
    return memorize(true);
}