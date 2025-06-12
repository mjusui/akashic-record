(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      request((err, data)=>{

      }, { pathname: '/manhours', });
      return;
    }
  };
  root.addEventListener('click', onclick);

  const onchange=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'change/set-endpoint'){
      endpoint=target.value; 
      return;
    }
  };
  root.addEventListener('change', onchange);

  const select_endpoint=document.getElementById('select-endpoint');
  const input_token=document.getElementById('input-token');
  const input_coopid=document.getElementById('input-coopid');
  const textarea_result=document.getElementById('textarea-result');
  const request=(hndl, ctxt)=>{
    if( !input_token.reportValidity() ){
      return;
    };
    if( !input_coopid.reportValidity() ){
      return;
    }
    const { method, pathname, body, }=ctxt;
    const { value: token, }=input_token;
    const { value: coopid, }=input_coopid;
    const url=new URL(endpoint);
    url.pathname=`/api/cooperation/${coopid}${pathname}`;
    
    const params=url.getSearchParams;
    params.set('token', token);

    fetch(url.href, { method, body, })
      .then(resp => resp.json())
      .then(data =>{
      const json=JSON.stringify(data);
      textarea_result.value=json;
      hndl(null, data);
    });
  };
})();
