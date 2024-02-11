const categoryDiv = document.getElementById("Cat-container");
// if (categoryDiv.children.length > 3) {
//   createCarousel(categoryDiv);
// }
//mobile carousel initialize
function mobileCarFunc(mobileCar) {
  if (mobileCar.matches) {
    if (categoryDiv.children.length > 1) {
      createCategoryCarousel(categoryDiv);
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
    if (categoryDiv.children.length > 2) {
      createCategoryCarousel(categoryDiv);
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
function createCategoryCarousel(container) {
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

  const carouselDiv = document.getElementById("nextprev-category");
  carouselDiv.appendChild(prevButton);
  carouselDiv.appendChild(nextButton);
}

// WOMEN CATEGORY CAROUSEL ***********************************************************************

const categoryDiv2 = document.getElementById("Cat-container2");
// if (categoryDiv2.children.length > 3) {
//   createCategory2Carousel(categoryDiv2);
// }
//mobile carousel initialize
function mobileCar2Func(mobileCar) {
  if (mobileCar.matches) {
    if (categoryDiv2.children.length > 1) {
      createCategory2Carousel(categoryDiv2);
    }
  }
}
const mobileCar2 = window.matchMedia("(max-width: 480px)");
mobileCar2Func(mobileCar2);
mobileCar2.addEventListener("change", function () {
  mobileCar2Func(mobileCar2);
});
//tablet carousel initialize
function tabletCar2Func(tabletCar2) {
  if (tabletCar2.matches) {
    if (categoryDiv2.children.length > 2) {
      createCategory2Carousel(categoryDiv2);
    }
  }
}
const tabletCar2 = window.matchMedia(
  "(min-width: 481px) and (max-width:1080px)"
);
tabletCar2Func(tabletCar2);
tabletCar2.addEventListener("change", function () {
  tabletCar2Func(tabletCar2);
});
function createCategory2Carousel(container) {
  // console.log(container.children);
  const nextButton2 = document.createElement("button");
  nextButton2.innerHTML = "<i class='icon icon-chevron-right'></i>";
  nextButton2.addEventListener("click", function () {
    container.scrollLeft += container.scrollWidth / container.children.length;
  });
  const prevButton2 = document.createElement("button");
  prevButton2.innerHTML = "<i class='icon icon-chevron-left'></i>";
  prevButton2.addEventListener("click", function () {
    container.scrollLeft -= container.scrollWidth / container.children.length;
  });
  //   prevButton2.style =
  //     "position: absolute; width: 30px; height: 50px; top:50%; transform: translate(100%, 50%); cursor: pointer; background-color: #757194; border: none; color: white; font-size: 20px; font-weight: bold";
  //   nextButton2.style =
  //     "position: absolute; width: 30px; height: 50px; top:50%; right:0%; transform: translate(-100%, 50%); cursor: pointer; background-color: #757194; border: none; color: white; font-size: 20px; font-weight: bold";
  //pc carousel media
  //   function pcCarFunc(pcCar) {
  //     if (pcCar.matches) {
  //       if (container.children.length > 3) {
  //         // console.log(container.childNodes.length - 3);
  //         let btnVal = container.childNodes.length - 3;
  //         nextButton2.addEventListener("click", function () {
  //           if (btnVal > -1) {
  //             btnVal -= 1;
  //             // console.log(btnVal);
  //           }
  //           if (btnVal === -1) {
  //             container.scrollLeft = 0;
  //             btnVal = container.childNodes.length - 3;
  //           }
  //         });
  //         prevButton2.addEventListener("click", function () {
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
  function mobileFunc2(mobilesize2) {
    if (mobilesize2.matches) {
      nextButton2.style =
        "position: absolute; width: 20px; height: 40px; top:50%; right:0%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";
      prevButton2.style =
        "position: absolute; width: 20px; height: 40px; top:50%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";

      if (container.children.length > 1) {
        // console.log(container.children.length - 1);
        let btnVal = container.children.length - 1;
        nextButton2.addEventListener("click", function () {
          if (btnVal > -1) {
            btnVal -= 1;
            // console.log(btnVal);
          }
          if (btnVal === -1) {
            container.scrollLeft = 0;
            btnVal = container.children.length - 1;
          }
        });
        prevButton2.addEventListener("click", function () {
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
  const mobilesize2 = window.matchMedia("(max-width: 480px)");
  mobileFunc2(mobilesize2);
  mobilesize2.addEventListener("change", function () {
    mobileFunc2(mobilesize2);
  });

  // tablet carousel media query
  function tabletFunc2(tabletsize2) {
    if (tabletsize2.matches) {
      nextButton2.style =
        "position: absolute; width: 42px; height: 50px; top:50%; right:0%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";
      prevButton2.style =
        "position: absolute; width: 42px; height: 50px; top:50%; transform: translate(0%, -100%); cursor: pointer; background-color: #5C5858; border: none; color: white; display: flex; justify-content: center; align-items: center";

      if (container.children.length > 2) {
        // console.log(container.children.length - 2);
        let btnVal = container.children.length - 2;
        nextButton2.addEventListener("click", function () {
          if (btnVal > -1) {
            btnVal -= 1;
            // console.log(btnVal);
          }
          if (btnVal === -1) {
            container.scrollLeft = 0;
            btnVal = container.children.length - 2;
          }
        });
        prevButton2.addEventListener("click", function () {
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
  const tabletsize2 = window.matchMedia(
    "(min-width: 481px) and (max-width:1080px)"
  );
  tabletFunc2(tabletsize2);
  tabletsize2.addEventListener("change", function () {
    tabletFunc2(tabletsize2);
  });

  const carouselDiv2 = document.getElementById("nextprev-category2");
  carouselDiv2.appendChild(prevButton2);
  carouselDiv2.appendChild(nextButton2);
}
