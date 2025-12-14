document.querySelectorAll(".bento-item").forEach((box) => {
  box.addEventListener("mousemove", (e) => {
    let rect = box.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2;
    let y = e.clientY - rect.top - rect.height / 2;

    box.style.transform = `translateY(-6px) scale(1.03) rotateX(${y/40}deg) rotateY(${-x/40}deg)`;
  });

  box.addEventListener("mouseleave", () => {
    box.style.transform = "";
  });

  box.querySelector(".hover-icon").textContent = box.dataset.icon;
});
