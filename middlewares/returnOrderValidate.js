const returnOrderValid = async (returnTime) => {
  const savedTime = returnTime;
  const currentTime = new Date().getTime();
  const differenceInMilliseconds = currentTime - savedTime;
  // difference in Days
  const differenceInDays = Math.round(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );
  //   console.log(differenceInDays);
  //   console.log(savedTime);

  if (differenceInDays > 5) {
    return true;
  } else {
    return false;
  }
};

module.exports = { returnOrderValid };
