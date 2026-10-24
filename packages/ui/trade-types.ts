export interface TradeSite {
  kind:'electrical'|'homeservice'|'gardens'; name:string; tagline:string; eyebrow:string;
  headline:[string,string]; description:string; hero:string; heroAlt:string;
  servicesTitle:string; servicesIntro:string;
  services:{icon:string;title:string;text:string}[];
  aboutTitle:string;aboutText:string;aboutPoints:string[];
  benefits:{icon:string;title:string;text:string}[];
  process:{icon:string;title:string;text:string}[];
  faq:[string,string][];
}
