# Data Analysis Web App

Este proyecto consiste en una aplicación web que permite cargar, analizar y visualizar datasets. Los usuarios pueden subir archivos CSV o Excel, obtener información básica del dataset, generar estadísticas descriptivas, tablas de contingencia, gráficos y correlaciones.

## Integrantes del Proyecto

- **Luis Fontalvo**
- **Carlos Arcila**
- **Jazzlin Urieles**

## Requisitos

Para ejecutar este proyecto, asegúrate de tener instalados los siguientes requisitos:

- Python 3.7 o superior
- Las siguientes bibliotecas de Python:

  - Flask
  - Flask-Session
  - Pandas
  - Numpy
  - Matplotlib
  - Seaborn
  - Werkzueg

Puedes instalar todos los requisitos de este proyecto mediante `pip` utilizando el archivo `requirements.txt`.

## Instalación

1. Clona este repositorio en tu máquina local:

    ```bash
    git clone https://github.com/luisfontalvo/Analisis_Exploratorio.git
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd Analisis_Exploratorio
    ```

3. Crea un entorno virtual (opcional pero recomendado):

    ```bash
    python -m venv venv
    ```

4. Activa el entorno virtual:

    - En Windows:

      ```bash
      .\venv\Scripts\activate
      ```

    - En macOS/Linux:

      ```bash
      source venv/bin/activate
      ```

5. Instala las dependencias del proyecto:

    ```bash
    pip install -r requirements.txt
    ```

6. Configura la clave secreta de la aplicación. Asegúrate de tener un archivo `.env` con la siguiente línea:

    ```
    SECRET_KEY=tu_clave_secreta
    ```

   Si no tienes una clave secreta personalizada, puedes usar una cadena generada aleatoriamente.

7. Inicia la aplicación Flask:

    ```bash
    python app.py
    ```

   La aplicación debería estar disponible en `http://127.0.0.1:5000/` en tu navegador.

## Uso

1. **Subir un archivo**: Ve a la página principal de la aplicación (`/`), selecciona un archivo CSV o Excel desde tu equipo y haz clic en "Subir".
2. **Análisis de Datos**: Después de cargar el archivo, podrás visualizar información básica del dataset, como su tamaño, columnas, valores nulos, y los primeros registros.
3. **Generar Estadísticas**: Selecciona una columna y obtén estadísticas descriptivas (media, desviación estándar, etc.).
4. **Tablas de Contingencia**: Selecciona dos columnas y genera una tabla de contingencia.
5. **Gráficos**: Crea gráficos de barras, dispersión y pasteles para analizar las relaciones entre las columnas del dataset.
6. **Correlaciones**: Obtén la matriz de correlación de las columnas numéricas del dataset y visualízala como un gráfico.

## Contribuciones

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b nombre-de-tu-rama`).
3. Realiza los cambios necesarios.
4. Haz un commit de tus cambios (`git commit -am 'Descripción de los cambios'`).
5. Sube los cambios a tu fork (`git push origin nombre-de-tu-rama`).
6. Crea un pull request explicando los cambios realizados.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
