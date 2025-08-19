const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'admin123';
const rounds = 10;
bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(hash);
});
