let modoDinero = false;

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
    const maxCant = dataCant.length > 0 ? Math.max(...dataCant) : 0;
    const mesMaxCant = meses[dataCant.indexOf(maxCant)] || 'N/A';

    const totalPlata = dataPlata.reduce((a, b) => a + b, 0);
    const maxPlata = dataPlata.length > 0 ? Math.max(...dataPlata) : 0;
    const mesMaxPlata = meses[dataPlata.indexOf(maxPlata)] || 'N/A';
    
    const promedioCant = dataCant.length > 0 ? (totalCant / dataCant.length).toFixed(1) : 0;

    if (!modoDinero) {
        lista.innerHTML += `<li>Total acumulado del periodo visible: <b>${totalCant} procedimientos</b> realizados.</li>`;
        lista.innerHTML += `<li>Promedio de rendimiento: <b>${promedioCant} intervenciones</b> por mes cargado.</li>`;
        lista.innerHTML += `<li>Pico más alto registrado: <b>${maxCant} procedimientos</b> en el mes de ${mesMaxCant}.</li>`;
    } else {
        lista.innerHTML += `<li>Total acumulado del periodo visible: ${totalCant} procedimientos y <b>${formatearDinero(totalPlata)} recuperados</b>.</li>`;
        lista.innerHTML += `<li>Pico más alto registrado en ${mesMaxPlata}: <b>${formatearDinero(maxPlata)}</b> (${maxCant} procedimientos).</li>`;
        lista.innerHTML += `<li>Se mantiene un flujo de recuperación monetaria durante las fechas seleccionadas.</li>`;
    }
}

function renderizar() {
    const selectsMeses = document.querySelectorAll('.mes-select');
    const inputsC = document.querySelectorAll('#inputs-cant input');
    const inputsP = document.querySelectorAll('#inputs-plata input');
    
    let meses = [];
    let dataCant = [];
    let dataPlata = [];

    for (let i = 0; i < 6; i++) {
        let valC = inputsC[i].value.trim();
        let valP = inputsP[i].value.trim();

        // Si ambos campos están vacíos, omitimos este mes del gráfico
        if (valC === '' && valP === '') continue;

        meses.push(selectsMeses[i].value);
        dataCant.push(valC === '' ? 0 : parseInt(valC));
        dataPlata.push(valP === '' ? 0 : parseInt(valP));
    }

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

// Función para descargar el gráfico actual
function descargarGrafico() {
    const chart = Highcharts.charts.find(c => c && c.renderTo.id === 'chart-container');
    if (chart) {
        chart.exportChart({
            type: 'image/png',
            filename: modoDinero ? 'reporte-recuperacion-dinero' : 'reporte-cantidad-procedimientos'
        });
    } else {
        alert('El gráfico no está disponible para descargar.');
    }
}

// Inicialización de la aplicación al cargar la página
window.onload = renderizar;

// Registro del Service Worker para funcionamiento PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch(err => console.log('Error al registrar el Service Worker:', err));
    });
}
