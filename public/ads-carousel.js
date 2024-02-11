document.addEventListener("DOMContentLoaded", function () {
  const suggestDiv = document.getElementById("Ad-container");
  // if (suggestDiv.children.length > 3) {
  //   createCarousel(suggestDiv);
  // }
  //mobile carousel initialize
  function mobileCarFunc(mobileCar) {
    if (mobileCar.matches) {
      if (suggestDiv.children.length > 1) {
        createCarousel(suggestDiv);
      }
    }
  }
  const mobileCar = window.matchMedia("(max-width: 480px)");
  mobileCarFunc(mobileCar);
  mobileCar.addEventListener("change", function () {
    mobileCarFunc(mobileCar);
  });
  //tablet carousel initialize
  function tabletCarFunc(tabletCar) {
    if (tabletCar.matches) {
      if (suggestDiv.children.length > 2) {
        createCarousel(suggestDiv);
      }
    }
  }
  const tabletCar = window.matchMedia(
    "(min-width: 481px) and (max-width:1080px)"
  );
  tabletCarFunc(tabletCar);
  tabletCar.addEventListener("change", function () {
    tabletCarFunc(tabletCar);
  });
});
function createCarousel(container) {
  // console.log(container.children);
  const nextButton = document.createElement("button");
  nextButton.innerHTML = "<i class='icon icon-chevron-right'></i>";
  nextButton.addEventListener("click", function () {
    container.scrollLeft += container.scrollWidth / container.children.length;
  });
  const prevButton = document.createElement("button");
  prevButton.innerHTML = "<i class='icon icon-chevron-left'></i>";
  prevButton.addEventListener("click", function () {
    container.scrollLeft -= container.scrollWidth / container.children.length;
  });
  //   prevButton.style =
  //     "position: absolute; width: 30px; height: 50px; top:50%; transform: translate(100%, 50%); cursor: pointer; background-color: #757194; border: none; color: white; font-size: 20px; font-weight: bold";
  //   nextButton.style =
  //     "position: absolute; width: 30px; height: 50px; top:50%; right:0%; transform: translate(-100%, 50%); cursor: pointer; background-color: #757194; border: none; color: white; font-size: 20px; font-weight: bold";
  //pc carousel media
  //   function pcCarFunc(pcCar) {
  //     if (pcCar.matches) {
  //       if (container.children.length > 3) {
  //         // console.log(container.childNodes.length - 3);
  //         let btnVal = container.childNodes.length - 3;
  //         nextButton.addEventListener("click", function () {
  //           if (btnVal > -1) {
  //             btnVal -= 1;
  //             // console.log(btnVal);
  //           }
  //           if (btnVal === -1) {
  //             container.scrollLeft = 0;
  //             btnVal = container.childNodes.length - 3;
  //           }
  //         });
  //         prevButton.addEventListener("click", function () {
  //           if (btnVal < container.childNodes.length - 2) {
  //             btnVal += 1;
  //             // console.log(btnVal);
  //           }
  //           if (btnVal === container.childNodes.length - 2) {
  //             container.scrollLeft += container.scrollWidth;
  //             btnVal = 0;
  //           }
  //         });
  //       }
  //     }
  //   }
  //   const pcCar = window.matchMedia("(min-width: 1080px)");
  //   pcCarFunc(pcCar);
  //   pcCar.addEventListener("change", function () {
  //     pcCarFunc(pcCar);
  //   });
  // mobile carousel media
  function mobileFunc(mobilesize) {
    if (mobilesize.matches) {
      nextButton.style =
        "position: absolute; width: 20px; height: 40px; top:50%; right:0%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";
      prevButton.style =
        "position: absolute; width: 20px; height: 40px; top:50%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";

      if (container.children.length > 1) {
        // console.log(container.children.length - 1);
        let btnVal = container.children.length - 1;
        nextButton.addEventListener("click", function () {
          if (btnVal > -1) {
            btnVal -= 1;
            // console.log(btnVal);
          }
          if (btnVal === -1) {
            container.scrollLeft = 0;
            btnVal = container.children.length - 1;
          }
        });
        prevButton.addEventListener("click", function () {
          if (btnVal < container.children.length - 0) {
            btnVal += 1;
            // console.log(btnVal);
          }
          if (btnVal === container.children.length - 0) {
            container.scrollLeft += container.scrollWidth;
            btnVal = 0;
          }
        });
      }
    }
  }
  const mobilesize = window.matchMedia("(max-width: 480px)");
  mobileFunc(mobilesize);
  mobilesize.addEventListener("change", function () {
    mobileFunc(mobilesize);
  });

  // tablet carousel media query
  function tabletFunc(tabletsize) {
    if (tabletsize.matches) {
      nextButton.style =
        "position: absolute; width: 42px; height: 50px; top:50%; right:0%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";
      prevButton.style =
        "position: absolute; width: 42px; height: 50px; top:50%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";

      if (container.children.length > 2) {
        // console.log(container.children.length - 2);
        let btnVal = container.children.length - 2;
        nextButton.addEventListener("click", function () {
          if (btnVal > -1) {
            btnVal -= 1;
            // console.log(btnVal);
          }
          if (btnVal === -1) {
            container.scrollLeft = 0;
            btnVal = container.children.length - 2;
          }
        });
        prevButton.addEventListener("click", function () {
          if (btnVal < container.children.length - 1) {
            btnVal += 1;
            // console.log(btnVal);
          }
          if (btnVal === container.children.length - 1) {
            container.scrollLeft += container.scrollWidth;
            btnVal = 0;
          }
        });
      }
    }
  }
  const tabletsize = window.matchMedia(
    "(min-width: 481px) and (max-width:1080px)"
  );
  tabletFunc(tabletsize);
  tabletsize.addEventListener("change", function () {
    tabletFunc(tabletsize);
  });

  const carouselDiv = document.getElementById("nextprev-carousel");
  carouselDiv.appendChild(prevButton);
  carouselDiv.appendChild(nextButton);
}
