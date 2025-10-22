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

class EstadoTarefa(enum.Enum):
    ToDo = "ToDo"
    Doing = "Doing"
    Done = "Done"

class User(db.Model):
    __tablename__ = 'users'
    idUser = db.Column(db.String, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nome = db.Column(db.String(100), nullable=False)

class Gestor(db.Model):
    __tablename__ = 'gestores'
    idUser = db.Column(db.String, db.ForeignKey('users.idUser'), primary_key=True)
    departamento = db.Column(db.Enum(Departamento), default=Departamento.IT, nullable=False)
    idDono = db.Column(db.String, db.ForeignKey('dono.idUser'), nullable=False)
    user = db.relationship('User', backref=db.backref('gestor', uselist=False))
    dono = db.relationship('Dono', backref=db.backref('gestor', lazy=True))

class Programador(db.Model):
    __tablename__ = 'programadores'
    idUser = db.Column(db.String, db.ForeignKey('users.idUser'), primary_key=True)
    idGestor = db.Column(db.String, db.ForeignKey('gestores.idUser'), nullable=False)
    nivelExperiencia = db.Column(db.Enum(NivelExperiencia), default=NivelExperiencia.Junior, nullable=False)

    user = db.relationship('User', backref=db.backref('programador', uselist=False))
    gestor = db.relationship('Gestor', backref=db.backref('programadores', lazy=True))

class Dono(db.Model):
    __tablename__ = 'dono'
    idUser = db.Column(db.String, db.ForeignKey('users.idUser'), primary_key=True)
    empresa = db.Column(db.String, nullable=False)

class TipoTarefa(db.Model):
    __tablename__ = 'tipos_tarefa'
    idTipoTarefa = db.Column(db.String, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)

class Tarefa(db.Model):
    __tablename__ = 'tarefas'
    idTarefa = db.Column(db.String, primary_key=True)
    idGestor = db.Column(db.String, db.ForeignKey('gestores.idUser'), nullable=False)
    idProgramador = db.Column(db.String, db.ForeignKey('programadores.idUser'), nullable=False)
    idTipoTarefa = db.Column(db.String, db.ForeignKey('tipos_tarefa.idTipoTarefa'), nullable=False)
    
    descricao = db.Column(db.String(255), nullable=False)
    ordemExecucao = db.Column(db.Integer, nullable=False)
    storyPoint = db.Column(db.Integer, default=0, nullable=False)
    estadoTarefa = db.Column(db.Enum(EstadoTarefa), default=EstadoTarefa.ToDo, nullable=False)
    
    dataPrevistaInicio = db.Column(db.DateTime, nullable=False)
    dataPrevistaFim = db.Column(db.DateTime, nullable=False)
    dataRealInicio = db.Column(db.DateTime, nullable=True)
    dataRealFim = db.Column(db.DateTime, nullable=True)
    dataCriacao = db.Column(db.DateTime, default=datetime.utcnow)

    gestor = db.relationship('Gestor', backref=db.backref('tarefas', lazy=True))
    programador = db.relationship('Programador', backref=db.backref('tarefas', lazy=True))
    tipoTarefa = db.relationship('TipoTarefa', backref=db.backref('tarefas', lazy=True))
