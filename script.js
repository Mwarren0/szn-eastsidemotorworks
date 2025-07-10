let discountAmount = null;
let pendingInvoice = null;

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
  const invoiceData = collectInvoiceData();
  if (!invoiceData) return;

  const { employee, services, summary, discountNote, total } = invoiceData;
  const totalText = `$${total}` + (discountNote ? ` (${discountNote})` : "");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${employee}</td>
    <td>${summary}</td>
    <td>${services.join("<br>")}</td>
    <td>${totalText}</td>
  `;
  document.querySelector("#invoices tbody").appendChild(row);

  sendToDiscord(invoiceData);
  clearForm();
}

function previewInvoice() {
  const invoiceData = collectInvoiceData();
  if (!invoiceData) return;

  const { employee, services, summary, discountNote, total } = invoiceData;
  const totalText = `$${total}` + (discountNote ? ` (${discountNote})` : "");

  const previewHTML = `
    <p><strong>Employee:</strong> ${employee}</p>
    <p><strong>Service Types:</strong> ${summary}</p>
    <p><strong>Details:</strong><br>${services.join("<br>")}</p>
    ${discountNote ? `<p><strong>Discount:</strong> ${discountNote}</p>` : ""}
    <p><strong>Total:</strong> ${totalText}</p>
  `;

  document.getElementById("previewContent").innerHTML = previewHTML;
  document.getElementById("previewBox").style.display = "block";
  pendingInvoice = invoiceData;
}

function confirmInvoice() {
  if (!pendingInvoice) return;

  const { employee, services, summary, discountNote, total } = pendingInvoice;
  const totalText = `$${total}` + (discountNote ? ` (${discountNote})` : "");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${employee}</td>
    <td>${summary}</td>
    <td>${services.join("<br>")}</td>
    <td>${totalText}</td>
  `;
  document.querySelector("#invoices tbody").appendChild(row);

  sendToDiscord(pendingInvoice);
  clearForm();
  closePreview();
  pendingInvoice = null;
}

function closePreview() {
  document.getElementById("previewBox").style.display = "none";
}

function clearForm() {
  document.getElementById("employee").value = "";
  document.querySelectorAll(".item").forEach(item => {
    item.querySelector(".service").checked = false;
    item.querySelector(".quantity").value = 1;
  });
  document.getElementById("discountValue").value = "";
  document.getElementById("discountDisplay").textContent = "No discount applied.";
  discountAmount = null;
}

function collectInvoiceData() {
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

  if (services.length === 0) return null;

  const summary = Array.from(categories).join(", ") || "Uncategorized";

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

  return {
    employee,
    services,
    summary,
    discountNote,
    total
  };
}

function sendToDiscord({ employee, services, summary, discountNote, total }) {
  fetch("https://discord.com/api/webhooks/1392957993477210273/tRW5w15Ro9S1C8hswgmW062GMtpPdaFVcxUqbNZ6y5uYUIeQUIUGY2YzyIkqEcRyOrXm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "🧾 New Invoice",
          color: 65280,
          fields: [
            { name: "Employee", value: employee, inline: true },
            { name: "Service Types", value: summary, inline: true },
            { name: "Details", value: services.join("\n") },
            ...(discountNote ? [{ name: "Discount", value: discountNote }] : []),
            { name: "Total", value: `$${total}` }
          ],
          footer: { text: "East Side Invoice System" },
          timestamp: new Date().toISOString()
        }
      ]
    })
  });
}