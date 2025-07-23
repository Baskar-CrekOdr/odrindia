// Environment Checker for Google OAuth
// This file helps identify environment variable issues in production
// Run it with: bun check-env.js

console.log('🔍 Environment Variables Check');
console.log('===========================');

// Check for Next.js public env vars
checkEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
checkEnvVar('NEXT_PUBLIC_API_BASE_URL');

// Check for server-side env vars (if needed)
console.log('\n🔒 Server-side Environment Variables');
console.log('===================================');
checkEnvVar('BACKEND_URL');

function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    console.log(`❌ ${name}: Missing`);
  } else {
    const masked = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${name}: ${masked}`);
  }
}

console.log('\n📋 Next.js Runtime Config');
console.log('=======================');
console.log('Runtime config will contain:');
const runtimeConfig = {
  publicRuntimeConfig: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ? '✅ Set' : '❌ Missing',
  }
};
console.log(JSON.stringify(runtimeConfig, null, 2));

console.log('\n🌐 Browser Environment');
console.log('===================');
console.log('In the browser, process.env will contain:');
const browserEnv = {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Available' : '❌ Missing',
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ? '✅ Available' : '❌ Missing',
  GOOGLE_CLIENT_ID: '❌ Never available (not prefixed with NEXT_PUBLIC_)',
};
console.log(JSON.stringify(browserEnv, null, 2));
