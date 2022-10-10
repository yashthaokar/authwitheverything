const User = require("../models/user");
const { sendMail } = require("../utils/sendMail");
const { sendToken } = require("../utils/sendToken");
const cloudinary = require("cloudinary");
const fs = require("fs");

exports.registeUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(Math.random() * 1000000);

    const mycloud = await cloudinary.v2.uploader.upload(avatar);

    fs.rmSync("./tmp", { recursive: true }); // it will

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    await sendMail(email, "Verify your account", `Your OTP is ${otp}`);

    sendToken(
      res,
      user,
      201,
      "OTP sent to your email, please verify your account"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//verify
exports.verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findById(req.user._id);
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or Has been Expired" });
    }
    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();
    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "please enter all fields",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email and Password or User does't exists",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    sendToken(res, user, 200, "login SuccessFully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//logout
exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "logout SuccessFully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//getmyprofle
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendToken(res, user, 200, `Welcome ${user.name}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name } = req.body;
    const avatar = req.files.avatar.tempFilePath;

    if (name) user.name = name;
    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);//alredy presed file delet

      const mycloud = await cloudinary.v2.uploader.upload(avatar);// and then new file added

      fs.rmSync("./tmp", { recursive: true });

      user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldpassword, newPassword } = req.body;
    if (!oldpassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }
    const isMatch = await user.comparePassword(oldpassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "invalid old password" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//forgot passsword
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    const otp = Math.floor(Math.random() * 1000000);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000; //10mints
    await user.save();
    await sendMail(email, "request for reset password ", `Your OTP is ${otp}`);
    res.status(200).json({
      success: true,
      message: `Otp send to your mail please check on this ${email} mail Id`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//reseting password
exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Otp Invalid or has been Expired" });
    }
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: `Password Changed Successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//add task
exports.addtask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const user = await User.findById(req.user._id);
    user.task.push({
      title,
      description,
      completed: false,
      createAt: new Date(Date.now()),
    });
    await user.save();
    res.status(200).json({
      success: true,
      message: "Task added successfuly",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//remove task
exports.removetask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user._id);

    user.task = user.task.filter(
      (tas) => tas._id.toString() !== taskId.toString()
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Task removed successfuly",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//updateTask
exports.updatetask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user._id);

    user.task = user.task.find(
      (tas) => tas._id.toString() === taskId.toString()
    );
    user.task.completed = !user.task.completed;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfuly",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
