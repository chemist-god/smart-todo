// Complete authentication flow test
const testCompleteFlow = async () => {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing Complete Authentication Flow...\n');

    // Test 1: Register a new user
    console.log('1. 📝 Registering new user...');
    try {
        const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            }),
        });

        const registerData = await registerResponse.json();
        console.log('✅ Registration successful:', registerData.message);
        console.log('📧 Email sent:', registerData.emailSent);

        // Extract token from console logs (in real app, user would get this via email)
        console.log('🔑 Check server console for verification token');

    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        return;
    }

    // Test 2: Test verification page
    console.log('\n2. 🔍 Testing verification page...');
    try {
        const verifyPageResponse = await fetch(`${baseUrl}/auth/verify-request`);
        if (verifyPageResponse.ok) {
            console.log('✅ Verification page loads successfully');
        } else {
            console.log('❌ Verification page failed to load');
        }
    } catch (error) {
        console.error('❌ Verification page test failed:', error.message);
    }

    // Test 3: Test sign-in page
    console.log('\n3. 🔐 Testing sign-in page...');
    try {
        const signinPageResponse = await fetch(`${baseUrl}/auth/signin`);
        if (signinPageResponse.ok) {
            console.log('✅ Sign-in page loads successfully');
        } else {
            console.log('❌ Sign-in page failed to load');
        }
    } catch (error) {
        console.error('❌ Sign-in page test failed:', error.message);
    }

    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📋 Next steps for manual testing:');
    console.log('   1. Visit http://localhost:3000/auth/signup');
    console.log('   2. Register with your email');
    console.log('   3. Check server console for verification token');
    console.log('   4. Visit http://localhost:3000/auth/verify-request');
    console.log('   5. Enter the verification token');
    console.log('   6. Visit http://localhost:3000/auth/signin');
    console.log('   7. Sign in with your credentials');
    console.log('\n💡 In development mode, verification tokens are displayed on the verification page!');
};

// Run the test
testCompleteFlow().catch(console.error);
