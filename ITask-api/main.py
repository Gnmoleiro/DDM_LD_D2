import uuid
from flask import Flask, render_template, request, redirect, url_for, flash, session, abort, jsonify
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required

from models import Departamento, Gere, NivelExperiencia, Programador, User, Gestor, db

from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

from datetime import timedelta



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///itask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=90)
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
        user_filter = User.query.filter_by(email=email).first()

        if (not all([email, nome, password, password_conf, tipo])):
            return jsonify({"error": "Campos obrigatórios em falta."}), 400
        if (password != password_conf):
            return jsonify({"error": "As passwords não coincidem."}), 400
        if (user_filter):
            return jsonify({"error": "Email já registado."}), 400

        hashed_password = generate_password_hash(password)

        new_id = uuid.uuid4()

        while User.query.filter_by(idUser = new_id).first():
            new_id = uuid.uuid4()

        new_user = User(idUser=new_id,email=email, nome=nome, password=hashed_password)
        db.session.add(new_user)
        db.session.flush()

        if (tipo == "Gestor"):
            return jsonify({"error": "Não é permitido criar contas de gestor via registo público."}), 403

        elif (tipo == "Programador"):
            nivel = data.get("nivelExperiencia", "Junior")
            id_gestor = data.get("idGestor")

            if (not id_gestor):
                return jsonify({'error': 'É necessário indicar um Gestor associado.'}), 400

            gestor = Gestor.query.get(id_gestor)
            if (not gestor):
                return jsonify({'error': 'Gestor não encontrado.'}), 404

            nivel_enum = next((n for n in NivelExperiencia if n.value == nivel), None)
            if (not nivel_enum):
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
    if (not all([email, password])):
        return jsonify({"error": "Campos obrigatórios em falta."}), 400
    user = User.query.filter_by(email=email).first()
    if (not user):
        return jsonify({"error": "Utilizador não encontrado."}), 404
    if (not check_password_hash(user.password, password)):
        return jsonify({"error": "Password incorreta."}), 401
    access_token = create_access_token(identity=user.idUser)

    response = {
        "message": "Login efetuado com sucesso.",
        "access_token": access_token,
        "user": {
            "nome": user.nome
        }
    }

    return jsonify(response), 200

@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def return_data_user():
    idUser = get_jwt_identity()
    user_info = {}

    if (not idUser):
        return jsonify({"error": "Utilizador não autenticado."}), 401
    user_filter = User.query.filter_by(idUser=idUser).first()
    if (not user_filter):
        return jsonify({"error": "Utilizador não encontrado."}), 404
    gestor_filter = Gestor.query.filter_by(idUser=idUser).first()
    if (gestor_filter):
        user_info = {
            "email": user_filter.email,
            "nome": user_filter.nome,
            "tipo": "Gestor",
            "departamento": gestor_filter.departamento.value
            }
    else:
        user_info = {
            "email": user_filter.email,
            "nome": user_filter.nome,
            "tipo": "Programador",
            "nivelExperiencia": Programador.nivelExperiencia.value
            }
    return jsonify(user_info), 200

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
        idUser = get_jwt_identity()
        gestor_filter = Gestor.query.filter_by(idUser=idUser).first()

        if (not gestor_filter):
            return jsonify({"error": "Acesso negado. Apenas gestores podem listar utilizadores."}), 403

        users = User.query.all()
        gestores = {g.idUser: g for g in Gestor.query.all()}
        programadores = {p.idUser: p for p in Programador.query.all()}
        geres = {g.idProgramador: g.idGestor for g in Gere.query.all()}
        user_json = []

        for user in users:
            if (user.idUser in gestores):
                tipo = "Gestor"
                gestor_obj = gestores[user.idUser]
                user_json.append({
                "email": user.email,
                "nome": user.nome,
                "tipo": tipo,
                "departamento": gestor_obj.departamento.value
                })
            elif (user.idUser in programadores):
                tipo = "Programador"
                programador_obj = programadores[user.idUser]
                gestor_id = geres.get(user.idUser)
                gestor_user = User.query.filter_by(idUser=gestor_id).first()
                user_json.append({
                "email": user.email,
                "nome": user.nome,
                "tipo": tipo,
                "nivelExperiencia": programador_obj.nivelExperiencia.value,
                "nomeGestor": gestor_user.nome
            })

        return jsonify(user_json), 200




    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/user", methods=["POST"])
