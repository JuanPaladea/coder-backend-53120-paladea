const isVerified = (req, res, next) => {
  if (!req.session.user.verified) {
    return res.status(401).send({status: 'error', message: 'The user is not verified, please check your email to verify your account'})
  }
  return next();
}

export default isVerified;