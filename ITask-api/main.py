from functools import wraps
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime, timedelta
from models import Departamento, Tarefa, TipoTarefa, User, Dono, Gestor, Programador, db

# Caminho do banco de dados
DB_PATH = "itask.db"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=90)
app.config["SECRET_KEY"] = "chave_flask_para_flash_e_sessions"
jwt = JWTManager(app)

# Aceitar qualquer origem
CORS(app, supports_credentials=True)

db.init_app(app)

CHAVE_PRIVADA_DONO = "@@2Ve618dElgnzKr#OxWNeNb4ufQzX_oAkvce7j6uCfDN0k4ozQ8Oy@UbTqNo"

def get_user_role(idUser):
    programador = Programador.query.filter_by(idUser = idUser).first()
    gestor = Gestor.query.filter_by(idUser = idUser).first()
    dono = Dono.query.filter_by(idUser = idUser).first()

    if programador:
        return "Programador"
    elif gestor:
        return "Gestor"
    elif dono:
        return "Dono"
    else:
        return "ERRO"

def role_required(roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated(*args, **kwargs):
            idUser = get_jwt_identity()
            user_role = get_user_role(idUser)
            if user_role not in roles:
                return jsonify({"error": "Acesso negado"}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper

@app.route("/")
def index():
    return "API ESTÁ ONLINE"

@app.route("/api/login", methods=["POST"])
def login():
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
    access_token = create_access_token(identity=user.idUser)
    pass_change = user.password_change
    return jsonify({
        "message": "Login efetuado com sucesso.",
        "access_token": access_token,
        "change_password": pass_change
    }), 200

@app.route("/api/user-is-auth", methods=["GET"])
@jwt_required()
def user_is_auth():
    idUser = get_jwt_identity()
    user_try = User.query.filter_by(idUser=idUser).first()
    if(user_try):
        return jsonify({"auth": True})
    return jsonify({"auth": False})

@app.route("/api/user-role", methods=["GET"])
@jwt_required()
def user_role():
    idUser = get_jwt_identity()

    programador_filter = Programador.query.filter_by(idUser=idUser).first()
    gestor_filter = Gestor.query.filter_by(idUser=idUser).first()
    dono_filter = Dono.query.filter_by(idUser=idUser).first()

    if(not programador_filter and not gestor_filter and not dono_filter):
        return jsonify({"error": "Cargo de Utilizador nao encontrado"})
    if dono_filter:
        return jsonify({"role": "Dono"})
    elif gestor_filter:
        return jsonify({"role": "Gestor"})
    elif programador_filter:
        return jsonify({"role": "Programador"})
    else:
        return jsonify({"role": "Erro"})

@app.route("/api/change_password", methods=["POST"])
@jwt_required()
def change_password():
    idUser = get_jwt_identity()

    data = request.get_json()
    password = data.get("password")
    confirm_password = data.get("confPassword")

    if not password or not confirm_password:
        return jsonify({"error": "Todos os campos têm de ser preenchidos"}), 400

    user = User.query.filter_by(idUser=idUser).first()

    if not user:
        return jsonify({"error": "Utilizador não encontrado"}), 404

    if len(password) < 8:
        return jsonify({"error": "A palavra-passe deve conter 8 caracteres ou mais"}), 400

    if password != confirm_password:
        return jsonify({"error": "As palavras-passe não coincidem"}), 400
    
    if not (any(c.isupper() for c in password) and 
            any(c.islower() for c in password) and 
            any(not c.isalnum() for c in password)):
        return jsonify({"error": "A palavra-passe deve conter letras maiúsculas, minúsculas e símbolos."}), 400

    if check_password_hash(user.password, password):
        return jsonify({"error": "A nova palavra-passe não pode ser igual à anterior."}), 400

    # Update password
    user.password = generate_password_hash(password)
    user.password_change = False
    db.session.commit()

    return jsonify({"message": "Palavra-passe atualizada com sucesso."}), 200

@app.route("/api/user_data", methods=["GET"])
@jwt_required()
def user_data():
    idUser = get_jwt_identity()

    user = User.query.filter_by(idUser=idUser).first()
    empresa = ""

    dono = Dono.query.filter_by(idUser=idUser).first()
    if dono:
        empresa = dono.empresa

    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if gestor:
        idDono = gestor.idDono 
        dono = Dono.query.filter_by(idUser=idDono).first()
        if dono:
            empresa = dono.empresa

    programador = Programador.query.filter_by(idUser=idUser).first()
    if programador:
        idGestor = programador.idGestor
        gestor = Gestor.query.filter_by(idUser=idGestor).first()
        if gestor:
            idDono = gestor.idDono
            dono = Dono.query.filter_by(idUser=idDono).first()
            if dono:
                empresa = dono.empresa

    if not user:
        return jsonify({"error": "Utilizador não encontrado"}), 400
    
    return jsonify({
        "email": user.email,
        "nome": user.nome,
        "empresa": empresa
    }), 200

@app.route("/api/criar_gestor", methods=["POST"])
@role_required(["Dono"])
def criar_gestor():
    idUser = get_jwt_identity()
    dono = Dono.query.filter_by(idUser=idUser).first()
    if not dono:
        return jsonify({"error": "Acesso inválido"}), 403

    data = request.get_json()
    email = data.get("email")
    nome = data.get("nome")
    departamento = data.get("departamento")

    if not all([email, nome, departamento]):
        return jsonify({"error": "Campos obrigatórios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email já está a ser usado"}), 400

    password = f"{nome.replace(' ', '')}_{dono.empresa.replace(' ', '')}"
    new_idUser = str(uuid.uuid4())

    user = User(
        idUser=new_idUser,
        email=email,
        password=generate_password_hash(password),
        nome=nome,
        password_change=True,
    )
    gestor = Gestor(
        idUser=new_idUser,
        idDono=idUser,
        departamento=Departamento[departamento]
    )

    db.session.add_all([user, gestor])
    db.session.commit()

    return jsonify({
        "message": "Gestor criado com sucesso",
        "senha_temporaria": password
    }), 201

@app.route("/api/get_all_gestores", methods=["GET"])
@role_required(["Dono"])
def get_all_gestores():
    idUser = get_jwt_identity()

    if not Dono.query.filter_by(idUser=idUser).first():
        return jsonify({"error": "Utilizador não tem acesso"}), 400

    gestores = Gestor.query.filter_by(idDono=idUser).all()
    users = []

    for i in gestores:
        user = User.query.filter_by(idUser=i.idUser).first()
        gestor = Gestor.query.filter_by(idUser=i.idUser).first()
        if user and gestor:
            users.append({
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
                "departamento": gestor.departamento.value,
                "password_change": user.password_change
            })

    return jsonify(users), 200

@app.route("/api/criar_tarefa", methods=["POST"])
@role_required(["Gestor"])
def criar_tarefa():
    idUser = get_jwt_identity()
    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if (not gestor):
        return jsonify({"error": "Acesso inválido"}), 403

    data = request.get_json()
    titulo = data.get("titulo")
    descricao = data.get("descricao")
    programador_id = data.get("programador_id")
    tipo_tarefa_id = data.get("tipo_tarefa_id")
    data_inicio = data.get("dataPrevistaInicio")
    data_fim = data.get("dataPrevistaFim")
    ordem_execucao = data.get("ordemExecucao")

    if (not all([titulo, descricao, programador_id, tipo_tarefa_id, data_inicio, data_fim, ordem_execucao])):
        return jsonify({"error": "Todos os campos são obrigatórios"}), 400

    programador_filter = Programador.query.filter_by(idUser=programador_id, idGestor=idUser).first()
    if (not programador_filter):
        return jsonify({"error": "Programador não encontrado"}), 404

    tipo_tarefa_filter = TipoTarefa.query.filter_by(idTipoTarefa=tipo_tarefa_id).first()
    if (not tipo_tarefa_filter):
        return jsonify({"error": "Tipo de tarefa inválido"}), 404

    try:
        data_inicio = datetime.fromisoformat(data_inicio)
        data_fim = datetime.fromisoformat(data_fim)
    except ValueError:
        return jsonify({"error": "Formato de data inválido"}), 400

    id_tarefa = str(uuid.uuid4())

    tarefa = Tarefa(
        idTarefa=id_tarefa,
        idGestor=idUser,
        idProgramador=programador_id,
        idTipoTarefa=tipo_tarefa_id,
        tituloTarefa=titulo,
        descricao=descricao,
        ordemExecucao=int(ordem_execucao),
        dataPrevistaInicio=data_inicio,
        dataPrevistaFim=data_fim
    )

    db.session.add(tarefa)
    db.session.commit()

    return jsonify({ "message": "Tarefa criada com sucesso" }), 201

@app.route("/api/apagar_tarefa/<tarefa_id>", methods=["DELETE"])
@role_required(["Gestor"])
def apagar_tarefa(tarefa_id):
    idUser = get_jwt_identity()
    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if (not gestor):
        return jsonify({"error": "Acesso inválido"}), 403

    tarefa = Tarefa.query.filter_by(idTarefa=tarefa_id, idGestor=idUser).first()
    if (not tarefa):
        return jsonify({"Erro"}), 404

    try:
        db.session.delete(tarefa)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao apagar tarefa: {str(e)}"}), 500

    return jsonify({ "message": "Tarefa apagada com sucesso" }), 200

@app.route("/api/update_tarefa/<int:tarefa_id>", methods=["PUT"])
@role_required(["Gestor"])
def update_tarefa(tarefa_id):
    idUser = get_jwt_identity()
    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if (not gestor):
        return jsonify({"error": "Acesso inválido"}), 403

    tarefa = Tarefa.query.filter_by(idTarefa=tarefa_id, idGestor=idUser).first()
    if (not tarefa):
        return jsonify({"error": "Tarefa não encontrada"}), 404

    data = request.get_json()
    titulo = data.get("titulo")
    descricao = data.get("descricao")
    ordem_execucao = data.get("ordemExecucao")

    if (not data):
        return jsonify({"error": "Nenhum dado enviado"}), 400
    if titulo is not None:
        tarefa.tituloTarefa = titulo
    if descricao is not None:
        tarefa.descricao = descricao
    if ordem_execucao is not None:
        try:
            tarefa.ordemExecucao = int(ordem_execucao)
        except ValueError:
            return jsonify({"error": "O campo 'ordemExecucao' deve ser um número inteiro"}), 400

    db.session.commit()

    return jsonify({"message": "Tarefa atualizada com sucesso"}), 200

# -----------------------------
# Criação de dono via formulário HTML
# -----------------------------
@app.route("/create_owner", methods=["GET", "POST"])
def create_owner():
    if request.method == "POST":
        email = request.form.get("email")
        nome = request.form.get("nome")
        empresa = request.form.get("empresa")
        chave_privada = request.form.get("chave_privada")

        # Validação básica
        if not all([email, nome, empresa, chave_privada]):
            flash("Todos os campos são obrigatórios.")
            return render_template("create_owner.html", form=request.form)

        if chave_privada != CHAVE_PRIVADA_DONO:
            flash("Chave privada inválida.")
            return render_template("create_owner.html", form=request.form)

        if User.query.filter_by(email=email).first():
            flash("Já existe um utilizador com este email.")
            return render_template("create_owner.html", form=request.form)

        # Criação do User e Dono
        new_idUser = str(uuid.uuid4())
        while User.query.filter_by(idUser=new_idUser).first():
            new_idUser = str(uuid.uuid4())

        senha_temporaria = f"{nome.replace(' ', '')}_{empresa.replace(' ', '')}"
        senha_hashed = generate_password_hash(senha_temporaria)

        user_dono = User(
            idUser=new_idUser,
            email=email,
            password=senha_hashed,
            nome=nome,
            password_change = True,
        )

        dono = Dono(
            idUser=new_idUser,
            empresa=empresa
        )

        db.session.add_all([user_dono, dono])
        db.session.commit()

        flash(f"Dono {nome} criado com sucesso! Senha temporária: {senha_temporaria}")
        return redirect(url_for("owners_list"))

    return render_template("create_owner.html", form={})

@app.route("/delete_owner/<owner_id>", methods=["POST"])
def delete_owner(owner_id):
    chave_privada = request.form.get("chave_privada")
    if chave_privada != CHAVE_PRIVADA_DONO:
        flash("Chave privada inválida.")
        return redirect(url_for("owners_list"))

    dono = Dono.query.filter_by(idUser=owner_id).first()
    if not dono:
        flash("Dono não encontrado.")
        return redirect(url_for("owners_list"))

    # Deletar dados relacionados (Gestores, Programadores, Tarefas)
    gestores = dono.gestor  # relacionamento definido no modelo
    if gestores:
        for gestor in gestores:
            # Deletar tarefas do gestor
            for tarefa in gestor.tarefas:
                db.session.delete(tarefa)
            # Deletar programadores do gestor
            for prog in gestor.programadores:
                db.session.delete(prog)
            db.session.delete(gestor)

    # Deletar usuário e dono
    user = dono.user
    db.session.delete(dono)
    if user:
        db.session.delete(user)

    db.session.commit()
    flash(f"Dono {user.nome} e todos os dados relacionados foram eliminados com sucesso!")
    return redirect(url_for("owners_list"))

# -----------------------------
# Lista de donos
# -----------------------------
@app.route("/owners_list", methods=["GET", "POST"])
def owners_list():
    if request.method == "POST":
        chave_privada = request.form.get("chave_privada")

        if chave_privada != CHAVE_PRIVADA_DONO:
            flash("Chave privada inválida.")
            return render_template("owner_list_auth.html")

        donos = Dono.query.all()
        return render_template("owner_list.html", owners=donos)

    # GET: pede a chave privada
    return render_template("owner_list_auth.html")

# -----------------------------
# Inicialização do banco
# -----------------------------
with app.app_context():
    # os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)