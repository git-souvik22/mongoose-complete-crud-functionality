const otpVerification = async (otpTime) => {
  const savedTime = otpTime;
  const currentTime = new Date().getTime();
  const differenceInMilliseconds = currentTime - savedTime;

  const differenceInMinutes = Math.round(
    differenceInMilliseconds / (1000 * 60)
  );
  if (differenceInMinutes > 5) {
    return true;
  }
  return false;
};

module.exports = { otpVerification };
