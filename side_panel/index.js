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
    const val=localStorage.getItem(key);

    if( !val.startsWith('value/') ){
      continue;
    }
    const id=val.split('/')[1];
    const el=document.getElementById(id);

    if(!el){
      continue;
    }
    if(el.tagName === 'INPUT'){
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
