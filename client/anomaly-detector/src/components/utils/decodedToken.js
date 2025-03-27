export function decodeToken(token) {
    if (!token) return null;
  
    // A valid JWT has 3 parts: header, payload, signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
  
    try {
      // The payload is the second part
      const base64Payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/'); // convert base64url to base64
  
      // Decode the base64
      const jsonString = atob(base64Payload);
      return JSON.parse(jsonString); // parse JSON to object
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  