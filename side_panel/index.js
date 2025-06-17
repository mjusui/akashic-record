(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'click/fetch-result'){
      const { args: reqjson, resultid, }=target.dataset;
      const reqopt=JSON.parse(reqjson);
      const { pathname, }=reqopt;

      if(pathname === '/working_records'){
        const staffs=util.getResult('textarea-staff-result');
        const staffs_group=Object.groupBy(staffs, (staff, idx)=> Math.floor(idx/50) )
        const staffs_list=Object.values(staffs_group);
        const staff_ids_list=staffs_list.map(staffs => staffs.map(staff => staff.id).join(',') );
        reqopt.iter=staff_ids_list.map(staff_ids =>({ query: { staff_ids, }, }) );
      }

      util.request((errs, ...items)=>{

        if(errs){
          const { json, }=items[0];
          const result=document.getElementById(resultid);
          result.value=json;
          return;
        }
        if(pathname === '/staffs'){
          const staffs=items.map( ({ resp, })=>(
            resp.staffs.map(staff =>({
              id: staff.staffId,
              name: `${staff.lastName} ${staff.firstName}`,
            }) )
          ) ).flat(1);
          util.setResult(resultid, staffs);
          return;
        }
        if(pathname === '/working_records'){
          const { resp: recs, }=items[0];
          const recs_by_staffs=Object.groupBy(recs, rec => rec.staff_id);
          util.setResult(resultid, recs_by_staffs);
          return;
        }
        if(pathname === '/manhours'){
          const manhours=items.map( ({ resp, })=>(
            resp.manhours
          ) ).flat(1);
          const manhours_by_staffs=Object.groupBy(manhours, mh => mh.staff_id);
          util.setResult(resultid, manhours_by_staffs);
          return;
        }
      }, reqopt);
      return;
    }
    if(cmd === 'click/check-kosu'){
      const { resultid, }=target.dataset
      const staffs=util.getResult('textarea-staff-result');
      const records_list=util.getResult('textarea-kintai-result');
      const manhours_list=util.getResult('textarea-kosu-result');

      let csv='id,name,kintai,kosu\n';
      csv+=staffs.map(staff =>{
        const records=records_list[staff.id] || [];
        const manhours=manhours_list[staff.id] || [];

        return ([ staff.id, staff.name,
          records.length, manhours.length, ]).join(',');
      }).join('\n');

      util.setResult(resultid, csv, true);
      return;
    }
  };
  root.addEventListener('click', onclick);

  const onchange=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'change/save-value'){
      const { id, }=target;
      if(!id){
        return;
      }
      util.setValue(id, target.value);
      return;
    }
  };
  root.addEventListener('change', onchange);

  const select_endpoint=document.getElementById('select-endpoint');
  const input_token=document.getElementById('input-token');
  const input_coopid=document.getElementById('input-coopid');
  const input_start=document.getElementById('input-start');
  const input_end=document.getElementById('input-end');

  const init=()=>{
    for(let i=0; i < localStorage.length; i++){
      const key=localStorage.key(i);

      if( !(key.startsWith('value/') || key.startsWith('result/') )){
        continue;
      }
      const val=localStorage.getItem(key);

      const id=key.split('/')[1];
      const el=document.getElementById(id);

      if(!el){
        continue;
      }
      if(el.tagName === 'INPUT'
      || el.tagName === 'TEXTAREA'){
        el.value=val;
        continue;
      }
      if(el.tagName === 'SELECT'){
        for(let j=0; j < el.options.length; j++){
          const option=el.options[j];
          if(option.value === val){
            option.selected=true;
            break;
          }
        }
        continue;
      }
    }
  }; init();

  const util={};
  util.request=(hndl, ctxt)=>{
    if( !input_token.reportValidity() ){
      return;
    };
    if( !input_coopid.reportValidity() ){
      return;
    }
    const { method, pathname, query,
      date, paging, iter, }=ctxt;
    const { value: endpoint, }=select_endpoint;
    const { value: token, }=input_token;
    const { value: coopid, }=input_coopid;
    const { value: start_date, }=input_start;
    const { value: end_date, }=input_end;
    const url=new URL(endpoint);
    url.pathname=`/api/cooperation/${coopid}${pathname}`;
    
    const params=url.searchParams;
    params.set('token', token);

    if(query){
      Object.keys(query).forEach(key =>{
        const val=query[key];
        params.set(key, val);
      });
    }
    if(date){
      params.set('start_date', start_date);
      params.set('end_date', end_date);
    }

    let items=[];
    const dorequest=({ page, idx, })=>{
      if(paging){
        params.set('page', page);
      }
      if(iter){
        if( !(idx < iter.length) ){
          hndl(null, ...items);
          return;
        }
        const { query, }=iter[idx];
        Object.keys(query).forEach(key =>{
          const val=query[key];
          params.set(key, val);
        });
      }
      console.log('fetch:', url);
      fetch(url.href)
        .then(resp => resp.json())
        .then(data =>{
        const { success, errors, response: resp, }=data;
        if(!success){
          const json=JSON.stringify(errors);
          hndl(errors, { json, data, });
          return;
        }
        const json=JSON.stringify(resp);
        items.push({ json, resp, data, });

        if(paging){
          const { Count: count, }=resp;
          if( !(count < 20) ){
            dorequest({ page: page + 1, });
            return;
          }
        }
        if(iter){
          dorequest({ idx: idx + 1, });
          return;
        }
        hndl(null, ...items);
      });
    };
    dorequest({
      page: paging ? 0 : -100,
      idx: iter ? 0 : -100, });
  };
  util.getValue=(id)=>{
    const value=localStorage.getItem(`value/${id}`);
    return value;
  };
  util.setValue=(id, value)=>{
    localStorage.setItem(`value/${id}`, value);
  };
  util.getResult=(id)=>{
    const json=localStorage.getItem(`result/${id}`);
    return JSON.parse(json);
  };
  util.setResult=(id, data, raw=false)=>{
    const json=raw ? data : JSON.stringify(data);
    const el=document.getElementById(id);
    el.value=json;
    localStorage.setItem(`result/${id}`, json);
  };
})();
