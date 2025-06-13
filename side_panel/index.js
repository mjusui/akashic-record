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
        const { value: staffs_json, }=document.getElementById('textarea-staff-result');
        const staffs=JSON.parse(staffs_json);
        const staff_ids_list=Object.values(
          staffs_data.groupBy((staff, idx)=> Math.floor(idx/50) )
        ).map(staff_ids => staff_ids.join(',') );
        reqopt.iter=staff_ids_list.map(staff_ids =>({ query: { staff_ids, }) );
      }
      if(pathname === '/manhours'){

      }
      request((errs, ...items)=>{
        const result=document.getElementById(resultid);

        if(errs){
          const { json, }=items[0];
          result.value=json;
          return;
        }
        if(pathname === '/staffs'){
          const staffs=items.map( ({ resp, })=>(
            resp.staffs.map(staff =>({
              id: staff.staffId,
              name: `${staff.lastName} ${staff.firstName}`,
            })
          ) ).flat(1);
          const staffs_json=JSON.stringify(staffs);
          result.value=staffs_json;
          return;
        }
        if(pathname === '/working_records'){
          const { resp: recs, }=items[0];
          const recs_by_staffs=recs.groupBy(rec => rec.staff_id);
          const recs_json=JSON.stringify(recs_by_staffs);
          result.value=recs_json;
          return;
        }
        if(pathname === '/manhours'){
          const manhours=items.map( ({ resp, })=>(
            resp.manhours
          ) ).flat(1);
          const manhours_by_staffs=manhours.groupBy(mh => mh.staff_id);
          const manhours_json=JSON.stringify(manhours_by_staffs);
          result.value=manhours_json;
          return;
        }
      }, reqopt);
      return;
    }
    return;
    if(cmd === 'click/fetch-staffs'){
      console.log('click/fetch-staffs:', ev);
      request((errs, ...items)=>{
        if(errs){
          const { json, }=items[0];
          textarea_staff_result.value=json;
          return;
        }
        const staffs=items.map( ({ resp, }) =>(
          resp.staffs.map(staff =>({
            id: staff.staffId,
            name: `${staff.lastName} ${staff.firstName}`,
          }) )
        ) ).flat(1);

        json_staffs=JSON.stringify(staffs);
        textarea_staff_result.value=json_staffs;
        /* textarea_staff_result.value=staffs.map(
          ({ id, name, })=> `${name}(${id})`
        ).join('\n'); */
        localStorage.setItem('result/textarea-staff-result', json_staffs);
      }, { pathname: '/staffs', paging: true, });
      return;
    }
    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      request((errs, item)=>{
        const { errs, json, resp, }=item;
        textarea_kosu_result.value=json;

        if(errs){
          return;
        }
        const { manhours: , }=resp;
      }, { pathname: '/manhours', });
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
      localStorage.setItem(`value/${id}`, target.value);
      return;
    }
  };
  root.addEventListener('change', onchange);

  const select_endpoint=document.getElementById('select-endpoint');
  const input_token=document.getElementById('input-token');
  const input_coopid=document.getElementById('input-coopid');
  const input_start=document.getElementById('input-start');
  const input_end=document.getElementById('input-end');

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

  const request=(hndl, ctxt)=>{
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
      fetch(url.href, { method, body, })
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
      idx: iter ? 0 : -100, );
  };
})();
