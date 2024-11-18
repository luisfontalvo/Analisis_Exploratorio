from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from werkzeug.utils import secure_filename
import os


app = Flask(__name__)
app.config['SESSION_TYPE'] = 'FileSystem'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
Session(app)

# Asegurarse de que existe el directorio de uploads
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv', 'xlsx', 'xls'}

def get_dataframe_info(df):
    buffer = io.StringIO()
    df.info(buf=buffer)
    info_string = buffer.getvalue()
    all_data = df.to_dict(orient="records")
    return {
        'info': info_string,
        'head': df.head().to_html(classes='table table-striped'),
        'shape': df.shape,
        'columns': list(df.columns),
        'null_counts': df.isnull().sum().to_dict(),
        'data': all_data,
        'dtypes': df.dtypes.astype(str).to_dict()
    }

def get_descriptive_stats(df):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    stats = {
        'numeric': df[numeric_cols].describe().to_dict(),
        'categorical': {col: df[col].value_counts().to_dict() for col in categorical_cols}
    }
    return stats

def create_contingency_table(df, col1, col2):
    return pd.crosstab(df[col1], df[col2]).to_html(classes='table table-striped')

def create_plot(df, x_col, y_col=None, plot_type='bar'):
    plt.figure(figsize=(10, 6))
    plt.clf()
    
    if plot_type == 'bar':
        if y_col:
            df.groupby(x_col)[y_col].mean().plot(kind='bar')
        else:
            df[x_col].value_counts().plot(kind='bar')
    elif plot_type == 'pie':
        df[x_col].value_counts().plot(kind='pie')
    elif plot_type == 'scatter':
        plt.scatter(df[x_col], df[y_col])
        
    plt.tight_layout()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    return base64.b64encode(img.getvalue()).decode()

def get_correlations(df):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    corr_matrix = df[numeric_cols].corr()
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
    plt.tight_layout()
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    return base64.b64encode(img.getvalue()).decode()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Elminar Archivo subido 
        file.close()
        os.remove(filepath)
            
        # Guardar el DataFrame en una sesión o cache
        session['current_df'] = df.to_json()
        
        return jsonify({
            'success': True,
            'columns': list(df.columns),
            'info': get_dataframe_info(df)
        })
    
    return jsonify({'error': 'Invalid file type'})

@app.route('/get_stats', methods=['POST'])
def get_stats():
    if 'current_df' not in session:
        return jsonify({'error': 'No file uploaded. Please upload a file first.'})
    column = request.json.get('column')
    df = pd.read_json(session['current_df'])
    stats = get_descriptive_stats(df)
    return jsonify(stats)

@app.route('/get_contingency', methods=['POST'])
def get_contingency():
    col1 = request.json.get('col1')
    col2 = request.json.get('col2')
    df = pd.read_json(session['current_df'])
    table = create_contingency_table(df, col1, col2)
    return jsonify({'table': table})

@app.route('/get_plot', methods=['POST'])
def get_plot():
    plot_type = request.json.get('plot_type')
    x_col = request.json.get('x_col')
    y_col = request.json.get('y_col', None)
    df = pd.read_json(session['current_df'])
    plot_data = create_plot(df, x_col, y_col, plot_type)
    return jsonify({'plot': plot_data})

@app.route('/get_correlations', methods=['POST'])
def get_correlation_matrix():
    df = pd.read_json(session['current_df'])
    corr_plot = get_correlations(df)
    return jsonify({'plot': corr_plot})

if __name__ == '__main__':
    app.run(debug=True)