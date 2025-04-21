let turnoActual = [];
let historialTurnos = JSON.parse(localStorage.getItem('historialTurnos')) || {};
let totalCasaActual = 0;

function redondearA5(monto) {
  return Math.round(monto / 5) * 5;
}

function agregarPropina() {
  const mesero = document.getElementById('mesero').value.trim();
  const propina = parseFloat(document.getElementById('propina').value);

  if (!mesero || isNaN(propina))return alert("Datos inválidos");

  const meseroBruto = propina * 0.4;
  const staffBruto = propina * 0.6;
  
  const meseroRedondeado = redondearA5(meseroBruto);
  const staffRedondeado = redondearA5(staffBruto);
  const excedente = propina - (meseroRedondeado + staffRedondeado);

  turnoActual.push({mesero, propina, meseroRedondeado, staffRedondeado});
  totalCasaActual += excedente;

  document.getElementById('mesero').value = '';
  document.getElementById('propina').value = '';
  actualizarTabla();
}

function actualizarTabla() {
  const tbody = document.getElementById('tbodyResumen');
  tbody.innerHTML = '';
  
  let totalStaff = 0;
  let totalMesero = 0;
  const resumen = {};

  turnoActual.forEach(item => {
    if (!resumen[item.mesero]) {
      resumen[item.mesero] = {mesero: 0, staff: 0, total: 0};
    }
    resumen[item.mesero].mesero += item.meseroRedondeado;
    resumen[item.mesero].staff += item.staffRedondeado;
    resumen[item.mesero].total += item.meseroRedondeado + item.staffRedondeado;
    
    totalStaff += item.staffRedondeado;
    totalMesero += item.meseroRedondeado;
  });

  for (const [nombre, datos] of Object.entries(resumen)) {
    tbody.innerHTML += `
      <tr>
        <td>${nombre}</td>
        <td>$${datos.total.toFixed(2)}</td>
        <td>$${datos.mesero.toFixed(2)}</td>
        <td>$${datos.staff.toFixed(2)}</td>
      </tr>`;
  }

  document.getElementById('totalStaff').textContent = `$${totalStaff.toFixed(2)}`;
  document.getElementById('totalCasa').textContent = `$${totalCasaActual.toFixed(2)}`;
}

function terminarTurno() {
  if (!turnoActual.length) return alert("No hay datos que guardar");
  
  const fecha = new Date().toLocaleString();
  historialTurnos[fecha] = {datos: [...turnoActual], casa: totalCasaActual};
  localStorage.setItem('historialTurnos', JSON.stringify(historialTurnos));
  
  turnoActual = [];
  totalCasaActual = 0;
  actualizarTabla();
  actualizarSelector();
  alert(`Turno guardado: ${fecha}`);
}

function actualizarSelector() {
  const select = document.getElementById('turnos');
  select.innerHTML = '<option value="">Selecciona un turno</option>';
  Object.keys(historialTurnos).forEach(fecha => {
    select.innerHTML += `<option value="${fecha}">${fecha}</option>`;
  });
}

function mostrarTurno() {
  const fecha = document.getElementById('turnos').value;
  if (!fecha) return actualizarTabla();
  
  const turno = historialTurnos[fecha];
  turnoActual = turno.datos;
  totalCasaActual = turno.casa;
  actualizarTabla();
}

function exportarCSV() {
  const fecha = document.getElementById('turnos').value;
  if (!fecha) return alert("Selecciona un turno");
  
  const {datos, casa} = historialTurnos[fecha];
  let csv = "Mesero,Propina Total,Mesero (40%),Staff (60%)\n";
  
  datos.forEach(item => {
    csv += `${item.mesero},${item.propina},${item.meseroRedondeado},${item.staffRedondeado}\n`;
  });
  
  const totalStaff = datos.reduce((sum, item) => sum + item.staffRedondeado, 0);
  csv += `\nTotal Staff,${totalStaff.toFixed(2)}`;
  csv += `\nExcedente Casa,${casa.toFixed(2)}`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv'}));
  link.download = `turno_${fecha.replace(/[\/:, ]/g, '_')}.csv`;
  link.click();
}

window.onload = () => {
  actualizarSelector();
  actualizarTabla();
};