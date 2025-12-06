from functools import wraps
from sqlalchemy import or_
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime, timedelta
from models import Departamento, NivelExperiencia, Tarefa, TipoTarefa, User, Dono, Gestor, Programador, Departamento, db
import re

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

@event.listens_for(Engine, "connect")
def enable_sqlite_fk(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

def formatar_nome_proprio(nome: str) -> str:
    if not isinstance(nome, str) or not nome.strip():
        return ""

    conectores = {'da', 'de', 'do', 'das', 'dos', 'e', 'em', 'à', 'às', 'o', 'a', 'os', 'as'}
    
    nome_formatado = nome.strip().lower().title()

    palavras = nome_formatado.split()
    
    palavras_finais = []
    
    for palavra in palavras:
        if palavra.lower() in conectores:
            palavras_finais.append(palavra.lower())
        else:
            palavras_finais.append(palavra)

    return " ".join(palavras_finais)

def validar_nome_pessoa(nome: str) -> bool:
    if not isinstance(nome, str) or not nome:
        return False

    nome_limpo = re.sub(r'\s+', ' ', nome.strip())

    if len(nome_limpo) < 5 or len(nome_limpo) > 150:
        return False

    padrao_caracteres = re.compile(r"^[a-zA-ZÀ-ÿ\s\-\']+$")
    if not padrao_caracteres.match(nome_limpo):
        return False

    palavras_sem_extras = re.sub(r'[\-\']', ' ', nome_limpo).split()

    preposicoes_conectores = {'d', 'da', 'de', 'do', 'das', 'dos', 'e', 'em', 'à', 'às', 'o', 'a', 'os', 'as'}
    
    partes_significativas = [
        palavra for palavra in palavras_sem_extras 
        if palavra.lower() not in preposicoes_conectores and len(palavra) >= 2
    ]
    if len(partes_significativas) < 2:
        return False
        
    return True


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

#region validações

@app.route("/api/user-is-auth", methods=["GET"])
@jwt_required()
def user_is_auth():
    idUser = get_jwt_identity()
    user_try = User.query.filter_by(idUser=idUser).first()
    if user_try.password_change:
        return jsonify({"auth": False})
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

#endregion

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

@app.route("/api/get_all_departamentos", methods=["GET"])
@jwt_required()
def get_all_departamentos():
    idUser = get_jwt_identity()

    user = User.query.filter_by(idUser=idUser).first()
    if not user:
        return jsonify({"error": "Acesso inválido"}), 400
    
    departamentos = []

    for i in Departamento:
        departamentos.append({"departamento": i.value})

    return jsonify(departamentos), 200

@app.route("/api/get_all_nivel_experiencia", methods=["GET"])
@jwt_required()
def get_all_nivel_experiencia():
    idUser = get_jwt_identity()

    user = User.query.filter_by(idUser=idUser).first()
    if not user:
        return jsonify({"error": "Acesso inválido"}), 400
    
    departamentos = []

    for i in NivelExperiencia:
        departamentos.append({"nivel": i.value})

    return jsonify(departamentos), 200

@app.route("/api/get_all_tipo_tarefa", methods=["GET"])
@jwt_required()
def get_all_tipo_tarefa():
    idUser = get_jwt_identity()

    user = User.query.filter_by(idUser=idUser).first()
    if not user:
        return jsonify({"error": "Acesso inválido"}), 400
    
    tipos_tarefa = []

    tipo_tarefas = TipoTarefa.query.all()

    for i in tipo_tarefas:
        tipos_tarefa.append({
            "idTipoTarefa": i.idTipoTarefa,
            "nome": i.nome
        })

    return jsonify(tipos_tarefa), 200   

@app.route("/api/create_tipo_tarefa", methods=["POST"])
@jwt_required()
@role_required(["Gestor"])
def create_tipo_tarefa():
    idUser = get_jwt_identity()

    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if not gestor:
        return jsonify({"error": "Acesso inválido"}), 403

    data = request.get_json()
    nome = data.get("nome")

    if not nome:
        return jsonify({"error": "Nome é obrigatório"}), 400

    nome = nome.strip()
    if len(nome) < 3 or len(nome) > 100:
        return jsonify({"error": "Nome deve ter entre 3 e 100 caracteres"}), 400

    if TipoTarefa.query.filter_by(nome=nome).first():
        return jsonify({"error": "Tipo de tarefa já existe"}), 400

    tipo_tarefa = TipoTarefa(
        nome=nome,
        idGestor=idUser
    )

    db.session.add(tipo_tarefa)
    db.session.commit()

    return jsonify({"message": "Tipo de tarefa criado com sucesso"}), 200

#region DONO APIs

#region GESTOR

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

    nome = formatar_nome_proprio(nome=nome)
    if not validar_nome_pessoa(nome=nome):
        return jsonify({"error": "Nome inválido"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email já está a ser usado"}), 400

    password = f"{nome.replace(' ', '')}_{dono.empresa.replace(' ', '')}"
    new_idUser = str(uuid.uuid4())
    while User.query.filter_by(idUser=new_idUser).first():
        new_idUser = str(uuid.uuid4())
    departamento_key = next((k.name for k in Departamento if k.value == departamento), None)

    if not departamento_key:
        return jsonify({"error": "Departamento inválido"}), 400
    
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
        departamento=departamento_key
    )

    db.session.add_all([user, gestor])
    db.session.commit()

    return jsonify({
        "message": "Gestor criado com sucesso",
        "senha_temporaria": password
    }), 200

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
        if user:
            users.append({
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
                "departamento": i.departamento.value,
                # "password_change": user.password_change
            })

    return jsonify(users), 200

@app.route("/api/reset_password", methods=["POST"])
@role_required(["Dono"])
def reset_password():
    idUser = get_jwt_identity()

    dono = Dono.query.filter_by(idUser=idUser).first()
    if not dono:
        return jsonify({"error": "Acesso inválido"}), 400

    data = request.get_json()
    idGestor = data.get("idGestor")
    
    user = User.query.filter_by(idUser=idGestor).first()

    if user.password_change:
        return jsonify({"error": "Erro ao reiniciar a palavra passe"}), 400

    password = f"{user.nome.replace(' ', '')}_{dono.empresa.replace(' ', '')}"

    user.password = generate_password_hash(password)
    user.password_change = True
    db.session.commit()

    return jsonify({"message": f"Senha reiniciada para {user.nome.replace(' ', '')}_{dono.empresa.replace(' ', '')}"}), 200

@app.route("/api/editar_gestor", methods=["POST"])
@role_required(["Dono"])
def editar_gestor():
    idUser = get_jwt_identity()

    data = request.get_json()
    idGestor = data.get("id")
    nome = data.get("nome")
    departamento = data.get("departamento")

    if not idGestor:
        return jsonify({"error": "Gestor não encontrado"}), 400
    
    if not nome and not departamento:
        return jsonify({"error": "Para salvar tem de alterar pelo menos algum valor"}), 400

    departamento_key = ""

    if departamento:
        departamento_key = next((k.name for k in Departamento if k.value == departamento), None)

        if not departamento_key:
            return jsonify({"error": "Departamento inválido"}), 400

    gestor = Gestor.query.filter_by(idUser=idGestor, idDono=idUser).first()
    user = User.query.filter_by(idUser=idGestor).first()
    if not gestor or not user:
        return jsonify({"error": "Gestor não encontrado"}), 400

    if nome:
        nome = formatar_nome_proprio(nome=nome)
        if not validar_nome_pessoa(nome=nome):
            return jsonify({"error": "Nome inválido"}), 400
        user.nome = nome
    if departamento_key:
        gestor.departamento = departamento_key

    db.session.commit()

    return jsonify({"message": "Dados atualizados com sucesso"}), 200

@app.route("/api/eliminar_gestor", methods=["POST"])
@role_required(["Dono"])
def eliminar_gestor():
    idUser = get_jwt_identity()

    data = request.get_json()
    idGestor = data.get("id")

    gestor = Gestor.query.filter_by(idUser=idGestor, idDono=idUser).first()
    if not gestor:
        return jsonify({"error", "Utilizador não encontrado"}), 400
    
    for i in gestor.programadores:
        user_prog = User.query.filter_by(idUser=i.idUser).first()
        db.session.delete(user_prog)

    user_delete = User.query.filter_by(idUser=idGestor).first()
    db.session.delete(user_delete)
    db.session.commit()

    return jsonify({"message": "Conta eliminada com sucesso"}), 200

#endregion

@app.route("/api/get_all_programadores_and_gestores", methods=["GET"])
@role_required(["Dono"])
def get_all_programadores_and_gestores():
    idUser = get_jwt_identity()
    
    if not Dono.query.filter_by(idUser=idUser).first():
        return jsonify({"error": "Utilizador não tem acesso"}), 400
    
    gestores = Gestor.query.filter_by(idDono=idUser).all()
    if not gestores:
        return jsonify({"error": "Nenhum gestor encontrado"}), 404

    resultado = []
    
    for gestor in gestores:
        user_gestor = User.query.filter_by(idUser=gestor.idUser).first()
        
        programadores = Programador.query.filter_by(idGestor=gestor.idUser).all()
        programadores_list = []
        
        for programador in programadores:
            user_prog = User.query.filter_by(idUser=programador.idUser).first()
            if user_prog:
                programadores_list.append({
                    "idUser": user_prog.idUser,
                    "email": user_prog.email,
                    "nome": user_prog.nome,
                    "nivelExperiencia": programador.nivelExperiencia.value
                })
        
        resultado.append({
            "gestor": {
                "idUser": user_gestor.idUser,
                "email": user_gestor.email,
                "nome": user_gestor.nome,
                "departamento": gestor.departamento.value
            },
            "programadores": programadores_list
        })

    return jsonify(resultado), 200

#endregion

@app.route("/api/criar_programador", methods=["POST"])
@role_required(["Gestor"])
def criar_programador():
    idUser = get_jwt_identity()
    gestor = Gestor.query.filter_by(idUser=idUser).first()
    if not gestor:
        return jsonify({"error": "Acesso inválido"}), 403

    data = request.get_json()
    email = data.get("email")
    nome = data.get("nome")
    nivelExperiencia = data.get("nivelExperiencia")
    idGestor = idUser

    if not all([email, nome, nivelExperiencia, idGestor]):
        return jsonify({"error": "Campos obrigatórios"}), 400

    nome = formatar_nome_proprio(nome=nome)
    if not validar_nome_pessoa(nome=nome):
        return jsonify({"error": "Nome inválido"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email já está a ser usado"}), 400

    dono = Dono.query.filter_by(idUser=gestor.idDono).first()

    password = f"{nome.replace(' ', '')}_{dono.empresa.replace(' ', '')}"
    new_idUser = str(uuid.uuid4())
    while User.query.filter_by(idUser=new_idUser).first():
        new_idUser = str(uuid.uuid4())
    nivel_experiencia_key = next((k.name for k in NivelExperiencia if k.value == nivelExperiencia), None)

    if not nivel_experiencia_key:
        return jsonify({"error": "Nível de experiência inválido"}), 400
    
    user = User(
        idUser=new_idUser,
        email=email,
        password=generate_password_hash(password),
        nome=nome,
        password_change=True,
    )
    programador = Programador(
        idUser=new_idUser,
        idGestor=idUser,
        nivelExperiencia=nivel_experiencia_key
    )

    db.session.add_all([user, programador])
    db.session.commit()

    return jsonify({
        "message": "Programador criado com sucesso",
        "senha_temporaria": password
    }), 200

@app.route("/api/get_all_programadores", methods=["GET"])
@role_required(["Dono","Gestor"])
def get_all_programadores():
    idUser = get_jwt_identity()

    if not Dono.query.filter_by(idUser=idUser).first() and not Gestor.query.filter_by(idUser=idUser).first():
        return jsonify({"error": "Utilizador não tem acesso"}), 400

    programadores = Programador.query.filter(
        or_(
            Programador.idGestor == idUser,
            Programador.gestor.has(Gestor.idDono == idUser)
        )
    ).all()
    users = []

    for i in programadores:
        user = User.query.filter_by(idUser=i.idUser).first()
        if user:
            users.append({
                "idUser": user.idUser,
                "email": user.email,
                "nome": user.nome,
                "nivelExperiencia": i.nivelExperiencia.value,
            })

    return jsonify(users), 200

@app.route("/api/editar_programador", methods=["POST"])
@role_required(["Gestor"])
def editar_programador():
    idUser = get_jwt_identity()

    data = request.get_json()
    idProgramador = data.get("id")
    nome = data.get("nome")
    nivelExperiencia = data.get("nivelExperiencia")

    if not idProgramador:
        return jsonify({"error": "Programador não encontrado"}), 400
    
    if not nome and not nivelExperiencia:
        return jsonify({"error": "Para salvar tem de alterar pelo menos algum valor"}), 400

    nivel_experiencia_key = ""

    if nivelExperiencia:
        nivel_experiencia_key = next((k.name for k in NivelExperiencia if k.value == nivelExperiencia), None)

        if not nivel_experiencia_key:
            return jsonify({"error": "Nível de experiência inválido"}), 400
        
    programador = Programador.query.filter_by(idUser=idProgramador, idGestor=idUser).first()
    user = User.query.filter_by(idUser=idProgramador).first()
    if not programador or not user:
        return jsonify({"error": "Programador não encontrado"}), 400
    if nome:
        nome = formatar_nome_proprio(nome=nome)
        if not validar_nome_pessoa(nome=nome):
            return jsonify({"error": "Nome inválido"}), 400
        user.nome = nome
    if nivel_experiencia_key:
        programador.nivelExperiencia = nivel_experiencia_key

    db.session.commit()

    return jsonify({"message": "Dados atualizados com sucesso"}), 200

@app.route("/api/eliminar_programador", methods=["POST"])
@role_required(["Gestor"])
def eliminar_programador():
    idUser = get_jwt_identity()

    data = request.get_json()
    idProgramador = data.get("id")
    programador = Programador.query.filter_by(idUser=idProgramador, idGestor=idUser).first()
    if not programador:
        return jsonify({"error": "Utilizador não encontrado"}), 400
    
    user_delete = User.query.filter_by(idUser=idProgramador).first()
    db.session.delete(user_delete)
    db.session.commit()

    return jsonify({"message": "Conta eliminada com sucesso"}), 200

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

    # 1) Apagar Users dos programadores associados a gestores do Dono
    for gestor in dono.gestores:
        for programador in gestor.programadores:
            user_prog = programador.user
            if user_prog:
                db.session.delete(user_prog)

    # 2) Apagar Users dos gestores associados ao Dono
    for gestor in dono.gestores:
        user_gestor = gestor.user
        if user_gestor:
            db.session.delete(user_gestor)

    # Delete utilizador
    user = dono.user
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