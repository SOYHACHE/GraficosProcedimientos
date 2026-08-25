let modoDinero = false;

function generarCamposDinamicos() {
    const cantidad = parseInt(document.getElementById('num-columnas').value);
    const container = document.getElementById('dinamic-inputs-container');
    
    // Guardar valores actuales antes de redibujar (si ya existían)
    const filasActuales = container.querySelectorAll('.columna-row');
    let valoresPrevios = [];
    filasActuales.forEach((fila) => {
        valoresPrevios.push({
            mes: fila.querySelector('.input-mes').value,
            cant: fila.querySelector('.input-cant').value,
            plata: fila.querySelector('.input-plata').value
        });
    });

    container.innerHTML = '';

    for (let i = 0; i < cantidad; i++) {
        // Si no hay valores previos, se dejan totalmente vacíos
        let defMes = valoresPrevios[i] ? valoresPrevios[i].mes : '';
        let defCant = valoresPrevios[i] ? valoresPrevios[i].cant : '';
        let defPlata = valoresPrevios[i] ? valoresPrevios[i].plata : '';

        let row = document.createElement('div');
        row.className = 'columna-row';
        row.innerHTML = `
            <div class="input-group">
                <label>Nombre Periodo ${i+1}</label>
                <input type="text" class="input-mes" value="${defMes}" placeholder="Ej: Enero">
            </div>
            <div class="input-group">
                <label>Cantidad</label>
                <input type="number" class="input-cant" value="${defCant}" placeholder="0">
            </div>
            <div class="input-group">
                <label>Monto ($)</label>
                <input type="number" class="input-plata" value="${defPlata}" placeholder="0">
            </div>
        `;
        container.appendChild(row);
    }
    
    renderizar();
}

function cambiarModo(mostrarDinero) {
    modoDinero = mostrarDinero;
    document.getElementById('tab-cant').classList.toggle('active', !modoDinero);
    document.getElementById('tab-plata').classList.toggle('active', modoDinero);
    renderizar();
}

function formatearDinero(valor) {
    return '$' + valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function actualizarTextoResumen(meses, dataCant, dataPlata) {
    const lista = document.getElementById('lista-resumen');
    lista.innerHTML = ''; 

    if (meses.length === 0) {
        lista.innerHTML = '<li>No hay datos ingresados para mostrar en este reporte.</li>';
        return;
    }

    const totalCant = dataCant.reduce((a, b) => a + b, 0);
    const maxCant = Math.max(...dataCant);
    const mesMaxCant = meses[dataCant.indexOf(maxCant)] || 'N/A';

    const totalPlata = dataPlata.reduce((a, b) => a + b, 0);
    const maxPlata = Math.max(...dataPlata);
    const mesMaxPlata = meses[dataPlata.indexOf(maxPlata)] || 'N/A';
    
    const promedioCant = (totalCant / dataCant.length).toFixed(1);

    if (!modoDinero) {
        lista.innerHTML += `<li>Total acumulado del periodo: <b>${totalCant} procedimientos</b> realizados en ${meses.length} periodos.</li>`;
        lista.innerHTML += `<li>Promedio de rendimiento mensual: <b>${promedioCant} intervenciones</b>.</li>`;
        lista.innerHTML += `<li>Pico más alto registrado: <b>${maxCant} procedimientos</b> en ${mesMaxCant}.</li>`;
    } else {
        lista.innerHTML += `<li>Total acumulado del periodo: ${totalCant} procedimientos y <b>${formatearDinero(totalPlata)} recuperados</b>.</li>`;
        lista.innerHTML += `<li>Pico más alto de dinero en ${mesMaxPlata}: <b>${formatearDinero(maxPlata)}</b> (${maxCant} procedimientos).</li>`;
        lista.innerHTML += `<li>Se mantiene el flujo de recuperación monetaria registrado en los campos activos.</li>`;
    }
}

function renderizar() {
    const filas = document.querySelectorAll('.columna-row');
    let meses = [];
    let dataCant = [];
    let dataPlata = [];

    filas.forEach(fila => {
        let mesTxt = fila.querySelector('.input-mes').value.trim() || 'Sin Nombre';
        let valC = parseFloat(fila.querySelector('.input-cant').value) || 0;
        let valP = parseFloat(fila.querySelector('.input-plata').value) || 0;

        meses.push(mesTxt);
        dataCant.push(valC);
        dataPlata.push(valP);
    });

    const titulo = modoDinero ? "MONTOS RECUPERADOS ($)" : "CANTIDAD DE PROCEDIMIENTOS";
    const colorBarra = modoDinero ? '#2c5282' : '#1a365d';
    const dataActiva = modoDinero ? dataPlata : dataCant;

    actualizarTextoResumen(meses, dataCant, dataPlata);

    Highcharts.chart('chart-container', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 12,
                depth: 40,
                viewDistance: 25
            },
            backgroundColor: 'transparent'
        },
        title: { text: titulo, style: { fontWeight: 'bold', color: '#000', fontSize: '15px' } },
        xAxis: {
            categories: meses,
            labels: { style: { fontSize: '11px', fontWeight: 'bold', color: '#333' } }
        },
        yAxis: {
            title: { 
                text: modoDinero ? 'Monto en Pesos ($)' : 'Cantidad de Procedimientos',
                style: { fontWeight: 'bold', color: '#000', fontSize: '12px' }
            },
            allowDecimals: false,
            tickInterval: modoDinero ? null : 1,
            labels: {
                style: { fontSize: '10px' },
                formatter: function() {
                    return modoDinero ? '$' + this.value.toLocaleString('es-AR') : this.value;
                }
            }
        },
        tooltip: {
            headerFormat: '<b>{point.key}</b><br>',
            pointFormat: modoDinero ? 'Recuperado: \${point.y:,.2f}' : 'Procedimientos: {point.y}'
        },
        plotOptions: {
            column: {
                depth: 35,
                color: colorBarra,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return modoDinero ? '$' + this.y.toLocaleString('es-AR') : this.y;
                    },
                    style: { fontSize: '11px', fontWeight: 'bold', color: '#000', textOutline: 'none' }
                }
            }
        },
        series: [{
            name: modoDinero ? 'Dinero' : 'Cantidad',
            data: dataActiva,
            showInLegend: false
        }]
    });
}

// Inicializar al cargar la página
window.onload = function() {
    generarCamposDinamicos();
};
