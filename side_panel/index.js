(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;

    if(cmd === 'click/get-manhours'){
      console.log('click/get-manhours:', ev);
      fetch
      return;
    }
  };
  root.addEventListener('click', onclick);
})();
