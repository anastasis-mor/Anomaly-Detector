//Here is important to forward the logs with axios while the user is logging

const loginUser = async (req, res) => {
    // 1. Find the user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Log the failed login attempt (email not found)
      try {
        const failedLogPayload = {
          userId: null, // No user exists
          action: "failed_login",
          ipAddress: req.ip,
          timestamp: new Date(),
          details: { attemptedEmail: req.body.email }
        };
  
        // Forward the failed login log to the anomaly-detector
        await axios.post(
          'http://localhost:8080/api/integration/ingest-log',
          failedLogPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.API_INGEST // Use anomaly-detector API key
            }
          }
        );
        console.log("Failed login log forwarded (email not found)");
      } catch (error) {
        console.error("Error forwarding failed login log:", error);
      }
      return res.status(400).send('Email is not found');
    }
  
    // 2. Check if the password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      // Log the failed login attempt (invalid password)
      try {
        const failedLogPayload = {
          userId: user._id,
          action: "failed_login",
          ipAddress: req.ip,
          timestamp: new Date()
        };
  
        // Forward the failed login log to the anomaly-detector
        await axios.post(
          'http://localhost:8080/api/integration/ingest-log',
          failedLogPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.API_INGEST
            }
          }
        );
        console.log("Failed login log forwarded (invalid password)");
      } catch (error) {
        console.error("Error forwarding failed login log:", error);
      }
      return res.status(400).send('Invalid password');
    }
  
    // 3. Successful login: Forward the login log
    try {
      const successLogPayload = {
        userId: user._id,
        action: "login",
        ipAddress: req.ip,
        timestamp: new Date()
      };
  
      await axios.post(
        'http://localhost:8080/api/integration/ingest-log',
        successLogPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_INGEST
          }
        }
      );
      console.log("Successful login log forwarded for user:", user._id);
    } catch (error) {
      console.error("Error forwarding successful login log:", error);
    }
  
    // 4. Generate token and complete login response
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
  };