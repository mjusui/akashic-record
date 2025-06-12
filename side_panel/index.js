(()=>{

  const root=document.getElementById('root');

  const textarea_staff_result=document.getElementById('textarea-staff-result');
  const textarea_kosu_result=document.getElementById('textarea-kosu-result');
  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

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
        localStorage.setItem('result/textarea-staff-result', json_staffs);
      }, { pathname: '/staffs', paging: true, });
      return;
    }
    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      request((errs, ctxt)=>{
        const { json, }=ctxt;
        textarea_kosu_result.value=json;
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
    const { method, pathname, body, paging, }=ctxt;
    const { value: endpoint, }=select_endpoint;
    const { value: token, }=input_token;
    const { value: coopid, }=input_coopid;
    const url=new URL(endpoint);
    url.pathname=`/api/cooperation/${coopid}${pathname}`;
    
    const params=url.searchParams;
    params.set('token', token);


    let items=[];
    const dorequest=(page)=>{
      if(paging){
        params.set('page', page);
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
            dorequest(page + 1);
            return;
          }
        }
        hndl(null, ...items);
      });
    }; dorequest(paging ? 0 : -100);
  };
})();
