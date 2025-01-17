const {
  userValidator,
  validateSubscription,
  validateEmail,
} = require("../dataValidation");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const passport = require("passport");
const {
  createUser,
  findUser,
  findVerificationToken,
} = require("../service/index");
const gravatar = require("gravatar");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
const Jimp = require("jimp");
const uploadDir = path.join(process.cwd(), "tmp");
const createPublic = path.join(process.cwd(), "public");
const storeImage = path.join(createPublic, "avatars");
// const { nanoid } = require("nanoid");
const { sendEmail } = require("../sendEmailHandler");
// const Mailer = require("../../mailer");
const uuid = require("uuid");



const signup = async (req, res, next) => {
  try {
    const { body } = req;
    const { email } = body;
    const avatarUrl = gravatar.url(email);

    const verificationToken = uuid.v4();
    console.log("Generated verificationToken:", verificationToken);
    const url = `http://localhost:3000/api/users/verify/${verificationToken}`;

    const { error } = userValidator(body);
    if (error) return res.status(400).json({ message: error });

    const user = await findUser(email);
    if (user) return res.status(409).json({ message: "Email in use" });

    const newUser = await createUser(body, avatarUrl, verificationToken);
       await sendEmail(email, url);

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


        if (!user.verify)
          return res
            .status(401)
            .json({ message: "Please verify your email first" });

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({ storage: storage });

const avatars = async (req, res, next) => {
  const { path: temporaryName, originalname } = req.file;
  const filename = path.join(uploadDir, originalname);
  const { user } = req;
  const { email, token } = user;
  const username = email.split("@")[0];
  const newAvatarPath = `${storeImage}/${username}.jpg`;

  try {
    if (!token) return res.status(401).json({ message: "Not authorized" });

    await fs.rename(temporaryName, filename);

    const avatarImg = await Jimp.read(filename);
    avatarImg.resize(250, 250).write(newAvatarPath);

    user.avatarURL = `/avatars/${username}.jpg`;
    await user.save();

    await fs.unlink(filename);

    const { avatarURL } = user;

    return res.status(200).json({ avatarURL });
  } catch (error) {
    await fs.unlink(temporaryName);
    console.log(error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const findToken = await findVerificationToken(verificationToken);

    if (!findToken) return res.status(404).json({ message: "User not found" });

    findToken.verify = true;
    findToken.verificationToken = "null";
    await findToken.save();

    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { body } = req;
    const { email } = body;

    const user = await findUser(email);
    const { verify, verificationToken } = user;
    const url = `http://localhost:3000/api/users/verify/${verificationToken}`;

    const { error } = validateEmail(body);
    if (error) return res.status(400).json({ error });

    if (verify)
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });

    sendEmail(url);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return res.status(500).send();
  }
};

module.exports = {
  signup,
  login,
  auth,
  logout,
  current,
  subscription,
  avatars,
  upload,
  uploadDir,
  storeImage,
  createPublic,
  verifyUser,
  resendVerificationEmail,
};
