(()=>{
  const root=document.getElementById('root');

  const onclick=(ev)=>{
    const { target, }=ev;
    const { cmd, }=target.dataset;
    console.log(`${cmd}:`, ev);

    if(cmd === 'click/fetch-and-check-kosu'){
      const { resultid, args, }=target.dataset;
      util.clearResult(resultid);

      const steps=args.split(',');
      fetchAndCheckKosu(ev, ...steps);
      return;
    }
  };
  root.addEventListener('click', onclick);

  const fetchAndCheckKosu=(ev, step, ...steps)=>{
    const loadingid=`${step}-loading`;
    const resultid=`textarea-${step}-result2`;
    util.clearResult(resultid);

    if(step === 'staff'){
      util.startLoading(loadingid);
      const pathname='/staffs';
      const paging=true;
      util.request((errs, ...items)=>{
        if(errs){
          util.setLoadingError(loadingid);
          const { json, }=items[0];
          util.showResult(resultid, json, true);
          return;
        }
        util.endLoading(loadingid);
        const staffs=items.map( ({ resp, })=>(
          resp.staffs.map(staff =>({
            id: staff.staffId,
            name: `${staff.lastName} ${staff.firstName}`,
          }) )
        ) ).flat(1);
        util.setResult(resultid, staffs);

        fetchAndCheckKosu(ev, ...steps);
      }, { pathname, paging, });
      return;
    }
    if(step === 'kintai'){
      util.startLoading(loadingid);
      const pathname='/working_records';
      const date=true;

      const staffs=util.getResult('textarea-staff-result2');
      const iter=staffs.map(staff =>({
        query: { staff_ids: staff.id,
          include_break_results: 1,
          include_actual_working_hours_no_rounding: 1, }
      }) );
      /* const staff_ids_group=Object.groupBy(
        staffs.map(s => s.id), (id, idx)=> Math.floor(idx/50)
      );
      const staff_ids_list=Object.values(staff_ids_group).map(
        ids => ids.join(',')
      );
      const iter=staff_ids_list.map(
        staff_ids => ({ query: { staff_ids,
          include_break_results: 1,
          include_actual_working_hours_no_rounding: 1, },
        })
      ); */
      util.request((errs, ...items)=>{
        if(errs){
          util.setLoadingError(loadingid);
          const { json, }=items[0];
          util.showResult(resultid, json, true);
          return;
        }
        util.endLoading(loadingid);
        const recs=items.map(i => i.resp).flat(1);
        const recs_by_staffs={};
        recs.forEach(rec =>{
          const{ staff_id, working_records, }=rec;

          const expected_working_records=working_records.filter(wr =>{
            const { working_day_category,
              start_time, end_time, }=wr;

            if(0 < working_day_category){
              if(start_time === null && end_time === null){
                return false;
              }
            }
            wr.valid=!!(start_time && end_time);
            return true;
          });
          recs_by_staffs[staff_id]=expected_working_records;
        });
        util.setResult(resultid, recs_by_staffs);

        fetchAndCheckKosu(ev, ...steps);
      }, { pathname, date, iter, });
      return;
    }
    if(step === 'kosu'){
      util.startLoading(loadingid);
      const pathname='/manhours';
      const date=true;
      util.request((errs, ...items)=>{
        if(errs){
          util.setLoadingError(loadingid);
          const { json, }=items[0];
          util.showResult(resultid, json, true);
          return;
        }
        util.endLoading(loadingid);
        const manhours=items.map( ({ resp, })=>(
          resp.manhours
        ) ).flat(1);
        const manhours_by_staffs={};
        manhours.forEach(mh =>{
          const { staff_id, dates, }=mh;
          manhours_by_staffs[staff_id]=dates;
        });
        util.setResult(resultid, manhours_by_staffs);

        fetchAndCheckKosu(ev, ...steps);
      }, { pathname, date, });
      return;
    }
    if(step === 'kosu-kakunin'){
      const select_endpoint=document.getElementById('select-endpoint');
      const { value: baseurl, }=select_endpoint;
      const input_start=document.getElementById('input-start');
      const { value: start_date, }=input_start;
      const urlsuffix=start_date.slice(0, 6);

      const staffs=util.getResult('textarea-staff-result2');
      const records_list=util.getResult('textarea-kintai-result2');
      const manhours_list=util.getResult('textarea-kosu-result2');

      const csv=([ 'ID,氏名,労働日,労働日エラー,工数入力,工数入力エラー,出勤簿URL,工数管理URL',
        ...staffs.map(staff =>{
        const rurl=`${baseurl}/manager/attendance/${staff.id}/${urlsuffix}`;
        const mhurl=`${baseurl}/manager/manhours/${staff.id}/${urlsuffix}`;
        const records=records_list[staff.id] || [];
        const manhours=manhours_list[staff.id] || [];

        const no_input_error_manhours=[];
        const error_records=records.filter(r =>{
          const { valid, }=r;
          const date=r.date.replace(/\//g, '-');

          if(!valid){
            no_input_error_manhours.push({ date, });
            return true; 
          }
          const mh=manhours.find(mh => mh.date === date);

          if(!mh){
            no_input_error_manhours.push({ date, });
            return false;
          }
        });
        const error_manhours=manhours.filter(mh =>{
          const { date, }=mh;
          const rdate=date.replace(/-/g, '/');
          const r=records.find(r => r.date === rdate);

          if(!r){
            return true;
          }
          const { valid, actual_working_hours_no_rounding: rmin, }=r;

          if(!valid){
            // already count in error_records
            return false;
          }
          const mhmin=mh.projects.map(
            p => p.daily_hour_items
          ).flat(1).reduce((tot,task)=>(tot + task.minute), 0);

          const diff=Math.abs(rmin - mhmin);

          return !(diff < 2);
        });

        return ([ staff.id, staff.name,
          records.length, error_records.length,
          manhours.length, error_manhours.length + no_input_error_manhours.length,
          rurl, mhurl,  ]).join(',');
      }), ]).join('\n');

      util.setResult(resultid, csv, true);
      return;
    }
  };

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
  util.showResult=(id, data, raw=false)=>{
    const json=raw ? data : JSON.stringify(data);
    const el=document.getElementById(id);
    el.value=json;
  }
  util.clearResult=(id)=>{
    const el=document.getElementById(id);
    el.value='';
  };
  util.startLoading=(id)=>{
    const el=document.getElementById(id);
    if(!el){
      return;
    }
    el.textContent='データ取得中';
  };
  util.endLoading=(id)=>{
    const el=document.getElementById(id);
    if(!el){
      return;
    }
    el.textContent='詳細';
  };
  util.setLoadingError=(id)=>{
    const el=document.getElementById(id);
    if(!el){
      return;
    }
    el.textContent='エラー発生';
  };
})();
