let discountAmount = null;

// Aplica descuento y actualiza mensaje visual
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

// Genera la factura con descuento, detalle y envío
function generateInvoice() {
  const employee = document.getElementById("employee").value || "Unknown";
  const services = [];
  const categories = new Set();
  let total = 0;
  
  
  // Recorrer todos los servicios seleccionados
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

      const category = item.closest(".category")?.querySelector("h3")?.textContent;
      if (category) categories.add(category);
    }
  });

  const summary = Array.from(categories).join(", ") || "Uncategorized";

  // Aplicar descuento
  let discountNote = "";
  if (discountAmount) {
    if (discountAmount.type === "percent") {
      const percent = discountAmount.value / 100;
      const deducted = Math.round(total * percent);
      total -= deducted;
      discountNote = `${discountAmount.value}% discount (-$${deducted})`;
    } else if (discountAmount.type === "amount") {
      total -= discountAmount.value;
      discountNote = `$${discountAmount.value} discount`;
    }
    if (total < 0) total = 0;
  }

  const totalText = `$${total}` + (discountNote ? ` (${discountNote})` : "");

  // Agregar a la tabla
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${employee}</td>
    <td>${summary}</td>
    <td>${services.join("<br>")}</td>
    <td>${totalText}</td>
  `;
  document.querySelector("#invoices tbody").appendChild(row);

  // Enviar a Discord
  fetch("https://discord.com/api/webhooks/1392217195953786962/rn3McMeacAiTIzjN1sNmTxF8iPYW3QDNlRpsaUFMoH61SmJl59fPgO4sjX6lQEvxzJAD", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🧾 New invoice:
Employee: ${employee}
Service Types: ${summary}
Details:\n${services.join("\n")}
${discountNote ? `Discount Applied: ${discountNote}\n` : ""}
Total: $${total}`
    })
  }).then(res => {
    if (res.ok) {
      console.log("Invoice sent to Discord");
    } else {
      console.error("Error sending to Discord");
    }
  });

  // Reset descuento después de generar factura
  discountAmount = null;
  document.getElementById("discountDisplay").textContent = "No discount applied.";
  document.getElementById("discountValue").value = "";
}