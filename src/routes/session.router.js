import { Router } from "express";
import auth from "../middlewares/auth.js";
import { cartModel } from "../dao/models/cartsModel.js";

const router = Router();

router.get('/login', async (req, res) => {
  if (req.session.user) {
    res.redirect('/user')
  }
  res.render(
    "login",
    {
      layout: 'default',
      title: 'Backend Juan Paladea | Login',
      loginFailed: req.session.failLogin
    }
  )
})

router.get('/register', async (req, res) => {
  if (req.session.user) {
    res.redirect('/user')
  }
  res.render(
    'register',
    {
      layout: 'default',
      title: 'Backend Juan Paladea | Register'
    }
  )
})

router.get('/user', auth, async (req, res) => {
  const userId = req.session.user._id
  const cart = await cartModel.findOne({user: userId}).lean()
  res.render(
    "user",
    {
      layout: "default",
      title: 'Backend Juan Paladea | Usuario',
      user: req.session.user,
      cart: cart
    }
  )
})

export default router