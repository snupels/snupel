import svgPaths from "./svg-h8k8fmk50e";
import imgImage from "./18066e7ff0aeb3c580378f67c60cd90b8a23a6bd.png";
import imgImageGoogle from "./930d0d9f37713a29d9fa9e8468fcf4d498383c16.png";

function Container() {
  return <div className="absolute h-[1016px] left-0 opacity-3 top-0 w-[1551px]" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1551 1016' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -92.707 -92.707 0 775.5 508)'><stop stop-color='rgba(0,0,0,1)' offset='0.00064475'/><stop stop-color='rgba(0,0,0,0)' offset='0'/></radialGradient></defs></svg>\")" }} data-name="Container" />;
}

function DesignImage() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="Image (앱 아이콘)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage.src} />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] relative rounded-[16px] shrink-0 size-[64px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <DesignImage />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[42px] not-italic relative shrink-0 text-[#101828] text-[28px] text-center tracking-[-0.7px] whitespace-nowrap">로그인</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-[205.016px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-center relative size-full">
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[19.5px] not-italic relative shrink-0 text-[#364153] text-[13px] whitespace-nowrap">이메일</p>
      </div>
    </div>
  );
}

function EmailInput() {
  return (
    <div className="bg-[#f9fafb] h-[47px] relative rounded-[14px] shrink-0 w-[350px]" data-name="Email Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip px-[17px] py-[13px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[14px] w-full">example@email.com</p>
      </div>
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[6px] items-start relative size-full">
        <Label />
        <EmailInput />
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="relative shrink-0" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[19.5px] not-italic relative shrink-0 text-[#364153] text-[13px] whitespace-nowrap">비밀번호</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] not-italic relative shrink-0 text-[#99a1af] text-[12px] whitespace-nowrap">비밀번호 찾기</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Label1 />
        <Text />
      </div>
    </div>
  );
}

function PasswordInput() {
  return (
    <div className="bg-[#f9fafb] h-[47px] relative rounded-[14px] shrink-0 w-[350px]" data-name="Password Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip px-[17px] py-[13px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[14px] w-full">비밀번호를 입력하세요</p>
      </div>
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[6px] items-start relative size-full">
        <Container8 />
        <PasswordInput />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#101828] content-stretch flex flex-col items-center justify-center py-[14px] relative rounded-[14px] shrink-0 w-[350px]" data-name="Button">
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[22.5px] not-italic relative shrink-0 text-[15px] text-center text-white whitespace-nowrap">로그인</p>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="relative shrink-0" data-name="Button (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative size-full">
        <Button />
      </div>
    </div>
  );
}

function Form() {
  return (
    <div className="relative shrink-0 w-full" data-name="Form">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative size-full">
        <Container6 />
        <Container7 />
        <ButtonMargin />
      </div>
    </div>
  );
}

function Container10() {
  return <div className="bg-[#e5e7eb] flex-[151.953_0_0] h-px min-w-px relative" data-name="Container" />;
}

function Text1() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] not-italic relative shrink-0 text-[#99a1af] text-[12px] whitespace-nowrap">또는</p>
      </div>
    </div>
  );
}

function Container11() {
  return <div className="bg-[#e5e7eb] flex-[151.953_0_0] h-px min-w-px relative" data-name="Container" />;
}

function Container9() {
  return (
    <div className="h-[38px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center pt-[20px] relative size-full">
        <Container10 />
        <Text1 />
        <Container11 />
      </div>
    </div>
  );
}

function ImageGoogle() {
  return (
    <div className="h-[19px] relative shrink-0 w-[18px]" data-name="Image (Google)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageGoogle.src} />
    </div>
  );
}

function Text2() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[22.5px] not-italic relative shrink-0 text-[#f3f3f3] text-[15px] text-center tracking-[-0.375px] whitespace-nowrap">Google로 로그인</p>
      </div>
    </div>
  );
}

function GoogleButton() {
  return (
    <div className="bg-[#2c2c2c] relative rounded-[14px] shrink-0 w-[350px]" data-name="GoogleButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center px-[20px] py-[16px] relative size-full">
        <ImageGoogle />
        <Text2 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[16.797px] relative shrink-0 w-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 16.7969">
        <g clipPath="url(#clip0_1_4478)" id="Icon">
          <path clipRule="evenodd" d={svgPaths.p367d0400} fill="var(--fill-0, #303030)" fillRule="evenodd" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_4478">
            <rect fill="white" height="16.7969" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[22.5px] not-italic relative shrink-0 text-[#303030] text-[15px] text-center tracking-[-0.375px] whitespace-nowrap">카카오 로그인</p>
      </div>
    </div>
  );
}

function KakaoButton() {
  return (
    <div className="bg-[#fee500] relative rounded-[14px] shrink-0 w-[350px]" data-name="KakaoButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center px-[20px] py-[16px] relative size-full">
        <Icon />
        <Text3 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_1_4475)" id="Icon">
          <path d={svgPaths.p3755bbf0} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_4475">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text4() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[22.5px] not-italic relative shrink-0 text-[15px] text-center text-white tracking-[-0.375px] whitespace-nowrap">네이버 로그인</p>
      </div>
    </div>
  );
}

function NaverButton() {
  return (
    <div className="bg-[#03c75a] relative rounded-[14px] shrink-0 w-[350px]" data-name="NaverButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center px-[20px] py-[16px] relative size-full">
        <Icon1 />
        <Text4 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[209px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pt-[20px] relative size-full">
        <GoogleButton />
        <KakaoButton />
        <NaverButton />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[36px] relative shrink-0 w-[350px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[20px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_KR:Medium','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#99a1af] text-[0px] text-center whitespace-nowrap">
          <span className="leading-[16px] text-[12px]">{`계정이 없으신가요? `}</span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-['Inter:Medium','Noto_Sans_KR:Medium','Noto_Sans_KR:Regular',sans-serif] font-medium leading-[16px] text-[#364153] text-[12px] underline">회원가입</span>
        </p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[rgba(255,255,255,0.8)] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(229,231,235,0.8)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_25px_0px_rgba(229,231,235,0.6),0px_8px_10px_0px_rgba(229,231,235,0.6)]" />
      <div className="content-stretch flex flex-col items-start p-[25px] relative size-full">
        <Form />
        <Container9 />
        <Container12 />
        <Paragraph />
      </div>
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[32px] relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[575.5px] max-w-[400px] top-[140.5px] w-[400px]" data-name="Container">
      <Container2 />
      <ContainerMargin />
    </div>
  );
}

function App() {
  return (
    <div className="h-[1016px] relative shrink-0 w-full" style={{ backgroundImage: "linear-gradient(146.773deg, rgb(249, 250, 251) 0%, rgb(255, 255, 255) 50%, rgb(243, 244, 246) 100%)" }} data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

export default function RefineDesign() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Refine design">
      <App />
    </div>
  );
}
