const mongoose = require('mongoose');


main()
    .then(() => { console.log('Connected to the database'); })
    .catch((err) => { console.log('Unable to connect to the database', err); });

async function main(){
    await mongoose.connect(process.env.MONGO_URI);
}

module.exports = main;