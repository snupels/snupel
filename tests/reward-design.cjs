/* eslint-disable @typescript-eslint/no-require-imports -- Local component and native dialog regression. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
function load(file, dependencies = {}, extras = {}) {
  const context = {exports:{}, require:name=>dependencies[name] ?? require(name), ...extras};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
  }).outputText,context);
  return context.exports;
}
const plans = load('lib/passportRewards.ts');
const tee = plans.PASSPORT_REWARD_PLANS.find(p=>p.previewImage);
const image = ({src,alt})=>React.createElement('img',{src,alt});
const link = ({children,href})=>React.createElement('a',{href},children);
test('provided tee asset is unchanged, complete and landscape',()=>{
  const bytes = fs.readFileSync('public'+tee.previewImage);
  assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),'f68dad5cdd20678da0678878493be8b204b7a00a8b104e2219e62c19e1012494');
  assert.equal(bytes.readUInt32BE(16),1536); assert.equal(bytes.readUInt32BE(20),1024);
});
test('reward card shows owner-set criteria, real preview and backend claim entry',()=>{
  const {PassportRewards} = load('components/PassportRewards.tsx',{
    'next/image':image,'next/link':link,'@/lib/passportRewards':plans,'./AppIcon':{AppIcon:()=>null},'./RewardDesignModal':{RewardDesignModal:()=>null},'./TeeRewardClaim':{TeeRewardClaim:()=>React.createElement('div',null,'서버 신청 현황')},
  });
  for (const count of [null,0,4,5,20]) {
    const html = renderToStaticMarkup(React.createElement(PassportRewards,{stampCount:count}));
    assert.match(html,/스탬프 5개 달성/); assert.match(html,/선착순 100명/);
    assert.match(html,/선착순 신청/); assert.match(html,/aria-haspopup="dialog"/);
    assert.match(html,/\/rewards\/gsp-performance-tee-black.png/);
    assert.doesNotMatch(html,/브랜드 협업|남은 수량|교환 완료/);
    assert.match(html,/서버 신청 현황/);
  }
});
test('preview opens a real modal, supports Escape/backdrop/close, restores scroll and focus',()=>{
  let effect,opened=0,closed=0,dismissed=0,focused=0;
  const dialog = {showModal(){opened++;},close(){closed++;}};
  const body = {style:{overflow:'auto'}};
  const {RewardDesignModal} = load('components/RewardDesignModal.tsx',{
    react:{useRef:()=>({current:dialog}),useEffect:fn=>{effect=fn;}},'next/image':image,
  },{document:{body,activeElement:{isConnected:true,focus(){focused++;}}}});
  const tree = RewardDesignModal({reward:tee,onClose(){dismissed++;}});
  assert.equal(tree.type,'dialog'); assert.equal(tree.props['aria-labelledby'],'reward-design-title');
  assert.equal(tree.props.open,undefined,'Use showModal rather than a non-modal open attribute');
  const cleanup = effect(); assert.equal(opened,1); assert.equal(body.style.overflow,'hidden');
  let prevented=false; tree.props.onCancel({preventDefault(){prevented=true;}});
  assert.ok(prevented); assert.equal(dismissed,1);
  tree.props.onClick({target:dialog,currentTarget:dialog}); assert.equal(dismissed,2);
  tree.props.onClick({target:{},currentTarget:dialog}); assert.equal(dismissed,2);
  const nodes=[]; function walk(node){if(!node || typeof node!=='object')return;nodes.push(node);React.Children.forEach(node.props?.children,walk);} walk(tree);
  const close=nodes.find(node=>node.props?.['aria-label']==='티셔츠 디자인 닫기'); assert.ok(close.props.autoFocus);
  close.props.onClick(); assert.equal(dismissed,3);
  const picture=nodes.find(node=>node.type===image); assert.equal(picture.props.src,tee.previewImage); assert.match(picture.props.className,/object-contain/);
  cleanup(); assert.equal(closed,1); assert.equal(body.style.overflow,'auto'); assert.equal(focused,1);
});
test('design trigger stays in the rewards page and respects reduced motion',()=>{
  const card=fs.readFileSync('components/PassportRewards.tsx','utf8');
  assert.match(card,/onClick=\{\(\) => setPreviewReward\(reward\)\}/);
  assert.match(card,/previewReward && <RewardDesignModal/); assert.doesNotMatch(card,/window\.open|target="_blank"/);
  assert.match(fs.readFileSync('components/RewardDesignModal.tsx','utf8'),/motion-safe:animate-/);
  assert.match(fs.readFileSync('app/globals.css','utf8'),/@keyframes reward-reveal/);
});
