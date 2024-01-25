const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

exports.matchPassword = async (password, hashedPassword) => {
  const comparedPass = await bcrypt.compare(password, hashedPassword);
  return comparedPass;
};
