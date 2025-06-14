document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wishlist-heart").forEach((button) => {
    button.addEventListener("click", async (e) => {
        console.log("event: ",e)
      const invId = button.dataset.id;
      const isInWishlist = button.textContent === "♥";
      console.log("button: ", button)
      alert()

      try {
        const res = await fetch(`/wishlist/${invId}`, {
          method: isInWishlist ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();

        if (res.ok) {
          button.textContent = isInWishlist ? "♡" : "♥";
        } else {
          alert(result.message || "Something went wrong");
        }
      } catch (err) {
        console.error("Wishlist update error:", err);
      }
    });
  });
});
