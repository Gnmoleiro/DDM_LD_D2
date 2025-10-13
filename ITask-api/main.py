from flask import Flask, render_template, request, redirect, url_for, flash, session, abort, jsonify
from models import Programador, User, db

from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///itask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'chave'

db.init_app(app)

@app.route("/")
def index():
    return "AAAAAAAAAAAAAAAA"

#region CREDENTIAL VALIDATION CALL'S ( TO DO )

@app.route("/api/register", methods=["POST"])
def register_user():
    return "TESTE"

@app.route("/api/login", methods=["GET"])
def login_user():
    return "TESTE"

@app.route("/api/logout", methods=["POST"])
def logout_user():
    return "TESTE"

#endregion

#region USERES CALL'S                ( MISSING update_user )

@app.route("/api/user", methods=["GET"])
def get_user_all():
    try:
        users = User.query.all()
        user_json = [
            {
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
            }
            for user in users
        ]
        return jsonify(user_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/user", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        email = data.get("email")
        nome = data.get("nome")
        password = data.get("password")
        password_conf = data.get("password_conf")

        if not email or not nome or not password or not password_conf:
            return jsonify({"error": "Missing required fields"}), 400

        if (password == password_conf):
            hashed_password = generate_password_hash(password)
            new_user = User(email=email, nome=nome, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
        else :
            return jsonify({"error": "Missing required fields"}), 400

        return jsonify({
            "idUser": new_user.idUser,
            "email": new_user.email,
            "nome": new_user.nome
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/user/<id>", methods=["PUT"])
def update_user():
    return "TESTE"

@app.route("/api/user/<int:idUser>", methods=["DELETE"])
def delete_user(idUser):
    try:
        user = User.query.filter_by(idUser=idUser).first()
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User deleted successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/api/user/<int:idUser>", methods=["GET"])
def get_user_by_id(idUser):
    try:
        user = User.query.filter_by(idUser=idUser).first()
        if user:
            user_json = {
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
            }
            return jsonify(user_json), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#endregion

#region PROGRAMADORES CALL'S         ( TO DO )

@app.route("/api/programador", methods=["GET"]) #In progress
def get_programador_all():
    programadores = Programador.query.all()
    programador_json = [
        "idUser": programador.idUser,
        "email": programador.email,
        "nome": programador.nome,
    ] for programador in programadores
    return "TESTE"

@app.route("/api/programador", methods=["POST"])
def create_programador():
    return "TESTE"

@app.route("/api/programador/<id>", methods=["PUT"])
def update_programador():
    return "TESTE"

@app.route("/api/programador/<id>", methods=["DELETE"])
def delete_programador():
    return "TESTE"

@app.route("/api/programador/<id>", methods=["GET"])
def get_programador_by_id():
    return "TESTE"

#endregion

#region GESTORES CALL'S              ( TO DO )

@app.route("/api/gestor", methods=["GET"])
def get_gestor_all():
    return"TESTE"

@app.route("/api/gestor", methods=["POST"])
def create_gestor():
    return"TESTE"

@app.route("/api/gestor/<id>", methods=["PUT"])
def update_gestor():
    return"TESTE"

@app.route("/api/gestor/<id>", methods=["DELETE"])
def delete_gestor():
    return"TESTE"

@app.route("/api/gestor/<id>", methods=["GET"])
def get_gestor_by_id():
    return"TESTE"

#endregion

#region TAREFAS CALL'S               ( TO DO )

@app.route("/api/tarefa",methods=["GET"])
def get_tarefa_all():
    return "TESTE"

@app.route("/api/tarefa/programador/<id>",methods=["GET"])
def get_tarefa_programador_by_id():
    return "TESTE"

@app.route("/api/tarefa/gestor/<id>",methods=["GET"])
def get_tarefa_gestor_by_id():
    return "TESTE"

@app.route("/api/tarefa", methods=["POST"])
def create_tarefa():
    return "TESTE"

@app.route("/api/tarefa/<id>", methods=["PUT"])
def update_tarefa():
    return "TESTE"

@app.route("/api/tarefa/<id>", methods=["DELETE"])
def delete_tarefa():
    return "TESTE"

@app.route("/api/tarefa/<id>",methods=["GET"])
def get_tarefa_by_id():
    return "TESTE"

#endregion

#region TIPOS DE TAREFA CALL'S       ( TO DO )

@app.route("/api/tipo-tarefa", methods=["GET"])
def get_tipo_tarefa_all():
    return "TESTE"

@app.route("/api/tipo-tarefa", methods=["POST"])
def create_tipo_tarefa():
    return "TESTE"

@app.route("/api/tipo-tarefa/<id>", methods=["PUT"])
def update_tipo_tarefa():
    return "TESTE"

@app.route("/api/tipo-tarefa/<id>", methods=["DELETE"])
def delete_tipo_tarefa():
    return "TESTE"

@app.route("/api/api/tipo-tarefa/<id>", methods=["GET"])
def get_tipo_tarefa_by_id():
    return "TESTE"

#endregion

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
