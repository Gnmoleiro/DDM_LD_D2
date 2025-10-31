from functools import wraps
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import timedelta
from models import Departamento, User, Dono, Gestor, Programador, db

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

    if not user:
        return jsonify({"error": "Utilizador não encontrado"})
    
    return jsonify({
        "email": user.email,
        "nome": user.nome
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

        senha_temporaria = f"{nome.replace(' ', '_')}_{empresa.replace(' ', '_')}"
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