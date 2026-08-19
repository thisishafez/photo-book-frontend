export const testApi = async () => {
  console.log('=== Testing API ===');
  
  // Test health endpoint
  try {
    const healthResponse = await fetch('https://yadegar-api.duster.ir/health');
    const healthText = await healthResponse.text();
    console.log('Health endpoint status:', healthResponse.status);
    console.log('Health response:', healthText);
    
    let healthData;
    try {
      healthData = JSON.parse(healthText);
      console.log('Health parsed:', healthData);
    } catch (e) {
      console.log('Health response is not JSON');
    }
  } catch (error) {
    console.error('Health test failed:', error);
  }

  console.log('\n=== Testing Register ===');
  try {
    const registerResponse = await fetch('https://yadegar-api.duster.ir/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: 'testuser_' + Date.now(), 
        password: 'testpass123' 
      }),
    });
    
    const registerText = await registerResponse.text();
    console.log('Register status:', registerResponse.status);
    console.log('Register response:', registerText);
    
    let registerData;
    try {
      registerData = JSON.parse(registerText);
      console.log('Register parsed:', registerData);
    } catch (e) {
      console.log('Register response is not JSON');
    }
  } catch (error) {
    console.error('Register test failed:', error);
  }

  console.log('\n=== Testing Login ===');
  try {
    const loginResponse = await fetch('https://yadegar-api.duster.ir/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: 'testuser', 
        password: 'testpass123' 
      }),
    });
    
    const loginText = await loginResponse.text();
    console.log('Login status:', loginResponse.status);
    console.log('Login response:', loginText);
    
    let loginData;
    try {
      loginData = JSON.parse(loginText);
      console.log('Login parsed:', loginData);
    } catch (e) {
      console.log('Login response is not JSON');
    }
  } catch (error) {
    console.error('Login test failed:', error);
  }
};