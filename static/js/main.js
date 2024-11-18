$(document).ready(function() {
    let datasetInfo = {};  // Variable para almacenar la información del dataset

    // Función para mostrar el spinner
    function showLoading() {
        $('#loadingSpinner').show();
    }

    // Función para ocultar el spinner
    function hideLoading() {
        $('#loadingSpinner').hide();
    }
    // Manejar el envío del formulario de carga de archivo
    $('#uploadForm').on('submit', function(e) {
        e.preventDefault();
        
        let formData = new FormData();
        let fileInput = $('#fileInput')[0];
        
        if (fileInput.files.length === 0) {
            alert('Por favor seleccione un archivo');
            return;
        }
        
        formData.append('file', fileInput.files[0]);
        
        showLoading();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.error) {
                    alert(response.error);
                    return;
                }
                
                // Habilitar el selector de información
                $("#infoSelect").prop("disabled", false);
                
                // Guardar la información del dataset
                datasetInfo = response.info;
                
                // Actualizar selectores con las columnas disponibles
                updateColumnSelectors(response.columns);
                
                // Habilitar las pestañas de análisis
                enableAnalysisTabs();

                // Ocultar el loading
                hideLoading();
            },
            error: function() {
                hideLoading();
                alert('Error al cargar el archivo');
            }
        });
    });

    // Función para mostrar la información básica dependiendo de la opción seleccionada
    $('#infoSelect').on('change', function() {
        const selectedOption = $(this).val();
        displayBasicInfo(selectedOption);
    });

    // Función para mostrar la información seleccionada
    function displayBasicInfo(option) {
        let html = '';
        $('#fullTable').html(html);
        $('#dataInfo').html(html);

        switch (option) {
            case 'info':
                html = `<pre>${datasetInfo.info}</pre>`;
                break;
            case 'head':
                html = datasetInfo.head;
                break;
            case 'size':
                html = `Tamaño del Dataset: ${datasetInfo.shape[0]} filas, ${datasetInfo.shape[1]} columnas`;
                break;
            case 'nullCounts':
                html = '<table class="table"><thead><tr><th>Columna</th><th>Valores Nulos</th></tr></thead><tbody>';
                for (const [col, nullCount] of Object.entries(datasetInfo.null_counts)) {
                    html += `<tr><td>${col}</td><td>${nullCount}</td></tr>`;
                }
                html += '</tbody></table>';
                break;
            case 'columns':
                html = `Cantidad de Columnas: ${datasetInfo.shape[1]}`;
                break;
            case 'allData':
                // Inicializar DataTable con todos los datos
                html = '<h4>Tabla Completa</h4>';
                $('#fullTable').html('<table id="completeDataTable" class="table table-striped"></table>');
                $('#completeDataTable').DataTable({
                    data: datasetInfo.data,
                    columns: datasetInfo.columns.map(col => ({title: col, data: col})),
                    pageLength: 10,
                    responsive: true
                });
                break;
            default:
                html = '';
                break;
        }

        // Actualizar el contenedor con la información
        $('#dataInfo').html(html);
    }

    // Función para actualizar los selectores de columnas
    function updateColumnSelectors(columns) {
        const selectors = [
            '#statsColumn',
            '#contingencyCol1',
            '#contingencyCol2',
            '#plotXCol',
            '#plotYCol'
        ];
        
        selectors.forEach(selector => {
            const select = $(selector);
            select.empty();
            select.append('<option value="">Seleccione una columna</option>');
            columns.forEach(col => {
                select.append(`<option value="${col}">${col}</option>`);
            });
        });
    }

    // Función para habilitar las pestañas de análisis
    function enableAnalysisTabs() {
        $('#analysisTabs a').removeClass('disabled');
    }

    // Manejar la generación de estadísticas
    $('#statsColumn').on('change', function() {
        const column = $(this).val();
        if (!column) return;
        showLoading();
        $.ajax({
            url: '/get_stats',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({column: column}),
            success: function(response) {
                displayStats(response, column);
                hideLoading();
            },
            error: function() {
                hideLoading();
                alert('Error al obtener las estadísticas');
            }
        });
    });

    // Manejar la generación de tablas de contingencia
    $('#generateContingency').on('click', function() {
        const col1 = $('#contingencyCol1').val();
        const col2 = $('#contingencyCol2').val();
        
        if (!col1 || !col2) {
            alert('Por favor seleccione ambas columnas');
            return;
        }
        
        showLoading();
        $.ajax({
            url: '/get_contingency',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({col1: col1, col2: col2}),
            success: function(response) {
                $('#contingencyResults').html(response.table);
                hideLoading();
            },
            error: function() {
                hideLoading();
                alert('Error al obtener la tabla de contingencia');
            }
        });
    });

    // Manejar la generación de gráficos
    $('#generatePlot').on('click', function() {
        const plotType = $('#plotType').val();
        const xCol = $('#plotXCol').val();
        const yCol = $('#plotYCol').val();
        
        if (!xCol) {
            alert('Por favor seleccione al menos la columna X');
            return;
        }
        
        if (plotType === 'scatter' && !yCol) {
            alert('El gráfico de dispersión requiere una columna Y');
            return;
        }
        
        showLoading();
        $.ajax({
            url: '/get_plot',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                plot_type: plotType,
                x_col: xCol,
                y_col: yCol
            }),
            success: function(response) {
                $('#plotResults').html(`<img src="data:image/png;base64,${response.plot}" alt="Gráfico">`);
                hideLoading();
            },
            error: function() {
                hideLoading();
                alert('Error al obtener el gráfico');
            }
        });
    });

    // Manejar la generación de correlaciones
    $('#generateCorrelation').on('click', function() {
        showLoading();
        $.ajax({
            url: '/get_correlations',
            type: 'POST',
            contentType: 'application/json',
            success: function(response) {
                $('#correlationResults').html(`<img src="data:image/png;base64,${response.plot}" alt="Matriz de Correlación">`);
                hideLoading();
            },
            error: function() {
                hideLoading();
                alert('Error al obtener la matriz de correlaciones');
            }
        });
    });

    // Función para mostrar estadísticas
    function displayStats(stats, column) {
        let html = '<div class="card"><div class="card-body">';
        html += `<h5 class="card-title">Estadísticas para ${column}</h5>`;
        
        if (stats.numeric && stats.numeric[column]) {
            const numStats = stats.numeric[column];
            html += '<table class="table"><tbody>';
            for (const [key, value] of Object.entries(numStats)) {
                html += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
            html += '</tbody></table>';
        } else if (stats.categorical && stats.categorical[column]) {
            const catStats = stats.categorical[column];
            html += '<table class="table"><tbody>';
            for (const [key, value] of Object.entries(catStats)) {
                html += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
            html += '</tbody></table>';
        }
        
        html += '</div></div>';
        $('#statsResults').html(html);
    }

    // Inicialmente deshabilitar las pestañas de análisis
    $('#analysisTabs a').addClass('disabled');
});
