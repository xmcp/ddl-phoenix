export function save(ver,userkey,resp) {
    if(resp.error) return;
    console.log('offline cache: saving',ver,resp);
    localStorage['PHOENIX_OFFLINE_CACHE']=JSON.stringify({
        ver: ver,
        userkey: userkey,
        resp: resp,
    });
}

export function load(ver,userkey) {
    let cache_txt=localStorage['PHOENIX_OFFLINE_CACHE'];
    if(!cache_txt) return null;
    try {
        let data=JSON.parse(cache_txt);
        if(data.ver!==ver || data.userkey!==userkey) return null;
        console.log('offline cache: loaded',data);
        return data.resp;
    } catch(e) {
        console.error('offline cache: load FAILED');
        console.trace(e);
    }
}