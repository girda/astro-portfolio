import {createRemoteJWKSet,jwtVerify} from 'jose';
let cached;
export async function authorize(request,env){
  if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.ADMIN_EMAIL)return false;
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN))return false;
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token)return false;
  const issuer=`https://${env.ACCESS_TEAM_DOMAIN}`;
  if(cached?.issuer!==issuer)cached={issuer,keys:createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))};
  try{
    const {payload}=await jwtVerify(token,cached.keys,{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']});
    return payload.email===env.ADMIN_EMAIL;
  }catch{return false;}
}
