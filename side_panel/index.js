(()=>{

  const root=document.getElementById('root');

  const textarea_kosu_result=document.getElementById('textarea-kosu-result');
  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      request((err, ctxt)=>{
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

    if(cmd === 'change/save-endpoint'){
      localStorage.setItem('common/endpoint', target.value);
      return;
    }
    if(cmd === 'change/save-token'){
      localStorage.setItem('common/token', target.value);
      return;
    }
    if(cmd === 'change/save-coopid'){
      localStorage.setItem('common/coopid', target.value);
      return;
    }
  };
  root.addEventListener('change', onchange);

  const select_endpoint=document.getElementById('select-endpoint');
  const input_token=document.getElementById('input-token');
  const input_coopid=document.getElementById('input-coopid');

  ['endpoint', 'token', 'coopid', ].forEach(key =>{
    const val=localStorage.getItem(`common/${key}`);
    if(!val){
      return;
    }
    if(key === 'endpoint'){
      [...select_endpoint.options,].forEach(option =>{
        option.value === val && option.selected=true;
      });
    }
    if(key === 'token'){
      input_token.value=val;
    }
    if(key === 'coopid'){
      input_coopid.value=val;
    }
  });

  const request=(hndl, ctxt)=>{
    if( !input_token.reportValidity() ){
      return;
    };
    if( !input_coopid.reportValidity() ){
      return;
    }
    const { method, pathname, body, }=ctxt;
    const { value: endpoint, }=select_endpoint;
    const { value: token, }=input_token;
    const { value: coopid, }=input_coopid;
    const url=new URL(endpoint);
    url.pathname=`/api/cooperation/${coopid}${pathname}`;
    
    const params=url.searchParams;
    params.set('token', token);

    fetch(url.href, { method, body, })
      .then(resp => resp.json())
      .then(data =>{
      const json=JSON.stringify(data);
      hndl(null, { json, data, });
    });
  };
})();
