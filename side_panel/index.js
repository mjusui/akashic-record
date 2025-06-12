(()=>{
  const root=document.getElementById('root');
  const msg=document.getElementById('msg');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;

    if(cmd === 'click/get-manhours'){
      msg.textContent='click/get-manhours';
      return;
    }
  };
  root.addEventListener('click', onclick);
})();
