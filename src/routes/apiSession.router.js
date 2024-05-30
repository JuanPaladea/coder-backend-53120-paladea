import { Router } from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';

import userService from "../services/userService.js";
import { JWT_SECRET } from "../utils/config.js";

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const users = await userService.getUsers()
    res.status(200).send({status: 'success', message: 'usuarios encontrados', users})
  } catch (error) {
    res.status(400).send({status: 'error', error: 'ha ocurrido un error', error})
  }
})

router.get('/current', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    res.status(200).send({
      status: 'success',
      message: 'User found',
      user: req.user,
    });
  }
);

router.post(
  '/register',
  passport.authenticate('register', { failureRedirect: '/api/session/failRegister' }),
  (req, res) => {
    res.status(200).send({
      status: 'success',
      message: 'User registered',
      user: req.user,
    });
  }
);

router.get("/failRegister", (req, res) => {
  res.status(400).send({
    status: "error",
    message: "Failed Register"
  });
});

router.post(
  '/login',
  passport.authenticate('login', {failureRedirect: '/api/session/failLogin'}),
  (req, res) => {
    if (!req.user) {
      res.status(401).send({
        status: 'error',
        message: 'Error login!'
      });
    }
    req.session.user = {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role 
    };

    const token = jwt.sign({
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role
    }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('jwt', token);
    res.status(200).send({
      status: 'success',
      message: 'User logged in',
      token: token
    });
  }
)

router.get("/failLogin", (req, res) => {
  res.status(400).send({
      status: "error",
      message: "Failed Login"
  });
});

router.get("/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
  res.status(200).send({
    status: 'success',
    message: 'Success'
  });
});

router.get("/githubcallback", passport.authenticate('github', {failureRedirect: '/login'}), (req, res) => {
  req.session.user = req.user;
  res.redirect('/');
});

router.get("/google", passport.authenticate('google', {scope: ['email', 'profile']}), (req, res) => {
  res.status(200).send({
    status: 'success',
    message: 'Success'
  });
});

router.get("/googlecallback", passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
  req.session.user = req.user;
  res.redirect('/');
});

router.post("/logout", (req, res) => {
  req.session.destroy(error => {
    if (error) {
      res.status(400).send({
        status: 'error',
        message: 'Error logging out'
      });
    }
    res.clearCookie('jwt');
    res.status(200).send({
      status: 'success',
      message: 'User logged out'
    });
  })
});

export default router