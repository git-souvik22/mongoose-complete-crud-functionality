//   console.log(document.getElementById("Email_ID").value);
const emailInput = document.getElementById("Email_ID");
const otpDiv = document.querySelector(".otp-div");
let loaderDiv = document.querySelector(".loader-content");
const loadMessage = document.getElementById("loadMessage");
const loadingDiv = document.querySelector(".loading");
const otpEmail = document.getElementById("otpEmail");
const otpInput = document.getElementById("otp-number");
// generate random otp
let minm = 100000;
let maxm = 999999;
const otpNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
// console.log(otpNumber);

function SendOTP() {
  if (emailInput.value !== "") {
    loaderDiv.style.display = "flex";
    loadMessage.innerText = "Wait we are sending OTP";
    const OTPparams = {
      from_name: "Chalkduster",
      message: `Please Verify Your Email: ${emailInput.value}`,
      otp_text: `Your OTP is - ${otpNumber.toString()}`,
      recipient_email: emailInput.value,
    };
    emailjs
      .send(
        "service_zqakjye",
        "template_upiuxr2",
        OTPparams,
        "sW010BfXgUaDdbuGq"
      )
      .then(function () {
        loaderDiv.style.display = "none";
        otpDiv.style.display = "inline-flex";
        otpEmail.innerText = emailInput.value;
      });
  } else {
    alert("Email is Required!");
  }
}
function VerifySubscribe() {
  if (otpInput.value !== "") {
    loaderDiv.style.display = "flex";
    loadMessage.innerText = "Verifying your OTP";
    if (otpInput.value === otpNumber.toString()) {
      const params = {
        from_name: "Chalkduster",
        email_id: emailInput.value,
      };
      emailjs
        .send(
          "service_zqakjye",
          "template_oz77gaq",
          params,
          "sW010BfXgUaDdbuGq"
        )
        .then(function () {
          loadMessage.innerText = "Thankyou! for Subscribing";
          loadingDiv.innerHTML = `<img
            src="images/verified.gif"
            alt="verified animation"
            style="height: 80px; width: 80px"
          />`;
          setTimeout(() => {
            loaderDiv.style.display = "none";
            window.location.reload();
            otpDiv.style.display = "none";
          }, 3000);
        });
    } else {
      alert("Please Enter Valid OTP");
    }
  } else {
    alert("OTP is required");
  }
}
