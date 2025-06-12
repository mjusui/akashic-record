(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
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
  const textarea_result=document.getElementById('textarea-result');
  const onrequest=(ctxt)=>{
    if(!input_token.reportValidity() ){
      return;
    };
    const { method, pathname, body, }=ctxt;
    const { value: token, }=input_token;
    const url=new URL(endpoint);
    url.pathname=pathname;
    
    url.setSearchParam('token', token);

    fetch(url.href, { method, body, })
      .then(resp => resp.json())
      .then(data =>{
      const json=JSON.stringify(data);
      textarea_result.value=json;
    });
  };
})();
