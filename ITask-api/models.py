from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

class NivelExperiencia(enum.Enum):
    Junior = "Júnior"
    Senior = "Sénior"

class Departamento(enum.Enum):
    IT = "IT"
    Marketing = "Marketing"
    Administracao = "Administração"

class User(db.Model):
    __tablename__ = 'users'
    idUser = db.Column(db.String, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nome = db.Column(db.String(100), nullable=False)

class Programador(db.Model):
    __tablename__ = 'programador'
    idUser = db.Column(db.String, db.ForeignKey('users.idUser'), primary_key=True)
    nivelExperiencia = db.Column(db.Enum(NivelExperiencia), default=NivelExperiencia.Junior, nullable=False)
    user = db.relationship('User', backref=db.backref('programador', uselist=False))

class Gestor(db.Model):
    __tablename__ = 'gestor'
    idUser = db.Column(db.String, db.ForeignKey('users.idUser'), primary_key=True)
    departamento = db.Column(db.Enum(Departamento), default=Departamento.IT, nullable=False)
    user = db.relationship('User', backref=db.backref('gestor', uselist=False))

class Gere(db.Model):
    __tablename__ = 'gere'
    idProgramador = db.Column(db.String, db.ForeignKey('programador.idUser'), primary_key=True)
    idGestor = db.Column(db.String, db.ForeignKey('gestor.idUser'), primary_key=True)

class TipoTarefa(db.Model):
    __tablename__ = 'tipoTarefa'
    idTipoTarefa = db.Column(db.String, primary_key=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)

class Tarefa(db.Model):
    __tablename__ = 'tarefa'
    idTarefa = db.Column(db.String, primary_key=True, autoincrement=True)
    idGestor = db.Column(db.String, db.ForeignKey('gestor.idUser'), nullable=False)
    idProgramador = db.Column(db.String, db.ForeignKey('programador.idUser'), nullable=False)
    ordemExecucao = db.Column(db.Integer, nullable=False)
    descricao = db.Column(db.String(255), nullable=False)
    dataPrevistaInicio = db.Column(db.DateTime, nullable=False)
    dataPrevistaFim = db.Column(db.DateTime, nullable=False)
    idTipoTarefa = db.Column(db.String, db.ForeignKey('tipoTarefa.idTipoTarefa'), nullable=False)
    storyPoint = db.Column(db.Integer, nullable=True)
    dataRealInicio = db.Column(db.DateTime, nullable=True)
    dataRealFim = db.Column(db.DateTime, nullable=True)
    dataCriacao = db.Column(db.DateTime, default=datetime.utcnow)
    estadoTarefa = db.Column(db.String(50), nullable=False)

    gestor = db.relationship('Gestor', backref='tarefas')
    programador = db.relationship('Programador', backref='tarefas')
    tipoTarefa = db.relationship('TipoTarefa', backref='tarefas')