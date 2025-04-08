Important things:
1) In the apiKeys model we need to apply the apiKey of the anomaly-detector db
2) In the sites model in the owner field we need to assign the id of the user that has the site and in the apiKey the id of the apiKey site.

so the logic here is that we provide a unique apiKey of the anomaly-detector to the client and we verify the apiKey so we can give access to send data via apiKey middleware, in the sites model we put the owner that has registered in the anomaly-detector and we make it objectId, also in the apiKey we provide the id of the apiKeys site, also we turn it in to ObjectId

3) The logApi goes in the frontend public folder and implement it with a script in the html folder
4) The integrationController and logModel goes to the backend that we also need to make a route for it