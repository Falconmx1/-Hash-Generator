from flask import Flask, render_template, request, jsonify
import hashlib
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALGORITMOS = {
    'md5': hashlib.md5,
    'sha1': hashlib.sha1,
    'sha256': hashlib.sha256,
    'sha512': hashlib.sha512
}

def generar_hash(texto, algoritmo, salt=''):
    texto_con_salt = salt + texto
    hash_obj = ALGORITMOS[algoritmo]()
    hash_obj.update(texto_con_salt.encode('utf-8'))
    return hash_obj.hexdigest()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/hash', methods=['POST'])
def hash_texto():
    data = request.json
    texto = data.get('texto', '')
    algoritmo = data.get('algoritmo', 'md5')
    salt = data.get('salt', '')
    
    if not texto:
        return jsonify({'error': 'Texto vacío'}), 400
    
    hash_generado = generar_hash(texto, algoritmo, salt)
    return jsonify({'hash': hash_generado})

@app.route('/hash-file', methods=['POST'])
def hash_archivo():
    if 'archivo' not in request.files:
        return jsonify({'error': 'No se recibió archivo'}), 400
    
    archivo = request.files['archivo']
    algoritmo = request.form.get('algoritmo', 'md5')
    salt = request.form.get('salt', '')
    
    if archivo.filename == '':
        return jsonify({'error': 'Archivo sin nombre'}), 400
    
    filename = secure_filename(archivo.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    archivo.save(filepath)
    
    # Leer archivo y hashear
    with open(filepath, 'rb') as f:
        contenido = f.read()
    
    texto = contenido.decode('utf-8', errors='ignore')
    hash_generado = generar_hash(texto, algoritmo, salt)
    
    # Limpiar archivo temporal
    os.remove(filepath)
    
    return jsonify({'hash': hash_generado, 'nombre': filename})

@app.route('/compare', methods=['POST'])
def comparar():
    data = request.json
    hash1 = data.get('hash1', '')
    hash2 = data.get('hash2', '')
    
    if not hash1 or not hash2:
        return jsonify({'error': 'Faltan hashes'}), 400
    
    son_iguales = hash1 == hash2
    return jsonify({'iguales': son_iguales})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
