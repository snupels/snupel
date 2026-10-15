/* eslint-disable @typescript-eslint/no-require-imports -- Isolated shipping API and form lifecycle checks. */
const {test}=require('node:test'); const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps={},extras={}){const ctx={exports:{},require:name=>deps[name]??require(name),URLSearchParams,...extras};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,ctx);return ctx.exports;}
const dto=load('lib/api/dto.ts');
const form={size:'M',recipientName:'테스트',phoneNumber:'010-1234-5678',postalCode:'24300',address:'강원 춘천 테스트 주소',addressDetail:'101호',shippingConsent:true};
const claim={id:1,allocationNo:1,size:'M',recipientName:'테스트',phoneNumber:'01012345678',postalCode:'24300',address:'강원 춘천 테스트 주소',addressDetail:'101호',status:'requested',requestedAt:'2026-10-15T01:00:00Z',fulfilledAt:null};
const available={requiredStamps:5,collectedStamps:5,quantity:100,remaining:100,isOpen:true,eligible:true,canManage:false,claim:null};
test('shipping DTO validates server-authoritative criteria and explicit consent',()=>{
  assert.equal(dto.teeClaimCreateSchema.parse(form).phoneNumber,'01012345678');
  for(const change of [{shippingConsent:false},{shippingConsent:1},{size:'XXXL'},{postalCode:'1234'},{phoneNumber:'12345'},{userId:2},{allocationNo:1},{recipientName:' '},{quantity:1000}])assert.ok(!dto.teeClaimCreateSchema.safeParse({...form,...change}).success);
  assert.ok(dto.teeRewardResponseSchema.safeParse(available).success);assert.ok(dto.teeClaimResponseSchema.safeParse(claim).success);
  assert.ok(!dto.teeClaimStatusSchema.safeParse('eligible').success);
});
test('claim API always sends session auth and uses dedicated endpoints, not badge claims',async()=>{
  const calls=[];const schema={...dto};const tokenStore={getItem:key=>key==='sportspassport-access-token'?'test-token':null};
  const {api}=load('lib/api/service.ts',{'./dto':schema,'./repository':{apiUrl:p=>p,request:async(path,options)=>{calls.push({path,...options});return options.body;},requestUrl:async()=>{}},'../accountAddress':{accountSessionUser:x=>x}}, {window:{},sessionStorage:tokenStore});
  await api.teeReward();await api.claimTee(form);await api.teeClaims();await api.updateTeeClaim(1,'shipped');
  assert.equal(calls[0].path,'/me/passport-rewards/tee');assert.equal(calls[1].path,'/me/passport-rewards/tee/claim');
  assert.equal(calls[1].body.phoneNumber,'01012345678');assert.equal(calls[1].body.shippingConsent,true);
  assert.ok(calls.every(call=>call.token==='test-token'));assert.equal(calls[3].path,'/admin/passport-tee-claims/1');
  assert.ok(!JSON.stringify(calls).includes('/me/rewards/'));
});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const find=(tree,predicate)=>!tree||typeof tree!=='object'?null:Array.isArray(tree)?tree.map(node=>find(node,predicate)).find(Boolean):predicate(tree)?tree:find(tree.props?.children,predicate);
function harness(initial=available){
  let idx=0,ridx=0,effect,cleanup;const state=[],refs=[],listeners=new Set();let resolveClaim,calls=0,resets=0,writes=0;
  const pending=new Promise(resolve=>{resolveClaim=resolve;});
  const {TeeRewardClaim}=load('components/TeeRewardClaim.tsx',{
    react:{useState(value){const index=idx++;if(!(index in state))state[index]=value;return[state[index],value=>{writes++;state[index]=typeof value==='function'?value(state[index]):value;}];},useRef(value){return refs[ridx++]??={current:value===null?{reset(){resets++;}}:value};},useEffect(fn){effect=fn;}},
    'next/link':()=>null,'@/lib/api/service':{api:{teeReward:async()=>initial,claimTee:()=>{calls++;return pending;}}},'@/lib/api/repository':{ApiError:class extends Error{}},'@/lib/api/dto':dto,
  },{window:{addEventListener:(_event,fn)=>listeners.add(fn),removeEventListener:(_event,fn)=>listeners.delete(fn)},FormData:class{get(key){return key==='shippingConsent'?'on':form[key];}}});
  return{render(){idx=ridx=0;return TeeRewardClaim();},async mount(){this.render();cleanup=effect();await flush();},get calls(){return calls;},get resets(){return resets;},get writes(){return writes;},resolveClaim,authChange(){for(const listener of listeners)listener();},unmount(){cleanup();}};
}
test('only eligible members can open a form, cap and unopened errors never offer a fake claim',async()=>{
  for(const input of [{...available,eligible:false,collectedStamps:4},{...available,eligible:false,remaining:0},{...available,eligible:false,isOpen:false}]){
    const h=harness(input);await h.mount();const tree=h.render();assert.ok(!find(tree,node=>node.type==='form'));
    assert.ok(!find(tree,node=>node.type==='button'&&node.props.children==='티셔츠 리워드 신청하기'));h.unmount();
  }
});
test('double submission posts once, clears private form and shows persisted receipt',async()=>{
  const h=harness();await h.mount();let tree=h.render();find(tree,node=>node.type==='button'&&node.props.children==='티셔츠 리워드 신청하기').props.onClick();tree=h.render();
  const formNode=find(tree,node=>node.type==='form');assert.ok(formNode);assert.ok(find(tree,node=>node.type==='input'&&node.props.name==='shippingConsent'&&!node.props.defaultChecked));
  const first=formNode.props.onSubmit({preventDefault(){},currentTarget:{}});const second=formNode.props.onSubmit({preventDefault(){},currentTarget:{}});assert.equal(h.calls,1);
  h.resolveClaim(claim);await Promise.all([first,second]);tree=h.render();assert.ok(!find(tree,node=>node.type==='form'));assert.ok(h.resets>=1);
  assert.ok(find(tree,node=>node.type==='h4'&&JSON.stringify(node.props.children).includes('신청 접수')));h.unmount();
});
test('account switch or unmount discards a late shipping response',async()=>{
  for(const switchAccount of [true,false]){
    const h=harness();await h.mount();let tree=h.render();find(tree,node=>node.type==='button'&&node.props.children==='티셔츠 리워드 신청하기').props.onClick();tree=h.render();
    const pending=find(tree,node=>node.type==='form').props.onSubmit({preventDefault(){},currentTarget:{}});
    if(switchAccount)h.authChange();else h.unmount();const writes=h.writes;h.resolveClaim(claim);await pending;assert.equal(h.writes,writes);
    if(switchAccount){assert.ok(h.resets>=1);tree=h.render();assert.ok(!find(tree,node=>node.type==='form'));h.unmount();}
  }
});
test('shipping privacy stays private and admin screen is not indexed',()=>{
  const source=fs.readFileSync('components/TeeRewardClaim.tsx','utf8');assert.match(source,/shippingConsent/);assert.match(source,/배송 개인정보 수집·이용 안내/);
  assert.doesNotMatch(source,/localStorage|sessionStorage|console\.log|localStorage\.setItem/);
  assert.match(source,/신청 내역 다시 확인/);assert.match(source,/reward\?\.canManage/);
  assert.match(fs.readFileSync('app/(portal)/reward-management/page.tsx','utf8'),/index: false/);
  assert.match(fs.readFileSync('components/TeeRewardManagement.tsx','utf8'),/sportspassport-auth-change/);
  const route=fs.readFileSync('app/terms/privacy/page.tsx','utf8');
  assert.match(route,/PrivacyPolicyPage/);
  const policy=fs.readFileSync('components/PrivacyPolicyPage.tsx','utf8');
  for(const label of ['티셔츠 리워드 배송 신청','수령인명','선택 사이즈','동의 시각','신청자 본인과 기존 관리자','회원 탈퇴 시까지']) assert.ok(policy.includes(label));
});
