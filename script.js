function generarFactura() {
  const cliente = document.getElementById("cliente").value || "Sin nombre";
  const vehiculoInfo = document.getElementById("vehiculo").value.split("|");
  const vehiculo = vehiculoInfo[0];
  let total = parseInt(vehiculoInfo[1]);

  const mejoras = [];
  document.querySelectorAll("section:nth-of-type(2) input:checked").forEach(el => {
    mejoras.push(el.parentNode.textContent.trim());
    total += parseInt(el.value);
  });

  // Mostrar en tabla
  const fila = document.createElement("tr");
  fila.innerHTML = `<td>${cliente}</td><td>${vehiculo}</td><td>${mejoras.join(", ")}</td><td>$${total}</td>`;
  document.querySelector("#facturas tbody").appendChild(fila);

  // Enviar a Discord
  fetch("https://discord.com/api/webhooks/TU_WEBHOOK_AQUI", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🧾 Factura generada:\nCliente: ${cliente}\nVehículo: ${vehiculo}\nMejoras: ${mejoras.join(", ")}\nTotal: $${total}`
    })
  }).then(res => {
    if (res.ok) {
      console.log("Factura enviada a Discord");
    } else {
      console.error("Error al enviar a Discord");
    }
  });
}
