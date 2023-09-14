const { userValidator, validateSubscription } = require("../dataValidation");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const passport = require("passport");
const { createUser, findUser } = require("../service/index");

const signup = async (req, res, next) => {
  try {
    const { body } = req;
    const { email } = body;

    const { error } = userValidator(body);
    if (error) return res.status(400).json({ message: error });

    const user = await findUser(email);
    if (user) return res.status(409).json({ message: "Email in use" });

    const newUser = await createUser(body);

    const { subscription } = newUser;

    return res.status(201).json({
      message: "user added",
      data: {
        user: {
          email,
          subscription,
        },
      },
    });
  } catch (error) {
    return res.status(500).json(`User create error - ${error}`);
  }
};

const login = async (req, res, next) => {
  try {
    const { body } = req;
    const { email, password } = body;

    const { error } = userValidator(body);
    if (error) return res.status(400).json({ message: error });

    const user = await findUser(email);
    if (!user)
      return res.status(401).json({ message: "There is no such user" });

    const isPasswordMatch = user.validPassword(password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "Password is wrong" });

    const { id, subscription } = user;

    const payload = {
      id,
      email,
      subscription,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    return res.status(200).json({
      data: {
        token,
        user: {
          email,
          subscription,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err)
      return res.status(401).json({ message: "Not authorized" });

    req.user = user;
    next();
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

const current = (req, res, next) => {
  const { user } = req;
  const { token } = user;

  if (!token) return res.status(401).json({ message: "Not authorized" });

  const decode = jwt.decode(token);
  const { email, subscription } = decode;

  return res.status(200).json({
    email,
    subscription,
  });
};
const subscription = async (req, res, next) => {
  try {
    const { body, user } = req;
    const { token } = user;
    const { error } = validateSubscription(body);

    if (error) return res.status(400).json({ message: error });
    if (!token) return res.status(401).json({ message: "Not authorized" });

    user.subscription = body.subscription;
    await user.save();

    const { email, subscription } = user;

    return res.status(200).json({
      message: "subscription updated",
      data: {
        email,
        subscription,
      },
    });
  } catch (error) {
    return res.status(500).json(`User update error - ${error}`);
  }
};

module.exports = {
  signup,
  login,
  auth,
  logout,
  current,
  subscription,
};
