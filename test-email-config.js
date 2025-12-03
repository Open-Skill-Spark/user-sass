// Test script to verify email configuration
require('dotenv').config({ path: '.env' });

console.log('=== Email Configuration Check ===\n');

console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? `✅ SET (${process.env.SMTP_PASS.length} characters)` : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

console.log('\n=== Validation ===\n');

if (!process.env.SMTP_USER) {
  console.log('❌ SMTP_USER is not set');
} else if (!process.env.SMTP_USER.includes('@')) {
  console.log('❌ SMTP_USER does not look like an email address');
} else {
  console.log('✅ SMTP_USER looks valid');
}

if (!process.env.SMTP_PASS) {
  console.log('❌ SMTP_PASS is not set');
} else if (process.env.SMTP_PASS.length !== 16) {
  console.log(`⚠️  SMTP_PASS length is ${process.env.SMTP_PASS.length} (should be 16 for Gmail App Password)`);
} else {
  console.log('✅ SMTP_PASS length looks correct (16 characters)');
}

if (process.env.SMTP_PASS && /\s/.test(process.env.SMTP_PASS)) {
  console.log('❌ SMTP_PASS contains spaces (should be continuous)');
} else if (process.env.SMTP_PASS) {
  console.log('✅ SMTP_PASS has no spaces');
}
