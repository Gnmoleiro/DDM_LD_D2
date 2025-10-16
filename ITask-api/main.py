from flask import Flask, render_template, request, redirect, url_for, flash, session, abort, jsonify
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity

from models import Departamento, Gere, NivelExperiencia, Programador, User, Gestor, db

from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///itask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'chave'
jwt = JWTManager(app)


db.init_app(app)

@app.route("/")
def index():
    return "AAAAAAAAAAAAAAAA"

#region CREDENTIAL VALIDATION CALL'S ( TO DO )

@app.route("/api/auth/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        email = data.get("email")
        nome = data.get("nome")
        password = data.get("password")
        password_conf = data.get("password_conf")
        tipo = data.get("tipo")

        if not all([email, nome, password, password_conf, tipo]):
            return jsonify({"error": "Campos obrigatórios em falta."}), 400
        if password != password_conf:
            return jsonify({"error": "As passwords não coincidem."}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email já registado."}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, nome=nome, password=hashed_password)
        db.session.add(new_user)
        db.session.flush()

        if tipo == "Gestor":

            return jsonify({"error": "Não é permitido criar contas de gestor via registo público."}), 403
        
            # departamento = data.get("departamento", "IT")
            # dep_enum = next((d for d in Departamento if d.value == departamento), None)
            # if not dep_enum:
            #     return jsonify({'error': 'Departamento inválido.'}), 400

            # gestor = Gestor(idUser=new_user.idUser, departamento=dep_enum)
            # db.session.add(gestor)

        elif tipo == "Programador":
            nivel = data.get("nivelExperiencia", "Junior")
            id_gestor = data.get("idGestor")

            if not id_gestor:
                return jsonify({'error': 'É necessário indicar um Gestor associado.'}), 400

            gestor = Gestor.query.get(id_gestor)
            if not gestor:
                return jsonify({'error': 'Gestor não encontrado.'}), 404

            nivel_enum = next((n for n in NivelExperiencia if n.value == nivel), None)
            if not nivel_enum:
                return jsonify({'error': 'Nível de experiência inválido.'}), 400

            prog = Programador(idUser=new_user.idUser, nivelExperiencia=nivel_enum)
            db.session.add(prog)

            gere = Gere(idProgramador=new_user.idUser, idGestor=id_gestor)
            db.session.add(gere)

        else:
            return jsonify({'error': 'Tipo de utilizador inválido.'}), 400

        db.session.commit()

        return jsonify({
            "message": "Utilizador registado com sucesso!",
            "idUser": new_user.idUser,
            "nome": new_user.nome,
            "email": new_user.email,
            "tipo": tipo
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocorreu um erro: {str(e)}"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Campos obrigatórios em falta."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Utilizador não encontrado."}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"error": "Password incorreta."}), 401

    tipo = None
    gestor_info = None
    if Gestor.query.filter_by(idUser=user.idUser).first():
        tipo = "Gestor"
    elif Programador.query.filter_by(idUser=user.idUser).first():
        tipo = "Programador"
        # opcionalmente, devolve o gestor associado
        gere = Gere.query.filter_by(idProgramador=user.idUser).first()
        if gere:
            gestor_info = gere.idGestor

    access_token = create_access_token(identity={"idUser": user.idUser, "tipo": tipo})

    response = {
        "message": "Login efetuado com sucesso.",
        "access_token": access_token,
        "user": {
            "idUser": user.idUser,
            "nome": user.nome,
            "email": user.email,
            "tipo": tipo
        }
    }

    if gestor_info:
        response["user"]["idGestor"] = gestor_info          #é necessário??

    return jsonify(response), 200

@app.route("/api/auth/profile", methods=["POST"])
def return_data_user():
    return "TESTE"

@app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout_user():
    return jsonify({"message": "Logout efetuado com sucesso."}), 200

#endregion

#region USERES CALL'S                ( MISSING update_user )

@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user_all():
    try:
        current_user = get_jwt_identity()

        if current_user["tipo"] != "Gestor":
            return jsonify({"error": "Acesso negado. Apenas gestores podem listar utilizadores."}), 403

        users = User.query.all()
        user_json = []

        for user in users:
            tipo = None
            gestor_id = None

            if Gestor.query.filter_by(idUser=user.idUser).first():
                tipo = "Gestor"
            elif Programador.query.filter_by(idUser=user.idUser).first():
                tipo = "Programador"
                gere = Gere.query.filter_by(idProgramador=user.idUser).first()
                if gere:
                    gestor_id = gere.idGestor

            user_json.append({
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
                "tipo": tipo,
                "idGestor": gestor_id
            })

        return jsonify(user_json), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/user", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        email = data.get("email")
        nome = data.get("nome")
        tipo = data.get('tipo')
        password = data.get("password")
        password_conf = data.get("password_conf")
        
        if not all([email, nome, tipo, password, password_conf]):
            return jsonify({"error": "Campos obrigatórios em falta."}), 400
        if password != password_conf:
            return jsonify({"error": "As passwords não coincidem."}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email já registado."}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, nome=nome, password=hashed_password)
        db.session.add(new_user)
        db.session.flush()

        if tipo == "Gestor":
            departamento = data.get('departamento', 'IT')
            dep_enum = next((d for d in Departamento if d.value == departamento), None)
            if not dep_enum:
                return jsonify({'error': 'Departamento inválido.'}), 400

            gestor = Gestor(idUser=new_user.idUser, departamento=dep_enum)
            db.session.add(gestor)

        elif tipo == "Programador":
            nivel = data.get('nivelExperiencia', 'Junior')
            id_gestor = data.get('idGestor')

            if not id_gestor:
                return jsonify({'error': 'É necessário indicar um Gestor associado.'}), 400

            if not Gestor.query.get(id_gestor):
                return jsonify({'error': 'Gestor não encontrado.'}), 404

            nivel_enum = next((n for n in NivelExperiencia if n.value == nivel), None)
            if not nivel_enum:
                return jsonify({'error': 'Nível de experiência inválido.'}), 400

            prog = Programador(idUser=new_user.idUser, nivelExperiencia=nivel_enum)
            db.session.add(prog)
            db.session.add(Gere(idProgramador=new_user.idUser, idGestor=id_gestor))

        else:
            return jsonify({'error': 'Tipo de utilizador inválido.'}), 400

        db.session.commit()

        return jsonify({
            'message': 'Utilizador criado com sucesso!',
            'idUser': new_user.idUser,
            'email': new_user.email,
            'nome': new_user.nome,
            'tipo': tipo
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocorreu um erro: {str(e)}"}), 500

@app.route("/api/user/<id>", methods=["PUT"])
def update_user():
    return "TESTE"

@app.route("/api/user/<int:idUser>", methods=["DELETE"])
@jwt_required()
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
    programador_premission = False
    if (programador_premission == True):
        try:
            programadores = Programador.query.all()
            programador_json = [
                {
                "idUser": programador.idUser,
                "email": programador.email,
                "nome": programador.nome,
                } for programador in programadores
            ]
            return jsonify(programador_json), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500


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

#region TAREFAS CALL'S               ( TO DO )

@app.route("/api/tarefa",methods=["GET"])
def get_tarefa_all():
    return "TESTE"

@app.route("/api/tarefa", methods=["POST"])
def create_tarefa():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401       Cria uma nova tarefa (o campo gestorId é atribuído automaticamente).

    user = User.query.filter_by(idUser=user_id).first()
    if not user or not hasattr(user, "gestor") or not user.gestor:
        return jsonify({"error": "Only gestores can create tarefas"}), 403
    try:
        data = request.get_json()
        ordemExecucao = data.get("ordemExecucao")
        descricao = data.get("descricao")
        dataPrevistaInicio = data.get("dataPrevistaInicio")
        dataPrevistaFim = data.get("dataPrevistaFim")
        idTipoTarefa = data.get("idTipoTarefa")
        storyPoint = data.get("storyPoint")
        dataRealInicio = data.get("dataRealInicio")         #FAZER UMA FUNÇÃO QUE CALCULA O TEMPO DESDE O INCIO DA CRIA
        dataRealFim  = data.get("dataRealFim")
        dataCriacao = data.get("dataCriacao")
        estadoTarefa = data.get("estadoTarefa")             #FAZER UMA FUNÇÃO QUE DA HANDLE NO ESTADO DA TAREFA
        return "TESTE"
    except Exception as e:
        return "TESTE"

@app.route("/api/tarefa/<id>", methods=["PUT"])
def update_tarefa():
    return "TESTE"

@app.route("/api/tasks/{id}/estado", methods=["PATCH"])
def change_stade_tarefa():
    return "TESTE"

@app.route("/api/tasks/done", methods=["GET"])
def get_all_done_tarefas():
    return "TESTE"

@app.route("/api/tasks/doing", methods=["GET"])
def get_all_doing_tarefas():
    return "TESTE"

@app.route("/api/tarefa/<id>", methods=["DELETE"])
def delete_tarefa():
    return "TESTE"

@app.route("/api/tarefa/<id>",methods=["GET"])
def get_tarefa_by_id():
    return "TESTE"

@app.route("/api/tasks/export", methods=["GET"])
def export_csv_tarefa():
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

#endregion

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
