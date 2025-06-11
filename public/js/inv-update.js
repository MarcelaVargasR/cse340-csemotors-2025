// const form = document.querySelector("#updateForm");
// console.log("----", form);
// if (form) {
//   form.addEventListener("change", function () {
//     const updateBtn = document.querySelector("#updateButton");
//     console.log("----", updateBtn);

//     if (updateBtn) {
//       updateBtn.removeAttribute("disabled");
//     }
//   });
// }



document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#updateForm");
  const updateBtn = document.querySelector("#updateButton");

  console.log("Form loaded:", form);
  console.log("Button loaded:", updateBtn);

  if (form && updateBtn) {
    form.addEventListener("input", function () {
      updateBtn.removeAttribute("disabled");
    });
  }
});
