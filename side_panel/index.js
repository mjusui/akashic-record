(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(cmd, ':', ev);

    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      fetch
      return;
    }
  };
  root.addEventListener('click', onclick);

  let endpoint='https://atnd.ak4.jp';
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
})();
