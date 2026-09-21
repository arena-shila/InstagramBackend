require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    const email = 'testuser' + Date.now() + '@example.com';
    const user = new User({ name: 'Test', username: 'testuser' + Date.now(), email, phone: '999' + Date.now(), password: 'secret123' });
    await user.save();
    const found = await User.findOne({ email });
    const ok = await found.comparePassword('secret123');
    console.log(JSON.stringify({ saved: !!user._id, found: !!found, ok }));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
