const returnOrderValid = async (returnTime) => {
  const savedTime = returnTime;
  const currentTime = new Date().getTime();
  const differenceInMilliseconds = currentTime - savedTime;
  // difference in Days
  const differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60));

  if (differenceInDays > 5) {
    return true;
  } else {
    return false;
  }
};

module.exports = { returnOrderValid };
