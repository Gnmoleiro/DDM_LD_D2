from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

# =======================================
# ENUMS
# =======================================

class NivelExperiencia(enum.Enum):
    Junior = "Júnior"
    Senior = "Sénior"

class Departamento(enum.Enum):
    IT = "IT"
    Marketing = "Marketing"
    Administracao = "Administração"

class EstadoTarefa(enum.Enum):
    ToDo = "ToDo"
    Doing = "Doing"
    Done = "Done"


# =======================================
# USER
# =======================================

class User(db.Model):
    __tablename__ = 'users'

    idUser = db.Column(db.String, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    password_change = db.Column(db.Boolean, nullable=False)

    # 1-1 Relacionamentos → CASCADE ORM + CASCADE SQL
    dono = db.relationship(
        "Dono",
        backref=db.backref("user", uselist=False),
        cascade="all, delete",        # delete → respeita FK CASCADE, sem orphan issues
        passive_deletes=True,
        uselist=False
    )

    gestor = db.relationship(
        "Gestor",
        backref=db.backref("user", uselist=False),
        cascade="all, delete",
        passive_deletes=True,
        uselist=False
    )

    programador = db.relationship(
        "Programador",
        backref=db.backref("user", uselist=False),
        cascade="all, delete",
        passive_deletes=True,
        uselist=False
    )


# =======================================
# DONO
# =======================================

class Dono(db.Model):
    __tablename__ = 'dono'

    idUser = db.Column(
        db.String,
        db.ForeignKey("users.idUser", ondelete="CASCADE"),
        primary_key=True
    )

    empresa = db.Column(db.String, nullable=False)

    gestores = db.relationship(
        "Gestor",
        backref="dono",
        cascade="all, delete",
        passive_deletes=True,
        lazy=True
    )


# =======================================
# GESTOR
# =======================================

class Gestor(db.Model):
    __tablename__ = "gestores"

    idUser = db.Column(
        db.String,
        db.ForeignKey("users.idUser", ondelete="CASCADE"),
        primary_key=True
    )

    departamento = db.Column(
        db.Enum(Departamento),
        default=Departamento.IT,
        nullable=False
    )

    idDono = db.Column(
        db.String,
        db.ForeignKey("dono.idUser", ondelete="CASCADE"),
        nullable=False
    )

    programadores = db.relationship(
        "Programador",
        backref="gestor",
        cascade="all, delete",
        passive_deletes=True,
        lazy=True
    )

    tarefas = db.relationship(
        "Tarefa",
        backref="gestor",
        cascade="all, delete",
        passive_deletes=True,
        lazy=True
    )


# =======================================
# PROGRAMADOR
# =======================================

class Programador(db.Model):
    __tablename__ = 'programadores'

    idUser = db.Column(
        db.String,
        db.ForeignKey("users.idUser", ondelete="CASCADE"),
        primary_key=True
    )

    idGestor = db.Column(
        db.String,
        db.ForeignKey("gestores.idUser", ondelete="CASCADE"),
        nullable=False
    )

    nivelExperiencia = db.Column(
        db.Enum(NivelExperiencia),
        default=NivelExperiencia.Junior,
        nullable=False
    )

    tarefas = db.relationship(
        "Tarefa",
        backref="programador",
        cascade="all, delete",
        passive_deletes=True,
        lazy=True
    )


# =======================================
# TIPO TAREFA
# =======================================

class TipoTarefa(db.Model):
    __tablename__ = 'tipos_tarefa'

    idTipoTarefa = db.Column(db.String, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    idGestor = db.Column(db.String, db.ForeignKey("gestores.idUser", ondelete="CASCADE"), nullable=False)

    tarefas = db.relationship(
        "Tarefa",
        backref="tipoTarefa",
        cascade="all, delete",
        passive_deletes=True,
        lazy=True
    )


# =======================================
# TAREFA
# =======================================

class Tarefa(db.Model):
    __tablename__ = 'tarefas'

    idTarefa = db.Column(db.String, primary_key=True)

    idGestor = db.Column(
        db.String,
        db.ForeignKey("gestores.idUser", ondelete="CASCADE"),
        nullable=False
    )

    idProgramador = db.Column(
        db.String,
        db.ForeignKey("programadores.idUser", ondelete="CASCADE"),
        nullable=False
    )

    idTipoTarefa = db.Column(
        db.String,
        db.ForeignKey("tipos_tarefa.idTipoTarefa", ondelete="CASCADE"),
        nullable=False
    )

    tituloTarefa = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)
    ordemExecucao = db.Column(db.Integer, nullable=False)
    storyPoint = db.Column(db.Integer, default=0, nullable=False)
    estadoTarefa = db.Column(db.Enum(EstadoTarefa), default=EstadoTarefa.ToDo, nullable=False)

    dataPrevistaInicio = db.Column(db.DateTime, nullable=False)
    dataPrevistaFim = db.Column(db.DateTime, nullable=False)
    dataRealInicio = db.Column(db.DateTime, nullable=True)
    dataRealFim = db.Column(db.DateTime, nullable=True)
    dataCriacao = db.Column(db.DateTime, default=datetime.utcnow)
