#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# API Configuration
# Development API URL (default)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Production API URL (update this for your production backend)
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Staging API URL (update this for your staging backend)
# NEXT_PUBLIC_API_URL=https://staging.your-backend-domain.com
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update NEXT_PUBLIC_API_URL with your backend URL');
}

console.log('\n🔧 Environment Variables:');
console.log('   NEXT_PUBLIC_API_URL - Your backend API base URL');
console.log('\n📚 For Vercel deployment:');
console.log('   1. Go to your Vercel project dashboard');
console.log('   2. Navigate to Settings → Environment Variables');
console.log('   3. Add NEXT_PUBLIC_API_URL with your production backend URL'); 