@jwt_required()
def create_user():
    try:
        idUser = get_jwt_identity()
        gestor_test = Gestor.query.filter_by(idUser=idUser).first()

        if (not gestor_test):
            return jsonify({"error": "Acesso negado."}), 403
        
        data = request.get_json()
        email = data.get("email")
        nome = data.get("nome")
        tipo = data.get('tipo')
        password = data.get("password")
        password_conf = data.get("password_conf")
        user_filter_email = User.query.filter_by(email=email).first()
        
        if not all([email, nome, tipo, password, password_conf]):
            return jsonify({"error": "Campos obrigatórios em falta."}), 400
        if password != password_conf:
            return jsonify({"error": "As passwords não coincidem."}), 400
        if user_filter_email:
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
            'email': new_user.email,
            'nome': new_user.nome,
            'tipo': tipo
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocorreu um erro: {str(e)}"}), 500

@app.route("/api/user/<id>", methods=["PUT"])
@jwt_required()
def update_user(id):
    try:
        data = request.get_json()
        if (not data):
            return jsonify({"error": "Dados inváilos ou ausentes, tem de alterar pelo menos 1 campo para atualizar"}), 400
        email = data.get("email")
        nome = data.get("nome")
        password = data.get("password")
        tipo = data.get("tipo")

        idUser = get_jwt_identity()
        programador_filter = User.query.filter_by(idUser=idUser).first()
        gestor_filter = Gestor.query.filter_by(idUser=idUser).first()

        if (not (programador_filter or gestor_filter)):
            return jsonify({"error": "Acesso negado: utilizador não autorizado."}), 403

        user = User.query.get(id)
        if (not user):
            return jsonify({"error": "Utilizador não encontrado."}), 404
        user_filter_email = User.query.filter(User.email==email, User.idUser!=id).first()
        if (email and user_filter_email):
            return jsonify({"error": "Email já em uso."}), 400
        if (email):
            user.email = email
        if (nome):
            user.nome = nome
        if (password):
            user.password = generate_password_hash(password)

        if (tipo):
            if (tipo == "Gestor"):
                # Se não for gestor ainda, cria a entrada
                if not Gestor.query.get(id):
                    departamento = data.get("departamento", "IT")
                    dep_enum = next((d for d in Departamento if d.value == departamento), None)
                    if not dep_enum:
                        return jsonify({"error": "Departamento inválido."}), 400
                    gestor = Gestor(idUser=id, departamento=dep_enum)
                    db.session.add(gestor)
                # Se for programador, remover entrada de programador e gere
                prog = Programador.query.get(id)
                if prog:
                    Gere.query.filter_by(idProgramador=id).delete()
                    db.session.delete(prog)

            elif tipo == "Programador":
                # Se não for programador ainda, cria a entrada
                if not Programador.query.get(id):
                    nivel = data.get("nivelExperiencia", "Junior")
                    nivel_enum = next((n for n in NivelExperiencia if n.value == nivel), None)
                    if not nivel_enum:
                        return jsonify({"error": "Nível de experiência inválido."}), 400

                    id_gestor = data.get("idGestor")
                    if not id_gestor or not Gestor.query.get(id_gestor):
                        return jsonify({"error": "Gestor inválido ou não encontrado."}), 400

                    prog = Programador(idUser=id, nivelExperiencia=nivel_enum)
                    db.session.add(prog)
                    db.session.add(Gere(idProgramador=id, idGestor=id_gestor))

                # Se for gestor, podes optar por remover ou manter a entrada de gestor
                gestor = Gestor.query.get(id)
                if gestor:
                    db.session.delete(gestor)

            else:
                return jsonify({"error": "Tipo de utilizador inválido."}), 400

        db.session.commit()
        return jsonify({"message": "Utilizador atualizado com sucesso!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocorreu um erro: {str(e)}"}), 500

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
        return jsonify({"error": "Authentication required"}), 401       # Cria uma nova tarefa (o campo gestorId é atribuído automaticamente).

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
