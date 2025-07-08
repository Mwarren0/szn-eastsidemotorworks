function generateInvoice() {
  const employee = document.getElementById("employee").value || "Unknown";
  const services = [];
  const serviceTypes = new Set();
  let total = 0;

  document.querySelectorAll(".item").forEach(el => {
    const checkbox = el.querySelector(".service");
    const quantity = parseInt(el.querySelector(".quantity").value);
    if (checkbox.checked && quantity > 0) {
      const name = checkbox.parentNode.textContent.trim();
      const price = parseInt(checkbox.dataset.price);
      const subtotal = price * quantity;
      services.push(`${name} x${quantity} ($${subtotal})`);
      total += subtotal;

      const category = el.closest(".category")?.querySelector("strong")?.textContent;
      if (category) serviceTypes.add(category);
    }
  });

  const serviceSummary = Array.from(serviceTypes).join(", ") || "Uncategorized";

  // Show in table
  const row = document.createElement("tr");
  row.innerHTML = `<td>${employee}</td><td>${serviceSummary}</td><td>${services.join("<br>")}</td><td>$${total}</td>`;
  document.querySelector("#invoices tbody").appendChild(row);

  // Send to Discord
  fetch("https://discord.com/api/webhooks/TU_WEBHOOK_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🧾 New invoice:
Employee: ${employee}
Service Types: ${serviceSummary}
Details:\n${services.join("\n")}
Total: $${total}`
    })
  }).then(res => {
    if (res.ok) console.log("Sent to Discord");
    else console.error("Error sending to Discord");
  });
}