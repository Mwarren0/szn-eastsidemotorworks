let discountAmount = null;

function applyDiscount() {
  const value = parseFloat(document.getElementById("discountValue").value);
  const type = document.getElementById("discountType").value;

  if (isNaN(value) || value <= 0) {
    document.getElementById("discountDisplay").textContent = "Invalid discount.";
    discountAmount = null;
    return;
  }

  discountAmount = { type, value };
  const display = type === "amount" ? `$${value} off` : `${value}% off`;
  document.getElementById("discountDisplay").textContent = `Discount applied: ${display}`;
}

function generateInvoice() {
  const employee = document.getElementById("employee").value || "Unknown";
  const services = [];
  const categories = new Set();
  let total = 0;

  document.querySelectorAll(".item").forEach(item => {
    const checkbox = item.querySelector(".service");
    const quantity = parseInt(item.querySelector(".quantity").value);
    if (checkbox.checked && quantity > 0) {
      const label = item.querySelector("label");
      const name = label ? label.textContent.trim() : "Unnamed Service";
      const price = parseInt(checkbox.dataset.price);
      const subtotal = price * quantity;
      services.push(`${name} ×${quantity} ($${subtotal})`);
      total += subtotal;

      const category = item.closest(".category")?.querySelector("strong")?.textContent;
      if (category) categories.add(category);
    }
  });

  const summary = Array.from(categories).join(", ") || "Uncategorized";

  let discountNote = "";
  if (discountAmount) {
    if (discountAmount.type === "percent") {
      const percent = discountAmount.value / 100;
      const deducted = Math.round(total * percent);
      total -= deducted;
      discountNote = `${discountAmount.value}% discount (-

{deducted})`;
    } else if (discountAmount.type === "amount") {
      total -= discountAmount.value;
      discountNote = `

{discountAmount.value} discount`;
    }
    if (total < 0) total = 0;
  }

  const totalText = `$${total}` + (discountNote ? ` (${discountNote})` : "");

  // Add to table
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${employee}</td>
    <td>${summary}</td>
    <td>${services.join("<br>")}</td>
    <td>${totalText}</td>
  `;
  document.querySelector("#invoices tbody").appendChild(row);

  // 🖼 Discord embed format
  fetch("https://discord.com/api/webhooks/1392217195953786962/rn3McMeacAiTIzjN1sNmTxF8iPYW3QDNlRpsaUFMoH61SmJl59fPgO4sjX6lQEvxzJAD", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "🧾 New Invoice",
          color: 65280, // Bright green
          fields: [
            { name: "Employee", value: employee, inline: true },
            { name: "Service Types", value: summary, inline: true },
            { name: "Details", value: services.join("\n") },
            ...(discountNote ? [{ name: "Discount", value: discountNote }] : []),
            { name: "Total", value: `$${total}` }
          ],
          footer: {
            text: "East Side Invoice System"
          },
          timestamp: new Date().toISOString()
        }
      ]
    })
  });

  // 🧹 Clean form after submission
  document.getElementById("employee").value = "";
  document.querySelectorAll(".item").forEach(item => {
    item.querySelector(".service").checked = false;
    item.querySelector(".quantity").value = 1;
  });
  document.getElementById("discountValue").value = "";
  document.getElementById("discountDisplay").textContent = "No discount applied.";
  discountAmount = null;
}