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

        // Si ambos campos están vacíos, omitimos este mes
        if (valC === '' && valP === '') {
            continue;
        }

        meses.push(selectsMeses[i].value);
        dataCant.push(valC === '' ? 0 : parseInt(valC));
        dataPlata.push(valP === '' ? 0 : parseInt(valP));
    }

    // Si el usuario borró todo y no hay meses, ponemos una categoría por defecto para que Highcharts no crashee
    if (meses.length === 0) {
        meses = ['Sin datos'];
        dataCant = [0];
        dataPlata = [0];
    }

    const titulo = modoDinero ? "MONTOS RECUPERADOS ($)" : "CANTIDAD DE PROCEDIMIENTOS";
    const colorBarra = modoDinero ? '#2c5282' : '#1a365d';
    const dataActiva = modoDinero ? dataPlata : dataCant;

    actualizarTextoResumen(meses.includes('Sin datos') ? [] : meses, dataCant, dataPlata);

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
            labels: { style: { fontSize: '11px', fontWeight: 'bold', color: '#333' } },
            gridLineWidth: 1,
            gridLineColor: '#cbd5e0',
            lineColor: '#a0aec0',
            lineWidth: 1
        },
        yAxis: {
            title: { 
                text: modoDinero ? 'Monto en Pesos ($)' : 'Cantidad de Procedimientos',
                style: { fontWeight: 'bold', color: '#000', fontSize: '12px' }
            },
            allowDecimals: false,
            tickInterval: modoDinero ? null : 1,
            gridLineWidth: 1,
            gridLineColor: '#e2e8f0',
            lineColor: '#a0aec0',
            lineWidth: 1,
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
