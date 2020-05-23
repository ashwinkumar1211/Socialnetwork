const express = require('express');
const router = express.Router();
const config = require('config');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
//@route       POST api/users
//@desc        Register Users
//@access      public

router.post(
   '/',
   [
      check('name', 'Name is required')
         .not()
         .isEmpty(),
      check('email', 'Please enter a valid email').isEmail(),
      check(
         'password',
         'Please check your password(atleast 6 or more characters)'
      ).isLength({ min: 6 })
   ],

   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;
      try {
         //See if user exists (precheck)
         let user = await User.findOne({ email });
         if (user) {
            res.status(400).json({ errors: [{ msg: 'user already exists' }] });
         }
         // Get users gravatar
         const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
         });
         user = new User({
            name,
            email,
            avatar,
            password
         });
         // Encrypt password
         // hash with 10 times salt
         const salt = await bcrypt.genSalt(10);

         user.password = await bcrypt.hash(password, salt);

         await user.save();
         // Return jsonwebtoken
         const payload = {
            user: {
               id: user.id
            }
         };
         jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
            if (err) throw err;
            res.json({ token });
         });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server error');
      }
   }
);

module.exports = router;
