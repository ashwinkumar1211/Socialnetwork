const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const user = require('../../models/User');
const { check, validationResult } = require('express-validator');

//@route       Get api/profile/me
//@desc        Get current user profile
//@access      Private

router.get('/me', auth, async (req, res) => {
   try {
      const profile = await Profile.findOne({
         user: req.user.id
      }).populate('user', ['name', 'avatar']);
      if (!profile) {
         return res
            .status(400)
            .json({ msg: 'There is no profile for this user' });
      }
      res.json(profile);
   } catch (err) {
      Console.log(err.message);
      res.status(500).send('Server Error');
   }
});

//@route       Get api/profile/
//@desc        create or update profile
//@access      Private

router.post(
   '/',
   [
      auth,
      [
         check('status', 'status is required')
            .not()
            .isEmpty(),
         check('skills', 'skills is required')
            .not()
            .isEmpty()
      ]
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      const {
         company,
         website,
         location,
         bio,
         status,
         githubusername,
         skills,
         youtube,
         facebook,
         twitter,
         instagram,
         linkedin
      } = req.body;
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
         profileFields.skills = skills.split(',').map(skill => skill.trim());
      }
      console.log(profileFields.skills);
      //build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (instagram) profileFields.social.instagram = instagram;

      try {
         let profile = await Profile.findOne({ user: req.user.id });
         if (profile) {
            //update the profile
            Profile = await Profile.findOneAndUpdate(
               { user: req.user.id },
               { $set: profileFields },
               { new: true }
            );
            return res.json(profile);
         }
         //create
         profile = new Profile(profileFields);
         await profile.save();
         res.json(profile);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error');
      }
   }
);

//@route Get api/profile
//@desc Get all profiles
//@access public
router.get('/', async (req, res) => {
   try {
      const profiles = await Profile.find().populate('user', [
         'name',
         'avatar'
      ]);
      res.json(profiles);
   } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
   }
});

//@route Get api/profile/user/:userid
//@desc Get profile by user id
//@access public

router.get('/user/:user_id', async (req, res) => {
   try {
      const profile = await Profile.findOne({
         user: req.params.user_id
      }).populate('user', ['name', 'avatar']);
      if (!profile) return res.status(400).json({ msg: 'profile not found' });
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
         return res.status(400).send('profile not found');
      }
      res.status(500).send('server error');
   }
});

//to delete profile

//@route Get api/profile
//@desc delete profile, user & posts
//@access private(auth middleware)

router.delete('/', auth, async (req, res) => {
   try {
      // remove users posts
      await this.post.deleteMany({user: req.user.id});
      //Remove profile
      await Profile.findOneAndRemove({ user: req.user.id });
      //Remove user -- _id - default
      await User.findOneAndRemove({ _id: req.user.id });
      res.json({ msg: 'user removed' });
   } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
   }
});

//@route PUT api/profile/experience
//@desc add profile experience (update which can be done with post)
//@access private(auth middleware)

router.put(
   '/experience',
   [
      auth,
      [
         check('title', 'title is required')
            .not()
            .isEmpty(),
         check('company', 'company is required')
            .not()
            .isEmpty(),
         check('from', 'From date is required')
            .not()
            .isEmpty()
      ]
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
         return res.status(400).json({ erros: errors.array() });
      const {
         title,
         company,
         location,
         from,
         to,
         current,
         description
      } = req.body;
      //new object
      const newExp = {
         title,
         company,
         location,
         from,
         to,
         current,
         description
      };
      try {
         const profile = await Profile.findOne({ user: req.user.id });
         profile.experience.unshift(newExp); //update or append
         await profile.save();
         res.json(profile);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('server error');
      }
   }
);

//@route DELETE api/profile/experience/:exp_id (: placehodler)
//@desc DELETE profile experience (update which can be done with post)
//@access private(auth middleware)

router.delete('/experience/:exp_id', auth, async (req, res) => {
   try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Get remove index
      const removeIndex = profile.experience
         .map(item => item.id)
         .indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex, 1);
      await profile.save();
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
   }
});

//@route PUT api/profile/education
//@desc add profile education (update which can be done with post)
//@access private(auth middleware)

router.put(
   '/education',
   [
      auth,
      [
         check('school', 'school is required')
            .not()
            .isEmpty(),
         check('degree', 'degree is required')
            .not()
            .isEmpty(),
         check('fieldofstudy', 'field of study is required')
            .not()
            .isEmpty(),
         check('from', 'From date is required')
            .not()
            .isEmpty()
      ]
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
         return res.status(400).json({ erros: errors.array() });
      const {
         school,
         degree,
         fieldofstudy,
         from,
         to,
         current,
         description
      } = req.body;
      //new object
      const newEdu = {
         school,
         degree,
         fieldofstudy,
         from,
         to,
         current,
         description
      };
      try {
         const profile = await Profile.findOne({ user: req.user.id });
         profile.education.unshift(newEdu); //update or append
         await profile.save();
         res.json(profile);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('server error');
      }
   }
);

//@route DELETE api/profile/education/:edu_id (: placehodler)
//@desc delete profile education (update which can be done with post)
//@access private(auth middleware)

router.delete('/education/:edu_id', auth, async (req, res) => {
   try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Get remove index
      const removeIndex = profile.education
         .map(item => item.id)
         .indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);
      await profile.save();
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
   }
});

//@route GET api/profile/github/:username
//@desc Get user repos from Github
//@access public
//using request package
router.get('/github/:username', async (req, res) => {
   try {
      const options = {
         uri: `https://api.github.com/users/${
            req.params.username
         }/repos?per_page=5&sort=created:asc&client_id=${config.get(
            'githubClientId'
         )}&client_secret=${config.get('githubSecret')}`,
         method: 'GET',
         headers: { 'user-agent': 'node.js' }
      };
      request(options, (error, response, body) => {
         if (error) console.error(error);
         if (response.statusCode != 200) {
            return res.status(404).json({ msg: 'no github profile found' });
         }
         res.json(JSON.parse(body));
      });
   } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
   }
});

module.exports = router;
